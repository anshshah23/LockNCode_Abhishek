import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in',
  '/sign-up',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  console.log(userId, req.nextUrl.pathname);
  if (userId && isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  if (!userId) {
    if (!userId && !isPublicRoute(req) && req.nextUrl.pathname !== '/') {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}