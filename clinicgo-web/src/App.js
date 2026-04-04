import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage           from './pages/auth/LoginPage';
import AdminDashboard      from './pages/admin/AdminDashboard';
import AdminDoctors        from './pages/admin/AdminDoctors';
import AdminAnalytics      from './pages/admin/AdminAnalytics';
import AdminOperations     from './pages/admin/AdminOperations';
import DoctorSchedule      from './pages/doctor/DoctorSchedule';
import DoctorStats         from './pages/doctor/DoctorStats';
import DoctorLabReports    from './pages/doctor/DoctorLabReports';
import AdminLayout         from './components/layout/AdminLayout';
import DoctorLayout        from './components/layout/DoctorLayout';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-outline">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'DOCTOR') return <Navigate to="/doctor/schedule" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard"  element={<AdminDashboard />} />
            <Route path="doctors"    element={<AdminDoctors />} />
            <Route path="analytics"  element={<AdminAnalytics />} />
            <Route path="operations" element={<AdminOperations />} />
          </Route>

          {/* Doctor web portal routes */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DoctorLayout />
            </ProtectedRoute>
          }>
            <Route path="schedule"   element={<DoctorSchedule />} />
            <Route path="stats"      element={<DoctorStats />} />
            <Route path="lab-reports" element={<DoctorLabReports />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
