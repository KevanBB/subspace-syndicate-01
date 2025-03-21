
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, CalendarDays, MapPin, Heart, Lock, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const AboutTab: React.FC = () => {
  const { user } = useAuth();
  const metadata = user?.user_metadata || {};
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Basic Information</CardTitle>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="text-white/80 space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Username</p>
              <p>{metadata.username || user?.email?.split('@')[0] || 'Not set'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Birthday</p>
              <p>{formatDate(metadata.birthday)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Location</p>
              <p>{metadata.location || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Orientation</p>
              <p>{metadata.orientation || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Profile Visibility</p>
              <p>{metadata.visibility || 'Public'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Bio</CardTitle>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="text-white/80">
          <p>No bio information provided yet. Tell others about yourself!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutTab;
