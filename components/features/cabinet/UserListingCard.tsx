'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants';
import { formatPrice, getDaysLeft } from '@/lib/utils';

interface Listing {
  id: string;
  title: string;
  slug?: string;
  parentCategorySlug?: string;
  childCategorySlug?: string;
  location: string;
  price: number;
  imageUrl: string;
  postedDate: string;
  categoryName?: string;
  status: 'active' | 'pending' | 'inactive' | 'rejected';
  isBoosted: boolean;
  boostedAt?: string;
  totalBoostsRemaining: number;
  vipExpiresAt?: string;
  premiumExpiresAt?: string;
}

interface UserListingCardProps {
  listing: Listing;
  onPromote: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReactivate?: (id: string) => void;
}

export default function UserListingCard({
  listing,
  onPromote,
  onEdit,
  onDelete,
  onReactivate
}: UserListingCardProps) {
  const imageUrl = listing.imageUrl || '/placeholder-product.jpg';

  return (
    <div className="flex flex-col sm:flex-row rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300">

      {/* Product Image Section */}
      <Link href={ROUTES.PRODUCT(listing)} className="relative w-full sm:w-[180px] aspect-video sm:aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
        <div
          className="w-full h-full bg-center bg-no-repeat bg-cover group-hover:scale-105 transition-transform duration-500"
          style={{
            backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none',
          }}
          role="img"
          aria-label={listing.title}
        />

        {/* Status Overlay (smaller on mobile) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {listing.status === 'rejected' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600/90 backdrop-blur-sm text-white rounded-md shadow-sm">
              <span className="material-symbols-outlined !text-[12px] font-bold">cancel</span>
              <span className="text-[9px] font-bold uppercase tracking-tight">Rədd edilmiş</span>
            </div>
          )}
          {listing.status === 'pending' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/90 backdrop-blur-sm text-white rounded-md shadow-sm">
              <span className="material-symbols-outlined !text-[12px] font-bold">schedule</span>
              <span className="text-[9px] font-bold uppercase tracking-tight">Gözləmədə</span>
            </div>
          )}
        </div>

        {/* Price Tag (mobile absolute) */}
        {listing.categoryName !== 'Tanışlıq' && (
          <div className="sm:hidden absolute bottom-2 right-2 bg-white/95 px-2.5 py-1 rounded-lg shadow-sm border border-white">
            <span className="text-primary font-bold text-sm tabular-nums">
              {formatPrice(listing.price)}
            </span>
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className="flex flex-col p-4 sm:p-5 flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <Link href={ROUTES.PRODUCT(listing)}>
              <h3 className="text-gray-900 text-sm sm:text-base font-bold leading-tight line-clamp-1 sm:line-clamp-2 hover:text-primary transition-colors mb-1.5">
                {listing.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1 text-gray-500">
              <span className="material-symbols-outlined !text-[14px]">location_on</span>
              <span className="text-[11px] sm:text-xs font-semibold truncate">{listing.location}</span>
            </div>
          </div>

          {listing.categoryName !== 'Tanışlıq' && (
            <div className="hidden sm:block text-right flex-shrink-0">
              <p className="text-primary font-black text-lg tabular-nums leading-none">
                {formatPrice(listing.price)}
              </p>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50 flex flex-wrap items-center gap-4 text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-tight">
          <div className="flex flex-col">
            <span className="text-[8px] text-gray-400 font-medium">Tarix</span>
            <span>{listing.postedDate}</span>
          </div>
          {listing.status === 'active' && (
            <div className="flex flex-col">
              <span className="text-[8px] text-gray-400 font-medium">Status</span>
              <span className="text-emerald-600">Aktiv</span>
            </div>
          )}
          {listing.isBoosted && (
            <div className="flex flex-col">
              <span className="text-[8px] text-gray-400 font-medium">Boost</span>
              <span className="text-orange-600 flex items-center gap-0.5">
                <span className="material-symbols-outlined !text-[12px] font-bold">rocket_launch</span>
                <span>Aktiv</span>
              </span>
            </div>
          )}
          {listing.totalBoostsRemaining > 0 && (
            <div className="flex flex-col">
              <span className="text-[8px] text-gray-400 font-medium">Qalan Boostlar</span>
              <span className="text-primary">{listing.totalBoostsRemaining}</span>
            </div>
          )}
          {listing.vipExpiresAt && getDaysLeft(listing.vipExpiresAt) > 0 && (
            <div className="flex flex-col">
              <span className="text-[8px] text-gray-400 font-medium text-orange-600">VIP Bitir</span>
              <span>{getDaysLeft(listing.vipExpiresAt)} gün</span>
            </div>
          )}
          {listing.premiumExpiresAt && getDaysLeft(listing.premiumExpiresAt) > 0 && (
            <div className="flex flex-col">
              <span className="text-[8px] text-gray-400 font-medium text-indigo-600">Premium Bitir</span>
              <span>{getDaysLeft(listing.premiumExpiresAt)} gün</span>
            </div>
          )}
        </div>

        {/* Actions Bar (Compact) */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="flex-1">
            {listing.status === 'active' && (
              <button
                onClick={() => onPromote(listing.id)}
                className="w-full h-9 rounded-xl bg-primary text-white font-bold uppercase tracking-tight text-[10px] sm:text-[11px] hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 group/rocket cursor-pointer"
              >
                <span className="material-symbols-outlined !text-[16px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">rocket_launch</span>
                <span className="truncate">Önə Çıxar</span>
              </button>
            )}

            {listing.status === 'inactive' && onReactivate && (
              <button
                onClick={() => onReactivate(listing.id)}
                className="w-full h-9 rounded-xl bg-emerald-600 text-white font-bold uppercase tracking-tight text-[10px] sm:text-[11px] hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 group/refresh cursor-pointer"
              >
                <span className="material-symbols-outlined !text-[16px] group-hover:rotate-180 transition-transform duration-500">refresh</span>
                <span className="truncate">Yenilə</span>
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(listing.id)}
              className="size-9 rounded-xl bg-gray-50 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-100 transition-all flex items-center justify-center active:scale-90 cursor-pointer"
              title="Redaktə et"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>

            <button
              onClick={() => onDelete(listing.id)}
              className="size-9 rounded-xl bg-gray-50 text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-100 transition-all flex items-center justify-center active:scale-90 cursor-pointer"
              title="Sil"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
