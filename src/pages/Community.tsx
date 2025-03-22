
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield, Heart, SwitchCamera, HelpCircle } from 'lucide-react';
import { useActivity } from '@/utils/useActivity';
import OnlineIndicator from '@/components/community/OnlineIndicator';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import Navbar from '@/components/Navbar';

interface Member {
  id: string;
  username: string;
  avatar_url: string | null;
  bdsm_role: string;
  bio: string;
  last_active: string;
}

// Create a custom PageButton component to handle the "isActive" prop
const PageButton = ({ 
  children, 
  onClick, 
  active 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  active?: boolean;
}) => {
  return (
    <Button 
      onClick={onClick} 
      size="sm"
      variant={active ? "default" : "outline"}
      className={active ? "bg-crimson text-white" : "text-white/70 hover:text-white"}
    >
      {children}
    </Button>
  );
};

const Community = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(12);
  
  useEffect(() => {
    fetchMembers();
  }, [searchQuery, filterRole, currentPage]);
  
  const fetchMembers = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id); // Exclude current user
        
      if (searchQuery) {
        query = query.ilike('username', `%${searchQuery}%`);
      }
      
      if (filterRole && filterRole !== 'all') {
        query = query.eq('bdsm_role', filterRole);
      }
      
      const startIndex = (currentPage - 1) * membersPerPage;
      query = query.range(startIndex, startIndex + membersPerPage - 1);
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Profile[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds for active users
  });
  
  // Set up real-time subscription for profile updates
  useEffect(() => {
    const channel = supabase
      .channel('profiles-channel')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles' 
        }, 
        (payload) => {
          // This will trigger a refetch of the data
          console.log('Profile updated:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Helper function to get BDSM role badge variant and icon
  const getBdsmRoleBadge = (role: string | null) => {
    const bdsmRole = role || 'Exploring';
    let variant = "exploring";
    let Icon = HelpCircle;
    
    switch(bdsmRole) {
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
    
    return { variant, Icon, bdsmRole };
  };
  
  // Check if a user is online based on last_active
  const isUserOnline = (lastActive: string | null) => {
    if (!lastActive) return false;
    
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60));
    
    return diffInMinutes < 5; // Consider online if active in the last 5 minutes
  };
  
  // Pagination logic
  const totalPages = allMembers ? Math.ceil(allMembers.length / membersPerPage) : 0;
  const paginatedMembers = allMembers?.slice(
    (currentPage - 1) * membersPerPage,
    currentPage * membersPerPage
  );
  
  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pageNumbers.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pageNumbers.push('ellipsis');
    }
  }

  const communityContent = (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Community</h1>
        <p className="text-white/70">Connect with members of the SubSpace community</p>
      </motion.div>
      
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="bg-black/30 border border-white/10 mb-6">
          <TabsTrigger value="recent" className="data-[state=active]:bg-crimson/20">
            Recently Active
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-crimson/20">
            All Members
          </TabsTrigger>
          <TabsTrigger value="table" className="data-[state=active]:bg-crimson/20">
            Table View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="mt-0">
          {loadingActive ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {members.map((member) => (
                <div key={member.id}>
                  <MemberCard member={member as any} />
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <Button 
              onClick={() => handlePageChange(currentPage - 1)} 
              className="text-white/70 hover:text-white"
              size="sm"
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-2">
              {renderPageNumbers()}
            </div>
            
            <Button 
              onClick={() => handlePageChange(currentPage + 1)} 
              className="text-white/70 hover:text-white"
              size="sm"
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {pageNumbers.map((page, index) => (
                  <React.Fragment key={index}>
                    {page === 'ellipsis' ? (
                      <PaginationItem>
                        <span className="px-4 py-2">...</span>
                      </PaginationItem>
                    ) : (
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(page as number)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                  </React.Fragment>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
  
  return user ? (
    <AuthenticatedLayout pageTitle="Community">
      {communityContent}
    </AuthenticatedLayout>
  ) : (
    <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-10">
        {communityContent}
      </div>
    </div>
  );
};

export default Community;
