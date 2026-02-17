import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  // Process the content to handle markdown syntax with RTL support
  const processContent = (text: string) => {
    if (!text) return '';
    
    // Handle the custom <terms> tag first
    if (text.includes('<terms>')) {
      return text.replace(
        /<terms>(.*?)<\/terms>/g, 
        (_, text) => 
          `<a href="/terms" class="text-[#e3372e] font-medium hover:underline cursor-pointer">${text}</a>`
      );
    }
    
    // Add RTL support for Arabic text
    const isArabic = (text: string) => {
      return /[\u0600-\u06FF]/.test(text);
    };
    
    // Split the text into lines
    const lines = text.split('\n');
    let inList = false;
    let result = '';
    let isPreviousLineArabic = false;

    for (const line of lines) {
      const currentLineIsArabic = isArabic(line);
      const dir = currentLineIsArabic ? 'rtl' : 'ltr';
      
      // Handle headers (###)
      if (line.startsWith('### ')) {
        result += `<h3 class="text-lg font-semibold mt-4 mb-2" dir="${dir}">${line.substring(4)}</h3>`;
        isPreviousLineArabic = currentLineIsArabic;
        continue;
      }
      
      // Handle unordered lists (- or * )
      if (/^[-*]\s+/.test(line)) {
        if (!inList) {
          result += `<ul class="list-disc pl-6 my-2" dir="${dir}">`;
          inList = true;
        }
        result += `<li class="mb-1">${line.substring(2)}</li>`;
        isPreviousLineArabic = currentLineIsArabic;
        continue;
      } else if (inList) {
        result += '</ul>';
        inList = false;
      }
      
      // Handle empty lines (paragraph breaks)
      if (line.trim() === '') {
        result += inList ? '</li><li class="mb-1">' : '</p><p class="my-2">';
        continue;
      }
      
      // Handle regular text with inline formatting
      let processedLine = line;
      
      // Handle bold (**text**) - more robust pattern that handles spaces and special characters
      processedLine = processedLine.replace(/\*\*([^*]+?)\*\*/g, (match, p1) => {
        return p1 ? `<strong class="font-bold">${p1}</strong>` : match;
      });
      
      // Handle italic (*text* or _text_) - more robust pattern
      processedLine = processedLine.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em class="italic">$1</em>');
      processedLine = processedLine.replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '<em class="italic">$1</em>');
      
      // Clean up any remaining double asterisks that weren't part of a valid pattern
      processedLine = processedLine.replace(/\*\*/g, '');
      
      // Handle line breaks (two spaces at the end of a line)
      processedLine = processedLine.replace(/  $/, '<br />');
      
      // Add RTL/LTR direction based on text content
      if (!inList && !isPreviousLineArabic && currentLineIsArabic) {
        result += `<span dir="rtl">${processedLine}</span> `;
      } else {
        result += processedLine + ' ';
      }
      
      isPreviousLineArabic = currentLineIsArabic;
    }
    
    // Close any open list
    if (inList) {
      result += '</ul>';
    }
    
    // Wrap everything in a paragraph if there are no block elements
    if (!result.startsWith('<h3') && !result.includes('<ul>')) {
      result = `<p class="my-2">${result.trim()}</p>`;
    }
    
    return result;
    
    return result;
  };

  // Process the content
  const processedContent = processContent(content);

  return (
    <div 
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

export default MarkdownRenderer;
