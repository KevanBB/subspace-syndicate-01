
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Camera } from 'lucide-react';

const ProfileHeader: React.FC = () => {
  const { user } = useAuth();
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  
  return (
    <div className="relative">
      {/* Banner Image with overlay for editing */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-gray-800 to-abyss rounded-b-lg overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" 
             style={{ backgroundImage: "url('/placeholder.svg')" }}>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <Button 
          className="absolute bottom-2 right-2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
          size="icon"
          variant="ghost"
        >
          <Camera size={18} />
        </Button>
      </div>
      
      {/* Avatar and basic info */}
      <div className="relative px-4 sm:px-6 -mt-12 flex flex-col items-center sm:items-start">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-background shadow-md">
            <AvatarImage src="/placeholder.svg" alt={username} />
            <AvatarFallback className="bg-crimson text-white text-xl">
              {username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button 
            className="absolute bottom-0 right-0 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5"
            size="icon"
            variant="ghost"
          >
            <Edit size={14} />
          </Button>
        </div>
        
        {/* User info */}
        <div className="mt-4 w-full text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-bold text-white">{username}</h2>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Edit size={14} />
            </Button>
          </div>
          <p className="text-gray-400 mt-1">
            {user?.user_metadata?.orientation || 'No orientation set'} • {user?.user_metadata?.location || 'No location set'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
