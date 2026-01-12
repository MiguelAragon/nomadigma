'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, LogOut, UserCircle, Sun, Moon, Globe } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { SignOutButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/providers/i18n-provider';
import { I18N_LANGUAGES } from '@/i18n/config';
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface UserDropdownProps {
  isLight?: boolean;
}

// Componentes de banderas SVG
const FlagUS = () => (
  <svg className="w-4 h-4 rounded-sm" viewBox="0 0 640 480">
    <path fill="#bd3d44" d="M0 0h640v480H0z"/>
    <path stroke="#fff" strokeWidth="37" d="M0 55.3h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640"/>
    <path fill="#192f5d" d="M0 0h364.8v258.5H0z"/>
    <g fill="#fff">
      <g id="us-d">
        <g id="us-c">
          <g id="us-e">
            <g id="us-b">
              <path id="us-a" d="M247 90.5L239.5 102 238 90l-10 4.5 7-8-10-4.5 10-4 6.5-9 2 11.5 10-4.5-10 4.5z"/>
              <use href="#us-a" y="42"/>
              <use href="#us-a" y="84"/>
            </g>
            <use href="#us-a" y="126"/>
          </g>
          <use href="#us-b" x="247" y="210"/>
        </g>
        <use href="#us-c" x="-494"/>
      </g>
      <use href="#us-d" x="-247"/>
    </g>
  </svg>
);

const FlagMX = () => (
  <svg className="w-4 h-4 rounded-sm" viewBox="0 0 640 480">
    <path fill="#006847" d="M0 0h640v480H0z"/>
    <path fill="#fff" d="M213.3 0h213.4v480H213.3z"/>
    <path fill="#ce1126" d="M426.7 0H640v480H426.7z"/>
    <g transform="translate(320,240)">
      <ellipse cx="0" cy="0" rx="45" ry="55" fill="#a8754f" stroke="#000" strokeWidth="2"/>
      <path d="M-20,-30 Q0,-35 20,-30 L15,0 Q0,5 -15,0 Z" fill="#8b4513"/>
      <circle cx="-10" cy="-20" r="3" fill="#000"/>
      <circle cx="10" cy="-20" r="3" fill="#000"/>
      <path d="M-8,-10 Q0,-8 8,-10" stroke="#000" strokeWidth="2" fill="none"/>
      <path d="M-5,0 Q-15,15 -10,25 T0,30" stroke="#228b22" strokeWidth="4" fill="none"/>
      <path d="M-30,20 L-25,30 M-25,25 L-30,35" stroke="#228b22" strokeWidth="2" fill="none"/>
      <path d="M30,20 L25,30 M25,25 L30,35" stroke="#228b22" strokeWidth="2" fill="none"/>
    </g>
  </svg>
);

const FlagIcon = ({ code }: { code: string }) => {
  switch (code) {
    case 'en':
      return <FlagUS />;
    case 'es':
      return <FlagMX />;
    default:
      return <Globe className="size-4" />;
  }
};

export function UserDropdown({ isLight = false }: UserDropdownProps) {
  const { user: dbUser } = useAuth();
  const { locale } = useTranslation();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || locale || 'en';
  const { resolvedTheme, setTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
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
                className="text-sm text-mono hover:text-primary font-semibold"
              >
                {fullName}
              </Link>
              <Link
                href={`mailto:${dbUser.email}`}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                {dbUser.email}
              </Link>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem asChild>
          <Link href="/public-profile" className="flex items-center gap-2">
            <UserCircle className="size-4" />
            {locale === 'es' ? 'Perfil Público' : 'Public Profile'}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${currentLocale}/settings`} className="flex items-center gap-2">
            <Settings className="size-4" />
            {locale === 'es' ? 'Configuración' : 'Settings'}
          </Link>
        </DropdownMenuItem>

        {/* Language Submenu with Radio Group */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Globe className="size-4" />
            <span className="flex items-center justify-between gap-2 grow relative">
              {locale === 'es' ? 'Idioma' : 'Language'}
              <Badge
                variant="outline"
                className="absolute end-0 top-1/2 -translate-y-1/2 flex items-center gap-1"
              >
                {language.name}
                <span className="text-xs">{language.flag}</span>
              </Badge>
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuRadioGroup
              value={language.code}
              onValueChange={changeLanguage}
            >
              {I18N_LANGUAGES.map((lang) => (
                <DropdownMenuRadioItem
                  key={lang.code}
                  value={lang.code}
                  className="flex items-center gap-2"
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Footer */}
        {mounted && (
          <DropdownMenuItem 
            className="flex items-center gap-2"
            onSelect={(event) => event.preventDefault()}
          >
                <Moon className="size-4" />
            <div className="flex items-center gap-2 justify-between grow">
              {locale === 'es' ? 'Modo Oscuro' : 'Dark Mode'}
              <Switch
                size="sm"
                checked={resolvedTheme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </DropdownMenuItem>
        )}
        <div className="p-2 mt-1">
        <SignOutButton>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
          >
            {locale === 'es' ? 'Cerrar sesión' : 'Logout'}
            </Button>
        </SignOutButton>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

