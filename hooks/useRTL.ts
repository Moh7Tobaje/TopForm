import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const useRTL = () => {
  const { isRTL } = useLanguage();

  useEffect(() => {
    // Set document direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    
    // Set document language
    document.documentElement.lang = isRTL ? 'ar' : 'en';
    
    // Add/remove RTL class to body
    if (isRTL) {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
    
    // Cleanup
    return () => {
      document.body.classList.remove('rtl', 'ltr');
    };
  }, [isRTL]);

  return { isRTL };
};

export default useRTL;
