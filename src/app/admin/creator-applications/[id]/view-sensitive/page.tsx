
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { logAdminAction } from "@/lib/admin-logger";
import { ensureNonNull } from "@/utils/supabaseUtils";

export default async function ViewSensitiveDataPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  const headersList = headers();
  
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

  // Fetch application details with sensitive data
  const { data: application, error } = await supabase
    .from('creator_applications')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    console.error('Error fetching application:', error);
    return <div>Error loading application</div>;
  }

  if (!application) {
    return <div>Application not found</div>;
  }

  // Get signed URLs for ID documents with short expiration
  const { data: frontUrl } = await supabase
    .storage
    .from('identity-documents')
    .createSignedUrl(ensureNonNull(application.id_front_storage_path, ''), 30); // 30 seconds

  const { data: backUrl } = await supabase
    .storage
    .from('identity-documents')
    .createSignedUrl(ensureNonNull(application.id_back_storage_path, ''), 30); // 30 seconds

  // Log the sensitive data access
  await logAdminAction({
    admin_id: session.user.id,
    action: 'view_sensitive_data',
    target_id: application.id,
    details: {
      application_id: application.id,
      user_id: application.user_id,
      accessed_fields: ['personal_info', 'id_documents'],
    },
    ip_address: headersList.get('x-forwarded-for') || headersList.get('x-real-ip'),
    user_agent: headersList.get('user-agent'),
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sensitive Application Data</h1>
        <Button variant="outline" asChild>
          <a href={`/admin/creator-applications/${params.id}`}>Back to Application</a>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p>{application.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p>{new Date(application.date_of_birth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p>{application.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identity Documents</CardTitle>
            <p className="text-sm text-muted-foreground">
              Document access links expire in 30 seconds
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Front ID</h3>
              {frontUrl && (
                <div className="relative aspect-[3/2] w-full max-w-md">
                  <Image
                    src={frontUrl.signedUrl}
                    alt="Front ID"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Back ID</h3>
              {backUrl && (
                <div className="relative aspect-[3/2] w-full max-w-md">
                  <Image
                    src={backUrl.signedUrl}
                    alt="Back ID"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
