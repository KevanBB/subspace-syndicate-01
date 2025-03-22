
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, CalendarDays, MapPin, Heart, Lock, User, FileText, Search, Shield, AlertCircle } from 'lucide-react';

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
  const lookingFor = profileData?.looking_for || 'Not specified';
  const kinks = profileData?.kinks || 'Not specified';
  const softLimits = profileData?.soft_limits || 'Not specified';
  const hardLimits = profileData?.hard_limits || 'Not specified';

  return (
    <div className="space-y-6">
      {/* Bio Section */}
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
      
      {/* User Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Username</p>
              <p className="text-white">{username}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Birthday</p>
              <p className="text-white">{formatDate(birthday)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Location</p>
              <p className="text-white">{location || 'Not specified'}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Orientation</p>
              <p className="text-white">{orientation || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Profile Visibility</p>
              <p className="text-white">{visibility}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Looking For */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Looking For</CardTitle>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="text-white/80">
          <div className="flex items-start gap-3">
            <Search className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <p className="whitespace-pre-wrap">{lookingFor}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Kinks/Fetishes */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Kinks/Fetishes</CardTitle>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="text-white/80">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <p className="whitespace-pre-wrap">{kinks}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Soft Limits */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Soft Limits</CardTitle>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="text-white/80">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <p className="whitespace-pre-wrap">{softLimits}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Hard Limits */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Hard Limits</CardTitle>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="text-white/80">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <p className="whitespace-pre-wrap">{hardLimits}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutTab;
