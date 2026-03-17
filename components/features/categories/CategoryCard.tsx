import Link from 'next/link';
import { Category } from '@/types';
import { ROUTES } from '@/constants';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={ROUTES.CATEGORY(category.slug)}
      className="group flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-200"
    >
      <div className="flex items-center justify-center w-20 h-20 bg-white border-2 border-gray-200 rounded-full group-hover:bg-primary group-hover:border-primary group-hover:shadow-lg transition-all duration-200">
        <span className="material-symbols-outlined !text-4xl text-primary group-hover:text-white transition-colors duration-200">
          {category.icon || 'category'}
        </span>
      </div>
      <span className="text-xs font-medium text-gray-700 text-center leading-tight max-w-[90px] min-h-[28px] flex items-center">{category.name}</span>
    </Link>
  );
}
