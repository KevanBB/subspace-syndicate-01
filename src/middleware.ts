import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Handle admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Handle creator onboarding
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('creator_status')
      .eq('id', session.user.id)
      .single();

    // Redirect to onboarding if needed
    if (profile?.creator_status === 'needs_onboarding' && 
        !request.nextUrl.pathname.startsWith('/creator/onboarding')) {
      return NextResponse.redirect(new URL('/creator/onboarding', request.url));
    }

    // Prevent accessing onboarding if not needed
    if (profile?.creator_status !== 'needs_onboarding' && 
        request.nextUrl.pathname.startsWith('/creator/onboarding')) {
      return NextResponse.redirect(new URL('/creator/dashboard', request.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/creator/:path*',
  ],
}; 