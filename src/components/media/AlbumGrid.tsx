
import React from 'react';
import Link from 'next/link';
import { Album } from '@/types/media';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface AlbumGridProps {
  albums: Album[];
  isLoading: boolean;
}

export const AlbumGrid: React.FC<AlbumGridProps> = ({ albums, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden">
            <Skeleton className="w-full h-40" />
            <Skeleton className="w-3/4 h-5 mt-2" />
            <Skeleton className="w-1/2 h-4 mt-1" />
          </div>
        ))}
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">No albums found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {albums.map((album) => (
        <Link href={`/albums/${album.id}`} key={album.id}>
          <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
            <div className="aspect-video relative bg-black/20">
              {album.cover_image_url ? (
                <img 
                  src={album.cover_image_url} 
                  alt={album.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Cover
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <h3 className="font-medium text-base line-clamp-1">{album.title}</h3>
              {album.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {album.description}
                </p>
              )}
            </CardContent>
            <CardFooter className="p-3 pt-0 text-xs text-muted-foreground">
              {format(new Date(album.created_at), 'MMM d, yyyy')}
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
};
