'use client';

import { useEffect, useState } from 'react';
import { Container } from '@/components/layout';
import SearchBar from '@/components/features/search/SearchBar';
import FilterPanel from '@/components/features/filters/FilterPanel';
import ProductGrid from '@/components/features/products/ProductGrid';
import { SearchFilters, Product } from '@/types';
import { SORT_OPTIONS } from '@/constants';
import Select, { SelectOption } from '@/components/ui/Select';
import { SingleValue } from 'react-select';
import { adService, ListingResponse } from '@/services/ad.service';

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '/placeholder-product.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `https://ikinci.musahesenli.com${imagePath}`;
};

export default function ListingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'latest',
  });

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const data = await adService.getAllAds();

        // Map API response to Product type
        const mappedProducts: Product[] = data.map((item: ListingResponse) => ({
          id: item.id.toString(),
          title: item.title,
          description: '', // Not provided in list API
          price: item.price,
          currency: '₼', // Assuming currency
          images: [getImageUrl(item.image)],
          category: { id: '0', name: 'Unknown', slug: 'unknown' }, // Placeholder
          location: { id: '0', city: 'Baku', region: '', country: 'Azerbaijan' }, // Placeholder
          seller: { id: '0', name: 'User', email: '', createdAt: new Date('2024-01-01'), isVerified: false }, // Placeholder
          condition: 'used', // Default or need more info
          status: item.status.toLowerCase() as any,
          viewCount: 0,
          favoriteCount: 0,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.createdAt),
          isFeatured: false,
          isPremium: false,
        }));

        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [filters]); // Re-fetch when filters change (logic to be added)

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    // In a real app, fetch products with new filters
  };



  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <Container>
          <div className="py-8">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6 tracking-tight">
              Bütün Elanlar
            </h1>
            <SearchBar initialQuery={filters.query} />
          </div>
        </Container>
      </div>

      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 hidden lg:block sticky top-24 z-10">
            <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
          </aside>

          {/* Mobile Filter Button (Visible on mobile only) */}
          <div className="lg:hidden mb-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm w-full justification-center font-medium text-gray-700">
              <span className="material-symbols-outlined">filter_list</span>
              Filtrlər
            </button>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-gray-500 font-medium">
                <span className="text-gray-900 font-bold">{products.length}</span> elan tapıldı
              </p>

              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-500 whitespace-nowrap">Sıralama:</label>
                <div className="w-48">
                  <Select
                    value={SORT_OPTIONS.map(s => ({ value: s.value, label: s.label })).find(s => s.value === filters.sortBy) || SORT_OPTIONS.map(s => ({ value: s.value, label: s.label }))[0]}
                    onChange={(option) => setFilters(prev => ({ ...prev, sortBy: option?.value as any }))}
                    options={SORT_OPTIONS.map(s => ({ value: s.value, label: s.label }))}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ProductGrid products={products} />
            )}

            {/* Pagination (Mock) */}
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center gap-2">
                <button className="size-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-50" disabled>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="size-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold">1</button>
                <button className="size-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">2</button>
                <button className="size-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">3</button>
                <span className="text-gray-400">...</span>
                <button className="size-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">12</button>
                <button className="size-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
