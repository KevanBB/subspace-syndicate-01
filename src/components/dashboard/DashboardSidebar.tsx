
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  MessageSquare, 
  UserIcon, 
  Settings, 
  Users, 
  RssIcon, 
  VideoIcon,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DashboardSidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const menuItems = [
    { to: '/dashboard', icon: <HomeIcon className="mr-2 h-4 w-4" />, text: 'Dashboard' },
    { to: '/feed', icon: <RssIcon className="mr-2 h-4 w-4" />, text: 'Feed' },
    { to: '/messages', icon: <MessageSquare className="mr-2 h-4 w-4" />, text: 'Messages' },
    { to: '/community', icon: <Users className="mr-2 h-4 w-4" />, text: 'Community' },
    { to: '/profile', icon: <UserIcon className="mr-2 h-4 w-4" />, text: 'Profile' },
    { to: '/subspacetv', icon: <VideoIcon className="mr-2 h-4 w-4" />, text: 'SubSpace TV' },
    { to: '/games/wheel', icon: <RotateCcw className="mr-2 h-4 w-4" />, text: 'Spin The Wheel' },
    { to: '/settings', icon: <Settings className="mr-2 h-4 w-4" />, text: 'Settings' },
  ];

  const adminMenuItems = [
    { to: '/admin', icon: <Settings className="mr-2 h-4 w-4" />, text: 'Admin Dashboard' },
  ];

  return (
    <div className="w-64 bg-secondary border-r border-r-white/5 h-screen py-4 px-2 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white text-center">SubSpace</h2>
      </div>
      <nav className="flex-grow">
        <ul>
          {menuItems.map((item) => (
            <li key={item.to} className="mb-2">
              <Link
                to={item.to}
                className={`flex items-center p-2 text-white rounded-md hover:bg-white/10 ${
                  location.pathname === item.to ? 'bg-white/10 font-semibold' : ''
                }`}
              >
                {item.icon}
                {item.text}
              </Link>
            </li>
          ))}
          {user?.user_metadata?.user_role === 'admin' && (
            <>
              <hr className="border-white/20 my-4" />
              {adminMenuItems.map((item) => (
                <li key={item.to} className="mb-2">
                  <Link
                    to={item.to}
                    className={`flex items-center p-2 text-white rounded-md hover:bg-white/10 ${
                      location.pathname === item.to ? 'bg-white/10 font-semibold' : ''
                    }`}
                  >
                    {item.icon}
                    {item.text}
                  </Link>
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>
      <div className="mt-auto text-center">
        <p className="text-white/60 text-sm">
          © {new Date().getFullYear()} SubSpace Syndicate
        </p>
      </div>
    </div>
  );
};

export default DashboardSidebar;
