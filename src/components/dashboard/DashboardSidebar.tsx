import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  User, 
  Settings, 
  Users, 
  Rss, 
  Video,
  RotateCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DashboardSidebar: React.FC = () => {
  const { user } = useAuth();
  
  const menuItems = [
    { to: '/dashboard', icon: <Home className="mr-2 h-4 w-4" />, text: 'Dashboard' },
    { to: '/feed', icon: <Rss className="mr-2 h-4 w-4" />, text: 'Feed' },
    { to: '/messages', icon: <MessageSquare className="mr-2 h-4 w-4" />, text: 'Messages' },
    { to: '/community', icon: <Users className="mr-2 h-4 w-4" />, text: 'Community' },
    { to: '/profile', icon: <User className="mr-2 h-4 w-4" />, text: 'Profile' },
    { to: '/subspacetv', icon: <Video className="mr-2 h-4 w-4" />, text: 'SubSpace TV' },
    { to: '/games/wheel', icon: <RotateCw className="mr-2 h-4 w-4" />, text: 'Spin The Wheel' },
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
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center p-2 text-white rounded-md hover:bg-white/10 ${
                    isActive ? 'bg-white/10 font-semibold' : ''
                  }`
                }
              >
                {item.icon}
                {item.text}
              </NavLink>
            </li>
          ))}
          {user?.user_metadata?.user_role === 'admin' && (
            <>
              <hr className="border-white/20 my-4" />
              {adminMenuItems.map((item) => (
                <li key={item.to} className="mb-2">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center p-2 text-white rounded-md hover:bg-white/10 ${
                        isActive ? 'bg-white/10 font-semibold' : ''
                      }`
                    }
                  >
                    {item.icon}
                    {item.text}
                  </NavLink>
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
