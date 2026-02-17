'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import MainNavigation from './MainNavigation';

interface LayoutWrapperProps {
  children: ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname();
  
  // Pages where navigation should be hidden
  const hideNavigationPages = ['/workout', '/nutrition', '/chat', '/progress'];
  const shouldHideNavigation = hideNavigationPages.some(page => pathname.startsWith(page));

  return (
    <>
      <MainNavigation />
      <main className={shouldHideNavigation ? 'pt-0' : 'pt-16'}>
        {children}
      </main>
    </>
  );
};

export default LayoutWrapper;
