
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { 
  Film, 
  Image, 
  MessageSquare, 
  BrightnessUp, 
  Users, 
  Calendar, 
  BookOpen, 
  Grid
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  link: string;
  color: string;
}

const categories: CategoryItem[] = [
  {
    id: 'videos',
    name: 'Videos',
    description: 'Tutorials, scenes, and educational content',
    icon: Film,
    link: '/subspacetv',
    color: 'from-purple-500 to-indigo-700'
  },
  {
    id: 'albums',
    name: 'Photo Albums',
    description: 'Visual stories and image collections',
    icon: Image,
    link: '/albums',
    color: 'from-rose-500 to-red-700'
  },
  {
    id: 'discussions',
    name: 'Discussions',
    description: 'Community conversations and topics',
    icon: MessageSquare,
    link: '/feed?type=discussion',
    color: 'from-blue-500 to-cyan-700'
  },
  {
    id: 'featured',
    name: 'Featured',
    description: 'Staff picks and highlighted content',
    icon: BrightnessUp,
    link: '/explore/featured',
    color: 'from-amber-500 to-yellow-700'
  },
  {
    id: 'members',
    name: 'Members',
    description: 'Explore profiles and creators',
    icon: Users,
    link: '/community',
    color: 'from-emerald-500 to-green-700'
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Meetups, workshops, and gatherings',
    icon: Calendar,
    link: '/events',
    color: 'from-violet-500 to-purple-700'
  },
  {
    id: 'guides',
    name: 'Guides',
    description: 'Tutorials and educational resources',
    icon: BookOpen,
    link: '/guides',
    color: 'from-pink-500 to-fuchsia-700'
  },
  {
    id: 'categories',
    name: 'All Categories',
    description: 'Browse all available categories',
    icon: Grid,
    link: '/categories',
    color: 'from-gray-500 to-slate-700'
  },
];

const CategoriesSection = () => {
  return (
    <ScrollArea className="w-full pb-4">
      <div className="flex space-x-4 pb-4 px-1">
        {categories.map((category) => (
          <Link key={category.id} to={category.link} className="flex-shrink-0 w-48">
            <Card 
              interactive={true}
              elevated={true}
              className={`overflow-hidden h-40 bg-gradient-to-br ${category.color} border-none flex flex-col justify-end p-4`}
            >
              <category.icon className="text-white/90 mb-3 h-6 w-6" />
              <h3 className="font-bold text-white text-lg">{category.name}</h3>
              <p className="text-xs text-white/80">{category.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
};

export default CategoriesSection;
