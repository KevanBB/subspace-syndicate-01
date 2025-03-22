
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
  
  interface LucideIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number;
  }
  
  type LucideIcon = React.FC<LucideIconProps>;
  
  // Basic Lucide icons
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Bell: LucideIcon;
  export const Bold: LucideIcon;
  export const BookmarkIcon: LucideIcon;
  export const Calendar: LucideIcon;
  export const CalendarDays: LucideIcon;
  export const Camera: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Circle: LucideIcon;
  export const Clock: LucideIcon;
  export const Compass: LucideIcon;
  export const CreditCard: LucideIcon;
  export const Dot: LucideIcon;
  export const Edit: LucideIcon;
  export const Eye: LucideIcon;
  export const FileText: LucideIcon;
  export const FileVideo: LucideIcon;
  export const Film: LucideIcon;
  export const Filter: LucideIcon;
  export const Flag: LucideIcon;
  export const Flame: LucideIcon;
  export const FolderOpen: LucideIcon;
  export const GripVertical: LucideIcon;
  export const Hash: LucideIcon;
  export const Heading: LucideIcon;
  export const Heart: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Image: LucideIcon;
  export const Info: LucideIcon;
  export const Italic: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const List: LucideIcon;
  export const ListOrdered: LucideIcon;
  export const Lock: LucideIcon;
  export const LogOut: LucideIcon;
  export const Mail: LucideIcon;
  export const MapPin: LucideIcon;
  export const Maximize: LucideIcon;
  export const Maximize2: LucideIcon;
  export const Menu: LucideIcon;
  export const MessageCircle: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Minimize2: LucideIcon;
  export const Monitor: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const PanelLeft: LucideIcon;
  export const Pause: LucideIcon;
  export const Play: LucideIcon;
  export const Plus: LucideIcon;
  export const Search: LucideIcon;
  export const Send: LucideIcon;
  export const Settings: LucideIcon;
  export const Share: LucideIcon;
  export const Shield: LucideIcon;
  export const SkipBack: LucideIcon;
  export const SkipForward: LucideIcon;
  export const Sliders: LucideIcon;
  export const Smile: LucideIcon;
  export const SwitchCamera: LucideIcon;
  export const Tag: LucideIcon;
  export const Trash2: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Underline: LucideIcon;
  export const Upload: LucideIcon;
  export const User: LucideIcon;
  export const UserRound: LucideIcon;
  export const Users: LucideIcon;
  export const VideoIcon: LucideIcon;
  export const Volume2: LucideIcon;
  export const VolumeX: LucideIcon;
  export const X: LucideIcon;
  export const Zap: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const ExternalLink: LucideIcon;
  
  // Export the icons object for dynamic imports
  export const icons: Record<string, LucideIcon>;
  export const dynamicIconImports: Record<string, () => Promise<any>>;
}

// Fix missing date-fns type declarations
declare module 'date-fns' {
  export function format(date: Date, format: string): string;
  export function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }): string;
}

// Fix missing react-router-dom type declarations
declare module 'react-router-dom' {
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
  export const Link: any;
  export const Navigate: any;
  export const useNavigate: () => (path: string) => void;
  export const useParams: () => Record<string, string>;
  export const useLocation: () => { pathname: string };
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
