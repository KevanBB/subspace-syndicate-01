
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Shield, SwitchCamera, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import MemberCard from '@/components/community/MemberCard';

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
      
      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching members",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  const handleFilterChange = (value: string) => {
    setFilterRole(value);
    setCurrentPage(1); // Reset to first page on new filter
  };
  
  // Get current members
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = members.slice(indexOfFirstMember, indexOfLastMember);
  
  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  const totalPages = Math.ceil(members.length / membersPerPage);
  
  const renderPageNumbers = () => {
    const pageNumbers = [];
    
    // Render "..." if there are more than 5 pages
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(
          <PageButton 
            key={i}
            onClick={() => handlePageChange(i + 1)} 
            active={currentPage === i + 1}
          >
            {i + 1}
          </PageButton>
        );
      }
    } else {
      // First page
      pageNumbers.push(
        <PageButton 
          key="first"
          onClick={() => handlePageChange(1)} 
          active={currentPage === 1}
        >
          1
        </PageButton>
      );
      
      // "..." if not near the beginning
      if (currentPage > 3) {
        pageNumbers.push(<span key="ellipsis1" className="text-white/60">...</span>);
      }
      
      // Current page +/- 1
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4);
      }
      
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <PageButton 
            key={i}
            onClick={() => handlePageChange(i)} 
            active={currentPage === i}
          >
            {i}
          </PageButton>
        );
      }
      
      // "..." if not near the end
      if (currentPage < totalPages - 2) {
        pageNumbers.push(<span key="ellipsis2" className="text-white/60">...</span>);
      }
      
      // Last page
      pageNumbers.push(
        <PageButton 
          key="last"
          onClick={() => handlePageChange(totalPages)} 
          active={currentPage === totalPages}
        >
          {totalPages}
        </PageButton>
      );
    }
    
    return pageNumbers;
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="bg-black/30 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Community Members</CardTitle>
          <CardDescription className="text-white/70">
            Connect with other members of the SubSpace community.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search by username</Label>
              <Input
                type="text"
                id="search"
                placeholder="Enter username"
                className="bg-black/30 border-white/10"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <div>
              <Label htmlFor="filter">Filter by role</Label>
              <Select value={filterRole} onValueChange={handleFilterChange}>
                <SelectTrigger className="bg-black/30 border-white/10">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 text-white">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="dominant">Dominant</SelectItem>
                  <SelectItem value="submissive">Submissive</SelectItem>
                  <SelectItem value="switch">Switch</SelectItem>
                  <SelectItem value="exploring">Exploring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator className="bg-white/10" />
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Community;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MemberCard from '@/components/community/MemberCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield, Heart, SwitchCamera, HelpCircle } from 'lucide-react';
import { useActivity } from '@/utils/useActivity';
import OnlineIndicator from '@/components/community/OnlineIndicator';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import Navbar from '@/components/Navbar';
import GroupChatButton from '@/components/community/GroupChatButton';

type Profile = {
  id: string;
  username: string | null;
  user_role: string | null;
  bdsm_role: string | null;
  created_at: string | null;
  last_active: string | null;
  avatar_url: string | null;
};

const Community = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 12;
  const { user } = useAuth();
  
  // Use the activity hook to track user activity
  useActivity();
  
  // Fetch all members
  const { data: allMembers, isLoading: loadingMembers } = useQuery({
    queryKey: ['allMembers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, user_role, bdsm_role, created_at, last_active, avatar_url')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Profile[];
    },
    refetchInterval: 60000, // Refetch every minute to update online status
  });
  
  // Find recently active members (active in the last 5 minutes)
  const { data: recentlyActiveMembers, isLoading: loadingActive } = useQuery({
    queryKey: ['recentlyActiveMembers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, user_role, bdsm_role, created_at, last_active, avatar_url')
        .order('last_active', { ascending: false })
        .limit(6);
        
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

  // Count online users
  const onlineUsersCount = recentlyActiveMembers?.filter(member => {
    if (!member.last_active) return false;
    
    const lastActiveDate = new Date(member.last_active);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60));
    
    return diffInMinutes < 5; // Consider online if active in the last 5 minutes
  }).length || 0;
  
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyActiveMembers?.map(member => (
                <MemberCard 
                  key={member.id}
                  id={member.id}
                  username={member.username}
                  user_role={member.user_role}
                  bdsm_role={member.bdsm_role}
                  last_active={member.last_active}
                  avatar_url={member.avatar_url}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          {loadingMembers ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {paginatedMembers?.map(member => (
                  <MemberCard 
                    key={member.id}
                    id={member.id}
                    username={member.username}
                    user_role={member.user_role}
                    bdsm_role={member.bdsm_role}
                    last_active={member.last_active}
                    avatar_url={member.avatar_url}
                  />
                ))}
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
            </>
          )}
        </TabsContent>
        
        <TabsContent value="table" className="mt-0">
          <div className="rounded-md border border-white/10 backdrop-blur-md overflow-hidden">
            <Table>
              <TableHeader className="bg-black/30">
                <TableRow className="hover:bg-black/40 border-white/10">
                  <TableHead className="text-white w-[50px]">#</TableHead>
                  <TableHead className="text-white">Username</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Role</TableHead>
                  <TableHead className="text-white">BDSM Role</TableHead>
                  <TableHead className="text-white">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMembers?.map((member, index) => {
                  const { variant, Icon, bdsmRole } = getBdsmRoleBadge(member.bdsm_role);
                  const username = member.username || 'Anonymous';
                  return (
                    <TableRow key={member.id} className="hover:bg-black/40 border-white/10">
                      <TableCell className="text-white/70">
                        {(currentPage - 1) * membersPerPage + index + 1}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Link to={`/profile/${username}`}>
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback className="bg-crimson text-white text-xs">
                                  {(member.username || 'AN').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <OnlineIndicator 
                                lastActive={member.last_active} 
                                className="absolute -top-1 -right-1 h-2 w-2 ring-1 ring-background" 
                                showTooltip={false}
                              />
                            </Link>
                          </div>
                          <Link to={`/profile/${username}`} className="hover:text-crimson transition-colors">
                            {username}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70">
                        {isUserOnline(member.last_active) ? (
                          <span className="text-green-500">Online</span>
                        ) : (
                          <span className="text-white/50">
                            {member.last_active ? 'Last active ' + new Date(member.last_active).toLocaleDateString() : 'Never'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {member.user_role || 'Member'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant as any} className="flex items-center gap-1 text-xs">
                          <Icon size={12} />
                          {bdsmRole}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/70">
                        {member.created_at 
                          ? new Date(member.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Unknown'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {communityContent}
      </div>
      
      {/* Add the GroupChatButton to enable community chat */}
      <GroupChatButton onlineCount={onlineUsersCount} />
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
