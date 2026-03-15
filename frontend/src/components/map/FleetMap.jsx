import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
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
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color}aa"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const shipmentIcon = (status) => {
  const color = status === 'PENDING' ? '#f59e0b' : status === 'ASSIGNED' ? '#8b5cf6' : '#0ea5e9';
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:2px;background:${color};border:2px solid white;box-shadow:0 0 8px ${color}aa;transform:rotate(45deg)"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

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
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>
            <div className="text-xs font-semibold">{d.email}</div>
            <div className="text-[10px] text-gray-500">{d.status} {d.active_shipment_id ? `(On Shipment: ${d.active_shipment_id.slice(0,8)})` : ''}</div>
          </Tooltip>
          <Popup>
            <div className="text-sm p-1">
              <p className="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-2">{d.email}</p>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-gray-500 text-xs uppercase font-semibold">Status</span>
                <StatusBadge status={d.status} />
              </div>
              <div className="text-gray-600 text-xs">
                <p><strong>Vehicle:</strong> {d.plate_number || 'N/A'}</p>
                {d.active_shipment_id && (
                  <p className="mt-1 text-blue-600 font-medium">📦 Active Shipment: {d.active_shipment_id.slice(0, 8)}</p>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {shipments.map((s) => s.origin_lat && (
        <Marker key={s.shipment_id} position={[s.origin_lat, s.origin_lng]} icon={shipmentIcon(s.status)}>
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>
             <div className="text-xs font-semibold">Shipment {s.shipment_id.slice(0,8)}</div>
             <div className="text-[10px] text-gray-500">{s.status} · {s.priority}</div>
          </Tooltip>
          <Popup>
            <div className="text-sm p-1">
              <p className="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-2">Shipment {s.shipment_id.slice(0,8)}</p>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-gray-500 text-xs uppercase font-semibold">Status</span>
                <StatusBadge status={s.status} />
              </div>
              <div className="text-gray-600 text-xs space-y-1">
                <p><strong>Weight:</strong> {s.weight_kg} kg</p>
                <p><strong>Priority:</strong> {s.priority}</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default FleetMap;
