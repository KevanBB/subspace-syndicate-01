import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { BookmarkIcon, Loader2, MessageSquare, MoreHorizontal, Heart, Share, Trash2, Edit, Flag, Eye, Clock, AlertTriangle } from 'lucide-react';
import { parseHashtags } from '@/utils/hashtags';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/ui/VideoPlayer';

interface ProfileData {
  username?: string;
  avatar_url?: string;
  bdsm_role?: string;
}

interface PostWithProfile {
  id: string;
  content: string;
  created_at: string | null;
  user_id: string;
  media_url: string | null;
  media_type: string | null;
  profiles?: ProfileData;
  username?: string;
  avatar_url?: string;
  bdsm_role?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  profiles?: ProfileData;
  username?: string;
  avatar_url?: string;
  bdsm_role?: string;
}

const PostItem = ({ post }: { post: PostWithProfile }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isTruncated, setIsTruncated] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [showFullMedia, setShowFullMedia] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaDimensions, setMediaDimensions] = useState<{ width: number; height: number } | null>(null);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [showAge, setShowAge] = useState(false);
  const [showViews, setShowViews] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [loadingViews, setLoadingViews] = useState(false);
  const [showFlagConfirmation, setShowFlagConfirmation] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);
  const [loadingFlag, setLoadingFlag] = useState(false);
  const [showTimers, setShowTimers] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showLess, setShowLess] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [showAttribution, setShowAttribution] = useState(false);
  const [showLicense, setShowLicense] = useState(false);
  const [showCopyright, setShowCopyright] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCookies, setShowCookies] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showCodeOfConduct, setShowCodeOfConduct] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);
  const [showNotices, setShowNotices] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showSponsors, setShowSponsors] = useState(false);
  const [showPartners, setShowPartners] = useState(false);
  const [showAffiliates, setShowAffiliates] = useState(false);
  const [showDonors, setShowDonors] = useState(false);
  const [showSupporters, setShowSupporters] = useState(false);
  const [showVolunteers, setShowVolunteers] = useState(false);
  const [showInterns, setShowInterns] = useState(false);
  const [showMentors, setShowMentors] = useState(false);
  const [showAdvisors, setShowAdvisors] = useState(false);
  const [showConsultants, setShowConsultants] = useState(false);
  const [showContractors, setShowContractors] = useState(false);
  const [showFreelancers, setShowFreelancers] = useState(false);
  const [showVendors, setShowVendors] = useState(false);
  const [showSuppliers, setShowSuppliers] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showClients, setShowClients] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showGroup, setShowGroup] = useState(false);
  const [showChannel, setShowChannel] = useState(false);
  const [showPage, setShowPage] = useState(false);
  const [showEvent, setShowEvent] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showPlace, setShowPlace] = useState(false);
  const [showVenue, setShowVenue] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showCity, setShowCity] = useState(false);
  const [showState, setShowState] = useState(false);
  const [showCountry, setShowCountry] = useState(false);
  const [showZip, setShowZip] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showWebsite, setShowWebsite] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showDetails2, setShowDetails2] = useState(false);
  const [showMore2, setShowMore2] = useState(false);
  const [showLess2, setShowLess2] = useState(false);
  const [showAll2, setShowAll2] = useState(false);
  const [showOriginal2, setShowOriginal2] = useState(false);
  const [showTranslated2, setShowTranslated2] = useState(false);
  const [showSource2, setShowSource2] = useState(false);
  const [showAttribution2, setShowAttribution2] = useState(false);
  const [showLicense2, setShowLicense2] = useState(false);
  const [showCopyright2, setShowCopyright2] = useState(false);
  const [showTerms2, setShowTerms2] = useState(false);
  const [showPrivacy2, setShowPrivacy2] = useState(false);
  const [showCookies2, setShowCookies2] = useState(false);
  const [showAccessibility2, setShowAccessibility2] = useState(false);
  const [showGuidelines2, setShowGuidelines2] = useState(false);
  const [showCodeOfConduct2, setShowCodeOfConduct2] = useState(false);
  const [showDisclaimer2, setShowDisclaimer2] = useState(false);
  const [showWarnings2, setShowWarnings2] = useState(false);
  const [showNotices2, setShowNotices2] = useState(false);
  const [showCredits2, setShowCredits2] = useState(false);
  const [showSponsors2, setShowSponsors2] = useState(false);
  const [showPartners2, setShowPartners2] = useState(false);
  const [showAffiliates2, setShowAffiliates2] = useState(false);
  const [showDonors2, setShowDonors2] = useState(false);
  const [showSupporters2, setShowSupporters2] = useState(false);
  const [showVolunteers2, setShowVolunteers2] = useState(false);
  const [showInterns2, setShowInterns2] = useState(false);
  const [showMentors2, setShowMentors2] = useState(false);
  const [showAdvisors2, setShowAdvisors2] = useState(false);
  const [showConsultants2, setShowConsultants2] = useState(false);
  const [showContractors2, setShowContractors2] = useState(false);
  const [showFreelancers2, setShowFreelancers2] = useState(false);
  const [showVendors2, setShowVendors2] = useState(false);
  const [showSuppliers2, setShowSuppliers2] = useState(false);
  const [showCustomers2, setShowCustomers2] = useState(false);
  const [showClients2, setShowClients2] = useState(false);
  const [showUsers2, setShowUsers2] = useState(false);
  const [showMembers2, setShowMembers2] = useState(false);
  const [showFollowers2, setShowFollowers2] = useState(false);
  const [showFollowing2, setShowFollowing2] = useState(false);
  const [showFriends2, setShowFriends2] = useState(false);
  const [showContacts2, setShowContacts2] = useState(false);
  const [showConnections2, setShowConnections2] = useState(false);
  const [showNetwork2, setShowNetwork2] = useState(false);
  const [showCommunity2, setShowCommunity2] = useState(false);
  const [showGroup2, setShowGroup2] = useState(false);
  const [showChannel2, setShowChannel2] = useState(false);
  const [showPage2, setShowPage2] = useState(false);
  const [showEvent2, setShowEvent2] = useState(false);
  const [showLocation2, setShowLocation2] = useState(false);
  const [showPlace2, setShowPlace2] = useState(false);
  const [showVenue2, setShowVenue2] = useState(false);
  const [showAddress2, setShowAddress2] = useState(false);
  const [showCity2, setShowCity2] = useState(false);
  const [showState2, setShowState2] = useState(false);
  const [showCountry2, setShowCountry2] = useState(false);
  const [showZip2, setShowZip2] = useState(false);
  const [showPhone2, setShowPhone2] = useState(false);
  const [showEmail2, setShowEmail2] = useState(false);
  const [showWebsite2, setShowWebsite2] = useState(false);
  const [showSocial2, setShowSocial2] = useState(false);
  const [showLinks2, setShowLinks2] = useState(false);
  const [showTags2, setShowTags2] = useState(false);
  const [showCategories2, setShowCategories2] = useState(false);
  const [showKeywords2, setShowKeywords2] = useState(false);
  const [showDescription2, setShowDescription2] = useState(false);
  const [showSummary2, setShowSummary2] = useState(false);

  useEffect(() => {
    loadComments();
    checkIfLiked();
    fetchLikeCount();
    checkIfBookmarked();
  }, [post.id, user?.id]);

  useEffect(() => {
    if (post.media_url) {
      loadImageDimensions(post.media_url);
    }
  }, [post.media_url]);

  const loadImageDimensions = (url: string) => {
    setMediaLoading(true);
    setMediaError(null);

    const img = new Image();
    img.onload = () => {
      setMediaDimensions({
        width: img.width,
        height: img.height,
      });
      setMediaLoading(false);
    };
    img.onerror = () => {
      setMediaError('Failed to load image');
      setMediaLoading(false);
    };
    img.src = url;
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            bdsm_role
          )
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setComments(
        (data as any[]).map((comment) => ({
          ...comment,
          username: comment.profiles?.username || 'User',
          avatar_url: comment.profiles?.avatar_url,
          bdsm_role: comment.profiles?.bdsm_role,
        }))
      );
    } catch (error: any) {
      toast({
        title: 'Error loading comments',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment,
          user_id: user.id,
          post_id: post.id,
        });

      if (error) throw error;

      setNewComment('');
      loadComments();
    } catch (error: any) {
      toast({
        title: 'Error submitting comment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const checkIfLiked = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', post.id)
        .single();

      if (error && error.message !== 'No rows found') throw error;

      setIsLiked(!!data);
    } catch (error: any) {
      console.error('Error checking if liked:', error.message);
    }
  };

  const fetchLikeCount = async () => {
    setLoadingLikes(true);
    try {
      const { count, error } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact' })
        .eq('post_id', post.id);

      if (error) throw error;

      setLikeCount(count || 0);
    } catch (error: any) {
      console.error('Error fetching like count:', error.message);
    } finally {
      setLoadingLikes(false);
    }
  };

  const toggleLike = async () => {
    if (!user) return;

    setLoadingLikes(true);
    try {
      if (isLiked) {
        // Unlike the post
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);

        if (deleteError) throw deleteError;

        setIsLiked(false);
        setLikeCount(likeCount - 1);
      } else {
        // Like the post
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: post.id,
          });

        if (insertError) throw insertError;

        setIsLiked(true);
        setLikeCount(likeCount + 1);
      }
    } catch (error: any) {
      toast({
        title: 'Error toggling like',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingLikes(false);
    }
  };

  const checkIfBookmarked = async () => {
    if (!user) return;

    setLoadingBookmark(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', post.id)
        .single();

      if (error && error.message !== 'No rows found') throw error;

      setIsBookmarked(!!data);
    } catch (error: any) {
      console.error('Error checking if bookmarked:', error.message);
    } finally {
      setLoadingBookmark(false);
    }
  };

  const toggleBookmark = async () => {
    if (!user) return;

    setLoadingBookmark(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error: deleteError } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);

        if (deleteError) throw deleteError;

        setIsBookmarked(false);
      } else {
        // Add bookmark
        const { error: insertError } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            post_id: post.id,
          });

        if (insertError) throw insertError;

        setIsBookmarked(true);
      }
    } catch (error: any) {
      toast({
        title: 'Error toggling bookmark',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingBookmark(false);
    }
  };

  const deletePost = async () => {
    setLoadingDelete(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: 'Post deleted',
        description: 'Your post has been deleted successfully.',
      });
      // Refresh the page or navigate away
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Error deleting post',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingDelete(false);
      setShowConfirmation(false);
    }
  };

  const updatePost = async () => {
    setLoadingEdit(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: editedContent })
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: 'Post updated',
        description: 'Your post has been updated successfully.',
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Error updating post',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingEdit(false);
    }
  };

  const flagPost = async () => {
    setLoadingFlag(true);
    try {
      // Implement your flagging logic here
      // For example, you can update a 'flagged' column in the 'posts' table
      const { error } = await supabase
        .from('posts')
        .update({ flagged: true })
        .eq('id', post.id);

      if (error) throw error;

      setIsFlagged(true);
      toast({
        title: 'Post flagged',
        description: 'This post has been flagged for review.',
      });
    } catch (error: any) {
      toast({
        title: 'Error flagging post',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingFlag(false);
      setShowFlagConfirmation(false);
    }
  };

  const toggleTruncate = () => {
    setIsTruncated(!isTruncated);
  };

  const toggleMediaSize = () => {
    setShowFullMedia(!showFullMedia);
  };

  const toggleTimestamps = () => {
    setShowTimestamps(!showTimestamps);
  };

  const toggleAge = () => {
    setShowAge(!showAge);
  };

  const toggleViews = () => {
    setShowViews(!showViews);
  };

  const toggleTimers = () => {
    setShowTimers(!showTimers);
  };

  const toggleStats = () => {
    setShowStats(!showStats);
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const toggleActions = () => {
    setShowActions(!showActions);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  const toggleMore = () => {
    setShowMore(!showMore);
  };

  const toggleLess = () => {
    setShowLess(!showLess);
  };

  const toggleAll = () => {
    setShowAll(!showAll);
  };

  const toggleOriginal = () => {
    setShowOriginal(!showOriginal);
  };

  const toggleTranslated = () => {
    setShowTranslated(!showTranslated);
  };

  const toggleSource = () => {
    setShowSource(!showSource);
  };

  const toggleAttribution = () => {
    setShowAttribution(!showAttribution);
  };

  const toggleLicense = () => {
    setShowLicense(!showLicense);
  };

  const toggleCopyright = () => {
    setShowCopyright(!showCopyright);
  };

  const toggleTerms = () => {
    setShowTerms(!showTerms);
  };

  const togglePrivacy = () => {
    setShowPrivacy(!showPrivacy);
  };

  const toggleCookies = () => {
    setShowCookies(!showCookies);
  };

  const toggleAccessibility = () => {
    setShowAccessibility(!showAccessibility);
  };

  const toggleGuidelines = () => {
    setShowGuidelines(!showGuidelines);
  };

  const toggleCodeOfConduct = () => {
    setShowCodeOfConduct(!showCodeOfConduct);
  };

  const toggleDisclaimer = () => {
    setShowDisclaimer(!showDisclaimer);
  };

  const toggleWarnings = () => {
    setShowWarnings(!showWarnings);
  };

  const toggleNotices = () => {
    setShowNotices(!showNotices);
  };

  const toggleCredits = () => {
    setShowCredits(!showCredits);
  };

  const toggleSponsors = () => {
    setShowSponsors(!showSponsors);
  };

  const togglePartners = () => {
    setShowPartners(!showPartners);
  };

  const toggleAffiliates = () => {
    setShowAffiliates(!showAffiliates);
  };

  const toggleDonors = () => {
    setShowDonors(!showDonors);
  };

  const toggleSupporters = () => {
    setShowSupporters(!showSupporters);
  };

  const toggleVolunteers = () => {
    setShowVolunteers(!showVolunteers);
  };

  const toggleInterns = () => {
    setShowInterns(!showInterns);
  };

  const toggleMentors = () => {
    setShowMentors(!showMentors);
  };

  const toggleAdvisors = () => {
    setShowAdvisors(!showAdvisors);
  };

  const toggleConsultants = () => {
    setShowConsultants(!showConsultants);
  };

  const toggleContractors = () => {
    setShowContractors(!showContractors);
  };

  const toggleFreelancers = () => {
    setShowFreelancers(!showFreelancers);
  };

  const toggleVendors = () => {
    setShowVendors(!showVendors);
  };

  const toggleSuppliers = () => {
    setShowSuppliers(!showSuppliers);
  };

  const toggleCustomers = () => {
    setShowCustomers(!showCustomers);
  };

  const toggleClients = () => {
    setShowClients(!showClients);
  };

  const toggleUsers = () => {
    setShowUsers(!showUsers);
  };

  const toggleMembers = () => {
    setShowMembers(!showMembers);
  };

  const toggleFollowers = () => {
    setShowFollowers(!showFollowers);
  };

  const toggleFollowing = () => {
    setShowFollowing(!showFollowing);
  };

  const toggleFriends = () => {
    setShowFriends(!showFriends);
  };

  const toggleContacts = () => {
    setShowContacts(!showContacts);
  };

  const toggleConnections = () => {
    setShowConnections(!showConnections);
  };

  const toggleNetwork = () => {
    setShowNetwork(!showNetwork);
  };

  const toggleCommunity = () => {
    setShowCommunity(!showCommunity);
  };

  const toggleGroup = () => {
    setShowGroup(!showGroup);
  };

  const toggleChannel = () => {
    setShowChannel(!showChannel);
  };

  const togglePage = () => {
    setShowPage(!showPage);
  };

  const toggleEvent = () => {
    setShowEvent(!showEvent);
  };

  const toggleLocation = () => {
    setShowLocation(!showLocation);
  };

  const togglePlace = () => {
    setShowPlace(!showPlace);
  };

  const toggleVenue = () => {
    setShowVenue(!showVenue);
  };

  const toggleAddress = () => {
    setShowAddress(!showAddress);
  };

  const toggleCity = () => {
    setShowCity(!showCity);
  };

  const toggleState = () => {
    setShowState(!showState);
  };

  const toggleCountry = () => {
    setShowCountry(!showCountry);
  };

  const toggleZip = () => {
    setShowZip(!showZip);
  };

  const togglePhone = () => {
    setShowPhone(!showPhone);
  };

  const toggleEmail = () => {
    setShowEmail(!showEmail);
  };

  const toggleWebsite = () => {
    setShowWebsite(!showWebsite);
  };

  const toggleSocial = () => {
    setShowSocial(!showSocial);
  };

  const toggleLinks = () => {
    setShowLinks(!showLinks);
  };

  const toggleTags = () => {
    setShowTags(!showTags);
  };

  const toggleCategories = () => {
    setShowCategories(!showCategories);
  };

  const toggleKeywords = () => {
    setShowKeywords(!showKeywords);
  };

  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  const toggleSummary = () => {
    setShowSummary(!showSummary);
  };

  const toggleDetails2 = () => {
    setShowDetails2(!showDetails2);
  };

  const toggleMore2 = () => {
    setShowMore2(!showMore2);
  };

  const toggleLess2 = () => {
    setShowLess2(!showLess2);
  };

  const toggleAll2 = () => {
    setShowAll2(!showAll2);
  };

  const toggleOriginal2 = () => {
    setShowOriginal2(!showOriginal2);
  };

  const toggleTranslated2 = () => {
    setShowTranslated2(!showTranslated2);
  };

  const toggleSource2 = () => {
    setShowSource2(!showSource2);
  };

  const toggleAttribution2 = () => {
    setShowAttribution2(!showAttribution2);
  };

  const toggleLicense2 = () => {
    setShowLicense2(!showLicense2);
  };

  const toggleCopyright2 = () => {
    setShowCopyright2(!showCopyright2);
  };

  const toggleTerms2 = () => {
    setShowTerms2(!showTerms2);
  };

  const togglePrivacy2 = () => {
    setShowPrivacy2(!showPrivacy2);
  };

  const toggleCookies2 = () => {
    setShowCookies2(!showCookies2);
  };

  const toggleAccessibility2 = () => {
    setShowAccessibility2(!showAccessibility2);
  };

  const toggleGuidelines2 = () => {
    setShowGuidelines2(!showGuidelines2);
  };

  const toggleCodeOfConduct2 = () => {
    setShowCodeOfConduct2(!showCodeOfConduct2);
  };

  const toggleDisclaimer2 = () => {
    setShowDisclaimer2(!showDisclaimer2);
  };

  const toggleWarnings2 = () => {
    setShowWarnings2(!showWarnings2);
  };

  const toggleNotices2 = () => {
    setShowNotices2(!showNotices2);
  };

  const toggleCredits2 = () => {
    setShowCredits2(!showCredits2);
  };

  const toggleSponsors2 = () => {
    setShowSponsors2(!showSponsors2);
  };

  const togglePartners2 = () => {
    setShowPartners2(!showPartners2);
  };

  const toggleAffiliates2 = () => {
    setShowAffiliates2(!showAffiliates2);
  };

  const toggleDonors2 = () => {
    setShowDonors2(!showDonors2);
  };

  const toggleSupporters2 = () => {
    setShowSupporters2(!showSupporters2);
  };

  const toggleVolunteers2 = () => {
    setShowVolunteers2(!showVolunteers2);
  };

  const toggleInterns2 = () => {
    setShowInterns2(!showInterns2);
  };

  const toggleMentors2 = () => {
    setShowMentors2(!showMentors2);
  };

  const toggleAdvisors2 = () => {
    setShowAdvisors2(!showAdvisors2);
  };

  const toggleConsultants2 = () => {
    setShowConsultants2(!showConsultants2);
  };

  const toggleContractors2 = () => {
    setShowContractors2(!showContractors2);
  };

  const toggleFreelancers2 = () => {
    setShowFreelancers2(!showFreelancers2);
  };

  const toggleVendors2 = () => {
    setShowVendors2(!showVendors2);
  };

  const toggleSuppliers2 = () => {
    setShowSuppliers2(!showSuppliers2);
  };

  const toggleCustomers2 = () => {
    setShowCustomers2(!showCustomers2);
  };

  const toggleClients2 = () => {
    setShowClients2(!showClients2);
  };

  const toggleUsers2 = () => {
    setShowUsers2(!showUsers2);
  };

  const toggleMembers2 = () => {
    setShowMembers2(!showMembers2);
  };

  const toggleFollowers2 = () => {
    setShowFollowers2(!showFollowers2);
  };

  const toggleFollowing2 = () => {
    setShowFollowing2(!showFollowing2);
  };

  const toggleFriends2 = () => {
    setShowFriends2(!showFriends2);
  };

  const toggleContacts2 = () => {
    setShowContacts2(!showContacts2);
  };

  const toggleConnections2 = () => {
    setShowConnections2(!showConnections2);
  };

  const toggleNetwork2 = () => {
    setShowNetwork2(!showNetwork2);
  };

  const toggleCommunity2 = () => {
    setShowCommunity2(!showCommunity2);
  };

  const toggleGroup2 = () => {
