import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MediaItem } from '@/types/albums';
import { Eye, Heart, Clock, Image as FileImage, FileVideo, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

interface MediaGridProps {
  mediaItems: MediaItem[];
  albumId: string;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

// Helper function to format duration
const formatDuration = (seconds: number | null): string => {
  if (!seconds) return '';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Error boundary component
class MediaGridErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-white/60">
          <FileImage className="h-12 w-12 mb-4 opacity-50" />
          <p>Something went wrong loading the media grid</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component
const MediaGridSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="aspect-square bg-black/20 animate-pulse rounded-md" />
    ))}
  </div>
);

// Media item component with error handling
const MediaItemComponent: React.FC<{ item: MediaItem; albumId: string }> = ({ item, albumId }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <Link 
      to={`/albums/${albumId}/media/${item.id}`}
      className="block transition-transform hover:scale-[1.02]"
      aria-label={`View ${item.description || 'media item'}`}
    >
      <div className="relative aspect-square">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white/30" />
          </div>
        )}
        
        {item.file_type.startsWith('image/') ? (
          <img 
            src={imageError ? '/placeholder-image.jpg' : (item.thumbnail_url || item.url)}
            alt={item.description || 'Album media'} 
            className="object-cover w-full h-full rounded-md"
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : item.file_type.startsWith('video/') ? (
          <div className="relative w-full h-full">
            <img 
              src={imageError ? '/placeholder-video.jpg' : (item.thumbnail_url || item.url)}
              alt={item.description || 'Video thumbnail'} 
              className="object-cover w-full h-full rounded-md"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-3">
                <FileVideo className="h-8 w-8 text-white" />
              </div>
            </div>
            {item.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(item.duration)}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black/40 rounded-md">
            <FileImage className="h-12 w-12 text-white/30" />
          </div>
        )}
      </div>
      
      <div className="mt-2">
        {item.description && (
          <p className="text-sm text-white truncate">{item.description}</p>
        )}
        
        <div className="flex items-center justify-between mt-1 text-xs text-white/60">
          <div className="flex items-center gap-3">
            <span className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {item.views}
            </span>
            <span className="flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              {item.likes}
            </span>
          </div>
          
          <span className="text-xs">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  );
};

const MediaGrid: React.FC<MediaGridProps> = ({ 
  mediaItems, 
  albumId,
  isLoading = false,
  onLoadMore,
  hasMore = false
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onLoadMore, hasMore]);

  if (isLoading && !mediaItems.length) {
    return <MediaGridSkeleton />;
  }

  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/60">
        <FileImage className="h-12 w-12 mb-4 opacity-50" />
        <p>No media items in this album yet</p>
      </div>
    );
  }

  return (
    <MediaGridErrorBoundary>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaItems.map(item => (
          <Suspense key={item.id} fallback={<MediaGridSkeleton />}>
            <MediaItemComponent item={item} albumId={albumId} />
          </Suspense>
        ))}
      </div>
      
      {hasMore && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-white/30" />}
        </div>
      )}
    </MediaGridErrorBoundary>
  );
};

export default MediaGrid;
