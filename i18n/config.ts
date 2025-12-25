// Configuración de idiomas
export interface Language {
  code: string;
  name: string;
  shortName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

export const I18N_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    shortName: 'EN',
    direction: 'ltr',
    flag: '🇺🇸',
  },
  {
    code: 'es',
    name: 'Español',
    shortName: 'ES',
    direction: 'ltr',
    flag: '🇲🇽',
  }
];
