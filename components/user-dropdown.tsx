'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, LogOut, UserCircle, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { SignOutButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface UserDropdownProps {
  isLight?: boolean;
}

export function UserDropdown({ isLight = false }: UserDropdownProps) {
  const { user: dbUser } = useAuth();
  const { locale } = useTranslation();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || locale || 'en';
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Si no está autenticado, no mostrar nada
  if (!dbUser) {
    return null;
  }

  // Obtener nombre completo del usuario
  const fullName = dbUser.firstName && dbUser.lastName 
    ? `${dbUser.firstName} ${dbUser.lastName}` 
    : dbUser.firstName || 'Usuario';
  
  const initials = dbUser.firstName 
    ? dbUser.firstName.charAt(0).toUpperCase() 
    : dbUser.email.charAt(0).toUpperCase();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            'cursor-pointer hover:bg-transparent relative',
            isLight
              ? 'text-white/80 hover:text-white'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {dbUser.imageUrl ? (
            <img
              src={dbUser.imageUrl}
              alt={fullName}
              className="size-8 rounded-full border-2 border-green-500 object-cover"
            />
          ) : (
            <div className="size-8 rounded-full bg-slate-600 dark:bg-slate-500 text-white flex items-center justify-center text-sm font-semibold border-2 border-green-500">
              {initials}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            {dbUser.imageUrl ? (
              <img
                src={dbUser.imageUrl}
                alt={fullName}
                className="size-9 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="size-9 rounded-full bg-slate-600 dark:bg-slate-500 text-white flex items-center justify-center text-sm font-semibold border border-border">
                {initials}
              </div>
            )}
            <div className="flex flex-col">
              <Link
                href="/account"
                className="text-sm font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {fullName}
              </Link>
              <Link
                href={`mailto:${dbUser.email}`}
                className="text-xs text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {dbUser.email}
              </Link>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem asChild>
          <Link href="/public-profile" className="flex items-center gap-2 cursor-pointer">
            <UserCircle className="size-4" />
            {locale === 'es' ? 'Perfil Público' : 'Public Profile'}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${currentLocale}/settings`} className="flex items-center gap-2 cursor-pointer">
            <Settings className="size-4" />
            {locale === 'es' ? 'Configuración' : 'Settings'}
          </Link>
        </DropdownMenuItem>

        {/* Theme Toggle - Only visible on mobile */}
        {mounted && (
          <DropdownMenuItem 
            className="flex md:hidden items-center gap-2 cursor-pointer"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {resolvedTheme === 'dark' ? (
              <>
                <Sun className="size-4" />
                {locale === 'es' ? 'Tema Claro' : 'Light Theme'}
              </>
            ) : (
              <>
                <Moon className="size-4" />
                {locale === 'es' ? 'Tema Oscuro' : 'Dark Theme'}
              </>
            )}
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <SignOutButton>
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
          >
            <LogOut className="size-4" />
            {locale === 'es' ? 'Cerrar sesión' : 'Logout'}
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

