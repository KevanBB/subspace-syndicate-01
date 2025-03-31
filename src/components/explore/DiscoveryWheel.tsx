
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import WheelSettings from '@/components/games/WheelSettings';

// Mock data for wheel segments
const wheelItems = [
  { id: '1', label: 'Videos', color: '#6366F1', route: '/subspacetv' },
  { id: '2', label: 'Albums', color: '#F87171', route: '/albums' },
  { id: '3', label: 'Community', color: '#10B981', route: '/community' },
  { id: '4', label: 'Discussions', color: '#FBBF24', route: '/feed' },
  { id: '5', label: 'Events', color: '#8B5CF6', route: '/events' },
  { id: '6', label: 'Tutorials', color: '#EC4899', route: '/subspacetv?category=tutorials' },
  { id: '7', label: 'Profiles', color: '#3B82F6', route: '/community' },
  { id: '8', label: 'Random', color: '#14B8A6', route: '/explore/random' },
];

const DiscoveryWheel = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<typeof wheelItems[0] | null>(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const spinWheel = () => {
    if (spinning) return;
    
    setSpinning(true);
    setResult(null);
    
    // Calculate a random rotation (minimum 2 full rotations, plus a random segment)
    const extraRotation = Math.floor(Math.random() * 360);
    const totalRotation = 720 + extraRotation;
    
    setRotation(totalRotation);
    
    // Determine the winning segment after the wheel stops
    setTimeout(() => {
      // Calculate which segment is at the top when wheel stops
      const segmentAngle = 360 / wheelItems.length;
      const normalizedRotation = totalRotation % 360;
      const segmentIndex = Math.floor((360 - normalizedRotation) / segmentAngle);
      const selectedSegment = wheelItems[segmentIndex % wheelItems.length];
      
      setResult(selectedSegment);
      setSpinning(false);
    }, 3000);
  };

  const goToResult = () => {
    if (result) {
      navigate(result.route);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 mx-auto mb-6">
        {/* Wheel */}
        <div 
          ref={wheelRef}
          className="w-full h-full rounded-full overflow-hidden transition-transform duration-3000 ease-out relative"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
          }}
        >
          {wheelItems.map((item, index) => {
            const angle = 360 / wheelItems.length;
            const rotate = angle * index;
            return (
              <div
                key={item.id}
                className="absolute top-0 left-0 right-0 w-full h-full origin-bottom-center flex justify-center items-start"
                style={{ 
                  transform: `rotate(${rotate}deg)`,
                  transformOrigin: 'center bottom',
                }}
              >
                <div 
                  className="h-1/2 w-2 border-l border-r bg-transparent flex justify-center"
                  style={{ transform: 'translateY(-100%)' }}
                >
                  <div 
                    className="w-32 h-32 absolute bottom-0 origin-bottom transform-gpu"
                    style={{
                      backgroundColor: item.color,
                      clipPath: 'polygon(100% 100%, 50% 0%, 0% 100%)',
                    }}
                  >
                    <div 
                      className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white font-semibold text-xs whitespace-nowrap"
                      style={{ transform: `rotate(${90 - rotate}deg) translateX(-50%)` }}
                    >
                      {item.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Center Point */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-4 border-gray-800 z-10"></div>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-white z-20" style={{ borderRadius: '0 0 4px 4px' }}></div>
      </div>
      
      <div className="mb-4">
        <WheelSettings onSpin={spinWheel} />
      </div>
      
      {result && (
        <div className="bg-black/30 p-4 rounded-lg mb-4">
          <p className="text-white mb-2">You landed on: <span className="font-bold">{result.label}</span></p>
          <Button onClick={goToResult}>
            Explore {result.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiscoveryWheel;
