'use client';

import { ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { SignOutButton } from '@clerk/nextjs';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';

interface UserDropdownMenuProps {
  trigger: ReactNode;
}

export function UserDropdownMenu({ trigger }: UserDropdownMenuProps) {
  const { user: dbUser } = useAuth();
  const { locale } = useTranslation();

  // Si no está autenticado, mostrar solo el trigger sin dropdown
  if (!dbUser) {
    return <>{trigger}</>;
  }

  // Obtener nombre completo del usuario
  const fullName = dbUser.firstName && dbUser.lastName 
    ? `${dbUser.firstName} ${dbUser.lastName}` 
    : dbUser.firstName || 'Usuario';

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {trigger}
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
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <Link
                href="/settings"
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
          <Link href="/store/my-orders" className="flex items-center gap-2">
            <ShoppingBag className="size-4" />
            {locale === 'es' ? 'Mis Pedidos' : 'My Orders'}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="size-4" />
            {locale === 'es' ? 'Configuración' : 'Settings'}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Footer */}
        <div className="p-2">
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
