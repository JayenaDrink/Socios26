'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const { ready } = useTranslation();

  useEffect(() => {
    // Set initial language from localStorage or default to Dutch
    const savedLanguage = localStorage.getItem('i18nextLng') || 'nl';
    if (savedLanguage !== 'nl' && savedLanguage !== 'fr' && savedLanguage !== 'es') {
      localStorage.setItem('i18nextLng', 'nl');
    }
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
