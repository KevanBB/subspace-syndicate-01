
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-abyss py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center"
    >
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="text-2xl font-bold text-white flex items-center justify-center mb-2"
          >
            <span className="text-gradient font-poppins">SubSpace</span>
          </motion.div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Welcome to the revolution
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Unleash. Connect. Dominate.
          </p>
        </div>

        <div className="glass p-6 sm:p-8 rounded-xl backdrop-blur-md border border-white/10">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm />
            </TabsContent>

            <TabsContent value="signup">
              <SignupForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
};

export default Auth;
