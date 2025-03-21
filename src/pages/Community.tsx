
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MemberCard from '@/components/community/MemberCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Navbar from '@/components/Navbar';

type Profile = {
  id: string;
  username: string | null;
  user_role: string | null;
  created_at: string | null;
  last_active?: string | null;
};

const Community = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 12;
  
  // Fetch all members
  const { data: allMembers, isLoading: loadingMembers } = useQuery({
    queryKey: ['allMembers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, user_role, created_at')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Profile[];
    }
  });
  
  // For the purpose of this demo, we'll randomly select some members as "recently active"
  // In a real app, you'd track last_active in the database
  const { data: recentlyActiveMembers, isLoading: loadingActive } = useQuery({
    queryKey: ['recentlyActiveMembers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, user_role, created_at')
        .limit(6)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Add a mock last_active timestamp (in a real app, this would come from the database)
      return data.map(member => ({
        ...member,
        last_active: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
      })) as Profile[];
    }
  });
  
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
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-10">
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
                    last_active={member.last_active}
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
                    <TableHead className="text-white">Role</TableHead>
                    <TableHead className="text-white">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMembers?.map((member, index) => (
                    <TableRow key={member.id} className="hover:bg-black/40 border-white/10">
                      <TableCell className="text-white/70">
                        {(currentPage - 1) * membersPerPage + index + 1}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-crimson text-white text-xs">
                              {(member.username || 'AN').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {member.username || 'Anonymous'}
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70">
                        {member.user_role || 'Member'}
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
                  ))}
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
      </div>
    </div>
  );
};

export default Community;
