import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import { Login } from './pages/Login';
import { RoleLayout } from './components/RoleLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { MentorDashboard } from './pages/mentor/MentorDashboard';
import { MenteeDashboard } from './pages/mentee/MenteeDashboard';
import { ContributionFormPage } from './pages/mentee/ContributionFormPage';
import { ContributionDetailPage } from './pages/contributions/ContributionDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Root redirect based on active user role
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'mentor':
      return <Navigate to="/mentor/dashboard" replace />;
    case 'mentee':
      return <Navigate to="/mentee/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Admin routes protected for 'admin' role */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <RoleLayout roleTitle="Administrator" allowedRole="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Mentor routes protected for 'mentor' role */}
      <Route
        path="/mentor"
        element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <RoleLayout roleTitle="Mentor" allowedRole="mentor" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<MentorDashboard />} />
      </Route>

      {/* Mentee routes protected for 'mentee' role */}
      <Route
        path="/mentee"
        element={
          <ProtectedRoute allowedRoles={['mentee']}>
            <RoleLayout roleTitle="Mentee" allowedRole="mentee" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<MenteeDashboard />} />
        <Route path="contributions/new" element={<Navigate to="/mentee/dashboard" replace />} />
        <Route path="contributions/edit/:id" element={<ContributionFormPage />} />
      </Route>

      {/* Contribution detail accessible to all permitted roles */}
      <Route
        path="/contributions/:id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'mentor', 'mentee']}>
            <RoleLayout roleTitle="Contribution Details" />
          </ProtectedRoute>
        }
      >
        <Route index element={<ContributionDetailPage />} />
      </Route>

      {/* Shared protected profile route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['admin', 'mentor', 'mentee']}>
            <RoleLayout roleTitle="User Profile" />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProfilePage />} />
      </Route>

      {/* Access Denied and Fallbacks */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
