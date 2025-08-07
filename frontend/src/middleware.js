import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhook(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    // For API routes, we want to continue even if auth fails
    // This allows our API routes to handle auth themselves
    if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.next();
    }
    
    // For non-API routes that aren't public, protect them
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
    
    if(req.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/teacher/dashboard', req.url));
    }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};