'use client';

import { use, useEffect, useState, Suspense, useMemo } from 'react';
import ListingsContent from '@/components/features/listings/ListingsContent';
import ProductDetailContent from '@/components/features/products/ProductDetailContent';
import { adService } from '@/services/ad.service';
import { generateSlug } from '@/lib/utils';
import { SearchFilters } from '@/types';


export default function ElanlarDynamicPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug || [];

  const [resolvedFilters, setResolvedFilters] = useState<Partial<SearchFilters> | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const resolvePath = async () => {
      if (slug.length > 0) {
        const lastSegment = slug[slug.length - 1];
        const numericMatch = lastSegment.match(/(?:^|-)([0-9]{5,})$/);
        const guidMatch = lastSegment.match(/(?:^|-)([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
        const detectedId = guidMatch ? guidMatch[1] : (numericMatch ? numericMatch[1] : null);

        if (detectedId) {
          setProductId(detectedId);
          setIsReady(true);
          return;
        }
      }

      if (slug.length === 0) {
        setResolvedFilters({});
        setIsReady(true);
        return;
      }

      try {
        const tree = await adService.getCategoryTree();
        let categoryId = '';
        let subCategoryId = '';

        if (slug.length >= 1) {
          const rootCat = tree.find((c: any) => generateSlug(c.name) === slug[0]);
          if (rootCat) {
            categoryId = rootCat.id;

            if (slug.length >= 2) {
              const childCat = (rootCat.children || []).find((c: any) => generateSlug(c.name) === slug[1]);
              if (childCat) {
                categoryId = childCat.id;

                if (slug.length >= 3) {
                  // Segment 3 is usually a brand (technical subcategory)
                  const brands = await adService.getSubCategories(childCat.id);
                  const brand = brands.find((b: any) => generateSlug(b.name) === slug[2]);
                  if (brand) {
                    subCategoryId = brand.id;
                  }
                }
              } else {
                // If segment 2 is not a child category, check if it's a brand of the root
                const brands = await adService.getSubCategories(rootCat.id);
                const brand = brands.find((b: any) => generateSlug(b.name) === slug[1]);
                if (brand) {
                  subCategoryId = brand.id;
                }
              }
            }
          }
        }

        setResolvedFilters({ categoryId, subCategoryId });
      } catch (error) {
        console.error('Error resolving slugs:', error);
        setResolvedFilters({});
      } finally {
        setIsReady(true);
      }
    };

    resolvePath();
  }, [unwrappedParams.slug?.join('/')]);

  const memoizedFilters = useMemo(() => resolvedFilters || {}, [resolvedFilters]);

  if (!isReady) {
    return (
      <div className="flex justify-center items-center py-20 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (productId) {
    return <ProductDetailContent id={productId} />;
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center py-20 min-h-screen animate-pulse text-gray-400">Yüklənir...</div>}>
      <ListingsContent initialFilters={memoizedFilters} />
    </Suspense>
  );
}
