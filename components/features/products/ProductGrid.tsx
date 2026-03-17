import { Product } from '@/types';
import ProductCard from './ProductCard';
import Link from 'next/link';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
  // Kept for backward compatibility if used elsewhere, but optional
  title?: string;
  description?: string;
  viewAllLink?: string;
}

export default function ProductGrid({ products, emptyMessage = 'No products found', title, description, viewAllLink }: ProductGridProps) {
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
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div className="flex flex-col gap-2">
            {title && (
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            )}
            {description && (
              <p className="text-gray-500">{description}</p>
            )}
          </div>
          {viewAllLink && (
            <Link href={viewAllLink}>
              <button className="flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors group">
                <span>Hamısına bax</span>
                <span className="material-symbols-outlined !text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
