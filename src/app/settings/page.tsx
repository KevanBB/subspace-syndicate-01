import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('creator_status')
    .eq('id', session.user.id)
    .single();

  const { data: application } = await supabase
    .from('creator_applications')
    .select('status, submitted_at')
    .eq('user_id', session.user.id)
    .single();

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending_application':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'needs_onboarding':
        return <Badge variant="default">Approved - Complete Onboarding</Badge>;
      case 'active':
        return <Badge variant="success">Active Creator</Badge>;
      case 'denied':
        return <Badge variant="destructive">Application Denied</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Account Suspended</Badge>;
      default:
        return <Badge variant="outline">Not Applied</Badge>;
    }
  };

  const getStatusDescription = (status: string | null) => {
    switch (status) {
      case 'pending_application':
        return "Your application is being reviewed by our team. We'll notify you once a decision has been made.";
      case 'needs_onboarding':
        return "Congratulations! Your application has been approved. Complete the onboarding process to start creating content.";
      case 'active':
        return "You are an active creator on SubSpace. You can manage your content and subscriptions from your creator dashboard.";
      case 'denied':
        return "We're sorry, but your application was not approved at this time. You can apply again in the future.";
      case 'suspended':
        return "Your creator account has been suspended. Please contact support for more information.";
      default:
        return "Join our creator program to start monetizing your content and building your community.";
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="creator">Creator Program</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          {/* Existing profile settings content */}
        </TabsContent>

        <TabsContent value="creator">
          <Card>
            <CardHeader>
              <CardTitle>Creator Program</CardTitle>
              <CardDescription>
                {getStatusDescription(profile?.creator_status)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Application Status</h3>
                  {getStatusBadge(profile?.creator_status)}
                </div>
                {(!profile?.creator_status || profile.creator_status === 'denied') && (
                  <Link href="/settings/creator/apply">
                    <Button>Apply Now</Button>
                  </Link>
                )}
              </div>

              {profile?.creator_status === 'needs_onboarding' && (
                <div className="mt-4">
                  <Link href="/settings/creator/onboarding">
                    <Button>Complete Onboarding</Button>
                  </Link>
                </div>
              )}

              {application && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Submitted on: {new Date(application.submitted_at).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          {/* Existing notifications settings content */}
        </TabsContent>
      </Tabs>
    </div>
  );
} 