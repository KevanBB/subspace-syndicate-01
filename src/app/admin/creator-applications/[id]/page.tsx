import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ApplicationActions } from "./application-actions";

export default async function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  // Fetch application details
  const { data: application, error } = await supabase
    .from('creator_applications')
    .select(`
      *,
      profiles:user_id (
        username,
        email
      )
    `)
    .eq('id', params.id)
    .single();

  if (error) {
    console.error('Error fetching application:', error);
    return <div>Error loading application</div>;
  }

  if (!application) {
    return <div>Application not found</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Application Review</h1>
        <Button variant="outline" asChild>
          <a href="/admin/creator-applications">Back to List</a>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                <p>{application.profiles.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{application.profiles.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p>{application.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                <p>{formatDistanceToNow(new Date(application.submitted_at), { addSuffix: true })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identity Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Front ID</p>
                <p className="text-sm">{application.id_front_storage_path}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Back ID</p>
                <p className="text-sm">{application.id_back_storage_path}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={`/admin/creator-applications/${params.id}/view-sensitive`}>
                  View Sensitive Data
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {application.admin_notes || "No notes yet"}
            </p>
          </CardContent>
        </Card>

        <ApplicationActions application={application} />
      </div>
    </div>
  );
} 