
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    setIsLoaded(true);
  }, [user, loading, navigate]);

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UserProfile />
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
