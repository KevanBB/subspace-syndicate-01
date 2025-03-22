
import React, { useState } from 'react';
import { parseHashtags } from '@/utils/hashtags';
import VideoPlayer from '@/components/ui/VideoPlayer';

interface PostContentProps {
  content: string;
  media_url: string | null;
  media_type: string | null;
  isEditing: boolean;
  editedContent: string;
  onEditChange: (value: string) => void;
}

const PostContent: React.FC<PostContentProps> = ({ 
  content, 
  media_url, 
  media_type,
  isEditing,
  editedContent,
  onEditChange
}) => {
  const [isTruncated, setIsTruncated] = useState(true);
  const [showFullMedia, setShowFullMedia] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const toggleTruncate = () => setIsTruncated(!isTruncated);
  const toggleMediaSize = () => setShowFullMedia(!showFullMedia);

  // Determine if content is long enough to truncate
  const isLongContent = content.length > 300;
  const displayContent = isTruncated && isLongContent ? `${content.substring(0, 300)}...` : content;

  return (
    <div className="px-4 pt-2 pb-4">
      {isEditing ? (
        <textarea
          value={editedContent}
          onChange={(e) => onEditChange(e.target.value)}
          className="w-full bg-black/30 border border-white/20 rounded-md p-3 text-white"
          rows={4}
        />
      ) : (
        <div className="text-white/90 whitespace-pre-wrap">
          <div className="space-x-1">
            {parseHashtags(displayContent)}
          </div>
          
          {isLongContent && (
            <button
              onClick={toggleTruncate}
              className="text-crimson text-sm mt-2 hover:underline"
            >
              {isTruncated ? "Read more" : "Show less"}
            </button>
          )}
        </div>
      )}

      {media_url && (
        <div className={`mt-4 overflow-hidden rounded-md ${showFullMedia ? 'max-h-none' : 'max-h-96'}`}>
          {media_type?.startsWith('image/') ? (
            <>
              <img
                src={media_url}
                alt="Post media"
                className="w-full h-auto rounded-md cursor-pointer"
                onClick={toggleMediaSize}
                onLoad={() => setMediaLoading(false)}
                onError={() => {
                  setMediaLoading(false);
                  setMediaError("Failed to load image");
                }}
              />
              {mediaError && <p className="text-red-500 text-sm mt-1">{mediaError}</p>}
            </>
          ) : media_type?.startsWith('video/') ? (
            <VideoPlayer src={media_url} />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default PostContent;
