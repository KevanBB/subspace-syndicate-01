
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthenticatedLayout from './components/layout/AuthenticatedLayout';
import SpinTheWheelPage from './pages/SpinTheWheel';

// Import pages from the correct locations
import { Index as LandingPage } from './pages/Index';
import { Auth as LoginPage } from './pages/Auth';  
import { Profile as ProfilePage } from './pages/Profile';
import { Community as CommunityPage } from './pages/Community';
import { Settings as SettingsPage } from './pages/Settings';
import { AdminDashboard as AdminPage } from './pages/AdminDashboard';
import { ProfileView as PublicProfilePage } from './pages/ProfileView';
import { Messages as MessagesPage } from './pages/Messages';
import { NotFound as NotFoundPage } from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={
            <AuthenticatedLayout>
              <ProfilePage />
            </AuthenticatedLayout>
          } />
          <Route path="/community" element={
            <AuthenticatedLayout>
              <CommunityPage />
            </AuthenticatedLayout>
          } />
          <Route path="/settings" element={
            <AuthenticatedLayout>
              <SettingsPage />
            </AuthenticatedLayout>
          } />
           <Route path="/admin" element={
            <AuthenticatedLayout>
              <AdminPage />
            </AuthenticatedLayout>
          } />
          <Route path="/profile/:userId" element={
            <AuthenticatedLayout>
              <PublicProfilePage />
            </AuthenticatedLayout>
          } />
           <Route path="/messages" element={
            <AuthenticatedLayout>
              <MessagesPage />
            </AuthenticatedLayout>
          } />
          <Route path="/creator-application" element={
            <AuthenticatedLayout>
              <SettingsPage />
            </AuthenticatedLayout>
          } />
          <Route path="/spin-the-wheel" element={
            <AuthenticatedLayout>
              <SpinTheWheelPage />
            </AuthenticatedLayout>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
