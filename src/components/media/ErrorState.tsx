
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  albumId?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ albumId }) => {
  const navigate = useNavigate();
  
  return (
    <div className="container py-6">
      <Card className="bg-black/20 border-white/10">
        <CardContent className="py-12 text-center">
          <h3 className="text-xl font-medium text-white mb-2">Media Not Found</h3>
          <p className="text-white/70 mb-6">This media doesn't exist or has been deleted</p>
          <Button onClick={() => navigate(albumId ? `/albums/${albumId}` : '/albums')}>
            Go Back to {albumId ? 'Album' : 'Albums'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorState;
