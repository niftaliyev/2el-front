import Link from 'next/link';
import { Category } from '@/types';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
}

import { useLanguage } from '@/contexts/LanguageContext';

export default function CategoryCard({ category }: CategoryCardProps) {
  const { language } = useLanguage();
  const displayName = language === 'ru' && category.nameRu ? category.nameRu : category.name;

  return (
    <Link
      href={category.slug ? ROUTES.CATEGORY(category.slug) : ROUTES.CATEGORY(category.id)}
      className="group flex flex-col gap-1.5 items-center text-center sm:items-stretch sm:text-left transition-all duration-300"
    >
      <div className="relative w-16 h-16 mx-auto sm:w-full sm:h-auto sm:aspect-[1.6/1] bg-[#f2f4f7] rounded-2xl sm:rounded-xl overflow-hidden group-hover:bg-[#ebedf2] transition-colors duration-300">
        {/* Category Image */}
        <div className="absolute inset-0 flex items-center justify-center p-1 sm:p-0 sm:block sm:inset-auto sm:bottom-0 sm:right-0 sm:w-[90%] sm:h-[90%] pointer-events-none">
          {category.image ? (
            <img
              src={category.image}
              alt={displayName}
              className="w-full h-full object-contain scale-[1.75] -translate-x-[11px] sm:scale-[1.5] sm:object-right-bottom sm:-translate-x-7 sm:-translate-y-6 sm:group-hover:scale-[1.6] transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center sm:pr-4 sm:pb-4">
              <span className="material-symbols-outlined !text-[24px] sm:!text-[32px] text-gray-400 group-hover:text-primary transition-colors duration-300">
                {category.icon || 'category'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Label (Responsive and Line-clamped) */}
      <span className="text-[10px] sm:text-[14px] font-medium sm:font-semibold text-gray-800 leading-tight px-0.5 text-center sm:text-left line-clamp-2 min-h-[28px] sm:min-h-[40px] group-hover:text-primary transition-colors duration-300 w-full">
        {displayName}
      </span>
    </Link>
  );
}
