'use client';

import { useState, useEffect } from 'react';
import { Menu, Home, Globe, FileText, Compass, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerTitle, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
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
    { title: t('navigation.home'), path: `/${currentLocale}`, icon: Home },
    { title: t('navigation.destinations'), path: `/${currentLocale}/destinations`, icon: Globe },
    { title: t('navigation.blog'), path: `/${currentLocale}/blog`, icon: FileText },
    // { title: t('navigation.about_me'), path: `/${currentLocale}/about-me`, icon: Compass },
    { title: t('navigation.gallery'), path: `/${currentLocale}/gallery`, icon: Image },
  ];

  const { resolvedTheme, setTheme } = useTheme();
  const { isSignedIn, isLoaded } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mounted, setMounted] = useState(false);

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
    
    // Si el path es el home (solo el locale), debe coincidir exactamente
    if (path === `/${currentLocale}` || path === `/${currentLocale}/`) {
      return pathname === `/${currentLocale}` || pathname === `/${currentLocale}/`;
    }
    
    // Para otros paths, verificar si el pathname empieza con el path
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300', 
        'bg-white dark:bg-background'
      )}
    >
      <div className={cn("container mx-auto px-6 py-4 flex items-center justify-between")}  >
        {/* Left Side: Logo + Navigation */}
        <div className="flex items-center gap-8">
          <Link href={`/${currentLocale}`}>
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
                </nav>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* Right Side: Language + Theme + User */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <LanguageSelector />

          {/* Theme Toggle */}
          {mounted && (
            <Button 
              className="cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground" 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              {resolvedTheme === 'dark' ? <Sun className="size-4"/> : <Moon className="size-4"/>}
            </Button>
          )}

          {/* User Dropdown o Login Button */}
          {isLoaded && (
            <>
              {isSignedIn ? (
                <UserDropdown />
              ) : (
                <Button 
                  size="sm" 
                  variant="default"
                  className="gap-2"
                  asChild
                >
                  <Link href={`/${currentLocale}/login`}>
                    <LogIn className="size-4" />
                    {t('common.login')}
                  </Link>
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
