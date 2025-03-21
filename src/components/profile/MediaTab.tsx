
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Image, Film } from 'lucide-react';

const MediaTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Button variant="outline" className="border-white/20 bg-black/30 text-white hover:bg-white/10">
          <Image size={18} className="mr-2" /> Photos
        </Button>
        <Button variant="outline" className="border-white/20 bg-black/30 text-white hover:bg-white/10">
          <Film size={18} className="mr-2" /> Videos
        </Button>
      </div>
      
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Media Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[200px] flex flex-col items-center justify-center border border-dashed border-white/20 rounded-md p-8">
            <Upload className="h-10 w-10 text-white/40 mb-3" />
            <p className="text-white/70 text-center">No media uploaded yet</p>
            <Button className="mt-4 bg-crimson hover:bg-crimson/80">
              Upload Media
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">When you upload photos and videos, they'll appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaTab;
