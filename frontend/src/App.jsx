import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Rentals from './pages/Rentals';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Setup from './pages/auth/Setup';
import CreateListing from './pages/listings/CreateListing';
import ListingDetail from './pages/listings/ListingDetail';
import Spinner from './components/ui/Spinner';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

// Minimal stub for edit listing
function EditListingStub() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-dark">Edit Listing</h1>
      <p className="text-muted mt-2">Coming soon.</p>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />

      {/* Protected setup route (outside Layout) */}
      <Route
        path="/setup"
        element={
          <ProtectedRoute>
            <Setup />
          </ProtectedRoute>
        }
      />

      {/* Public listing detail (no ProtectedRoute) */}
      <Route
        path="/listings/:id"
        element={
          <SocketProvider>
            <Layout>
              <ListingDetail />
            </Layout>
          </SocketProvider>
        }
      />

      {/* Protected app routes inside layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <SocketProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/rentals" element={<Rentals />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/listings/create" element={<CreateListing />} />
                  <Route path="/listings/:id/edit" element={<EditListingStub />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </SocketProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
