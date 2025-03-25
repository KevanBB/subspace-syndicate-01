
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { ProfileData } from '@/hooks/useProfileData';

interface WheelSettingsProps {
  selectedDom: ProfileData;
  initialValues: {
    minAmount: number;
    maxAmount: number;
    segments: number;
    spinDuration: number;
  };
  onConfirm: (settings: {
    minAmount: number;
    maxAmount: number;
    segments: number;
    spinDuration: number;
  }) => void;
  onBack: () => void;
}

export const WheelSettings: React.FC<WheelSettingsProps> = ({
  selectedDom,
  initialValues,
  onConfirm,
  onBack,
}) => {
  const [minAmount, setMinAmount] = useState(initialValues.minAmount);
  const [maxAmount, setMaxAmount] = useState(initialValues.maxAmount);
  const [segments, setSegments] = useState(initialValues.segments);
  const [spinDuration, setSpinDuration] = useState(initialValues.spinDuration);
  const [error, setError] = useState<string | null>(null);

  const validateSettings = () => {
    if (minAmount <= 0) {
      setError('Minimum amount must be greater than 0');
      return false;
    }

    if (maxAmount <= minAmount) {
      setError('Maximum amount must be greater than minimum amount');
      return false;
    }

    if (segments < 2 || segments > 12) {
      setError('Number of segments must be between 2 and 12');
      return false;
    }

    if (spinDuration < 2 || spinDuration > 10) {
      setError('Spin duration must be between 2 and 10 seconds');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateSettings()) {
      onConfirm({
        minAmount,
        maxAmount,
        segments,
        spinDuration,
      });
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            {selectedDom.avatar_url ? (
              <AvatarImage src={selectedDom.avatar_url} alt={selectedDom.username} />
            ) : (
              <AvatarFallback>{selectedDom.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <CardTitle className="text-xl">Game Settings with {selectedDom.username}</CardTitle>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="minAmount">Minimum Amount ($)</Label>
            <Input
              id="minAmount"
              type="number"
              min="1"
              step="1"
              value={minAmount}
              onChange={(e) => setMinAmount(parseFloat(e.target.value) || 1)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxAmount">Maximum Amount ($)</Label>
            <Input
              id="maxAmount"
              type="number"
              min={minAmount + 1}
              step="1"
              value={maxAmount}
              onChange={(e) => setMaxAmount(parseFloat(e.target.value) || minAmount + 1)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="segments">Number of Segments: {segments}</Label>
            </div>
            <Slider
              id="segments"
              value={[segments]}
              min={2}
              max={12}
              step={1}
              onValueChange={(values) => setSegments(values[0])}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>2</span>
              <span>12</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="spinDuration">Spin Duration: {spinDuration} seconds</Label>
            </div>
            <Slider
              id="spinDuration"
              value={[spinDuration]}
              min={2}
              max={10}
              step={1}
              onValueChange={(values) => setSpinDuration(values[0])}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>2s</span>
              <span>10s</span>
            </div>
          </div>
          
          {error && (
            <div className="text-destructive text-sm font-medium">{error}</div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">
            <RotateCcw className="mr-2 h-4 w-4" />
            Spin the Wheel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
