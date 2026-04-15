'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice, formatRelativeTime, getImageUrl, generateSlug } from '@/lib/utils';
import { ROUTES } from '@/constants';
import { adService } from '@/services/ad.service';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isChangingFav, setIsChangingFav] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const mainImage = product.images?.[0] || '/placeholder-product.jpg';
  const [imageSrc, setImageSrc] = useState(mainImage);

  useEffect(() => {
    setImageSrc(mainImage);
  }, [mainImage]);

  useEffect(() => {
    if (product.isFavourite !== undefined) {
      setIsFavorite(product.isFavourite);
    }
  }, [product.isFavourite]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }

    if (isChangingFav) return;

    setIsChangingFav(true);
    try {
      if (isFavorite) {
        await adService.removeFromFavourites(product.id);
        setIsFavorite(false);
      } else {
        await adService.addToFavourites(product.id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Favorite action failed:', error);
    } finally {
      setIsChangingFav(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 flex flex-col h-full overflow-hidden">
      {/* Image Container Area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Link href={ROUTES.PRODUCT(product)} className="block w-full h-full">
          <Image
            src={imageSrc}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImageSrc('/placeholder-product.jpg')}
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Top gradient for heart contrast */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/30 to-transparent pointer-events-none z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Favorite Button */}
        <button
          className={`absolute top-2 right-2 z-20 transition-all duration-300 hover:scale-110 focus:outline-none ${
            isFavorite ? 'text-[#ff4d4d]' : 'text-white/90 hover:text-white'
          }`}
          onClick={handleFavorite}
          disabled={isChangingFav}
        >
          <span
            className="material-symbols-outlined !text-[22px] sm:!text-[26px] block"
            style={{
              fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0",
              filter: !isFavorite ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' : 'none',
            }}
          >
            favorite
          </span>
        </button>

        {/* Store Badge */}
        {product.store && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md pl-1 pr-2 py-1 rounded-lg border border-white/10 pointer-events-none z-20">
            {product.store.logo ? (
              <div className="relative w-5 h-5 rounded-md overflow-hidden bg-white flex-shrink-0">
                <Image 
                  src={product.store.logo} 
                  alt={product.store.name} 
                  fill 
                  className="object-contain p-0.5" 
                  onError={(e) => {
                    // Fallback to storefront icon if logo fails
                    (e.target as any).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-md">
                <span className="material-symbols-outlined text-white !text-[14px]">storefront</span>
              </div>
            )}
            <span className="text-white text-[10px] sm:text-[11px] font-bold tracking-tight truncate max-w-[90px]">
              {product.store.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* Price */}
          <div className="flex items-baseline gap-0.5 mb-1 h-6">
            {product.category?.name === 'Tanışlıq' || product.subCategory?.name === 'Tanışlıq' ? null : (
              <>
                <span className="text-base sm:text-lg font-black text-gray-900">
                  {formatPrice(product.price, product.currency).split(' ')[0]}
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-500 ml-0.5">
                  {product.currency}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <Link href={ROUTES.PRODUCT(product)}>
            <h3 className="text-gray-800 font-medium text-[12px] sm:text-sm leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="pt-2 mt-auto border-t border-gray-100 flex items-center justify-between text-[11px] sm:text-[13px] text-gray-500 font-medium tracking-tight">
          <div className="flex items-center gap-1 truncate max-w-[55%]">
            <span className="material-symbols-outlined !text-[14px] sm:!text-[16px] text-gray-400">location_on</span>
            <span className="truncate">{product.location.city}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-normal">{mounted ? formatRelativeTime(product.createdAt) : '\u00A0'}</span>
            <div className="flex items-center gap-1">
              {product.isBoosted && (
                <span className="material-symbols-outlined !text-[15px] text-green-600" title="Boosted">rocket_launch</span>
              )}
              {product.isFeatured && (
                <span className="material-symbols-outlined !text-[15px] sm:!text-[16px] text-[#0057e6] font-bold" title="VIP">stars</span>
              )}
              {product.isPremium && (
                <span className="material-symbols-outlined !text-[15px] sm:!text-[16px] text-[#ff9900]" title="Premium">workspace_premium</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
