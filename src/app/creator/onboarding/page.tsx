import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CreatorOnboardingForm } from "@/components/creator/CreatorOnboardingForm";

export default async function CreatorOnboardingPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  // Verify creator status
  const { data: profile } = await supabase
    .from('profiles')
    .select('creator_status')
    .eq('id', session.user.id)
    .single();

  if (!profile || profile.creator_status !== 'needs_onboarding') {
    redirect('/creator/dashboard');
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Welcome to SubSpace Creator Program</h1>
        <p className="text-muted-foreground mb-8">
          Let's set up your creator profile and get you started with monetization options.
        </p>
        <CreatorOnboardingForm />
      </div>
    </div>
  );
} 