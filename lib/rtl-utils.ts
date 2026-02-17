/**
 * RTL Utilities for Arabic support
 */

// Arabic-Indic numerals mapping
const ARABIC_INDIC_NUMERALS = {
  '0': '٠',
  '1': '١',
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩'
};

/**
 * Convert Western numerals to Arabic-Indic numerals
 */
export const toArabicNumerals = (num: string | number): string => {
  const str = String(num);
  return str.replace(/[0-9]/g, (digit) => ARABIC_INDIC_NUMERALS[digit as keyof typeof ARABIC_INDIC_NUMERALS] || digit);
};

/**
 * Format number for Arabic context
 * Uses Arabic-Indic numerals for better readability
 */
export const formatArabicNumber = (num: number | string, options?: {
  useArabicNumerals?: boolean;
  suffix?: string;
}): string => {
  const { useArabicNumerals = true, suffix = '' } = options || {};
  
  const formattedNum = useArabicNumerals ? toArabicNumerals(num) : String(num);
  return suffix ? `${formattedNum}${suffix}` : formattedNum;
};

/**
 * Format text with mixed Arabic and numbers properly
 * Ensures proper spacing and direction
 */
export const formatMixedText = (text: string, isRTL: boolean): string => {
  if (!isRTL) return text;
  
  // Add proper spacing between Arabic text and numbers/units
  return text.replace(/([\u0600-\u06FF]+)(\d+[a-zA-Z%]*)/g, '$1 $2');
};

/**
 * Check if text contains Arabic characters
 */
export const containsArabic = (text: string): boolean => {
  return /[\u0600-\u06FF]/.test(text);
};

/**
 * Get text direction based on content
 */
export const getTextDirection = (text: string): 'rtl' | 'ltr' => {
  return containsArabic(text) ? 'rtl' : 'ltr';
};

/**
 * Logical margin/padding utilities
 */
export const getLogicalMargin = (isRTL: boolean, left: number, right: number) => {
  return {
    marginInlineStart: isRTL ? right : left,
    marginInlineEnd: isRTL ? left : right,
  };
};

export const getLogicalPadding = (isRTL: boolean, left: number, right: number) => {
  return {
    paddingInlineStart: isRTL ? right : left,
    paddingInlineEnd: isRTL ? left : right,
  };
};

/**
 * Common Arabic fitness terms with proper formatting
 */
export const ARABIC_UNITS = {
  kg: 'كجم',
  g: 'جم',
  reps: 'تكرار',
  sets: 'مجموعات',
  calories: 'سعرات',
  protein: 'بروتين',
  carbs: 'كربوهيدرات',
  fat: 'دهون',
  minutes: 'دقيقة',
  hours: 'ساعة',
  days: 'أيام',
  weeks: 'أسابيع',
  months: 'أشهر',
};

/**
 * Format fitness values with Arabic units
 */
export const formatFitnessValue = (
  value: number | string,
  unit: keyof typeof ARABIC_UNITS,
  isRTL: boolean,
  useArabicNumerals: boolean = true
): string => {
  const arabicUnit = isRTL ? ARABIC_UNITS[unit] : unit;
  const formattedValue = useArabicNumerals ? toArabicNumerals(value) : String(value);
  
  return isRTL ? `${formattedValue} ${arabicUnit}` : `${formattedValue}${arabicUnit}`;
};
