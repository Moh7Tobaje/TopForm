'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { formatArabicNumber, formatMixedText, containsArabic } from '@/lib/rtl-utils';

type Language = 'en' | 'ar';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
  formatNumber: (num: number | string, options?: { useArabicNumerals?: boolean; suffix?: string }) => string;
  formatText: (text: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    'nav.getStarted': 'Get Started',
    'nav.language': 'Language',
    'nav.english': 'English',
    'nav.arabic': 'العربية',
    'nav.community': 'Community',
    'nav.profile': 'Profile',
    'nav.signIn': 'Sign In',
    'nav.signUp': 'Sign Up',
    'nav.startFree': 'Start Free',
    'nav.logOut': 'Log out',
    
    // Hero Section
    'hero.badge': 'AI Personal Trainer & Smart Fitness Coach',
    'hero.title': 'Transform Your Body with',
    'hero.subtitle': 'AI Personal Trainer',
    'hero.description': 'Get personalized AI workout plans and a 24/7 online AI personal trainer that adapts to your fitness goals and daily routine',
    'hero.cta': 'Try AI Personal Trainer Free',
    'hero.aiCoach': 'Your AI Coach',
    'hero.onlineNow': 'Online now',
    'hero.calories': 'Calories',
    'hero.requiredConsumed': 'required / consumed',
    'hero.streak': 'Streak',
    
    // Testimonials
    'testimonials.title': 'Trusted by <span class="text-primary">100+</span> Fitness Enthusiasts',
    'testimonials.sarah.name': 'Sarah Chen',
    'testimonials.sarah.role': 'Fitness Enthusiast',
    'testimonials.sarah.content': 'Top Coach\'s AI completely transformed my workout routine. I\'ve never been more motivated!',
    'testimonials.mike.name': 'Mike Rodriguez',
    'testimonials.mike.role': 'Busy Professional',
    'testimonials.mike.content': 'The personalized meal plans saved me hours of planning. Results speak for themselves.',
    'testimonials.emma.name': 'Emma Thompson',
    'testimonials.emma.role': 'Marathon Runner',
    'testimonials.emma.content': 'The AI coach adapts to my training schedule perfectly. It\'s like having a personal trainer 24/7.',
    
    // Coming Soon
    'comingSoon.title': 'Coming Soon',
    'comingSoon.subtitle': 'Tap anywhere to dismiss',
    
    // Quick Actions
    'actions.generateWorkout': 'Generate Workout',
    'actions.adjustIntensity': 'Adjust Intensity',
    'actions.mealSuggestions': 'Meal Suggestions',
    
    // AI Messages
    'ai.welcome': 'Hey there! I\'m your AI fitness coach. I\'m here to help you crush your fitness goals! What would you like to work on today?',
    'ai.generateResponse': 'Great question! Based on your current fitness level, I\'d recommend starting with a balanced approach. Would you like me to create a personalized workout plan?',
    'ai.strengthResponse': 'Perfect timing! I\'ve analyzed your recent workouts and I think we should focus on strength training today. Ready to get started?',
    'ai.motivationResponse': 'That\'s awesome motivation! I love your dedication. Let me suggest some exercises that align with your goals.',
    'ai.mealResponse': 'Excellent! Based on your dietary preferences and fitness goals, I\'ve prepared some nutritious meal options that will fuel your workouts perfectly.',
    'ai.defaultResponse': 'I\'m here to help! What specific aspect of your fitness journey would you like to focus on?',
    
    
    
    // Chat Page
    'chat.title': 'AI Fitness Coach',
    'chat.online': 'Online • Ready to help',
    'chat.welcome': 'Welcome',
    'chat.signInRequired': 'Please sign in to access the AI Coach',
    'chat.placeholder': 'Ask me anything about fitness...',
    'chat.typing': 'AI is typing...',
    'chat.error': 'Sorry, I\'m having trouble connecting right now. Please try again later.',
    'chat.welcomeMessage': 'Hey there! 👋 I\'m your AI-powered fitness coach, here to guide you step by step toward crushing your fitness goals 💪. \nBefore we begin, please make sure you\'ve carefully read and understood our <terms>Terms of Use & Privacy Policy</terms> they\'re important for your safety and clarity. \nNow, tell me: What would you like to focus on today?',
    'chat.secureBadge': 'AI-powered fitness coaching • Secure & Private',
    'chat.exercisesModal': 'Exercises Mentioned',
    'chat.noExercises': 'No exercises detected in the last message.',
    'chat.targets': 'Targets',
    'chat.showExercises': 'Exercises',
    
    // Quick Actions
    'actions.generateWorkoutPlan': 'Generate a workout plan',
    'actions.mealSuggestionsQuick': 'Meal suggestions',
    'actions.setGoals': 'Set fitness goals',
    
     // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!', 
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Are you sure?',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.noResults': 'No results found',
    
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.services': 'خدماتنا',
    'nav.contact': 'اتصل بنا',
    'nav.getStarted': 'ابدأ الآن',
    'nav.language': 'اللغة',
    'nav.english': 'English',
    'nav.arabic': 'العربية',
    'nav.community': 'المجتمع',
    'nav.profile': 'الملف الشخصي',
    'nav.signIn': 'تسجيل الدخول',
    'nav.signUp': 'إنشاء حساب',
    'nav.startFree': 'ابدأ مجاناً',
    'nav.logOut': 'تسجيل الخروج',
    
    // Hero Section
    'hero.badge': 'مدرب شخصي بالذكاء الاصطناعي ومستشار لياقة ذكي',
    'hero.title': 'حول جسدك مع',
    'hero.subtitle': 'مدرب شخصي بالذكاء الاصطناعي',
    'hero.description': 'احصل على خطط تمارين مخصصة بالذكاء الاصطناعي، وتتبع تغذية ذكي، ومدرب شخصي عبر الإنترنت يعمل 24/7 يتكيف مع أهدافك وروتينك اليومي',
    'hero.cta': 'جرب المدرب الشخصي بالذكاء الاصطناعي مجاناً',
    'hero.aiCoach': 'مدربك بالذكاء الاصطناعي',
    'hero.onlineNow': 'متصل الآن',
    'hero.calories': 'السعرات الحرارية',
    'hero.requiredConsumed': 'مطلوب / مستهلك',
    'hero.streak': 'السلسلة المتتالية',
    
    // Testimonials
    'testimonials.title': 'موثوق من قبل <span class="text-primary">100+</span> عشاق اللياقة',
    'testimonials.sarah.name': 'سارة تشن',
    'testimonials.sarah.role': 'عشاق اللياقة',
    'testimonials.sarah.content': 'الذكاء الاصطناعي في Top Coach حول روتين التمارين بالكامل. لم أكن متحفزة أكثر من أي وقت مضى!',
    'testimonials.mike.name': 'مايك رودريغيز',
    'testimonials.mike.role': 'محترف مشغول',
    'testimonials.mike.content': 'خطط الوجبات المخصصة وفرت علي ساعات من التخطيط. النتائج تتحدث بنفسها.',
    'testimonials.emma.name': 'إيما تومسون',
    'testimonials.emma.role': 'عداءة ماراثون',
    'testimonials.emma.content': 'مدرب الذكاء الاصطناعي يتكيف مع جدول التدريب الخاص بي بشكل مثالي. الأمر أشبه بوجود مدرب شخصي 24/7.',
    
    // Coming Soon
    'comingSoon.title': 'قريباً',
    'comingSoon.subtitle': 'اضغط في أي مكان للإغلاق',
    
    // Quick Actions
    'actions.generateWorkout': 'توليد تمرين',
    'actions.adjustIntensity': 'تعديل الشدة',
    'actions.mealSuggestions': 'اقتراحات وجبات',
    'actions.trackProgress': 'تتبع التقدم',
    
    // AI Messages
    'ai.welcome': 'مرحباً! أنا مدرب اللياقة البدنية بالذكاء الاصطناعي الخاص بك. أنا هنا لمساعدتك في تحقيق أهداف اللياقة الخاصة بك! ماذا تود العمل عليه اليوم؟',
    'ai.generateResponse': 'سؤال رائع! بناءً على مستوى لياقتك الحالي، أوصي بالبدء بنهج متوازن. هل تريد مني إنشاء خطة تمرين مخصصة؟',
    'ai.strengthResponse': 'التوقيت المثالي! لقد حللت تمارينك الأخيرة وأعتقد أننا يجب أن نركز على تدريب القوة اليوم. هل أنت مستعد للبدء؟',
    'ai.motivationResponse': 'هذه دافع رائع! أحب تفانيك. دعني أقترح بعض التمارين التي تتوافق مع أهدافك.',
    'ai.mealResponse': 'ممتاز! بناءً على تفضيلاتك الغذائية وأهداف اللياقة، قمت بإعداد بعض خيارات الوجبات المغذية التي ستشعل تمارينك بشكل مثالي.',
    'ai.trackResponse': 'دعني أجلب بيانات تقدمك! لقد كنت تفعل بشكل رائع - معدل إتمام التمارين 85% هذا الأسبوع وأنت متقدم على أهداف حرق السعرات الحرارية!',
    'ai.defaultResponse': 'أنا هنا للمساعدة! ما الجانب المحدد من رحلة اللياقة الخاص بك الذي تود التركيز عليه؟',
    
    
    
    // Chat Page
    'chat.title': 'مدرب اللياقة بالذكاء الاصطناعي',
    'chat.online': 'متصل • جاهز للمساعدة',
    'chat.welcome': 'أهلاً بك',
    'chat.signInRequired': 'يرجى تسجيل الدخول للوصول إلى مدرب الذكاء الاصطناعي',
    'chat.placeholder': 'اسألني أي شيء عن اللياقة...',
    'chat.typing': 'الذكاء الاصطناعي يكتب...',
    'chat.error': 'عذراً، أواجه مشكلة في الاتصال الآن. يرجى المحاولة مرة أخرى لاحقاً.',
    'chat.welcomeMessage': 'مرحباً! 👋 أنا مدرب اللياقة البدنية بالذكاء الاصطناعي، هنا لأرشدك خطوة بخطوة نحو تحقيق أهداف اللياقة 💪. \nقبل أن نبدأ، يرجى التأكد من أنك قرأت وفهمت بعناية <terms>شروط الاستخدام وسياسة الخصوصية</terms> فهي مهمة لسلامتك ووضوحك. \nالآن، أخبرني: ماذا تود التركيز عليه اليوم؟',
    'chat.secureBadge': 'تدريب لياقة بالذكاء الاصطناعي • آمن وخاص',
    'chat.exercisesModal': 'التمارين المذكورة',
    'chat.noExercises': 'لم يتم اكتشاف تمارين في الرسالة الأخيرة.',
    'chat.targets': 'يستهدف',
    'chat.showExercises': 'تمارين',
    
    // Quick Actions
    'actions.generateWorkoutPlan': 'إنشاء خطة تمرين',
    'actions.mealSuggestionsQuick': 'اقتراحات وجبات',
    'actions.setGoals': 'تحديد أهداف اللياقة',
    
     // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.success': 'تم بنجاح!',
    'common.submit': 'إرسال',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.confirm': 'هل أنت متأكد؟',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.search': 'بحث',
    'common.noResults': 'لا توجد نتائج',
    
  },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [language, setLanguageState] = useState<Language>('en');
  const [isRTL, setIsRTL] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize language from localStorage or default to 'en'
  useEffect(() => {
    setIsMounted(true);
    const savedLanguage = localStorage.getItem('language') as Language | null;
    const defaultLanguage = savedLanguage || 'en';
    setLanguageState(defaultLanguage);
  }, []);

  // Update RTL and document direction when language changes
  useEffect(() => {
    if (!isMounted) return;
    
    console.log('RTL effect triggered, language:', language);
    setIsRTL(language === 'ar');
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    console.log('Document direction set to:', document.documentElement.dir);
  }, [language, isMounted]);

  const setLanguage = (lang: Language) => {
    console.log('setLanguage called with:', lang);
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Update URL with language parameter
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('lang', lang);
    window.history.pushState({}, '', currentUrl.toString());
    
    console.log('Language set to:', lang);
  };

  // Translation function with RTL formatting
  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key] || key;
    
    // Replace placeholders with actual values
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        const formattedValue = typeof paramValue === 'number' && language === 'ar' 
          ? formatArabicNumber(paramValue)
          : String(paramValue);
        translation = translation.replace(`{{${paramKey}}}`, formattedValue);
      });
    }
    
    // Apply mixed text formatting for Arabic
    return language === 'ar' ? formatMixedText(translation, true) : translation;
  };

  // Number formatting function
  const formatNumber = (num: number | string, options?: { useArabicNumerals?: boolean; suffix?: string }) => {
    return language === 'ar' 
      ? formatArabicNumber(num, { useArabicNumerals: true, ...options })
      : options?.suffix 
        ? `${num}${options.suffix}`
        : String(num);
  };

  // Text formatting function
  const formatText = (text: string) => {
    return language === 'ar' ? formatMixedText(text, true) : text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL, formatNumber, formatText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
