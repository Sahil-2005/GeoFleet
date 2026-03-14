import { useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import FleetMap from '../components/map/FleetMap';
import StatusBadge from '../components/common/StatusBadge';
import { getShipments, createShipment, autoAssign, cancelShipment } from '../api/shipmentsApi';
import { getDrivers } from '../api/driversApi';

const DispatcherPage = () => {
  const [shipments, setShipments]   = useState([]);
  const [drivers, setDrivers]       = useState([]);
  const [form, setForm]             = useState({ weight_kg: '', priority: 'NORMAL', notes: '',
                                                  origin: { lat: '', lng: '' }, destination: { lat: '', lng: '' } });
  const [assigning, setAssigning]   = useState(null);
  const [assignResult, setAssignResult] = useState(null);
  const [msg, setMsg]               = useState('');

  const fetchData = async () => {
    const [s, d] = await Promise.all([getShipments({}), getDrivers()]);
    setShipments(s.data.data || []);
    setDrivers(d.data.data || []);
  };

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 30000); return () => clearInterval(t); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createShipment(form);
      setMsg('✅ Shipment created!');
      setForm({ weight_kg: '', priority: 'NORMAL', notes: '', origin: { lat: '', lng: '' }, destination: { lat: '', lng: '' } });
      fetchData();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.error || 'Failed to create shipment')); }
  };

  const handleAssign = async (shipment_id) => {
    setAssigning(shipment_id);
    setAssignResult(null);
    try {
      const res = await autoAssign(shipment_id);
      setAssignResult(res.data.data);
      fetchData();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.error || 'No driver available')); }
    finally { setAssigning(null); }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Dispatcher Dashboard</h1>
        {msg && <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm">{msg}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden" style={{ height: '420px' }}>
            <FleetMap drivers={drivers} shipments={shipments} zoom={6} />
          </div>

          {/* Create Shipment Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4">New Shipment</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              {[
                { label: 'Origin Lat', field: 'lat', section: 'origin' },
                { label: 'Origin Lng', field: 'lng', section: 'origin' },
                { label: 'Dest Lat',   field: 'lat', section: 'destination' },
                { label: 'Dest Lng',   field: 'lng', section: 'destination' },
              ].map(({ label, field, section }) => (
                <div key={`${section}-${field}`}>
                  <label className="text-xs text-gray-400">{label}</label>
                  <input type="number" step="any" required
                    value={form[section][field]}
                    onChange={(e) => setForm(f => ({ ...f, [section]: { ...f[section], [field]: e.target.value } }))}
                    className="w-full mt-0.5 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="0.0000"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-400">Weight (kg)</label>
                <input type="number" step="0.01" required value={form.weight_kg}
                  onChange={(e) => setForm(f => ({ ...f, weight_kg: e.target.value }))}
                  className="w-full mt-0.5 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Priority</label>
                <select value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full mt-0.5 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500">
                  {['LOW','NORMAL','HIGH','URGENT'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <button type="submit" id="create-shipment-btn"
                className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:opacity-90 transition text-sm">
                Create Shipment
              </button>
            </form>
          </div>
        </div>

        {/* Assign Result Banner */}
        {assignResult && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
            ✅ Driver assigned — Trip ID: <strong>{assignResult.trip_id?.slice(0,8)}…</strong> · Distance: <strong>{assignResult.distance_km} km</strong>
          </div>
        )}

        {/* Shipment Queue */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800"><h2 className="text-lg font-semibold">Shipment Queue</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase border-b border-gray-800">
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Priority</th>
                  <th className="px-6 py-3 text-left">Weight</th>
                  <th className="px-6 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s.shipment_id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="px-6 py-3 font-mono text-xs text-gray-400">{s.shipment_id.slice(0,8)}…</td>
                    <td className="px-6 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-6 py-3 text-gray-300">{s.priority}</td>
                    <td className="px-6 py-3 text-gray-300">{s.weight_kg} kg</td>
                    <td className="px-6 py-3">
                      {s.status === 'PENDING' && (
                        <button id={`assign-${s.shipment_id}`} onClick={() => handleAssign(s.shipment_id)}
                          disabled={assigning === s.shipment_id}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50">
                          {assigning === s.shipment_id ? 'Assigning...' : 'Auto-Assign'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {shipments.length === 0 && (
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

export default DispatcherPage;
