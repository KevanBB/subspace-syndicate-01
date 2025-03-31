import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import CreatorApplicationForm from "@/components/creator/CreatorApplicationForm";

export default async function CreatorApplicationPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  // Check if user already has a pending or approved application
  const { data: profile } = await supabase
    .from('profiles')
    .select('creator_status')
    .eq('id', session.user.id)
    .single();

  if (profile?.creator_status && profile.creator_status !== 'denied') {
    redirect('/settings');
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Apply to Become a Creator</h1>
        <CreatorApplicationForm />
      </div>
    </div>
  );
} 