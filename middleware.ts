import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default clerkMiddleware((auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  
  // Redirección root "/" a idioma preferido
  if (pathname === '/') {
    const acceptLanguage = req.headers.get('accept-language') || '';
    const preferredLocale = acceptLanguage.toLowerCase().includes('es') ? 'es' : 'en';
    return NextResponse.redirect(new URL(`/${preferredLocale}`, req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
