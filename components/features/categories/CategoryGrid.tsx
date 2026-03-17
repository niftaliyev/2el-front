import { Category } from '@/types';
import CategoryCard from './CategoryCard';

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="py-4">
        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden overflow-x-auto scrollbar-hide px-4">
          <div className="flex gap-4 pb-2">
            {categories.map((category) => (
              <div key={category.id} className="min-w-[70px]">
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:block">
          <div className="grid grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
