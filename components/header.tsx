'use client';

import { useState, useEffect } from 'react';
import { Menu, Home, Globe, FileText, Compass, Image, Shield, Users, ImageIcon, ChevronDown, ShoppingCart, ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerTitle, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Logo from '@/components/logo';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { LanguageSelector } from '@/components/language-selector';
import { UserDropdown } from '@/components/user-dropdown';
import { useAuth } from '@/hooks/use-auth';
import { LogIn } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { usePathname } from 'next/navigation';
import { useStoreClient } from '@/app/(public)/store/components/context';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const { t, locale, i18n: i18nInstance } = useTranslation();
  const pathname = usePathname();
  
  // Get current locale from pathname or use locale from context
  const currentLocale = pathname?.split('/')[1] || locale || 'en';
  
  // Debug: verificar estado de i18n
  useEffect(() => {
    if (typeof window !== 'undefined' && i18nInstance) {
      console.log('Header i18n state:', {
        language: i18nInstance.language,
        locale,
        currentLocale,
        isInitialized: i18nInstance.isInitialized,
        hasResource: i18nInstance.hasResourceBundle(i18nInstance.language || 'en', 'translation'),
        loginTranslation: t('common.login'),
        allResources: i18nInstance.store?.data
      });
    }
  }, [i18nInstance, locale, currentLocale, t]);
  
  const navItems = [
    { title: t('navigation.home'), path: `/`, icon: Home },
    { title: t('navigation.destinations'), path: `/destinations`, icon: Globe },
    { title: t('navigation.blog'), path: `/blog`, icon: FileText },
    // { title: t('navigation.about_me'), path: `/about-me`, icon: Compass },
    { title: t('navigation.gallery'), path: `/gallery`, icon: Image },
  ];

  const { resolvedTheme, setTheme } = useTheme();
  const { user, isLoading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mounted, setMounted] = useState(false);
  
  // Get cart context (may be undefined if not in store context, but we handle it)
  let cartContext;
  try {
    cartContext = useStoreClient();
  } catch {
    // Context not available, that's okay
    cartContext = null;
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      if (window.scrollY < 50) {
        setActiveSection('home');
        return;
      }

      const sections = ['destinations', 'blog', 'about-me', 'gallery'];
      const scrollPosition = window.scrollY + 200;
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            if (activeSection !== section) setActiveSection(section);
            return;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);  
  
  const handleNavClick = (path: string) => {
    setIsOpen(false);
    // For now just use regular navigation
    window.location.href = path;
  };

  const isActiveItem = (path: string) => {
    if (typeof window === 'undefined' || !pathname) return false;
    
    // Normalizar pathname removiendo locale si existe
    const normalizedPathname = pathname.replace(/^\/(en|es)/, '') || '/';
    
    // Si el path es el home, debe coincidir exactamente
    if (path === `/` || path === ``) {
      return normalizedPathname === `/` || normalizedPathname === ``;
    }
    
    // Para otros paths, verificar si el pathname normalizado empieza con el path
    return normalizedPathname === path || normalizedPathname.startsWith(path + '/');
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40', 
        'bg-white dark:bg-background'
      )}
    >
      <div className={cn("container mx-auto px-6 py-4 flex items-center justify-between")}  >
        {/* Left Side: Logo + Navigation */}
        <div className="flex items-center gap-4 md:gap-8 min-w-0">
          <Link href={`/`} className="shrink-0">
            <Logo />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    'cursor-pointer transition-colors duration-150 relative group',
                    isActiveItem(item.path)
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-accent-foreground hover:text-indigo-600 dark:hover:text-indigo-400'
                  )}
                >
                  {item.title}
                  <span 
                    className={`absolute -bottom-1 left-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 transition-all duration-150 ${
                      isActiveItem(item.path) ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </Link>
              </div>
            ))}
            
            {/* Admin Dropdown - Solo visible para ADMIN */}
            {user && user.role === 'ADMIN' && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'cursor-pointer transition-colors duration-150 relative group px-0 hover:bg-transparent',
                      pathname?.startsWith('/admin')
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-accent-foreground hover:text-indigo-600 dark:hover:text-indigo-400'
                    )}
                  >
                    Admin
                    <ChevronDown className="size-3 ml-1" />
                    <span 
                      className={`absolute -bottom-1 left-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 transition-all duration-150 ${
                        pathname?.startsWith('/admin') ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    ></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users" className="flex items-center gap-2 cursor-pointer">
                      <Users className="size-4" />
                      {locale === 'es' ? 'Usuarios' : 'Users'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/blog" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="size-4" />
                      {locale === 'es' ? 'Blog' : 'Blog'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/gallery" className="flex items-center gap-2 cursor-pointer">
                      <ImageIcon className="size-4" />
                      {locale === 'es' ? 'Galería' : 'Gallery'}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Mobile Navigation - Only visible on mobile */}
          <div className="md:hidden">
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DrawerTrigger asChild>
                <Button className="cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground" variant="ghost" size="icon">
                  <Menu className="size-4"/>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="px-6 pb-8">
                <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
                <nav className="flex flex-col space-y-4 mt-6">
                  {navItems.map((item) => (
                    <Button 
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      variant="ghost"
                      className={cn(
                        'w-full justify-start hover:text-indigo-600 dark:hover:text-indigo-400',
                        isActiveItem(item.path) && 'text-indigo-600 dark:text-indigo-400 font-medium'
                      )}
                    >
                      {item.title}
                    </Button>
                  ))}
                  
                  {/* Admin Options - Solo visible para ADMIN en mobile */}
                  {user && user.role === 'ADMIN' && (
                    <>
                      <div className="border-t border-border/50 my-2"></div>
                      <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <Shield className="size-3" />
                        Admin
                      </div>
                      <Button 
                        onClick={() => handleNavClick('/admin/users')}
                        variant="ghost"
                        className={cn(
                          'w-full justify-start hover:text-indigo-600 dark:hover:text-indigo-400',
                          pathname === '/admin/users' && 'text-indigo-600 dark:text-indigo-400 font-medium'
                        )}
                      >
                        <Users className="size-4 mr-2" />
                        {locale === 'es' ? 'Usuarios' : 'Users'}
                      </Button>
                      <Button 
                        onClick={() => handleNavClick('/admin/blog')}
                        variant="ghost"
                        className={cn(
                          'w-full justify-start hover:text-indigo-600 dark:hover:text-indigo-400',
                          pathname === '/admin/blog' && 'text-indigo-600 dark:text-indigo-400 font-medium'
                        )}
                      >
                        <FileText className="size-4 mr-2" />
                        {locale === 'es' ? 'Blog' : 'Blog'}
                      </Button>
                      <Button 
                        onClick={() => handleNavClick('/admin/gallery')}
                        variant="ghost"
                        className={cn(
                          'w-full justify-start hover:text-indigo-600 dark:hover:text-indigo-400',
                          pathname === '/admin/gallery' && 'text-indigo-600 dark:text-indigo-400 font-medium'
                        )}
                      >
                        <ImageIcon className="size-4 mr-2" />
                        {locale === 'es' ? 'Galería' : 'Gallery'}
                      </Button>
                    </>
                  )}
                </nav>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* Right Side: Different layout for store vs non-store */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Selector - Only show when user is NOT logged in */}
          {!user && <LanguageSelector />}
          {pathname?.startsWith('/store') ? (
            /* Store Layout: User -> Wishlist -> Cart (with badge and total) */
            <>
              {/* User Dropdown o Login Button */}
              {user ? (
                <UserDropdown />
              ) : (
                <Button 
                  size="sm" 
                  variant="default"
                  className="gap-2"
                  asChild={!isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Cargando...</span>
                    </div>
                  ) : (
                    <Link href={`/login`}>
                      <LogIn className="size-4" />
                      {t('common.login')}
                    </Link>
                  )}
                </Button>
              )}

              {/* Wishlist */}
              {cartContext && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground"
                  onClick={() => cartContext.showWishlistSheet()}
                >
                  <Heart className="size-5" />
                </Button>
              )}

              {/* Cart with badge and total */}
              {cartContext && (
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-1 cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground",
                    cartContext.cartItemsCount > 0 ? "p-0 h-auto" : "size-icon"
                  )}
                  onClick={() => cartContext.showCartSheet()}
                >
                  <div className="relative">
                    <ShoppingCart className="size-5" />
                    {cartContext.cartItemsCount > 0 && (
                      <Badge
                        className="absolute -top-2 -right-2"
                        variant="success"
                        size="xs"
                        shape="circle"
                      >
                        {cartContext.cartItemsCount}
                      </Badge>
                    )}
                  </div>
                  {cartContext.cartItemsCount > 0 && (
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-secondary-foreground">
                        Total
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        ${cartContext.cartTotal.toFixed(2)}
                      </span>
                    </div>
                  )}
                </Button>
              )}
            </>
          ) : (
            /* Non-Store Layout: Store Button -> Language -> Theme -> User */
            <>
              {/* Store Button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-transparent gap-2"
                asChild
              >
                <Link href="/store">
                  <ShoppingCart className="size-5" />
                  {t('navigation.store')}
                </Link>
              </Button>

              {/* Theme Toggle - Only show if user NOT logged in */}
              {mounted && !user && (
            <Button 
              className="cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground hidden md:flex" 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
                  {resolvedTheme === 'dark' ? <Sun className="size-5"/> : <Moon className="size-5"/>}
            </Button>
          )}

          {/* User Dropdown o Login Button */}
          {user ? (
                <UserDropdown />
              ) : (
                <Button 
                  size="sm" 
                  variant="default"
                  className="gap-2"
              asChild={!isLoading}
              disabled={isLoading}
                >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Cargando...</span>
                </div>
              ) : (
                  <Link href={`/login`}>
                    <LogIn className="size-4" />
                    {t('common.login')}
                  </Link>
              )}
            </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
