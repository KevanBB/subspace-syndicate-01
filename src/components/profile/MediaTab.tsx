import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  FolderOpen, 
  PlusCircle, 
  ImageIcon, 
  Film, 
  Loader2 
} from 'lucide-react';
import AlbumGrid from '../media/AlbumGrid';
import MediaGrid from '../media/MediaGrid';

// Define proper types for Album and Media
export type AlbumPrivacy = 'public' | 'private' | 'friends-only';

export interface Album {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  privacy: AlbumPrivacy;
  likes: number;
  views: number;
}

export interface Media {
  id: string;
  album_id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  url: string;
  thumbnail_url?: string;
  title: string;
  description?: string;
  created_at: string;
  likes: number;
  views: number;
  width?: number;
  height?: number;
  duration?: number;
}

interface MediaTabProps {
  userId: string;
  isCurrentUser: boolean;
}

const MediaTab: React.FC<MediaTabProps> = ({ userId, isCurrentUser }) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchAlbumsAndMedia = async () => {
      setLoading(true);
      
      try {
        // Fetch albums
        const { data: albumsData, error: albumsError } = await supabase
          .from('albums')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (albumsError) throw albumsError;
        
        setAlbums(albumsData || []);
        
        // Fetch media (images/videos)
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (mediaError) throw mediaError;
        
        setMedia(mediaData || []);
      } catch (error: any) {
        console.error('Error fetching albums and media:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlbumsAndMedia();
  }, [userId]);
  
  const handleCreateAlbum = () => {
    navigate('/albums/create');
  };
  
  if (loading) {
    return (
      <Card className="bg-black/30 border-white/10 backdrop-blur-md shadow-lg shadow-crimson/5">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 text-crimson animate-spin mb-4" />
          <p className="text-white/70">Loading media...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Tabs defaultValue="albums" className="w-full">
      <div className="flex items-center justify-between mb-6">
        <TabsList className="bg-black/20 border border-white/10">
          <TabsTrigger value="albums">
            <FolderOpen className="mr-2 h-4 w-4" />
            Albums
          </TabsTrigger>
          <TabsTrigger value="media">
            <ImageIcon className="mr-2 h-4 w-4" />
            Media
          </TabsTrigger>
        </TabsList>
        
        {isCurrentUser && (
          <Button onClick={handleCreateAlbum} className="bg-crimson hover:bg-crimson/90 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Album
          </Button>
        )}
      </div>
      
      <TabsContent value="albums" className="mt-2">
        {albums.length > 0 ? (
          <AlbumGrid albums={albums} />
        ) : (
          <Card className="bg-black/30 border-white/10 backdrop-blur-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-8 w-8 text-white/50 mb-4" />
              <p className="text-white/70">No albums created yet.</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="media" className="mt-2">
        {media.length > 0 ? (
          <MediaGrid media={media} />
        ) : (
          <Card className="bg-black/30 border-white/10 backdrop-blur-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="h-8 w-8 text-white/50 mb-4" />
              <p className="text-white/70">No media uploaded yet.</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default MediaTab;
