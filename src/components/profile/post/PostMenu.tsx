
import React from 'react';
import { Card } from '@/components/ui/card';
import { Edit, Trash2, Flag, AlertTriangle } from 'lucide-react';

interface PostMenuProps {
  isOpen: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onFlag: () => void;
  onClose: () => void;
}

const PostMenu: React.FC<PostMenuProps> = ({ isOpen, onEdit, onDelete, onFlag, onClose }) => {
  if (!isOpen) return null;
  
  const handleItemClick = (fn: () => void) => {
    fn();
    onClose();
  };
  
  return (
    <Card className="absolute top-12 right-4 bg-black/90 border-white/10 shadow-xl rounded-md overflow-hidden z-50 w-44">
      <div className="py-1">
        <button
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white hover:bg-white/10"
          onClick={() => handleItemClick(onEdit)}
        >
          <Edit className="h-4 w-4" />
          Edit Post
        </button>
        
        <button
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white hover:bg-white/10"
          onClick={() => handleItemClick(onDelete)}
        >
          <Trash2 className="h-4 w-4" />
          Delete Post
        </button>
        
        <hr className="border-white/10 my-1" />
        
        <button
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white hover:bg-white/10"
          onClick={() => handleItemClick(onFlag)}
        >
          <Flag className="h-4 w-4" />
          Report Post
        </button>
      </div>
    </Card>
  );
};

export default PostMenu;
