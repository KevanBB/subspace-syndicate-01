
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface AboutTabViewProps {
  profile: {
    username?: string;
    birthday?: string;
    location?: string;
    orientation?: string;
    visibility?: string;
    bio?: string;
    looking_for?: string;
    kinks?: string;
    soft_limits?: string;
    hard_limits?: string;
  };
}

const AboutTabView: React.FC<AboutTabViewProps> = ({ profile }) => {
  const bio = profile?.bio;

  return (
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
  );
};

export default AboutTabView;
