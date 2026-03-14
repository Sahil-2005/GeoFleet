import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleColors = {
    FLEET_ADMIN: 'text-purple-400',
    DISPATCHER:  'text-blue-400',
    DRIVER:      'text-emerald-400',
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">GF</span>
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">GeoFleet</span>
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user.email}</span>
          <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-gray-800 ${roleColors[user.role]}`}>
            {user.role.replace('_', ' ')}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
