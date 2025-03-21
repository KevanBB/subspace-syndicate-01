
import React from 'react';
import { useVideoStatus } from '@/hooks/useVideoStatus';
import { toast } from '@/components/ui/use-toast';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VideoProcessingStatusProps {
  videoId: string;
  onProcessingComplete?: () => void;
}

const VideoProcessingStatus: React.FC<VideoProcessingStatusProps> = ({ 
  videoId, 
  onProcessingComplete 
}) => {
  const [progress, setProgress] = React.useState(0);
  
  const { status, isLoading, error } = useVideoStatus({
    videoId,
    onStatusChange: (newStatus) => {
      if (newStatus === 'ready' && onProcessingComplete) {
        toast({
          title: "Processing complete",
          description: "Your video is now ready to view!",
        });
        onProcessingComplete();
      } else if (newStatus === 'failed') {
        toast({
          title: "Processing failed",
          description: "There was an error processing your video.",
          variant: "destructive"
        });
      }
    }
  });

  // Simulate progress for visual feedback
  React.useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) {
            return prev + Math.random() * 5;
          }
          return prev;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    } else if (status === 'ready') {
      setProgress(100);
    }
  }, [status]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-gray-400 animate-pulse" />
        <span className="text-sm text-gray-400">Checking status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-500">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Error checking status</span>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-amber-500" />
          <span className="text-sm text-amber-500">Processing...</span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className="flex items-center space-x-2 text-green-500">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-sm">Ready</span>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex items-center space-x-2 text-red-500">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Processing failed</span>
      </div>
    );
  }

  return null;
};

export default VideoProcessingStatus;
