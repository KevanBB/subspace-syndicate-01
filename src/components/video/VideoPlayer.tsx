
import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  SkipBack, SkipForward, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

type VideoPlayerProps = {
  videoUrl: string;
  title?: string;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  
  // Hide controls after inactivity
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    const containerEl = videoContainerRef.current;
    
    if (containerEl) {
      containerEl.addEventListener('mousemove', resetTimeout);
      containerEl.addEventListener('mousedown', resetTimeout);
      containerEl.addEventListener('touchstart', resetTimeout);
    }
    
    resetTimeout();
    
    return () => {
      clearTimeout(timeout);
      if (containerEl) {
        containerEl.removeEventListener('mousemove', resetTimeout);
        containerEl.removeEventListener('mousedown', resetTimeout);
        containerEl.removeEventListener('touchstart', resetTimeout);
      }
    };
  }, [isPlaying]);
  
  // Handle video events
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const onTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };
    
    const onDurationChange = () => {
      setDuration(videoElement.duration);
    };
    
    const onEnded = () => {
      setIsPlaying(false);
    };
    
    const onPlay = () => {
      setIsPlaying(true);
    };
    
    const onPause = () => {
      setIsPlaying(false);
    };
    
    const onVolumeChange = () => {
      setVolume(videoElement.volume);
      setIsMuted(videoElement.muted);
    };
    
    const onWaiting = () => {
      setIsBuffering(true);
    };
    
    const onCanPlay = () => {
      setIsBuffering(false);
    };
    
    videoElement.addEventListener('timeupdate', onTimeUpdate);
    videoElement.addEventListener('durationchange', onDurationChange);
    videoElement.addEventListener('ended', onEnded);
    videoElement.addEventListener('play', onPlay);
    videoElement.addEventListener('pause', onPause);
    videoElement.addEventListener('volumechange', onVolumeChange);
    videoElement.addEventListener('waiting', onWaiting);
    videoElement.addEventListener('canplay', onCanPlay);
    
    return () => {
      videoElement.removeEventListener('timeupdate', onTimeUpdate);
      videoElement.removeEventListener('durationchange', onDurationChange);
      videoElement.removeEventListener('ended', onEnded);
      videoElement.removeEventListener('play', onPlay);
      videoElement.removeEventListener('pause', onPause);
      videoElement.removeEventListener('volumechange', onVolumeChange);
      videoElement.removeEventListener('waiting', onWaiting);
      videoElement.removeEventListener('canplay', onCanPlay);
    };
  }, []);
  
  // Toggle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };
  
  // Skip forward/backward
  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime += seconds;
  };
  
  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    const container = videoContainerRef.current;
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle slider change
  const handleTimeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = value[0];
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = value[0];
    if (value[0] === 0) {
      video.muted = true;
    } else if (video.muted) {
      video.muted = false;
    }
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="relative w-full bg-black rounded-lg overflow-hidden"
      ref={videoContainerRef}
      onDoubleClick={toggleFullscreen}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        onClick={togglePlay}
        className="w-full h-full"
        playsInline
      />
      
      {/* Loading overlay */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
        </div>
      )}
      
      {/* Controls */}
      <div 
        className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Title (only in fullscreen) */}
        {isFullscreen && title && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
            <h3 className="text-white font-medium">{title}</h3>
          </div>
        )}
        
        {/* Progress bar */}
        <div className="flex items-center mb-2">
          <span className="text-white text-xs mr-2">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleTimeChange}
            className="flex-1"
          />
          <span className="text-white text-xs ml-2">{formatTime(duration)}</span>
        </div>
        
        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(-10)}
              className="text-white hover:bg-white/20"
            >
              <SkipBack size={20} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(10)}
              className="text-white hover:bg-white/20"
            >
              <SkipForward size={20} />
            </Button>
            
            <div className="flex items-center ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>
              
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-20 ml-1"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
