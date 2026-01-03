import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/Home';
import UserDetailsPage from './pages/UserDetails';
import AdminAuthPage from './pages/AdminAuth';

// Component to handle redirects based on auth state
const AdminAuthRedirect = () => {
  const { isAuthenticated, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page even when authenticated (allows logout)
  return <AdminAuthPage />;
};

function App() {
  return (
    <AdminProvider>
      <Routes>
        <Route path="/admin-auth" element={<AdminAuthRedirect />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:employeeId"
          element={
            <ProtectedRoute>
              <UserDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminProvider>
  );
}

export default App;
