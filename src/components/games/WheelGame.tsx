
import React, { useState } from 'react';
import WheelSettings from './WheelSettings';
import SpinningWheel from './SpinningWheel';
import ResultDisplay from './ResultDisplay';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const WheelGame: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [winnings, setWinnings] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Define wheel segments
  const segments = [
    { text: '100 Coins', value: 100, color: '#FF6384' },
    { text: '50 Coins', value: 50, color: '#36A2EB' },
    { text: '10 Coins', value: 10, color: '#FFCE56' },
    { text: '200 Coins', value: 200, color: '#4BC0C0' },
    { text: '5 Coins', value: 5, color: '#9966FF' },
    { text: 'Try Again', value: 0, color: '#FF9F40' },
    { text: '20 Coins', value: 20, color: '#8AC926' },
    { text: '500 Coins', value: 500, color: '#C21292' }
  ];

  const handleSpin = () => {
    setIsSpinning(true);
    setResult(null);
    setWinnings(0);
    setShowResult(false);
  };

  const handleSpinComplete = (resultText: string, resultValue: number) => {
    setIsSpinning(false);
    setResult(resultText);
    setWinnings(resultValue);
    setShowResult(true);
  };

  const handlePlayAgain = () => {
    setShowResult(false);
  };

  return (
    <div className="relative flex flex-col items-center p-6">
      <h2 className="text-2xl font-bold mb-6">Spin The Wheel</h2>
      
      <div className="mb-6">
        <SpinningWheel 
          segments={segments} 
          onSpinComplete={handleSpinComplete}
          isSpinning={isSpinning}
        />
      </div>
      
      <div className="mt-6">
        <WheelSettings onSpin={handleSpin} />
      </div>
      
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="bg-transparent border-none shadow-none">
          {result && (
            <ResultDisplay 
              result={result} 
              onPlayAgain={handlePlayAgain} 
              winnings={winnings} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WheelGame;
