
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type VideoStatus = 'processing' | 'ready' | 'failed';

interface UseVideoStatusProps {
  videoId: string;
  onStatusChange?: (status: VideoStatus) => void;
}

export function useVideoStatus({ videoId, onStatusChange }: UseVideoStatusProps) {
  const [status, setStatus] = useState<VideoStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchVideoStatus = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('videos')
          .select('status')
          .eq('id', videoId)
          .single();

        if (error) throw error;
        
        if (isMounted) {
          setStatus(data.status as VideoStatus);
          setIsLoading(false);
          if (onStatusChange && data.status) {
            onStatusChange(data.status as VideoStatus);
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
            if (onStatusChange) {
              onStatusChange(newStatus);
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

  return { status, isLoading, error };
}
