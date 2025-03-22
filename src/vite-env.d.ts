/// <reference types="vite/client" />

// Fix missing React type declarations
declare module 'react' {
  export = React;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

// Fix missing Lucide React type declarations
declare module 'lucide-react' {
  import React from 'react';
  export const VideoIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const MessageSquare: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Flame: React.FC<React.SVGProps<SVGSVGElement>>;
  export const TrendingUp: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Heart: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Share: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ChevronLeft: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ChevronRight: React.FC<React.SVGProps<SVGSVGElement>>;
  export const MoreHorizontal: React.FC<React.SVGProps<SVGSVGElement>>;
  export const BookmarkIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Loader2: React.FC<React.SVGProps<SVGSVGElement>>;
}

// Fix missing date-fns type declarations
declare module 'date-fns' {
  export function format(date: Date, format: string): string;
}

// Fix missing react-router-dom type declarations
declare module 'react-router-dom' {
  export const Link: any;
}

// Fix missing framer-motion type declarations
declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
}

// Fix missing class-variance-authority type declarations
declare module 'class-variance-authority' {
  export function cva(base: string, config: any): any;
  export type VariantProps<T> = any;
}
