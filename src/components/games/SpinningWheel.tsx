
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SpinningWheelProps {
  segments: { text: string; value: number; color: string }[];
  onSpinComplete: (result: string, winnings: number) => void;
  isSpinning: boolean;
}

const SpinningWheel: React.FC<SpinningWheelProps> = ({
  segments,
  onSpinComplete,
  isSpinning,
}) => {
  const [rotation, setRotation] = useState(0);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinWheel = () => {
    // Generate a random result
    const randomIndex = Math.floor(Math.random() * segments.length);
    const randomDegree = Math.floor(Math.random() * 360);
    
    // Calculate total rotation (multiple spins + random position)
    const totalRotation = 1800 + randomDegree;
    
    setRotation(totalRotation);
    setResultIndex(randomIndex);
    
    // Calculate the actual segment that will be selected
    const segmentSize = 360 / segments.length;
    const normalizedRotation = totalRotation % 360;
    const selectedIndex = segments.length - 1 - Math.floor(normalizedRotation / segmentSize);
    
    setTimeout(() => {
      onSpinComplete(
        segments[selectedIndex].text,
        segments[selectedIndex].value
      );
    }, 3000); // Wait for animation to complete
  };

  useEffect(() => {
    if (isSpinning) {
      spinWheel();
    }
  }, [isSpinning]);

  return (
    <div className="relative w-72 h-72 mx-auto my-8">
      {/* Center pointer */}
      <div className="absolute top-0 left-1/2 z-10 w-0 h-0" style={{ transform: 'translateX(-50%)' }}>
        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-red-500" />
      </div>
      
      {/* The wheel */}
      <motion.div 
        ref={wheelRef}
        className="w-full h-full rounded-full overflow-hidden border-4 border-gray-200 shadow-xl"
        style={{ 
          transformOrigin: 'center',
          background: 'conic-gradient(from 0deg, ' + 
            segments.map((segment, index) => {
              const start = (index / segments.length) * 100;
              const end = ((index + 1) / segments.length) * 100;
              return `${segment.color} ${start}% ${end}%`;
            }).join(', ') + ')'
        }}
        animate={{ 
          rotate: rotation 
        }}
        transition={{ 
          duration: 3,
          ease: "easeOut"
        }}
      />
      
      {/* Segment labels */}
      {segments.map((segment, index) => {
        const angle = (index * 360) / segments.length;
        return (
          <div 
            key={index}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold"
            style={{
              transform: `rotate(${angle}deg) translateY(-25px) rotate(-${angle}deg)`,
              width: '100%',
              textAlign: 'center',
            }}
          >
            {segment.text}
          </div>
        );
      })}
    </div>
  );
};

export default SpinningWheel;
