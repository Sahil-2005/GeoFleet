import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StatusBadge from '../common/StatusBadge';

// Fix Leaflet default marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom driver icon (color by status)
const driverIcon = (status) => {
  const color = status === 'AVAILABLE' ? '#10b981' : status === 'ON_TRIP' ? '#3b82f6' : '#6b7280';
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 6px ${color}aa"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

const shipmentIcon = L.divIcon({
  html: `<div style="width:12px;height:12px;border-radius:2px;background:#f59e0b;border:2px solid white;box-shadow:0 0 6px #f59e0baa;transform:rotate(45deg)"></div>`,
  className: '',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

/**
 * FleetMap — shared Leaflet map component.
 *
 * @param {Array}  drivers   - [{driver_id, lat, lng, status, email}]
 * @param {Array}  shipments - [{shipment_id, origin_lat, origin_lng, status, priority}]
 * @param {number} height    - CSS height string, default "100%"
 * @param {number} centerLat
 * @param {number} centerLng
 * @param {number} zoom
 */
const FleetMap = ({
  drivers = [],
  shipments = [],
  height = '100%',
  centerLat = 20.5937,
  centerLng = 78.9629,
  zoom = 5,
}) => {
  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />

      {drivers.map((d) => d.lat && (
        <Marker key={d.driver_id} position={[d.lat, d.lng]} icon={driverIcon(d.status)}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{d.email}</p>
              <StatusBadge status={d.status} />
              <p className="text-gray-500 text-xs mt-1">{d.plate_number}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {shipments.map((s) => s.origin_lat && (
        <Marker key={s.shipment_id} position={[s.origin_lat, s.origin_lng]} icon={shipmentIcon}>
          <Popup>
            <div className="text-sm">
              <StatusBadge status={s.status} />
              <p className="text-gray-500 text-xs mt-1">{s.weight_kg} kg · {s.priority}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default FleetMap;
