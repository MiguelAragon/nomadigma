import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default clerkMiddleware((auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  
  // Rutas que necesitan locale
  const TRANSLATED_PREFIXES = ['/blog', '/gallery', '/destinations', '/about-me', '/settings'];
  
  // Verificar si ya tiene locale
  const hasLocale = /^\/(en|es)(\/|$)/.test(pathname);
  const pathWithoutLocale = hasLocale ? pathname.replace(/^\/(en|es)/, '') || '/' : pathname;

  // Verificar si la ruta necesita locale
  const needsLocale = pathWithoutLocale === '/' || 
    TRANSLATED_PREFIXES.some(prefix => pathWithoutLocale === prefix || pathWithoutLocale.startsWith(prefix + '/'));

  // Si tiene locale pero NO lo necesita -> quitar locale
  if (hasLocale && !needsLocale) {
    return NextResponse.redirect(new URL(pathWithoutLocale, req.url));
  }

  // Si necesita locale pero NO lo tiene -> agregar locale
  if (!hasLocale && needsLocale) {
    const lang = req.headers.get('accept-language')?.toLowerCase().includes('es') ? 'es' : 'en';
    return NextResponse.redirect(new URL(`/${lang}${pathname}`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - files (uploaded files directory)
     * But DO include /api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|files/).*)',
  ],
};
