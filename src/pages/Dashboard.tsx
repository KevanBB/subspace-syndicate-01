
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import PostForm from '@/components/profile/PostForm';
import PostsList from '@/components/profile/PostsList';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss">
      <SidebarProvider defaultOpen={true}>
        <div className="flex w-full">
          <DashboardSidebar />
          
          <SidebarInset className="flex-1">
            <div className="container px-4 py-6">
              <div className="flex items-center mb-6">
                <SidebarTrigger className="mr-2" />
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto"
              >
                {/* Post creation */}
                <Card className="bg-black/20 border-white/10 backdrop-blur-md p-6 mb-6">
                  <PostForm />
                </Card>

                {/* Posts list */}
                <PostsList />
              </motion.div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
