
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthenticatedLayout from './components/layout/AuthenticatedLayout';
import SpinTheWheelPage from './pages/SpinTheWheel';

// Import pages using default imports
import Index from './pages/Index';
import Auth from './pages/Auth';  
import Profile from './pages/Profile';
import Community from './pages/Community';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import ProfileView from './pages/ProfileView';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/profile" element={
            <AuthenticatedLayout>
              <Profile />
            </AuthenticatedLayout>
          } />
          <Route path="/community" element={
            <AuthenticatedLayout>
              <Community />
            </AuthenticatedLayout>
          } />
          <Route path="/settings" element={
            <AuthenticatedLayout>
              <Settings />
            </AuthenticatedLayout>
          } />
           <Route path="/admin" element={
            <AuthenticatedLayout>
              <AdminDashboard />
            </AuthenticatedLayout>
          } />
          <Route path="/profile/:userId" element={
            <AuthenticatedLayout>
              <ProfileView />
            </AuthenticatedLayout>
          } />
           <Route path="/messages" element={
            <AuthenticatedLayout>
              <Messages />
            </AuthenticatedLayout>
          } />
          <Route path="/creator-application" element={
            <AuthenticatedLayout>
              <Settings />
            </AuthenticatedLayout>
          } />
          <Route path="/spin-the-wheel" element={
            <AuthenticatedLayout>
              <SpinTheWheelPage />
            </AuthenticatedLayout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
