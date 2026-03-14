import { useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import FleetMap from '../components/map/FleetMap';
import { getDrivers } from '../api/driversApi';
import { getShipments } from '../api/shipmentsApi';
import StatusBadge from '../components/common/StatusBadge';

const AdminPage = () => {
  const [drivers, setDrivers]     = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversRes, shipmentsRes] = await Promise.all([
          getDrivers(),
          getShipments({}),
        ]);
        setDrivers(driversRes.data.data || []);
        setShipments(shipmentsRes.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const available = drivers.filter(d => d.status === 'AVAILABLE').length;
  const onTrip    = drivers.filter(d => d.status === 'ON_TRIP').length;
  const pending   = shipments.filter(s => s.status === 'PENDING').length;
  const delivered = shipments.filter(s => s.status === 'DELIVERED').length;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Fleet Admin Dashboard</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Available Drivers', value: available, color: 'text-emerald-400' },
            { label: 'Drivers On Trip',   value: onTrip,    color: 'text-blue-400' },
            { label: 'Pending Shipments', value: pending,   color: 'text-yellow-400' },
            { label: 'Delivered Today',   value: delivered, color: 'text-purple-400' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">{kpi.label}</p>
              <p className={`text-3xl font-bold mt-1 ${kpi.color}`}>
                {loading ? '—' : kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden" style={{ height: '480px' }}>
          <FleetMap drivers={drivers} shipments={shipments} zoom={5} />
        </div>

        {/* Shipments Table */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold">All Shipments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase border-b border-gray-800">
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Priority</th>
                  <th className="px-6 py-3 text-left">Weight</th>
                  <th className="px-6 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s.shipment_id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="px-6 py-3 font-mono text-xs text-gray-400">{s.shipment_id.slice(0, 8)}…</td>
                    <td className="px-6 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-6 py-3 text-gray-300">{s.priority}</td>
                    <td className="px-6 py-3 text-gray-300">{s.weight_kg} kg</td>
                    <td className="px-6 py-3 text-gray-400">{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!loading && shipments.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No shipments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
