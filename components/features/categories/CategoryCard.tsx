import Link from 'next/link';
import { Category } from '@/types';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={category.slug ? ROUTES.CATEGORY(category.slug) : ROUTES.CATEGORY(category.id)}
      className="group flex flex-col gap-2 transition-all duration-300"
    >
      <div className="relative w-full aspect-[1.3/1] sm:aspect-[1.6/1] bg-[#f2f4f7] rounded-xl overflow-hidden group-hover:bg-[#ebedf2] transition-colors duration-300">
        {/* Category Image (Bottom-Right Position) */}
        <div className="absolute bottom-0 right-0 w-[85%] h-[85%] sm:w-[90%] sm:h-[90%] pointer-events-none">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-contain object-right-bottom scale-[1.3] sm:scale-[1.5] -translate-x-6 sm:-translate-x-7 -translate-y-4 sm:-translate-y-6 group-hover:scale-[1.4] sm:group-hover:scale-[1.6] transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center pr-3 pb-3 sm:pr-4 sm:pb-4">
              <span className="material-symbols-outlined !text-[24px] sm:!text-[32px] text-gray-400 group-hover:text-primary transition-colors duration-300">
                {category.icon || 'category'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Label (Responsive and Line-clamped) */}
      <span className="text-[11px] sm:text-[14px] font-semibold text-gray-800 leading-tight px-1 line-clamp-2 min-h-[32px] sm:min-h-[40px] group-hover:text-primary transition-colors duration-300">
        {category.name}
      </span>
    </Link>
  );
}
