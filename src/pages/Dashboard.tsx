
import React from 'react';
import { Card } from '@/components/ui/card';
import PostForm from '@/components/profile/PostForm';
import PostsList from '@/components/profile/PostsList';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

const Dashboard = () => {
  return (
    <AuthenticatedLayout pageTitle="Dashboard">
      <div className="max-w-3xl mx-auto">
        {/* Post creation */}
        <Card className="bg-black/20 border-white/10 backdrop-blur-md p-6 mb-6">
          <PostForm />
        </Card>

        {/* Posts list */}
        <PostsList />
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
