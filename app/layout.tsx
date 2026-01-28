import { ReactNode } from 'react';
import { DM_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { NavigationProvider } from '@/providers/navigation-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { I18nProvider } from '@/providers/i18n-provider';
import { StoreClientProvider } from '@/app/(public)/store/components/context';
import { StoreClientWrapper } from '@/app/(public)/store/components/wrapper';
import { Toaster } from '@/components/ui/sonner';
import { GoogleAnalytics } from '@/components/google-analytics';
import { CookieBanner } from '@/components/cookie-banner';

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-dm-sans',
});

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Nomadigma',
    default: 'Nomadigma - Blog de viajes y nómada digital',
  },
  description: 'Explora el mundo como nómada digital. Guías de viaje, tips y experiencias.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Nomadigma - Blog de viajes y nómada digital',
    description: 'Explora el mundo como nómada digital. Guías de viaje, tips y experiencias.',
    url: 'https://nomadigma.com',
    siteName: 'Nomadigma',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: 'https://nomadigma.com/nomadigma_preview.png',
        width: 640,
        height: 598,
        alt: 'Nomadigma',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nomadigma - Blog de viajes y nómada digital',
    description: 'Explora el mundo como nómada digital. Guías de viaje, tips y experiencias.',
    images: ['https://nomadigma.com/nomadigma_preview.png'],
    creator: '@nomadigma',
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  
  return (
    <html className="h-full" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var lastTouchEnd = 0;
                document.addEventListener('touchend', function (event) {
                  var now = (new Date()).getTime();
                  if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                  }
                  lastTouchEnd = now;
                }, false);
                
                document.addEventListener('gesturestart', function (e) {
                  e.preventDefault();
                });
                
                document.addEventListener('gesturechange', function (e) {
                  e.preventDefault();
                });
                
                document.addEventListener('gestureend', function (e) {
                  e.preventDefault();
                });
                
                document.addEventListener('wheel', function(e) {
                  if (e.ctrlKey) {
                    e.preventDefault();
                  }
                }, { passive: false });
                
                document.addEventListener('keydown', function(e) {
                  if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
                    e.preventDefault();
                  }
                });
              })();
            `,
          }}
        />
        {GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={cn(
          'antialiased text-base text-foreground bg-background h-full',
          dmSans.variable,
          dmSans.className,
        )}
      >
        <I18nProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              storageKey="saas-theme"
              enableSystem
              disableTransitionOnChange
              enableColorScheme
            >
              <TooltipProvider>
                <NavigationProvider>
                  <StoreClientProvider>
                    <StoreClientWrapper>
                  <GoogleAnalytics />
                  {children}
                    </StoreClientWrapper>
                  </StoreClientProvider>
                </NavigationProvider>
              </TooltipProvider>
              <Toaster />
              <CookieBanner />
            </ThemeProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
