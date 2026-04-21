'use client';

import { HelpItem } from '@/types/help';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HelpAccordionProps {
  item: HelpItem;
}

export default function HelpAccordion({ item }: HelpAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string | number>(0);

  useEffect(() => {
    if (isOpen) {
      setHeight(contentRef.current?.scrollHeight || 'auto');
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-200 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left group bg-white transition-colors hover:bg-gray-50/50"
      >
        <span className={cn(
          "text-lg font-semibold transition-colors duration-300",
          isOpen ? "text-primary" : "text-gray-800 group-hover:text-black"
        )}>
          {item.question}
        </span>
        <span className={cn(
          "material-symbols-outlined transition-transform duration-300 !text-[24px]",
          isOpen ? "rotate-180 text-primary" : "text-gray-400"
        )}>
          expand_more
        </span>
      </button>

      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{ height }}
      >
        <div 
          ref={contentRef}
          className="px-6 pb-6 pt-2 text-gray-600 leading-relaxed text-base border-l-4 border-primary ml-[1px]"
        >
          <div 
            dangerouslySetInnerHTML={{ __html: item.answer }} 
            className="prose prose-sm max-w-none prose-primary"
          />
        </div>
      </div>
    </div>
  );
}
