'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/providers/i18n-provider';
import { I18N_LANGUAGES } from '@/i18n/config';

interface LanguageSelectorProps {
  isLight?: boolean;
}

// Componentes de banderas SVG
const FlagUS = () => (
  <svg className="w-5 h-5 rounded-sm" viewBox="0 0 640 480">
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
  <svg className="w-5 h-5 rounded-sm" viewBox="0 0 640 480">
    <path fill="#006847" d="M0 0h640v480H0z"/>
    <path fill="#fff" d="M213.3 0h213.4v480H213.3z"/>
    <path fill="#ce1126" d="M426.7 0H640v480H426.7z"/>
    {/* Escudo simplificado */}
    <g transform="translate(320,240)">
      <ellipse cx="0" cy="0" rx="45" ry="55" fill="#a8754f" stroke="#000" strokeWidth="2"/>
      <path d="M-20,-30 Q0,-35 20,-30 L15,0 Q0,5 -15,0 Z" fill="#8b4513"/>
      <circle cx="-10" cy="-20" r="3" fill="#000"/>
      <circle cx="10" cy="-20" r="3" fill="#000"/>
      <path d="M-8,-10 Q0,-8 8,-10" stroke="#000" strokeWidth="2" fill="none"/>
      {/* Serpiente */}
      <path d="M-5,0 Q-15,15 -10,25 T0,30" stroke="#228b22" strokeWidth="4" fill="none"/>
      {/* Ramas */}
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
      return <Globe className="size-5" />;
  }
};

export function LanguageSelector({ isLight = false }: LanguageSelectorProps) {
  const { language, changeLanguage } = useLanguage();

  const handleLanguageChange = (value: string) => {
    changeLanguage(value);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={cn(
            'cursor-pointer hover:bg-transparent gap-1.5 px-0',
            isLight
              ? 'text-white/80 hover:text-white'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Globe className="size-5" />
          <span className="text-xs font-medium uppercase">{language.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuRadioGroup
          value={language.code}
          onValueChange={handleLanguageChange}
        >
          {I18N_LANGUAGES.map((lang) => (
            <DropdownMenuRadioItem
              key={lang.code}
              value={lang.code}
              className="flex items-center gap-2 cursor-pointer"
            >
              <FlagIcon code={lang.code} />
              <span>{lang.name}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

