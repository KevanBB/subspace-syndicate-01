import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default async function SettingsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const { data: application } = await supabase
    .from('creator_applications')
    .select('status, submitted_at, admin_notes')
    .eq('user_id', session.user.id)
    .single();

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return <Badge variant="outline">Not Applied</Badge>;
    }
  };

  const getStatusDescription = (status: string | null) => {
    switch (status) {
      case 'pending':
        return "Your application is being reviewed by our team. We'll notify you once a decision has been made.";
      case 'approved':
        return "Congratulations! Your application has been approved. You can now start creating content.";
      case 'denied':
        return application?.admin_notes 
          ? `We're sorry, but your application was not approved at this time. Reason: ${application.admin_notes}`
          : "We're sorry, but your application was not approved at this time. You can apply again in the future.";
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
                {getStatusDescription(application?.status)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Application Status</h3>
                  {getStatusBadge(application?.status)}
                </div>
                {(!application || application.status === 'denied') && (
                  <Link href="/settings/creator/apply">
                    <Button>Apply Now</Button>
                  </Link>
                )}
              </div>

              {application && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Submitted {formatDistanceToNow(new Date(application.submitted_at), { addSuffix: true })}
                  </div>
                  {application.status === 'denied' && application.admin_notes && (
                    <div className="mt-2 p-3 bg-destructive/10 rounded-md">
                      <p className="text-sm text-destructive">
                        {application.admin_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {profile?.role === 'creator' && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Creator Dashboard</Badge>
                    <Link href="/creator/dashboard">
                      <Button variant="link">View Dashboard</Button>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Content Management</Badge>
                    <Link href="/creator/content">
                      <Button variant="link">Manage Content</Button>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Subscription Settings</Badge>
                    <Link href="/creator/subscriptions">
                      <Button variant="link">Configure Subscriptions</Button>
                    </Link>
                  </div>
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