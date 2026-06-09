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

  const getHref = () => {
    if (!category.slug) return ROUTES.CATEGORY(category.id);
    if (category.slug.startsWith('/')) return category.slug;
    return ROUTES.CATEGORY(category.slug);
  };

  return (
    <Link
      href={getHref()}
      className="group flex flex-col gap-1.5 items-center text-center transition-all duration-300 w-full"
    >
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#eaecf0] border border-[#d0d5dd] rounded-full overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.02)] group-hover:bg-white group-hover:border-primary/30 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
        {/* Category Image */}
        {category.image ? (
          <img
            src={category.image}
            alt={displayName}
            className="w-[70%] h-[70%] object-contain transition-all duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="material-symbols-outlined !text-[24px] sm:!text-[32px] text-gray-400 group-hover:text-primary transition-colors duration-300">
            {category.icon || 'category'}
          </span>
        )}
      </div>

      {/* Label (Responsive and Line-clamped) */}
      <span className="text-[10px] sm:text-[13px] font-medium sm:font-semibold text-gray-800 leading-tight px-0.5 text-center line-clamp-2 min-h-[28px] sm:min-h-[32px] group-hover:text-primary transition-colors duration-300 w-full mt-1">
        {displayName}
      </span>
    </Link>
  );
}
