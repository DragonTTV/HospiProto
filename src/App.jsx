import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardHR from './pages/DashboardHR';
import DashboardDoctor from './pages/DashboardDoctor';
import DashboardReceptionist from './pages/DashboardReceptionist';

// Simple placeholder for Staff (prevents redirect loops)
const DashboardStaff = () => {
  const { logout } = useAuth();
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Staff Dashboard</h1>
      <p>Welcome, Staff Member.</p>
      <button onClick={logout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Logout</button>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  // If role is required but user doesn't have it, send them to valid home based on THEIR role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route 
            path="/hr-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <DashboardHR />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/doctor-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DashboardDoctor />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/reception-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['receptionist']}>
                <DashboardReceptionist />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;