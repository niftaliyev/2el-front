'use client';

import { Suspense } from 'react';
import ListingsContent from '@/components/features/listings/ListingsContent';

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
}
