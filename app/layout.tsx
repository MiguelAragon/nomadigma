import { ReactNode } from 'react';
import { DM_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { NavigationProvider } from '@/providers/navigation-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { I18nProvider } from '@/providers/i18n-provider';

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
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html className="h-full" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
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
              defaultTheme="system"
              storageKey="saas-theme"
              enableSystem
              disableTransitionOnChange
              enableColorScheme
            >
              <TooltipProvider>
                <NavigationProvider>
                  {children}
                </NavigationProvider>
              </TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
