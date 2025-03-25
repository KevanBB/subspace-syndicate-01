
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { OnlineIndicator } from '@/components/community/OnlineIndicator';
import { ProfileData } from '@/hooks/useProfileData';

interface DomSelectorProps {
  onDomSelected: (dom: ProfileData) => void;
}

export const DomSelector: React.FC<DomSelectorProps> = ({ onDomSelected }) => {
  const [dominants, setDominants] = useState<ProfileData[]>([]);
  const [filteredDominants, setFilteredDominants] = useState<ProfileData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDominants = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_role', 'creator')
          .order('last_active', { ascending: false })
          .limit(20);

        if (error) throw error;
        setDominants(data as ProfileData[]);
        setFilteredDominants(data as ProfileData[]);
      } catch (error) {
        console.error('Error fetching dominants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDominants();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDominants(dominants);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = dominants.filter(dom => 
      dom.username.toLowerCase().includes(query) || 
      (dom.bio && dom.bio.toLowerCase().includes(query))
    );
    setFilteredDominants(filtered);
  }, [searchQuery, dominants]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Select a Dominant</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Choose a Dominant to play the Spin The Wheel game with
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search Dominants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredDominants.length === 0 ? (
        <div className="text-center p-6 bg-muted rounded-lg">
          <p className="text-lg font-medium">No Dominants found</p>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDominants.map((dom) => (
            <Card key={dom.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onDomSelected(dom)}>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    {dom.avatar_url ? (
                      <AvatarImage src={dom.avatar_url} alt={dom.username} />
                    ) : (
                      <AvatarFallback>{dom.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  {dom.show_online_status && (
                    <div className="absolute -right-1 -bottom-1">
                      <OnlineIndicator userId={dom.id} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{dom.username}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {dom.bio ? dom.bio.substring(0, 50) + (dom.bio.length > 50 ? '...' : '') : 'No bio available'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
