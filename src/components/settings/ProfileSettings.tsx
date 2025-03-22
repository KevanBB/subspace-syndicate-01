
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Upload, X } from 'lucide-react';

interface ProfileData {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  bdsm_role: string;
  location: string | null;
  birthday: string | null;
  orientation: string | null;
  created_at: string | null;
  last_active: string | null;
  visibility: string | null;
  media_visibility: string | null;
  allow_messages: boolean | null;
  username_normalized?: string;
  user_role?: string;
  show_online_status?: boolean;
  // Add the missing fields to fix the TypeScript errors
  looking_for?: string | null;
  kinks?: string | null;
  soft_limits?: string | null;
  hard_limits?: string | null;
}

const ProfileSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileData, setProfileData] = useState<Partial<ProfileData>>({
    looking_for: '',
    kinks: '',
    soft_limits: '',
    hard_limits: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [orientation, setOrientation] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [bdsmRole, setBdsmRole] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [kinks, setKinks] = useState('');
  const [softLimits, setSoftLimits] = useState('');
  const [hardLimits, setHardLimits] = useState('');
  
  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
    }
  }, [user]);
  
  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Create a safe data object with defaults for missing fields
        const safeData: ProfileData = {
          ...data,
          looking_for: data.looking_for ?? '',
          kinks: data.kinks ?? '',
          soft_limits: data.soft_limits ?? '',
          hard_limits: data.hard_limits ?? '',
        };
        
        // Update Supabase profiles table with these fields if they don't exist
        if (data.looking_for === undefined || 
            data.kinks === undefined || 
            data.soft_limits === undefined || 
            data.hard_limits === undefined) {
          await supabase
            .from('profiles')
            .update({
              looking_for: data.looking_for ?? '',
              kinks: data.kinks ?? '',
              soft_limits: data.soft_limits ?? '',
              hard_limits: data.hard_limits ?? ''
            })
            .eq('id', user?.id);
        }
        
        setProfileData(safeData);
        setUsername(safeData.username || '');
        setBio(safeData.bio || '');
        setLocation(safeData.location || '');
        setOrientation(safeData.orientation || '');
        setVisibility(safeData.visibility || 'public');
        setBdsmRole(safeData.bdsm_role || '');
        setLookingFor(safeData.looking_for || '');
        setKinks(safeData.kinks || '');
        setSoftLimits(safeData.soft_limits || '');
        setHardLimits(safeData.hard_limits || '');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setAvatarFile(file);
    
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };
  
  const uploadAvatar = async () => {
    if (!avatarFile || !user) return;
    
    setAvatarLoading(true);
    
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);
        
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      const avatarUrl = publicUrlData.publicUrl;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      setProfileData({ ...profileData, avatar_url: avatarUrl });
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated.',
      });
      
      setAvatarFile(null);
      
    } catch (error: any) {
      toast({
        title: 'Error updating avatar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAvatarLoading(false);
    }
  };
  
  const cancelAvatarUpload = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview('');
  };
  
  const updateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const updates = {
        username,
        bio,
        location,
        orientation,
        visibility,
        bdsm_role: bdsmRole,
        looking_for: lookingFor,
        kinks: kinks,
        soft_limits: softLimits,
        hard_limits: hardLimits,
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      await fetchProfileData();
      
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const initials = username
    ? username.substring(0, 2).toUpperCase()
    : user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Profile Settings</h2>
        <p className="text-gray-400 mb-6">Manage your profile information and visibility</p>
      </div>
      
      <Card className="bg-black/30 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Profile Picture</CardTitle>
          <CardDescription className="text-white/70">
            This is your public profile image. It will be displayed on your profile and comments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-2 border-white/20">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Preview" />
                ) : (
                  <>
                    <AvatarImage src={profileData.avatar_url || ""} alt={username} />
                    <AvatarFallback className="bg-crimson text-white text-xl">
                      {initials}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row">
              {avatarFile ? (
                <>
                  <Button 
                    onClick={uploadAvatar}
                    disabled={avatarLoading}
                    className="bg-crimson hover:bg-crimson/90 text-white"
                  >
                    {avatarLoading ? "Uploading..." : "Save Avatar"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={cancelAvatarUpload}
                    disabled={avatarLoading}
                    className="border-white/20"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <div>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    variant="outline"
                    className="border-white/20"
                  >
                    <Upload className="mr-2 h-4 w-4" /> Change Avatar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-black/30 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black/30 border-white/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-black/30 border-white/10"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <Select value={orientation} onValueChange={setOrientation}>
                <SelectTrigger className="bg-black/30 border-white/10 w-full">
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/10 text-white">
                  <SelectItem value="hetero">Hetero</SelectItem>
                  <SelectItem value="gay">Gay</SelectItem>
                  <SelectItem value="lesbian">Lesbian</SelectItem>
                  <SelectItem value="bisexual">Bisexual</SelectItem>
                  <SelectItem value="pansexual">Pansexual</SelectItem>
                  <SelectItem value="asexual">Asexual</SelectItem>
                  <SelectItem value="queer">Queer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bdsm-role">BDSM Role</Label>
              <Select value={bdsmRole} onValueChange={setBdsmRole}>
                <SelectTrigger className="bg-black/30 border-white/10 w-full">
                  <SelectValue placeholder="Select BDSM role" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/10 text-white">
                  <SelectItem value="dominant">Dominant</SelectItem>
                  <SelectItem value="submissive">Submissive</SelectItem>
                  <SelectItem value="switch">Switch</SelectItem>
                  <SelectItem value="exploring">Exploring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="visibility">Profile Visibility</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="bg-black/30 border-white/10 w-full">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-white/10 text-white">
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="members-only">Members Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-black/30 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Bio</CardTitle>
          <CardDescription className="text-white/70">
            Tell others about yourself
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short bio about yourself..."
            className="bg-black/30 border-white/10 min-h-[120px]"
          />
        </CardContent>
      </Card>
      
      <Card className="bg-black/30 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Looking For</CardTitle>
          <CardDescription className="text-white/70">
            Describe what you're seeking in a connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
            placeholder="What are you looking for on this platform?"
            className="bg-black/30 border-white/10 min-h-[100px]"
          />
        </CardContent>
      </Card>
      
      <Card className="bg-black/30 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Kinks/Fetishes</CardTitle>
          <CardDescription className="text-white/70">
            List your interests, kinks, and fetishes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={kinks}
            onChange={(e) => setKinks(e.target.value)}
            placeholder="List your kinks and fetishes..."
            className="bg-black/30 border-white/10 min-h-[100px]"
          />
        </CardContent>
      </Card>
      
      <Card className="bg-black/30 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Soft Limits</CardTitle>
          <CardDescription className="text-white/70">
            Activities you may consider under specific circumstances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={softLimits}
            onChange={(e) => setSoftLimits(e.target.value)}
            placeholder="List your soft limits..."
            className="bg-black/30 border-white/10 min-h-[100px]"
          />
        </CardContent>
      </Card>
      
      <Card className="bg-black/30 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Hard Limits</CardTitle>
          <CardDescription className="text-white/70">
            Activities you absolutely will not engage in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={hardLimits}
            onChange={(e) => setHardLimits(e.target.value)}
            placeholder="List your hard limits..."
            className="bg-black/30 border-white/10 min-h-[100px]"
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          onClick={updateProfile} 
          className="bg-crimson hover:bg-crimson/90 text-white"
          disabled={loading}
        >
          {loading ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
