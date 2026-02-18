'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import LanguageSwitcher from './LanguageSwitcher';
import ClerkErrorBoundary from './ClerkErrorBoundary';
import { useLanguage } from '@/contexts/LanguageContext';

const MainNavigation: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const pathname = usePathname();
  
  // Pages where navigation should be hidden
  const hideNavigationPages = ['/workout', '/chat'];
  const shouldHideNavigation = hideNavigationPages.some(page => pathname.startsWith(page));

  // Don't render navigation on specified pages
  if (shouldHideNavigation) {
    return null;
  }

  return (
    <header className={`fixed top-0 inset-inline-start-0 inset-inline-end-0 z-50 bg-background/80 backdrop-blur-md shadow-sm ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
          <img 
            src="/images/top-coach-logo.svg" 
            alt="TopCoach Logo" 
            className="h-10 w-10" 
          />
          <span className="text-xl font-bold text-primary">TopCoach</span>
        </Link>

        <nav className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
                                        <Link href="/community" className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">
            {t('nav.community')}
          </Link>
        </nav>

        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          {/* Language Switcher */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Auth Buttons */}
          <ClerkErrorBoundary>
            <SignedIn>
              <Button variant="ghost" size="sm" className="hidden md:block">
                {t('nav.profile')}
              </Button>
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="hidden md:block">
                  {t('nav.signIn')}
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">
                  {t('nav.getStarted')}
                </Button>
              </Link>
            </SignedOut>
          </ClerkErrorBoundary>
        </div>
      </div>
    </header>
  );
};

export default MainNavigation;
