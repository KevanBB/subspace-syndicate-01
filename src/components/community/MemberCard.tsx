
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Shield, Heart, SwitchCamera, HelpCircle } from 'lucide-react';

type MemberCardProps = {
  id: string;
  username: string | null;
  avatar_url?: string;
  user_role?: string | null;
  bdsm_role?: string | null;
  last_active?: string | null;
};

const MemberCard: React.FC<MemberCardProps> = ({
  username,
  avatar_url,
  user_role,
  bdsm_role,
  last_active,
}) => {
  const formattedUsername = username || 'Anonymous';
  const initials = formattedUsername.substring(0, 2).toUpperCase();
  
  // Get the appropriate badge variant and icon based on BDSM role
  const getBdsmRoleBadge = () => {
    const role = bdsm_role || 'Exploring';
    let variant: "dominant" | "submissive" | "switch" | "exploring" = "exploring";
    let Icon = HelpCircle;
    
    switch(role) {
      case 'Dominant':
        variant = "dominant";
        Icon = Shield;
        break;
      case 'submissive':
        variant = "submissive";
        Icon = Heart;
        break;
      case 'switch':
        variant = "switch";
        Icon = SwitchCamera;
        break;
      default:
        variant = "exploring";
        Icon = HelpCircle;
    }
    
    return { variant, Icon };
  };
  
  const { variant, Icon } = getBdsmRoleBadge();
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Card className="overflow-hidden bg-black/20 border-white/10 backdrop-blur-md hover:border-crimson/30 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-crimson/50">
              <AvatarImage src={avatar_url || "/placeholder.svg"} alt={formattedUsername} />
              <AvatarFallback className="bg-crimson text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{formattedUsername}</span>
                {user_role && (
                  <Badge variant="outline" className="text-xs text-white/70 border-white/30">
                    {user_role}
                  </Badge>
                )}
              </div>
              <div className="flex items-center mt-1">
                <Badge variant={variant} className="flex items-center gap-1 text-xs">
                  <Icon size={12} />
                  {bdsm_role || 'Exploring'}
                </Badge>
                {last_active && (
                  <p className="text-xs text-white/50 ml-2">
                    {new Date(last_active).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MemberCard;
