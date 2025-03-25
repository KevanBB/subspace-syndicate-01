
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DomSelector } from './DomSelector';
import { WheelSettings } from './WheelSettings';
import { SpinningWheel } from './SpinningWheel';
import { ResultDisplay } from './ResultDisplay';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from '@/hooks/useProfileData';

type GameState = 'selecting' | 'settings' | 'spinning' | 'result';

export interface SpinResult {
  amount: number;
  all_segments: number[];
  spin_id: string;
}

export const SpinTheWheelGame: React.FC = () => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>('selecting');
  const [selectedDom, setSelectedDom] = useState<ProfileData | null>(null);
  const [minAmount, setMinAmount] = useState<number>(1);
  const [maxAmount, setMaxAmount] = useState<number>(100);
  const [segments, setSegments] = useState<number>(8);
  const [spinDuration, setSpinDuration] = useState<number>(5);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDomSelected = (dom: ProfileData) => {
    setSelectedDom(dom);
    setGameState('settings');
  };

  const handleBackToDomSelection = () => {
    setGameState('selecting');
    setSelectedDom(null);
  };

  const handleSettingsConfirmed = (settings: {
    minAmount: number;
    maxAmount: number;
    segments: number;
    spinDuration: number;
  }) => {
    setMinAmount(settings.minAmount);
    setMaxAmount(settings.maxAmount);
    setSegments(settings.segments);
    setSpinDuration(settings.spinDuration);
    startSpin();
  };

  const startSpin = async () => {
    if (!user || !selectedDom) {
      toast.error('You must be logged in and select a Dominant to play');
      return;
    }

    setIsLoading(true);
    setGameState('spinning');

    try {
      const { data, error } = await supabase.functions.invoke<SpinResult>('spin-wheel', {
        body: {
          user_id: user.id,
          dom_id: selectedDom.id,
          min_amount: minAmount,
          max_amount: maxAmount,
          segments: segments,
          spin_duration: spinDuration,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No response from server');
      }

      // Wait for the spin animation to complete before showing the result
      setTimeout(() => {
        setSpinResult(data);
        setGameState('result');
        setIsLoading(false);
      }, spinDuration * 1000);
    } catch (error) {
      console.error('Error spinning wheel:', error);
      toast.error('Failed to spin the wheel. Please try again.');
      setGameState('settings');
      setIsLoading(false);
    }
  };

  const handlePlayAgain = () => {
    setGameState('selecting');
    setSelectedDom(null);
    setSpinResult(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-6">Spin The Wheel</h1>
      
      {gameState === 'selecting' && (
        <DomSelector onDomSelected={handleDomSelected} />
      )}

      {gameState === 'settings' && selectedDom && (
        <WheelSettings 
          selectedDom={selectedDom}
          initialValues={{
            minAmount,
            maxAmount,
            segments,
            spinDuration,
          }}
          onConfirm={handleSettingsConfirmed}
          onBack={handleBackToDomSelection}
        />
      )}

      {gameState === 'spinning' && spinResult === null && (
        <div className="flex flex-col items-center">
          <p className="text-lg mb-4">
            Spinning the wheel for {selectedDom?.username}...
          </p>
          <SpinningWheel 
            segments={segments}
            spinDuration={spinDuration}
            isSpinning={true}
            segmentValues={Array(segments).fill(0)} // Placeholder values during spinning
            winningIndex={-1}
          />
        </div>
      )}

      {gameState === 'result' && spinResult && selectedDom && (
        <ResultDisplay 
          dom={selectedDom} 
          spinResult={spinResult} 
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
};
