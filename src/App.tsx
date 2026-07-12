import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResidentHome from './pages/resident/ResidentHome';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminNotices from './pages/admin/AdminNotices';
import AdminExpenses from './pages/admin/AdminExpenses';
import AdminBilling from './pages/admin/AdminBilling';
import ResidentBilling from './pages/resident/ResidentBilling';
import GuardPortal from './pages/guard/GuardPortal';
import GateLogs from './pages/guard/GateLogs';

// Component to handle root redirect based on authentication
const RootRedirect = () => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!currentUser || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  switch (userProfile.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'guard':
      return <Navigate to="/guard/dashboard" replace />;
    case 'resident':
    default:
      return <Navigate to="/resident/dashboard" replace />;
  }
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Protected Routes Wrapper */}
      <Route element={<MainLayout />}>
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/notices" element={<AdminNotices />} />
          <Route path="/admin/expenses" element={<AdminExpenses />} />
          <Route path="/admin/billing" element={<AdminBilling />} />
        </Route>

        {/* Resident Routes */}
        <Route element={<ProtectedRoute allowedRoles={['resident']} />}>
          <Route path="/resident/dashboard" element={<ResidentHome />} />
          <Route path="/resident/billing" element={<ResidentBilling />} />
        </Route>

        {/* Guard Routes */}
        <Route element={<ProtectedRoute allowedRoles={['guard']} />}>
          <Route path="/guard/dashboard" element={<GuardPortal />} />
          <Route path="/guard/logs" element={<GateLogs />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
