'use client';

import { use, useEffect, useState } from 'react';
import ListingsContent from '@/components/features/listings/ListingsContent';
import ProductDetailContent from '@/components/features/products/ProductDetailContent';
import { adService } from '@/services/ad.service';
import { generateSlug } from '@/lib/utils';
import { SearchFilters, Category } from '@/types';

export default function ElanlarDynamicPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug || [];
  
  const [resolvedFilters, setResolvedFilters] = useState<Partial<SearchFilters> | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const resolvePath = async () => {
      // 1. Check if the last segment is likely an ID (e.g. numeric or GUID pattern)
      if (slug.length > 0) {
        const lastSegment = slug[slug.length - 1];
        // common ID patterns: numeric (tap.az) or hex with hyphens (GUID)
        const isLikelyId = /^[0-9]+$/.test(lastSegment) || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(lastSegment);
        
        if (isLikelyId) {
          setProductId(lastSegment);
          setIsReady(true);
          return;
        }
      }

      // 2. If it's a list page, resolve slugs to category/subcategory IDs
      if (slug.length === 0) {
        setResolvedFilters({});
        setIsReady(true);
        return;
      }

      try {
        const tree = await adService.getCategoryTree();
        const flattening: any[] = [];
        const flatten = (items: any[]) => {
          items.forEach(item => {
            flattening.push(item);
            if (item.children) flatten(item.children);
            if (item.subCategories) flatten(item.subCategories);
          });
        };
        flatten(tree);

        let categoryId = '';
        let subCategoryId = '';

        if (slug.length >= 1) {
          const cat = tree.find((c: any) => generateSlug(c.name) === slug[0]);
          if (cat) categoryId = cat.id;
        }

        if (slug.length >= 2) {
          const cat = tree.find((c: any) => generateSlug(c.name) === slug[0]);
          if (cat) {
             const sub = (cat.children || []).find((c: any) => generateSlug(c.name) === slug[1]);
             if (sub) {
                // If it's a child category (e.g. transport/cars)
                categoryId = sub.id;
             } else {
                // Check if it's a subcategory (Brand/Model)
                const brands = await adService.getSubCategories(cat.id);
                const brand = brands.find((b: any) => generateSlug(b.name) === slug[1]);
                if (brand) {
                   subCategoryId = brand.id;
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
  }, [slug]);

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
    <ListingsContent initialFilters={resolvedFilters || {}} />
  );
}
