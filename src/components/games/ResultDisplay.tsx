
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { SpinningWheel } from './SpinningWheel';
import { SpinResult } from './SpinTheWheelGame';
import { ProfileData } from '@/hooks/useProfileData';
import { Coins, RefreshCw } from 'lucide-react';

interface ResultDisplayProps {
  dom: ProfileData;
  spinResult: SpinResult;
  onPlayAgain: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  dom,
  spinResult,
  onPlayAgain,
}) => {
  const { amount, all_segments, spin_id } = spinResult;
  
  // Find the index of the winning segment
  const winningIndex = all_segments.findIndex(val => val === amount);

  const handlePayment = () => {
    // In a real implementation, this would initiate a payment process
    // For now, we'll just show an alert
    alert(`This would redirect to a payment page for $${amount} to ${dom.username}`);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Spin Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex flex-col items-center">
        <SpinningWheel 
          segments={all_segments.length}
          segmentValues={all_segments}
          spinDuration={0.1} // Very short duration since we're just showing the result
          isSpinning={false}
          winningIndex={winningIndex}
        />
        
        <div className="bg-muted p-6 rounded-lg w-full text-center">
          <h3 className="text-xl font-semibold mb-2">
            You must pay ${amount.toFixed(2)} to:
          </h3>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Avatar>
              {dom.avatar_url ? (
                <AvatarImage src={dom.avatar_url} alt={dom.username} />
              ) : (
                <AvatarFallback>{dom.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            <span className="text-lg font-medium">{dom.username}</span>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Spin ID: {spin_id.slice(0, 8)}...
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between">
        <Button variant="outline" className="w-full sm:w-auto" onClick={onPlayAgain}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Spin Again
        </Button>
        <Button className="w-full sm:w-auto" onClick={handlePayment}>
          <Coins className="mr-2 h-4 w-4" />
          Pay ${amount.toFixed(2)}
        </Button>
      </CardFooter>
    </Card>
  );
};
