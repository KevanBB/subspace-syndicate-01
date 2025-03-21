
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ProfileView from "./pages/ProfileView";
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import HashtagSearch from "./pages/HashtagSearch";
import SubSpaceTVBrowse from "./pages/SubSpaceTVBrowse";
import SubSpaceTVUpload from "./pages/SubSpaceTVUpload";
import SubSpaceTVMyContent from "./pages/SubSpaceTVMyContent";
import VideoPage from "./pages/VideoPage";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import { useActivity } from "./utils/useActivity";

const queryClient = new QueryClient();

// Activity wrapper component to track user activity across the app
const ActivityTracker = ({ children }: { children: React.ReactNode }) => {
  useActivity();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ActivityTracker>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:username" element={<ProfileView />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/community" element={<Community />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/hashtag/:tag" element={<HashtagSearch />} />
                <Route path="/subspacetv" element={<SubSpaceTVBrowse />} />
                <Route path="/subspacetv/upload" element={<SubSpaceTVUpload />} />
                <Route path="/subspacetv/my-content" element={<SubSpaceTVMyContent />} />
                <Route path="/subspacetv/watch/:videoId" element={<VideoPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </ActivityTracker>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
