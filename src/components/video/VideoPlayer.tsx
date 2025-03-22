
import React from 'react';
import VideoControls from './controls/VideoControls';
import VideoBuffering from './VideoBuffering';
import VideoTitle from './VideoTitle';
import { useVideoPlayer } from './hooks/useVideoPlayer';
import { useFullscreen } from './hooks/useFullscreen';
import { useControls } from './hooks/useControls';

type VideoPlayerProps = {
  videoUrl: string;
  title?: string;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title }) => {
  // Custom hooks for player functionality
  const { 
    videoRef, 
    isPlaying, 
    currentTime, 
    duration, 
    volume, 
    isMuted, 
    isBuffering,
    togglePlay, 
    skip, 
    toggleMute, 
    handleTimeChange, 
    handleVolumeChange 
  } = useVideoPlayer(videoUrl);
  
  const { 
    containerRef, 
    isFullscreen, 
    toggleFullscreen 
  } = useFullscreen();
  
  const { 
    showControls 
  } = useControls(isPlaying, containerRef);

  return (
    <div 
      className="relative w-full bg-black rounded-lg overflow-hidden"
      ref={containerRef}
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
      <VideoBuffering isBuffering={isBuffering} />
      
      {/* Title (only in fullscreen) */}
      <VideoTitle title={title} isFullscreen={isFullscreen} />
      
      {/* Controls */}
      <VideoControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        showControls={showControls}
        togglePlay={togglePlay}
        skip={skip}
        toggleMute={toggleMute}
        toggleFullscreen={toggleFullscreen}
        handleTimeChange={handleTimeChange}
      />
    </div>
  );
};

export default VideoPlayer;
