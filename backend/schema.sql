-- =============================================================================
--  GeoFleet Database Schema
--  Run this entire file in your PostgreSQL client (psql, pgAdmin, DBeaver, etc.)
--  against your target database (e.g.  \c geofleet_db  before running).
--
--  Prerequisites:
--    1. PostgreSQL 14+
--    2. PostGIS extension available on the server
--    3. A database already created:
--         CREATE DATABASE geofleet_db;
-- =============================================================================

-- ── 0. Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ── 1. HUBS ───────────────────────────────────────────────────────────────────
-- Represents physical logistics depots / distribution centers.
CREATE TABLE IF NOT EXISTS hubs (
    hub_id    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name      TEXT        NOT NULL,
    city      TEXT        NOT NULL,
    location  GEOMETRY(Point, 4326) NOT NULL,  -- PostGIS geographic point (lon, lat)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. USERS ──────────────────────────────────────────────────────────────────
-- All system users across every role.
CREATE TABLE IF NOT EXISTS users (
    user_id       UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT  UNIQUE NOT NULL,
    password_hash TEXT  NOT NULL,
    role          TEXT  NOT NULL
                        CHECK (role IN ('FLEET_ADMIN', 'DISPATCHER', 'DRIVER')),
    hub_id        UUID  REFERENCES hubs(hub_id) ON DELETE SET NULL,  -- NULL for FLEET_ADMIN
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. VEHICLES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    plate_number  TEXT    UNIQUE NOT NULL,
    capacity_kg   NUMERIC(10, 2) NOT NULL CHECK (capacity_kg > 0),
    vehicle_type  TEXT    NOT NULL
                          CHECK (vehicle_type IN ('VAN', 'TRUCK', 'BIKE')),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. DRIVERS ────────────────────────────────────────────────────────────────
-- Extends users with driver-specific spatial + status fields.
CREATE TABLE IF NOT EXISTS drivers (
    driver_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    hub_id           UUID REFERENCES hubs(hub_id) ON DELETE SET NULL,
    vehicle_id       UUID UNIQUE REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
    status           TEXT NOT NULL DEFAULT 'AVAILABLE'
                          CHECK (status IN ('AVAILABLE', 'ON_TRIP', 'OFFLINE')),
    current_location GEOMETRY(Point, 4326),  -- Updated in real-time by driver app
    last_updated     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. SHIPMENTS ──────────────────────────────────────────────────────────────
-- A single delivery job created by a dispatcher.
CREATE TABLE IF NOT EXISTS shipments (
    shipment_id   UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    dispatcher_id UUID    REFERENCES users(user_id) ON DELETE SET NULL,
    hub_id        UUID    REFERENCES hubs(hub_id) ON DELETE SET NULL,
    status        TEXT    NOT NULL DEFAULT 'PENDING'
                          CHECK (status IN ('PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED')),
    priority      TEXT    NOT NULL DEFAULT 'NORMAL'
                          CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    weight_kg     NUMERIC(10, 2) NOT NULL CHECK (weight_kg > 0),
    origin        GEOMETRY(Point, 4326) NOT NULL,
    destination   GEOMETRY(Point, 4326) NOT NULL,
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. TRIPS ──────────────────────────────────────────────────────────────────
-- Links a shipment to an assigned driver; tracks execution lifecycle.
CREATE TABLE IF NOT EXISTS trips (
    trip_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id  UUID UNIQUE NOT NULL REFERENCES shipments(shipment_id) ON DELETE CASCADE,
    driver_id    UUID NOT NULL REFERENCES drivers(driver_id) ON DELETE RESTRICT,
    status       TEXT NOT NULL DEFAULT 'ASSIGNED'
                      CHECK (status IN ('ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED')),
    assigned_at  TIMESTAMPTZ DEFAULT NOW(),
    started_at   TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- =============================================================================
--  INDEXES
--  Separate section for clarity — run after all tables are created.
-- =============================================================================

-- Spatial GIST indexes (required for PostGIS operators: ST_DWithin, ST_Distance, <->)
CREATE INDEX IF NOT EXISTS idx_drivers_location    ON drivers    USING GIST(current_location);
CREATE INDEX IF NOT EXISTS idx_hubs_location       ON hubs       USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_shipments_origin    ON shipments  USING GIST(origin);
CREATE INDEX IF NOT EXISTS idx_shipments_dest      ON shipments  USING GIST(destination);

-- Standard B-Tree indexes for common equality / range filters
CREATE INDEX IF NOT EXISTS idx_drivers_status      ON drivers    (status);
CREATE INDEX IF NOT EXISTS idx_drivers_hub         ON drivers    (hub_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status    ON shipments  (status);
CREATE INDEX IF NOT EXISTS idx_shipments_hub       ON shipments  (hub_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver        ON trips      (driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status        ON trips      (status);
CREATE INDEX IF NOT EXISTS idx_users_role          ON users      (role);

-- Composite index: fastest path for the dispatcher's main view
CREATE INDEX IF NOT EXISTS idx_shipments_hub_status ON shipments (hub_id, status);
-- Composite index: driver lookup by user
CREATE INDEX IF NOT EXISTS idx_drivers_user_status  ON drivers   (user_id, status);

-- =============================================================================
--  ROW-LEVEL SECURITY (RLS)
--  The backend sets app.* session variables before each query so policies work.
--  SET LOCAL app.current_user_id = '<uuid>';
--  SET LOCAL app.current_role    = 'DISPATCHER';
--  SET LOCAL app.current_hub_id  = '<uuid>';
-- =============================================================================

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS shipments_access_policy ON shipments;
CREATE POLICY shipments_access_policy ON shipments
    USING (
        -- Fleet Admin sees all
        current_setting('app.current_role', true) = 'FLEET_ADMIN'
        OR
        -- Dispatcher sees only their hub
        (current_setting('app.current_role', true) = 'DISPATCHER'
         AND hub_id::TEXT = current_setting('app.current_hub_id', true))
        OR
        -- Driver sees only the shipment attached to their active trip
        (current_setting('app.current_role', true) = 'DRIVER'
         AND shipment_id IN (
             SELECT t.shipment_id FROM trips t
             JOIN drivers d ON t.driver_id = d.driver_id
             WHERE d.user_id::TEXT = current_setting('app.current_user_id', true)
         ))
    );

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS trips_access_policy ON trips;
CREATE POLICY trips_access_policy ON trips
    USING (
        current_setting('app.current_role', true) IN ('FLEET_ADMIN', 'DISPATCHER')
        OR
        driver_id IN (
            SELECT driver_id FROM drivers
            WHERE user_id::TEXT = current_setting('app.current_user_id', true)
        )
    );

-- =============================================================================
--  TRIGGER: Auto-reset driver to AVAILABLE on delivery
--  Fires after UPDATE on trips.status changes to 'DELIVERED'.
--  Also marks the linked shipment as DELIVERED.
-- =============================================================================

CREATE OR REPLACE FUNCTION reset_driver_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'DELIVERED' AND OLD.status <> 'DELIVERED' THEN
        -- Reset driver
        UPDATE drivers
        SET    status       = 'AVAILABLE',
               last_updated = NOW()
        WHERE  driver_id = NEW.driver_id;

        -- Sync shipment status
        UPDATE shipments
        SET    status     = 'DELIVERED',
               updated_at = NOW()
        WHERE  shipment_id = NEW.shipment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reset_driver ON trips;
CREATE TRIGGER trg_reset_driver
AFTER UPDATE OF status ON trips
FOR EACH ROW
EXECUTE FUNCTION reset_driver_on_delivery();

-- =============================================================================
--  SAMPLE SEED DATA (Optional — comment out if not needed)
-- =============================================================================

-- Sample Hub
INSERT INTO hubs (hub_id, name, city, location) VALUES
    ('a1b2c3d4-0000-0000-0000-000000000001', 'Mumbai Central Hub', 'Mumbai',
     ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326))
ON CONFLICT DO NOTHING;

-- Sample Vehicle
INSERT INTO vehicles (vehicle_id, plate_number, capacity_kg, vehicle_type) VALUES
    ('b1b2c3d4-0000-0000-0000-000000000001', 'MH-01-AB-1234', 1500.00, 'TRUCK')
ON CONFLICT DO NOTHING;

-- NOTE: To add a sample DRIVER user, first register via POST /api/auth/register,
-- then create a drivers row linking the user_id + vehicle_id above.

-- =============================================================================
--  VERIFICATION QUERIES (Run these to confirm setup)
-- =============================================================================
-- SELECT PostGIS_Version();
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public';
-- SELECT tgname, tgrelid::regclass FROM pg_trigger WHERE tgname = 'trg_reset_driver';
