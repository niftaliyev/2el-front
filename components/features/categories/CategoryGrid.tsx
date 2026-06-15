'use client';

import { useRef, useState, useEffect } from 'react';
import { Category } from '@/types';
import CategoryCard from './CategoryCard';
import { useLanguage } from '@/contexts/LanguageContext';

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full">
      <div className="py-1 sm:py-2 container mx-auto px-1 sm:px-4 md:px-6">
        {/* Hybrid Container: Scroll on Mobile, Grid on Tablet/PC */}
        <div className="flex sm:grid overflow-x-auto sm:overflow-visible scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-8 gap-x-1.5 gap-y-2 sm:gap-x-3 sm:gap-y-3 md:gap-x-4 md:gap-y-3 pb-2 sm:pb-0">
          {/* Mobile-only Kataloq Trigger Card */}
          <div
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-mobile-catalog'));
            }}
            className="flex-shrink-0 w-[80px] sm:hidden flex flex-col gap-1.5 items-center text-center cursor-pointer select-none"
          >
            <div className="relative w-16 h-16 mx-auto bg-primary/5 border border-primary/15 rounded-full overflow-hidden flex items-center justify-center active:scale-95 transition-transform duration-200">
              <span className="material-symbols-outlined !text-[28px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                grid_view
              </span>
            </div>
            <span className="text-[10px] font-medium text-gray-800 leading-tight px-0.5 text-center line-clamp-2 min-h-[28px] mt-1">
              {t('nav.catalog')}
            </span>
          </div>

          {categories.map((category) => (
            <div key={category.id} className="flex-shrink-0 w-[80px] sm:w-auto">
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
