
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type VideoStatus = 'processing' | 'ready' | 'failed';

interface VideoMetadata {
  duration?: number;
  width?: number;
  height?: number;
  format?: string;
  bitrate?: number;
}

interface UseVideoStatusProps {
  videoId: string;
  onStatusChange?: (status: VideoStatus, metadata?: VideoMetadata) => void;
}

export function useVideoStatus({ videoId, onStatusChange }: UseVideoStatusProps) {
  const [status, setStatus] = useState<VideoStatus | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchVideoStatus = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('videos')
          .select('status, duration, thumbnail_url')
          .eq('id', videoId)
          .single();

        if (error) throw error;
        
        if (isMounted) {
          setStatus(data.status as VideoStatus);
          
          // Extract available metadata
          const videoMetadata: VideoMetadata = {};
          if (data.duration) videoMetadata.duration = data.duration;
          
          setMetadata(videoMetadata);
          setIsLoading(false);
          
          if (onStatusChange && data.status) {
            onStatusChange(data.status as VideoStatus, videoMetadata);
          }
        }
      } catch (err) {
        console.error('Error fetching video status:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setIsLoading(false);
        }
      }
    };

    // Fetch initial status
    fetchVideoStatus();

    // Subscribe to changes
    const channel = supabase
      .channel('video-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'videos',
          filter: `id=eq.${videoId}`,
        },
        (payload) => {
          if (isMounted) {
            const newStatus = payload.new.status as VideoStatus;
            setStatus(newStatus);
            
            // Extract available metadata from the update
            const videoMetadata: VideoMetadata = {};
            if (payload.new.duration) videoMetadata.duration = payload.new.duration;
            
            setMetadata(videoMetadata);
            
            if (onStatusChange) {
              onStatusChange(newStatus, videoMetadata);
            }
          }
        }
      )
      .subscribe();

    // Clean up
    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [videoId, onStatusChange]);

  return { status, metadata, isLoading, error };
}
