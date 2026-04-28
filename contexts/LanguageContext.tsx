'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import azTranslations from '@/public/locales/az.json';
import ruTranslations from '@/public/locales/ru.json';

export type Language = 'az' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

// All translations bundled at build time — zero async loading needed
const allTranslations: Record<Language, Record<string, any>> = {
  az: azTranslations,
  ru: ruTranslations,
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'az',
  setLanguage: () => {},
  t: (key) => key,
});

// Recursively get nested value by dot-notation key
function getNestedValue(obj: Record<string, any>, key: string): string {
  const parts = key.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return key;
    current = current[part];
  }
  return typeof current === 'string' ? current : key;
}

// Synchronously determine initial language from localStorage
function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'az';
  try {
    const stored = localStorage.getItem('elanaz_language') as Language | null;
    return stored === 'az' || stored === 'ru' ? stored : 'az';
  } catch {
    return 'az';
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Initialize with AZ so SSR and first render match
  const [language, setLanguageState] = useState<Language>('az');

  // On mount: hydrate from localStorage (client-side only)
  useEffect(() => {
    const lang = getInitialLanguage();
    if (lang !== language) {
      setLanguageState(lang);
    }
    document.documentElement.lang = lang;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('elanaz_language', lang);
    } catch {}
    document.documentElement.lang = lang;
  }, []);

  // t() reads directly from bundled JSON — instant, no async, no flash
  const t = useCallback(
    (key: string, variables?: Record<string, string | number>): string => {
      let value = getNestedValue(allTranslations[language], key);
      if (variables) {
        Object.entries(variables).forEach(([vKey, vValue]) => {
          value = value.replace(new RegExp(`{{${vKey}}}`, 'g'), String(vValue));
        });
      }
      return value;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  return useContext(LanguageContext);
}
