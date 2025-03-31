import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderClosed, ImagePlus, Loader2 } from 'lucide-react';
import AlbumCard from './AlbumCard';

interface Album {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  privacy: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function MediaTab() {
  const { user } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Album[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  
  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      if (!username) throw new Error('Username is required');
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();
        
      if (profileError) throw profileError;
      if (!profileData) throw new Error('Profile not found');
      
      const profileId = profileData.id;
      
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .select('*')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });
        
      if (albumError) throw albumError;
      
      setAlbums(albumData || []);
      setIsOwnProfile(user?.user_metadata?.username === username);
    } catch (error: any) {
      console.error('Error fetching albums:', error);
      toast({
        title: 'Error fetching albums',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [username, user]);
  
  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);
  
  const onCreateAlbum = () => {
    setCreatingAlbum(true);
    navigate('/create-album');
  };
  
  return (
    <Card className="bg-black/30 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">
          Albums
        </CardTitle>
        {isOwnProfile && (
          <Button onClick={onCreateAlbum} disabled={creatingAlbum}>
            {creatingAlbum ? (
              <>
                Creating <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Create Album <ImagePlus className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-full h-48 rounded-lg" />
            ))}
          </div>
        ) : (albums && albums.length > 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {albums && albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-gray-700 rounded-lg mt-6">
            <FolderClosed className="h-12 w-12 mx-auto text-gray-500 mb-3" />
            <h3 className="text-xl font-medium text-gray-200">No Albums Yet</h3>
            <p className="text-gray-400 mt-2 max-w-md mx-auto">
              {isOwnProfile 
                ? "You haven't created any albums yet. Create your first album to organize your media."
                : "This user hasn't created any albums yet."}
            </p>
            {isOwnProfile && (
              <Button className="mt-4" onClick={onCreateAlbum}>
                Create Album
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
