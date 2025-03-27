
import React from 'react';
import { 
  RotateCcw,
  Coins as CoinsIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultDisplayProps {
  result: string;
  onPlayAgain: () => void;
  winnings: number;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onPlayAgain, winnings }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-md shadow-md bg-black/50 backdrop-blur-md border border-white/10">
      <h2 className="text-3xl font-bold text-center text-white mb-4">
        Congratulations!
      </h2>
      <p className="text-xl text-center text-gray-300 mb-4">
        The wheel landed on: <span className="font-semibold text-crimson">{result}</span>
      </p>
      {winnings > 0 && (
        <div className="flex items-center mb-4">
          <CoinsIcon className="mr-2 h-6 w-6 text-yellow-500" />
          <p className="text-lg text-green-400">
            You won <span className="font-bold">{winnings}</span> coins!
          </p>
        </div>
      )}
      <Button onClick={onPlayAgain} className="bg-crimson hover:bg-crimson-focus text-white">
        <RotateCcw className="mr-2 h-4 w-4" />
        Play Again
      </Button>
    </div>
  );
};

export default ResultDisplay;
