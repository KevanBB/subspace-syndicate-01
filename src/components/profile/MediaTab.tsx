import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Image } from 'lucide-react';
import { useAlbums } from '@/hooks/useAlbums';
import AlbumCard from '@/components/albums/AlbumCard';

interface MediaTabProps {
  userId?: string;
}

const MediaTab: React.FC<MediaTabProps> = ({ userId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { albums, isLoadingAlbums } = useAlbums(userId);
  
  const isCurrentUser = !userId || userId === user?.id;
  
  const handleCreateAlbumClick = () => {
    navigate('/albums');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Media Albums</h2>
        {isCurrentUser && (
          <Button
            variant="outline"
            onClick={handleCreateAlbumClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            View All Albums
          </Button>
        )}
      </div>
      
      {isLoadingAlbums ? (
        <Card className="bg-black/20 border-white/10">
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-crimson"></div>
          </CardContent>
        </Card>
      ) : albums?.length === 0 ? (
        <Card className="bg-black/20 border-white/10">
          <CardContent className="py-12 text-center">
            <h3 className="text-xl font-medium text-white mb-2">No Albums Yet</h3>
            <p className="text-white/70 mb-6">
              {isCurrentUser 
                ? "You haven't created any albums yet" 
                : "This user hasn't created any public albums yet"}
            </p>
            
            {isCurrentUser && (
              <Button onClick={() => navigate('/albums/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Album
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {albums.slice(0, 6).map(album => (
            <AlbumCard key={album.id} album={album} />
          ))}
          {albums.length > 6 && (
            <Button
              variant="ghost"
              className="w-full h-[270px] border border-dashed border-white/20"
              onClick={() => navigate('/albums')}
            >
              <span className="flex flex-col items-center">
                <Plus className="h-6 w-6 mb-2" />
                View All Albums
              </span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaTab;
