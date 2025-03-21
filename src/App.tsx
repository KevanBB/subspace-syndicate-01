
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Community from './pages/Community';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ProfileView from './pages/ProfileView';
import HashtagSearch from './pages/HashtagSearch';
import NotFound from './pages/NotFound';
import SubSpaceTVBrowse from './pages/SubSpaceTVBrowse';
import SubSpaceTVUpload from './pages/SubSpaceTVUpload';
import SubSpaceTVMyContent from './pages/SubSpaceTVMyContent';
import VideoWatchPage from './pages/VideoWatchPage';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:conversationId" element={<Messages />} />
            <Route path="/community" element={<Community />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:username" element={<ProfileView />} />
            <Route path="/hashtag/:tag" element={<HashtagSearch />} />
            <Route path="/subspacetv" element={<SubSpaceTVBrowse />} />
            <Route path="/subspacetv/upload" element={<SubSpaceTVUpload />} />
            <Route path="/subspacetv/my-content" element={<SubSpaceTVMyContent />} />
            <Route path="/subspacetv/watch/:id" element={<VideoWatchPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
