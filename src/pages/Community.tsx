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
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRole(e.target.value);
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
          <Button 
            onClick={() => handlePageChange(i + 1)} 
            isActive={currentPage === i + 1}
            size="sm"
          >
            {i + 1}
          </Button>
        );
      }
    } else {
      // First page
      pageNumbers.push(
        <Button 
          onClick={() => handlePageChange(1)} 
          isActive={currentPage === 1}
          size="sm"
        >
          1
        </Button>
      );
      
      // "..." if not near the beginning
      if (currentPage > 3) {
        pageNumbers.push(<span className="text-white/60">...</span>);
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
          <Button 
            onClick={() => handlePageChange(i)} 
            isActive={currentPage === i}
            size="sm"
          >
            {i}
          </Button>
        );
      }
      
      // "..." if not near the end
      if (currentPage < totalPages - 2) {
        pageNumbers.push(<span className="text-white/60">...</span>);
      }
      
      // Last page
      pageNumbers.push(
        <Button 
          onClick={() => handlePageChange(totalPages)} 
          isActive={currentPage === totalPages}
          size="sm"
        >
          {totalPages}
        </Button>
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
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <Button 
              onClick={() => handlePageChange(currentPage - 1)} 
              className="text-white/70 hover:text-white"
              size="sm"
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
