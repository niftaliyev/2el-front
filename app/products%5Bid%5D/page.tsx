'use client';

import { use } from 'react';
import ProductDetailContent from '@/components/features/products/ProductDetailContent';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  return <ProductDetailContent id={id} />;
}
