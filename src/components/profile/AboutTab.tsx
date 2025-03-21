
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, CalendarDays, MapPin, Heart, Lock, User, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const AboutTab: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  
  useEffect(() => {
    if (user?.id) {
      const fetchProfileData = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          setProfileData(data);
        }
      };
      
      fetchProfileData();
    }
  }, [user]);
  
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

  const username = profileData?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const birthday = profileData?.birthday || user?.user_metadata?.birthday;
  const location = profileData?.location || user?.user_metadata?.location;
  const orientation = profileData?.orientation || user?.user_metadata?.orientation;
  const visibility = profileData?.visibility || user?.user_metadata?.visibility || 'Public';
  const bio = profileData?.bio || user?.user_metadata?.bio;

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
              <p>{username}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Birthday</p>
              <p>{formatDate(birthday)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Location</p>
              <p>{location || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Orientation</p>
              <p>{orientation || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Profile Visibility</p>
              <p>{visibility}</p>
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
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <p className="whitespace-pre-wrap">{bio || 'No bio information provided yet. Tell others about yourself!'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutTab;
