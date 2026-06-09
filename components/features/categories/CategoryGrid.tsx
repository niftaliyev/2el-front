'use client';

import { useRef, useState, useEffect } from 'react';
import { Category } from '@/types';
import CategoryCard from './CategoryCard';

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="w-full">
      <div className="py-1 sm:py-2 container mx-auto px-1 sm:px-4 md:px-6">
        {/* Hybrid Container: Scroll on Mobile, Grid on Tablet/PC */}
        <div className="flex sm:grid overflow-x-auto sm:overflow-visible scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-8 gap-x-1.5 gap-y-2 sm:gap-x-3 sm:gap-y-3 md:gap-x-4 md:gap-y-3 pb-2 sm:pb-0">
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
