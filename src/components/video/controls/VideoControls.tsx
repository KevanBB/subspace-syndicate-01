
import React from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  SkipBack, SkipForward
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import VolumeControl from './VolumeControl';
import TimeDisplay from './TimeDisplay';

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  showControls: boolean;
  togglePlay: () => void;
  skip: (seconds: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  handleTimeChange: (value: number[]) => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  showControls,
  togglePlay,
  skip,
  toggleMute,
  toggleFullscreen,
  handleTimeChange
}) => {
  return (
    <div 
      className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Progress bar */}
      <div className="flex items-center mb-2">
        <TimeDisplay currentTime={currentTime} />
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={handleTimeChange}
          className="flex-1"
        />
        <TimeDisplay currentTime={duration} />
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
          
          <VolumeControl 
            isMuted={isMuted} 
            volume={volume} 
            toggleMute={toggleMute} 
            handleVolumeChange={(value) => handleTimeChange(value)}
          />
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
  );
};

export default VideoControls;
