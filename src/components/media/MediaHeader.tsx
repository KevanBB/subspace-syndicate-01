
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface MediaHeaderProps {
  albumId: string;
}

const MediaHeader: React.FC<MediaHeaderProps> = ({ albumId }) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-4">
      <Button variant="ghost" onClick={() => navigate(`/albums/${albumId}`)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Album
      </Button>
    </div>
  );
};

export default MediaHeader;
