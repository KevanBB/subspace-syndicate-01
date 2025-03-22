
import { useState, useEffect } from 'react';

export const useControls = (isPlaying: boolean, containerRef: React.RefObject<HTMLDivElement>) => {
  const [showControls, setShowControls] = useState(true);
  
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
    
    const containerEl = containerRef.current;
    
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
  }, [isPlaying, containerRef]);
  
  return {
    showControls
  };
};
