
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Folder, PlusSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Album, Media } from '@/types/media';
import { MediaGrid } from '@/components/media/MediaGrid';
import { AlbumGrid } from '@/components/media/AlbumGrid';
import { ensureNonNullString, safeSetToArray } from '@/utils/typeUtils';

interface MediaTabProps {
  userId: string;
  isCurrentUser: boolean;
}

const MediaTab: React.FC<MediaTabProps> = ({ userId, isCurrentUser }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'albums'>('all');
  const [media, setMedia] = useState<Media[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaCount, setMediaCount] = useState(0);
  const [albumCount, setAlbumCount] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (userId) {
      fetchUserMedia();
      fetchUserAlbums();
    }
  }, [userId]);

  const fetchUserMedia = async () => {
    try {
      setIsLoading(true);
      
      const { data, error, count } = await supabase
        .from('media')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .is('album_id', null)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setMedia(data || []);
      setMediaCount(count || 0);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserAlbums = async () => {
    try {
      const { data, error, count } = await supabase
        .from('albums')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setAlbums(data);
      }
      
      if (count) {
        setAlbumCount(count);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const handleMediaSelect = (mediaId: string) => {
    setSelectedMedia(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(mediaId)) {
        newSelection.delete(mediaId);
      } else {
        newSelection.add(mediaId);
      }
      return newSelection;
    });
  };

  const handleAddToAlbum = async () => {
    if (selectedMedia.size === 0 || !isCurrentUser) return;
    
    // Convert Set to Array to avoid TypeScript issues
    const selectedMediaArray = safeSetToArray(selectedMedia);
    
    const albumId = prompt('Enter album ID to add media to:');
    if (!albumId) return;
    
    try {
      const { error } = await supabase
        .from('media')
        .update({ album_id: albumId })
        .in('id', selectedMediaArray);
        
      if (error) throw error;
      
      // Refresh media list
      fetchUserMedia();
      setSelectedMedia(new Set());
    } catch (error) {
      console.error('Error adding media to album:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <Button 
            onClick={() => setActiveTab('all')}
            variant={activeTab === 'all' ? 'default' : 'outline'}
          >
            All Media ({mediaCount})
          </Button>
          <Button 
            onClick={() => setActiveTab('albums')}
            variant={activeTab === 'albums' ? 'default' : 'outline'}
          >
            Albums ({albumCount})
          </Button>
        </div>
        
        {isCurrentUser && (
          <div className="flex space-x-2">
            {activeTab === 'all' && selectedMedia.size > 0 && (
              <Button onClick={handleAddToAlbum}>
                <Folder className="h-4 w-4 mr-2" />
                Add to Album
              </Button>
            )}
            
            {activeTab === 'albums' && (
              <Button onClick={() => router.push('/albums/new')}>
                <PlusSquare className="h-4 w-4 mr-2" />
                New Album
              </Button>
            )}
            
            {activeTab === 'all' && (
              <Button onClick={() => router.push('/upload')}>
                <PlusSquare className="h-4 w-4 mr-2" />
                Upload
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        {activeTab === 'all' && (
          <MediaGrid 
            media={media}
            isLoading={isLoading}
            selectable={isCurrentUser}
            selectedMedia={selectedMedia}
            onSelectMedia={handleMediaSelect}
          />
        )}
        
        {activeTab === 'albums' && (
          <AlbumGrid
            albums={albums}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default MediaTab;
