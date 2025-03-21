
import React from 'react';
import { Link } from 'react-router-dom';

// Regular expression to match hashtags
const HASHTAG_REGEX = /(^|\s)(#[a-zA-Z\d]+)/g;

/**
 * Formats text by converting hashtags to clickable links
 * @param text The text containing hashtags
 * @returns JSX with clickable hashtag links
 */
export const formatTextWithHashtags = (text: string): React.ReactNode[] => {
  // If no text is provided, return an empty array
  if (!text) return [];

  // Split the text by hashtag matches
  const parts = text.split(HASHTAG_REGEX);
  
  // Map through each part and convert hashtags to links
  return parts.map((part, index) => {
    // Check if this part is a hashtag
    if (part && part.startsWith('#')) {
      const tag = part.substring(1); // Remove the # symbol
      return (
        <Link 
          key={`${tag}-${index}`}
          to={`/hashtag/${encodeURIComponent(tag)}`}
          className="text-crimson hover:underline font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </Link>
      );
    }
    // Return the regular text
    return part;
  });
};

/**
 * Extracts hashtags from text content
 * @param text The text to extract hashtags from
 * @returns Array of hashtags without the # symbol
 */
export const extractHashtags = (text: string): string[] => {
  if (!text) return [];
  
  const matches = text.match(HASHTAG_REGEX);
  if (!matches) return [];
  
  return matches.map(tag => tag.trim().substring(1));
};
