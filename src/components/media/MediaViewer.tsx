
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Heart, BookmarkIcon, Eye, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MediaItem } from '@/types/albums';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface MediaViewerProps {
  mediaItem: MediaItem;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onDownload: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ 
  mediaItem, 
  isLiked, 
  isBookmarked, 
  onLike, 
  onBookmark, 
  onDownload 
}) => {
  const { user } = useAuth();
  const isOwner = user?.id === mediaItem.user_id;
  
  return (
    <Card className="bg-black/20 border-white/10 overflow-hidden">
      <div className="relative">
        {mediaItem.file_type.startsWith('image/') ? (
          <img 
            src={mediaItem.url} 
            alt={mediaItem.description || 'Media preview'} 
            className="w-full h-auto"
          />
        ) : mediaItem.file_type.startsWith('video/') ? (
          <video 
            src={mediaItem.url}
            controls
            className="w-full h-auto"
            poster={mediaItem.thumbnail_url || undefined}
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center bg-black/40">
            <p className="text-white/60">Unsupported media type</p>
          </div>
        )}
      </div>
      
      <CardFooter className="flex justify-between p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant={isLiked ? "default" : "outline"} 
            size="sm"
            onClick={onLike}
            className={isLiked ? "bg-crimson hover:bg-crimson/90" : ""}
          >
            <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-white" : ""}`} />
            {mediaItem.likes}
          </Button>
          
          <Button 
            variant={isBookmarked ? "default" : "outline"} 
            size="sm"
            onClick={onBookmark}
            className={isBookmarked ? "bg-crimson hover:bg-crimson/90" : ""}
          >
            <BookmarkIcon className={`mr-1 h-4 w-4 ${isBookmarked ? "fill-white" : ""}`} />
            Bookmark
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-white/70 px-3 py-1 rounded-md border border-white/10 bg-black/20">
            <Eye className="h-4 w-4" />
            <span>{mediaItem.views}</span>
          </div>
          
          {(isOwner || mediaItem.file_type.startsWith('image/')) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                {mediaItem.file_type.startsWith('image/') && (
                  <DropdownMenuItem onClick={onDownload} className="cursor-pointer">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="lucide lucide-download mr-2 h-4 w-4"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default MediaViewer;
