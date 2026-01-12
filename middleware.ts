import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación
const isProtectedRoute = createRouteMatcher(['/settings(.*)', '/blog/editor(.*)', '/admin(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  
  // Eliminar locale de la URL si existe (redirigir a la ruta sin locale)
  const hasLocale = /^\/(en|es)(\/|$)/.test(pathname);
  if (hasLocale) {
    const pathWithoutLocale = pathname.replace(/^\/(en|es)/, '') || '/';
    return NextResponse.redirect(new URL(pathWithoutLocale, req.url));
  }
  
  // Proteger rutas que requieren autenticación
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL('/login', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|files/).*)',
  ],
};
