import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
]);

const isTeacherRoute = createRouteMatcher([
  '/teacher/dashboard(.*)',
  '/teacher/assessment-builder(.*)',
  '/teacher/content-generation(.*)',
  '/teacher/media-toolkit(.*)',
  '/teacher/teacher-library(.*)',
  '/teacher/voice-coaching(.*)',
]);

const isStudentArea = createRouteMatcher([
  '/student/dashboard(.*)',
  '/student/learning-library(.*)',
  '/student/progress-report(.*)',
  '/student/achievements(.*)',
  '/student/my-learning(.*)',
]);

function roleFromClaims(claims) {
  return claims?.metadata?.role ?? claims?.publicMetadata?.role ?? null;
}

async function resolveRole(userId, claims) {
  const fromClaims = roleFromClaims(claims);
  if (fromClaims) return fromClaims;
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.publicMetadata?.role ?? user.privateMetadata?.role ?? null;
  } catch (e) {
    console.error('RBAC resolveRole failed:', e);
    return null;
  }
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (isPublicRoute(req)) {
    const { userId, sessionClaims } = await auth();

    // If signed in and visiting sign-in/up, send to dashboard
    if (userId && (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up'))) {
      const role = await resolveRole(userId, sessionClaims);
      const dest = role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
      return NextResponse.redirect(new URL(dest, req.url));
    }

    // Root: send signed-in users to their dashboard; render landing if no role
    if (pathname === '/') {
      if (userId) {
        const role = await resolveRole(userId, sessionClaims);
        if (role === 'teacher') return NextResponse.redirect(new URL('/teacher/dashboard', req.url));
        if (role === 'student') return NextResponse.redirect(new URL('/student/dashboard', req.url));
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    return NextResponse.next();
  }

  // Auth required beyond this point
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const role = await resolveRole(userId, sessionClaims);

  // Guard teacher routes only when we positively know the user is not teacher
  if (isTeacherRoute(req)) {
    if (role === 'teacher') return NextResponse.next();
    if (role === 'student') {
      return NextResponse.redirect(new URL('/student/dashboard', req.url));
    }
    // Unknown role → defer to page-level protection (no redirect here)
    return NextResponse.next();
  }

  if (isStudentArea(req)) {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};