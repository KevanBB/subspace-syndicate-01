
import React from 'react';
import Link from 'next/link';
import { Media } from '@/types/media';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Check } from 'lucide-react';

interface MediaGridProps {
  media: Media[];
  isLoading: boolean;
  selectable?: boolean;
  selectedMedia?: Set<string>;
  onSelectMedia?: (id: string) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({ 
  media, 
  isLoading,
  selectable = false,
  selectedMedia = new Set(),
  onSelectMedia = () => {}
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden">
            <Skeleton className="w-full aspect-square" />
          </div>
        ))}
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">No media found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {media.map((item) => (
        <div key={item.id} className="relative group">
          <Card 
            className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
              selectable && selectedMedia.has(item.id) ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => selectable ? onSelectMedia(item.id) : null}
          >
            <div className="aspect-square relative bg-black/20">
              {item.thumbnail_url || item.url ? (
                <img 
                  src={item.thumbnail_url || item.url} 
                  alt={item.file_name || 'Media'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Thumbnail
                </div>
              )}
              
              {selectable && selectedMedia.has(item.id) && (
                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                  <Check size={16} />
                </div>
              )}
              
              {!selectable && (
                <Link href={`/media/${item.id}`} className="absolute inset-0">
                  <span className="sr-only">View {item.file_name || 'media'}</span>
                </Link>
              )}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};
