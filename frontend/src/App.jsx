import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage      from './pages/LoginPage';
import AdminPage      from './pages/AdminPage';
import DispatcherPage from './pages/DispatcherPage';
import DriverPage     from './pages/DriverPage';

// Root redirect — sends logged-in users to their role page
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'FLEET_ADMIN') return <Navigate to="/admin"      replace />;
  if (user.role === 'DISPATCHER')  return <Navigate to="/dispatcher" replace />;
  return <Navigate to="/driver" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Role-gated */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['FLEET_ADMIN']}><AdminPage /></ProtectedRoute>
          } />
          <Route path="/dispatcher" element={
            <ProtectedRoute roles={['DISPATCHER']}><DispatcherPage /></ProtectedRoute>
          } />
          <Route path="/driver" element={
            <ProtectedRoute roles={['DRIVER']}><DriverPage /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
