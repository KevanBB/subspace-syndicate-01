
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, FileText } from 'lucide-react';
import UserPostsList from './UserPostsList';

interface PostsTabProps {
  userId: string;
  isCurrentUser?: boolean;
}

const PostsTab: React.FC<PostsTabProps> = ({ userId, isCurrentUser = false }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [userId]);

  if (isLoading) {
    return (
      <Card className="bg-black/30 border-white/10 backdrop-blur-md shadow-lg shadow-crimson/5">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 text-crimson animate-spin mb-4" />
          <p className="text-white/70">Loading posts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <UserPostsList userId={userId} />
      </motion.div>
    </AnimatePresence>
  );
};

export default PostsTab;
