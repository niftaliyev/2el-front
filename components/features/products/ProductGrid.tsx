import { Product } from '@/types';
import ProductCard from './ProductCard';
import Link from 'next/link';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
  title?: string;
  description?: string;
  viewAllLink?: string;
  viewAllText?: string;
  titleLight?: boolean;
}

export default function ProductGrid({ products, emptyMessage = 'No products found', title, description, viewAllLink, viewAllText, titleLight }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-center mb-4">
          <span className="material-symbols-outlined text-gray-300 !text-6xl">
            inventory_2
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Heç nə tapılmadı</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {(title || description || viewAllLink) && (
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
          <div className="flex flex-col gap-1">
            {title && (
              <h2 className={`${titleLight ? 'text-base' : 'text-lg sm:text-xl'} font-bold text-[#212121]`}>{title}</h2>
            )}
            {description && (
              <p className="text-gray-500 text-sm">{description}</p>
            )}
          </div>
          {viewAllLink && (
            <Link href={viewAllLink} className="text-primary hover:underline text-[14px] font-medium whitespace-nowrap">
              {viewAllText || 'Hamısına bax'}
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
