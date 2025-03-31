import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CreatorApplicationsPage() {
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

  // Fetch pending applications
  const { data: applications, error } = await supabase
    .from('creator_applications')
    .select(`
      id,
      user_id,
      full_name,
      status,
      submitted_at,
      profiles:user_id (
        username
      )
    `)
    .eq('status', 'pending_application')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    return <div>Error loading applications</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Creator Applications</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/creator-applications/history">
              View History
            </Link>
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={applications || []}
      />
    </div>
  );
} 