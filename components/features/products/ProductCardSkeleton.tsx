import { Skeleton } from '@/components/ui';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 flex flex-col h-full overflow-hidden shadow-sm">
      {/* Image Container Area with stable aspect ratio */}
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Content Area matching ProductCard layout */}
      <div className="p-2 sm:p-3 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* Price Placeholder */}
          <div className="flex items-baseline gap-0.5 mb-2 h-6">
            <Skeleton className="h-5 w-16 sm:w-20 rounded-md" />
          </div>

          {/* Title Placeholder */}
          <div className="space-y-1.5 mb-2">
            <Skeleton className="h-3.5 sm:h-4 w-full rounded-md" />
            <Skeleton className="h-3.5 sm:h-4 w-4/5 rounded-md" />
          </div>
        </div>

        {/* Footer Info Placeholder */}
        <div className="pt-2 mt-auto border-t border-gray-100 flex items-center justify-between">
          <Skeleton className="h-3.5 w-16 sm:w-20 rounded-md" />
          <Skeleton className="h-3.5 w-12 sm:w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}
