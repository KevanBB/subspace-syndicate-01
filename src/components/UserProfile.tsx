
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const UserProfile = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Your Profile</h2>
        <p className="text-white/70">Welcome to your SubSpace account</p>
      </div>

      <div className="w-full max-w-md bg-black/20 p-6 rounded-lg backdrop-blur-lg border border-white/10">
        <div className="space-y-4">
          <div>
            <p className="text-white/50 text-sm">Email</p>
            <p className="text-white">{user?.email}</p>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <Button onClick={signOut} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
