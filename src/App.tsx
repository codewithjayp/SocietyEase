import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Suspense, lazy } from 'react';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Loading Component
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#181c20]">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
      <p className="text-indigo-400 font-medium animate-pulse text-sm">Loading...</p>
    </div>
  </div>
);

// Lazy Loaded Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResidentHome = lazy(() => import('./pages/resident/ResidentHome'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminComplaints = lazy(() => import('./pages/admin/AdminComplaints'));
const AdminNotices = lazy(() => import('./pages/admin/AdminNotices'));
const AdminExpenses = lazy(() => import('./pages/admin/AdminExpenses'));
const AdminBilling = lazy(() => import('./pages/admin/AdminBilling'));
const ResidentBilling = lazy(() => import('./pages/resident/ResidentBilling'));
const GuardPortal = lazy(() => import('./pages/guard/GuardPortal'));
const GateLogs = lazy(() => import('./pages/guard/GateLogs'));

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
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
