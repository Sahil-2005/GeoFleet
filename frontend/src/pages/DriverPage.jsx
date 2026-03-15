import { useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import StatusBadge from '../components/common/StatusBadge';
import FleetMap from '../components/map/FleetMap';
import { getMyTrip, startTrip, deliverTrip } from '../api/tripsApi';
import { updateLocation, getDriverByUserId } from '../api/driversApi';
import { useAuth } from '../context/AuthContext';

const DriverPage = () => {
  const { user }         = useAuth();
  const [driver, setDriver] = useState(null);
  const [trip, setTrip]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [msg, setMsg]       = useState('');
  const [locForm, setLocForm] = useState({ lat: '', lng: '' });

  const fetchData = async () => {
    try {
      const [tripRes, driverRes] = await Promise.all([
        getMyTrip().catch(err => (err.response?.status === 404 ? { data: { data: null } } : Promise.reject(err))),
        getDriverByUserId(user.user_id)
      ]);
      setTrip(tripRes.data.data);
      setDriver(driverRes.data.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setMsg('❌ Failed to load dashboard data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleStart = async () => {
    setActing(true);
    try { await startTrip(trip.trip_id); setMsg('✅ Trip started!'); fetchData(); }
    catch { setMsg('❌ Could not start trip.'); }
    finally { setActing(false); }
  };

  const handleDeliver = async () => {
    setActing(true);
    try { await deliverTrip(trip.trip_id); setMsg('✅ Delivered! Status reset to AVAILABLE.'); fetchData(); }
    catch { setMsg('❌ Could not mark as delivered.'); }
    finally { setActing(false); }
  };

  const handleLocationBrowser = () => {
    if (!navigator.geolocation) {
      setMsg('❌ Geolocation is not supported by your browser.');
      return;
    }
    setActing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await updateLocation(driver.driver_id, { lat: pos.coords.latitude, lng: pos.coords.longitude });
          setMsg('📍 Location updated successfully (Browser)!');
          fetchData();
        } catch {
          setMsg('❌ Failed to update location via browser.');
        } finally { setActing(false); }
      },
      () => {
        setMsg('❌ Could not get browser location. Please allow permissions.');
        setActing(false);
      }
    );
  };

  const handleLocationManual = async (e) => {
    e.preventDefault();
    setActing(true);
    try {
      await updateLocation(driver.driver_id, { lat: parseFloat(locForm.lat), lng: parseFloat(locForm.lng) });
      setMsg('📍 Location updated successfully (Manual)!');
      setLocForm({ lat: '', lng: '' });
      fetchData();
    } catch {
      setMsg('❌ Failed to update location manually.');
    } finally { setActing(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-bold mb-4">My Trip</h1>
        {msg && <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm">{msg}</div>}

        {loading && <p className="text-gray-400">Loading trip…</p>}

        {!loading && !trip && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
            <p className="text-lg font-medium">No active trip</p>
            <p className="text-sm mt-2">You will be notified when a trip is assigned to you.</p>
          </div>
        )}

        {!loading && trip && (
          <div className="space-y-4">
            {/* Status Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Trip Status</h2>
                <StatusBadge status={trip.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Origin</p>
                  <p className="text-white font-mono">{trip.origin_lat?.toFixed(4)}, {trip.origin_lng?.toFixed(4)}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Destination</p>
                  <p className="text-white font-mono">{trip.dest_lat?.toFixed(4)}, {trip.dest_lng?.toFixed(4)}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Weight</p>
                  <p className="text-white">{trip.weight_kg} kg</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Priority</p>
                  <StatusBadge status={trip.priority} />
                </div>
              </div>
              {trip.notes && (
                <div className="mt-3 bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Notes</p>
                  <p className="text-white text-sm">{trip.notes}</p>
                </div>
              )}
            </div>

            {/* Mini Map */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden" style={{ height: '240px' }}>
              <FleetMap
                centerLat={trip.dest_lat}
                centerLng={trip.dest_lng}
                zoom={12}
                shipments={[{ ...trip, shipment_id: trip.shipment_id, origin_lat: trip.origin_lat, origin_lng: trip.origin_lng, status: trip.status }]}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {trip.status === 'ASSIGNED' && (
                <button id="start-trip-btn" onClick={handleStart} disabled={acting}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-blue-500/20">
                  {acting ? 'Starting…' : '🚛 Start Trip'}
                </button>
              )}
              {trip.status === 'IN_TRANSIT' && (
                <button id="deliver-btn" onClick={handleDeliver} disabled={acting}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                  {acting ? 'Updating…' : '✅ Mark as Delivered'}
                </button>
              )}
            </div>

            </div>
        )}

        {/* Location Update Card - Always visible if driver loaded */}
        {!loading && driver && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mt-4">
            <h2 className="font-semibold mb-4 text-emerald-400">Update Current Location</h2>
            <div className="space-y-4">
              <button onClick={handleLocationBrowser} disabled={acting}
                className="w-full py-2.5 bg-gray-800 border border-gray-700 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2">
                📍 Use Browser Geolocation
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-800"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-gray-900 px-2 text-gray-500">Or Manual Input</span></div>
              </div>

              <form onSubmit={handleLocationManual} className="grid grid-cols-2 gap-3">
                <input type="number" step="any" placeholder="Latitude" required
                  value={locForm.lat} onChange={e => setLocForm({...locForm, lat: e.target.value})}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500" />
                <input type="number" step="any" placeholder="Longitude" required
                  value={locForm.lng} onChange={e => setLocForm({...locForm, lng: e.target.value})}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500" />
                <button type="submit" disabled={acting}
                  className="col-span-2 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-sm font-semibold rounded-lg hover:bg-emerald-600/30 transition">
                  Update Manually
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DriverPage;
