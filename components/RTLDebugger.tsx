'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatArabicNumber, containsArabic, getTextDirection } from '@/lib/rtl-utils';

const RTLDebugger: React.FC = () => {
  const { language, isRTL, formatNumber } = useLanguage();

  const testTexts = [
    { key: 'english', text: 'Hello World', expected: 'ltr' },
    { key: 'arabic', text: 'مرحبا بالعالم', expected: 'rtl' },
    { key: 'mixed', text: 'Hello مرحبا 123', expected: 'rtl' },
  ];

  const testNumbers = [0, 1, 15, 100, 1234];

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm">
      <div className="font-bold mb-2">RTL Debugger (Dev Only)</div>
      
      <div className="mb-2">
        <div>Language: {language}</div>
        <div>isRTL: {isRTL ? 'true' : 'false'}</div>
        <div>Document dir: {document.documentElement.dir}</div>
      </div>

      <div className="mb-2">
        <div className="font-semibold mb-1">Text Direction Tests:</div>
        {testTexts.map((test) => (
          <div key={test.key} className="mb-1">
            <div className="text-gray-300">{test.text}</div>
            <div className="text-xs">
              Expected: {test.expected}, 
              Actual: {getTextDirection(test.text)},
              {containsArabic(test.text) ? ' (contains Arabic)' : ' (no Arabic)'}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-2">
        <div className="font-semibold mb-1">Number Formatting:</div>
        {testNumbers.map((num) => (
          <div key={num} className="mb-1">
            <div>
              {num} → {formatNumber(num)}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="font-semibold mb-1">Font Test:</div>
        <div className="font-arabic" style={{ fontFamily: 'var(--font-arabic-primary)' }}>
          العربية: Cairo/Tajawal Font Test
        </div>
      </div>
    </div>
  );
};

export default RTLDebugger;
