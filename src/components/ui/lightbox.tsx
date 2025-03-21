
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type LightboxProps = {
  isOpen: boolean;
  onClose: () => void;
  media: Array<{ url: string; type: string }>;
  initialIndex?: number;
};

const Lightbox: React.FC<LightboxProps> = ({ 
  isOpen, 
  onClose, 
  media, 
  initialIndex = 0 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Reset index when media changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [media, initialIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || media.length === 0) return null;
  
  const currentMedia = media[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-xl w-screen h-screen max-h-screen p-0 border-none bg-black/90">
        <div className="relative flex flex-col items-center justify-center w-full h-full">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 z-10"
            onClick={onClose}
          >
            <X size={24} />
          </Button>
          
          {/* Navigation arrows */}
          {media.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 z-10"
                onClick={handlePrevious}
              >
                <ChevronLeft size={24} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 z-10"
                onClick={handleNext}
              >
                <ChevronRight size={24} />
              </Button>
            </>
          )}
          
          {/* Media display */}
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex items-center justify-center p-4"
              >
                {currentMedia.type === 'image' ? (
                  <div className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden">
                    <img 
                      src={currentMedia.url} 
                      alt="Media content" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="relative max-w-full max-h-full">
                    <video 
                      src={currentMedia.url} 
                      controls 
                      autoPlay
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Pagination dots */}
          {media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {media.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { Lightbox };
