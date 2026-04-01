'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants';
import { formatPrice } from '@/lib/utils';

interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  imageUrl: string;
  postedDate: string;
  status: 'active' | 'pending' | 'inactive' | 'rejected';
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
    <div className="flex flex-col rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300">
      
      {/* Top Banner */}
      <Link href={ROUTES.PRODUCT(listing.id)} className="block relative aspect-video sm:aspect-[16/10] overflow-hidden bg-gray-100">
        <div
          className="w-full h-full bg-center bg-no-repeat bg-cover group-hover:scale-105 transition-transform duration-500"
          style={{ 
            backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none',
          }}
          role="img"
          aria-label={listing.title}
        />
        
        {/* Status Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {listing.status === 'rejected' && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-full shadow-lg">
              <span className="material-symbols-outlined !text-[12px] font-bold">cancel</span>
              <span className="text-[10px] font-bold uppercase tracking-tight">Rədd edilmiş</span>
            </div>
          )}
          {listing.status === 'pending' && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full shadow-lg">
              <span className="material-symbols-outlined !text-[12px] font-bold">schedule</span>
              <span className="text-[10px] font-bold uppercase tracking-tight">Gözləmədə</span>
            </div>
          )}
        </div>

        {/* Price Overlay */}
        <div className="absolute bottom-3 right-3 bg-white/95 px-4 py-1.5 rounded-xl shadow-lg border border-white">
           <span className="text-primary font-bold text-lg tabular-nums">
              {formatPrice(listing.price)} <span className="text-xs font-medium text-gray-500">AZN</span>
           </span>
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-col p-5 flex-1">
        <div className="flex-1">
          <Link href={ROUTES.PRODUCT(listing.id)}>
            <h3 className="text-gray-900 text-base font-bold leading-tight line-clamp-2 hover:text-primary transition-colors mb-2">
              {listing.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 text-gray-500 mb-4">
            <span className="material-symbols-outlined !text-xs font-bold">location_on</span>
            <span className="text-xs font-medium truncate">{listing.location}</span>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between mb-5 pt-3 border-t border-gray-50 text-[11px] text-gray-400">
           <div className="flex flex-col">
              <span className="font-medium text-gray-400 uppercase tracking-wider text-[9px]">Tarix</span>
              <span className="font-bold text-gray-600 uppercase">{listing.postedDate}</span>
           </div>
           {listing.status === 'active' && (
              <div className="flex flex-col text-right">
                 <span className="font-medium text-gray-400 uppercase tracking-wider text-[9px]">Status</span>
                 <span className="font-bold text-emerald-600 uppercase">Aktiv</span>
              </div>
           )}
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-100">
          {listing.status === 'active' && (
            <button
              onClick={() => onPromote(listing.id)}
              className="flex-1 h-10 rounded-xl bg-primary text-white font-bold uppercase tracking-tight text-[11px] hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 group/rocket"
            >
              <span className="material-symbols-outlined !text-base group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">rocket_launch</span>
              <span className="truncate">Önə Çıxar</span>
            </button>
          )}

          {listing.status === 'inactive' && onReactivate && (
            <button
              onClick={() => onReactivate(listing.id)}
              className="flex-1 h-10 rounded-xl bg-emerald-600 text-white font-bold uppercase tracking-tight text-[11px] hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 group/refresh"
            >
              <span className="material-symbols-outlined !text-base group-hover:rotate-180 transition-transform duration-500">refresh</span>
              <span className="truncate">Yenilə</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(listing.id)}
              className="size-10 rounded-xl bg-gray-50 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-100 transition-all flex items-center justify-center"
              title="Redaktə et"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>

            <button
              onClick={() => onDelete(listing.id)}
              className="size-10 rounded-xl bg-gray-50 text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-100 transition-all flex items-center justify-center"
              title="Sil"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
