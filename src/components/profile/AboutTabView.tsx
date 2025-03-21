
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, MapPin, Heart, Lock, User, FileText } from 'lucide-react';

interface AboutTabViewProps {
  profile: any;
}

const AboutTabView: React.FC<AboutTabViewProps> = ({ profile }) => {
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

  const username = profile?.username || 'User';
  const birthday = profile?.birthday;
  const location = profile?.location;
  const orientation = profile?.orientation;
  const visibility = profile?.visibility || 'Public';
  const bio = profile?.bio;

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Basic Information</CardTitle>
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
        <CardHeader>
          <CardTitle className="text-white">Bio</CardTitle>
        </CardHeader>
        <CardContent className="text-white/80">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <p className="whitespace-pre-wrap">{bio || 'No bio information provided yet.'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutTabView;
