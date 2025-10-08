'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/types';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setCurrentLanguage(languageCode);
    localStorage.setItem('i18nextLng', languageCode);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                {t('navigation.title')}
              </Link>
              
              {/* Navigation */}
              <nav className="hidden md:flex space-x-6">
                <Link href="/search" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {t('navigation.searchMembers')}
                </Link>
                <Link href="/import" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Import Data
                </Link>
                <Link href="/debug" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Debug Excel
                </Link>
                <Link href="/add" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {t('navigation.addMember')}
                </Link>
                <Link href="/status" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Status
                </Link>
              </nav>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">{t('common.language')}:</span>
              <select
                value={currentLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2026 Club Amistades Belgas de Levante
          </p>
        </div>
      </footer>
    </div>
  );
}
