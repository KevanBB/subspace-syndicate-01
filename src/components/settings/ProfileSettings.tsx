
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [birthday, setBirthday] = useState('');
  const [orientation, setOrientation] = useState('straight');
  const [bdsmRole, setBdsmRole] = useState('Exploring');
  const [bio, setBio] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [kinks, setKinks] = useState('');
  const [softLimits, setSoftLimits] = useState('');
  const [hardLimits, setHardLimits] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // Fetch profile data from the profiles table
  useEffect(() => {
    if (user?.id) {
      const fetchProfileData = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          setProfileData(data);
          setUsername(data.username || user?.user_metadata?.username || '');
          setLocation(data.location || user?.user_metadata?.location || '');
          setBirthday(data.birthday || user?.user_metadata?.birthday || '');
          setOrientation(data.orientation || user?.user_metadata?.orientation || 'straight');
          setBdsmRole(data.bdsm_role || user?.user_metadata?.bdsm_role || 'Exploring');
          setBio(data.bio || user?.user_metadata?.bio || '');
          setLookingFor(data.looking_for || '');
          setKinks(data.kinks || '');
          setSoftLimits(data.soft_limits || '');
          setHardLimits(data.hard_limits || '');
          setAvatarUrl(data.avatar_url || user?.user_metadata?.avatar_url || null);
        }
      };
      
      fetchProfileData();
    }
  }, [user]);
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };
  
  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarUrl(null);
  };
  
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Update metadata in auth.users
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          username,
          location,
          birthday,
          orientation,
          bdsm_role: bdsmRole,
          bio,
          looking_for: lookingFor,
          kinks,
          soft_limits: softLimits,
          hard_limits: hardLimits
        }
      });
      
      if (updateError) throw updateError;
      
      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username,
          location,
          birthday,
          orientation,
          bdsm_role: bdsmRole,
          bio,
          looking_for: lookingFor,
          kinks,
          soft_limits: softLimits,
          hard_limits: hardLimits,
          avatar_url: avatarUrl
        })
        .eq('id', user?.id);
        
      if (profileError) throw profileError;
      
      // Update avatar if a new one was uploaded
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user?.id}-avatar.${fileExt}`;
        
        // Upload to the media bucket we just created
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(`avatars/${fileName}`, avatarFile, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(`avatars/${fileName}`);
          
        // Update the avatar URL in metadata and profile
        await supabase.auth.updateUser({
          data: {
            avatar_url: publicUrlData.publicUrl
          }
        });
        
        await supabase
          .from('profiles')
          .update({
            avatar_url: publicUrlData.publicUrl
          })
          .eq('id', user?.id);
          
        setAvatarUrl(publicUrlData.publicUrl);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Profile Settings</h2>
        <p className="text-gray-400 mb-6">Update your profile information and avatar</p>
      </div>
      
      <form onSubmit={updateProfile} className="space-y-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <div className="relative flex flex-col items-center">
            <Avatar className="w-24 h-24 border-2 border-white/20">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Avatar preview" />
              ) : (
                <>
                  <AvatarImage 
                    src={user?.user_metadata?.avatar_url} 
                    alt={username} 
                  />
                  <AvatarFallback className="bg-crimson text-white text-xl">
                    {username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                <Upload size={14} />
                <span>Upload</span>
              </Button>
              
              {avatarUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={clearAvatar}
                >
                  <X size={14} />
                  <span>Clear</span>
                </Button>
              )}
            </div>
            
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-black/30 border-white/10"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-black/30 border-white/10"
                  placeholder="City, Country"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="bg-black/30 border-white/10"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orientation">Orientation</Label>
                <Select value={orientation} onValueChange={setOrientation}>
                  <SelectTrigger className="bg-black/30 border-white/10">
                    <SelectValue placeholder="Select orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight">Straight</SelectItem>
                    <SelectItem value="gay">Gay</SelectItem>
                    <SelectItem value="bisexual">Bisexual</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="bdsm-role">BDSM Role</Label>
                <Select value={bdsmRole} onValueChange={setBdsmRole}>
                  <SelectTrigger className="bg-black/30 border-white/10">
                    <SelectValue placeholder="Select BDSM role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dominant">Dominant</SelectItem>
                    <SelectItem value="submissive">submissive</SelectItem>
                    <SelectItem value="Switch">Switch</SelectItem>
                    <SelectItem value="Exploring">Exploring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-black/30 border-white/10 min-h-[120px]"
                placeholder="Tell others about yourself..."
              />
            </div>
            
            <div>
              <Label htmlFor="lookingFor">Looking For</Label>
              <Textarea
                id="lookingFor"
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                className="bg-black/30 border-white/10 min-h-[100px]"
                placeholder="What are you looking for in partners or connections..."
              />
            </div>
            
            <div>
              <Label htmlFor="kinks">Kinks/Fetishes</Label>
              <Textarea
                id="kinks"
                value={kinks}
                onChange={(e) => setKinks(e.target.value)}
                className="bg-black/30 border-white/10 min-h-[100px]"
                placeholder="List your kinks and fetishes..."
              />
            </div>
            
            <div>
              <Label htmlFor="softLimits">Soft Limits</Label>
              <Textarea
                id="softLimits"
                value={softLimits}
                onChange={(e) => setSoftLimits(e.target.value)}
                className="bg-black/30 border-white/10 min-h-[100px]"
                placeholder="List your soft limits..."
              />
            </div>
            
            <div>
              <Label htmlFor="hardLimits">Hard Limits</Label>
              <Textarea
                id="hardLimits"
                value={hardLimits}
                onChange={(e) => setHardLimits(e.target.value)}
                className="bg-black/30 border-white/10 min-h-[100px]"
                placeholder="List your hard limits..."
              />
            </div>
          </div>
        </div>
        
        <Alert className="bg-amber-900/20 border-amber-500/30 text-amber-200">
          <AlertDescription>
            All profile information is visible to other users according to your privacy settings.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
