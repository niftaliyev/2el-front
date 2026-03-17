'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { ROUTES } from '@/constants';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  const mainImage = product.images[0] || '/placeholder-product.jpg';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure image URL is absolute or valid for Next.Image if it's from external source
  // For this mock, we assume URLs are valid or configured in next.config.js

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 flex flex-col h-full overflow-hidden">
      {/* Image Container */}
      <Link href={ROUTES.PRODUCT(product.id)} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={mainImage}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isPremium && (
            <div className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
              <span className="material-symbols-outlined !text-[14px]">workspace_premium</span>
              <span>PREMIUM</span>
            </div>
          )}
          {product.condition === 'new' && (
            <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg backdrop-blur-sm">
              YENİ
            </div>
          )}
        </div>

        {/* Favorite Button - Visible on Hover (or always on mobile if needed) */}
        <button
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-gray-400 hover:text-red-500 rounded-full shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
          onClick={(e) => {
            e.preventDefault();
            // Handle favorite logic
          }}
        >
          <span className="material-symbols-outlined !text-[20px] block">favorite</span>
        </button>

        {/* Store Badge */}
        {product.store && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
            <span className="material-symbols-outlined text-white !text-[16px]">storefront</span>
            <span className="text-white text-xs font-medium truncate max-w-[100px]">{product.store.name}</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* Price */}
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-lg font-black text-gray-900">
              {formatPrice(product.price, product.currency).split(' ')[0]}
            </span>
            <span className="text-sm font-bold text-gray-500">
              {product.currency}
            </span>
          </div>

          {/* Title */}
          <Link href={ROUTES.PRODUCT(product.id)}>
            <h3 className="text-gray-900 font-medium text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="pt-3 mt-1 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1 truncate max-w-[60%]">
            <span className="material-symbols-outlined !text-[14px]">location_on</span>
            <span className="truncate">{product.location.city}</span>
          </div>
          <span className="flex-shrink-0">
            {mounted ? formatRelativeTime(product.createdAt) : '\u00A0'}
          </span>
        </div>
      </div>
    </div>
  );
}
