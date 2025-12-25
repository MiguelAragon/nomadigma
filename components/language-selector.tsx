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
            'cursor-pointer hover:bg-transparent gap-1.5',
            isLight
              ? 'text-white/80 hover:text-white'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Globe className="size-4" />
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
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

