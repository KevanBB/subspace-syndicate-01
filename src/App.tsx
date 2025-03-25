import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import CommunityPage from './pages/CommunityPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import PublicProfilePage from './pages/PublicProfilePage';
import MessagesPage from './pages/MessagesPage';
import NotFoundPage from './pages/NotFoundPage';
import CreatorApplicationPage from './pages/CreatorApplicationPage';
import SpinTheWheelPage from './pages/SpinTheWheel';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUpPage />} />
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
              <CreatorApplicationPage />
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
