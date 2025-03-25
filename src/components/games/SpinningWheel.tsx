
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SpinningWheelProps {
  segments: number;
  segmentValues: number[];
  spinDuration: number;
  isSpinning: boolean;
  winningIndex: number;
}

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
  segments,
  segmentValues,
  spinDuration,
  isSpinning,
  winningIndex,
}) => {
  const [rotations, setRotations] = useState(0);
  const [finalRotation, setFinalRotation] = useState(0);
  
  useEffect(() => {
    if (isSpinning) {
      // Calculate final rotation
      // We want to do 5-10 full rotations and then stop at the winning segment
      const baseRotations = 5 + Math.floor(Math.random() * 5); // 5-10 rotations
      const segmentAngle = 360 / segments;
      const segmentOffset = winningIndex >= 0 ? winningIndex * segmentAngle : 0;
      
      // We add 180 to make sure the winning segment is at the top when the wheel stops
      const finalAngle = baseRotations * 360 + (360 - segmentOffset) + 180;
      
      setRotations(baseRotations);
      setFinalRotation(finalAngle);
    }
  }, [isSpinning, segments, winningIndex]);

  const renderSegments = () => {
    const segmentAngle = 360 / segments;
    return Array.from({ length: segments }).map((_, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = (index + 1) * segmentAngle;
      
      // Calculate colors - alternate colors for adjacent segments
      const backgroundColor = index % 2 === 0 ? 'bg-primary/90' : 'bg-primary-foreground';
      const textColor = index % 2 === 0 ? 'text-primary-foreground' : 'text-primary';
      
      return (
        <div
          key={index}
          className={`absolute w-full h-full ${backgroundColor} ${textColor} font-bold flex items-center justify-center overflow-hidden`}
          style={{
            transform: `rotate(${startAngle}deg) skewY(${90 - segmentAngle}deg)`,
            transformOrigin: 'bottom right',
          }}
        >
          <div 
            className="absolute text-lg rotate-90"
            style={{ 
              left: '80%', 
              bottom: '50%',
              transform: `rotate(${segmentAngle / 2}deg) translateY(-50px)`,
            }}
          >
            ${segmentValues[index] || '?'}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex justify-center items-center my-8 relative">
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        {/* The wheel container */}
        <motion.div
          className="w-full h-full rounded-full overflow-hidden relative border-4 border-primary shadow-lg"
          animate={isSpinning ? 
            { 
              rotate: finalRotation 
            } : 
            { rotate: 0 }
          }
          transition={{
            duration: spinDuration,
            ease: [0.11, 0.5, 0.21, 0.9], // Custom ease to simulate wheel physics
          }}
        >
          {/* Wheel segments */}
          {renderSegments()}
        </motion.div>
        
        {/* Center hub */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10">
          <div className="w-8 h-8 text-primary">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
            </svg>
          </div>
        </div>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 z-20">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-destructive mx-auto"></div>
        </div>
      </div>
    </div>
  );
};
