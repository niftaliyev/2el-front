'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/lib/utils';
import CategoryDropdown from './CategoryDropdown';
import BurgerMenu from './BurgerMenu';
import SearchAutocomplete from '@/components/features/search/SearchAutocomplete';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { toast } from 'sonner';

export default function Header() {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isVisible = useScrollDirection();

  const isHome = pathname === '/';

  // Detect if we are on Ad Detail or Store Detail page
  const isAdDetail = pathname.includes('/elanlar/') && pathname.split('/').pop()?.length! > 20; // IDs are long
  const isStoreDetail = pathname.startsWith('/shops/') && pathname.split('/').filter(Boolean).length === 2;
  const showShare = isAdDetail || isStoreDetail;

  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error('Paylaşım zamanı xəta yarandı');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link kopyalandı!');
      } catch (error) {
        console.error('Error copying link:', error);
        toast.error('Linki kopyalamaq mümkün olmadı');
      }
    }
  };


  return (
    <>
      <header className={`w-full bg-white border-b border-solid border-gray-200 sticky top-0 z-[100] transition-transform duration-300 ease-in-out md:transform-none ${isVisible || isCatalogOpen ? 'transform-none' : '-translate-y-full'}`}>
        {/* ─── Main Row ─── */}
        <div className="flex items-center justify-between px-3 sm:px-6 lg:px-8 h-16 gap-3">

          {/* Left: back button (mobile) + burger + logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {!isHome && (
              <button
                onClick={() => router.back()}
                className="flex md:hidden items-center justify-center size-9 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined !text-[24px]">chevron_left</span>
              </button>
            )}

            <BurgerMenu />

            <Link href={ROUTES.HOME} className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
              <div className="size-6 sm:size-7 text-primary flex-shrink-0 transition-transform group-hover:scale-110">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
                </svg>
              </div>
              <span className="text-gray-900 text-[18px] sm:text-[21px] font-black leading-tight tracking-tight block">
                Elan<span className="text-primary">.az</span>
              </span>
            </Link>
          </div>

          {/* Center: Katalog + Search (desktop) */}
          <div className="hidden md:flex flex-1 items-center gap-3 max-w-2xl mx-4">
            {/* Katalog button */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                className={`flex items-center cursor-pointer gap-2.5 px-5 h-11 rounded-xl font-bold text-[14.5px] transition-all shadow-sm ${isCatalogOpen ? 'bg-primary text-white' : 'bg-primary text-white hover:brightness-110 active:scale-95'
                  }`}
              >
                <span className="material-symbols-outlined font-bold text-[22px]">
                  {isCatalogOpen ? 'close' : 'menu'}
                </span>
                <span className="tracking-wide hidden lg:inline">Kataloq</span>
              </button>
            </div>

            {/* Search bar — SearchAutocomplete ilə əvəz edildi */}
            <div className="flex-1">
              <SearchAutocomplete
                placeholder="Əşya və ya xidmət axtarışı"
                buttonLabel="Axtar"
              />
            </div>
          </div>

          {/* Right side nav links - desktop only */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700 flex-shrink-0">
            <Link href={ROUTES.LISTINGS} className="hover:text-primary transition-colors whitespace-nowrap">
              Bütün elanlar
            </Link>
            <Link href="/shops" className="hover:text-primary transition-colors whitespace-nowrap">
              Mağazalar
            </Link>
          </div>

          {/* Right side: action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Desktop: Elan yerləşdir (Always visible on sm+) */}
            <Link href={isAuthenticated ? ROUTES.CREATE_LISTING : ROUTES.LOGIN} className="hidden sm:block">
              <button className="flex cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-primary text-white text-[14px] font-bold leading-normal hover:bg-primary-dark transition-colors shadow-sm whitespace-nowrap active:scale-95">
                <span className="material-symbols-outlined !text-[20px] mr-1.5">add_circle</span>
                <span className="hidden lg:inline">Elan yerləşdir</span>
                <span className="lg:hidden">Yeni elan</span>
              </button>
            </Link>

            {/* Action Icons: Favorites & Messages */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Share Icon - only on detail pages on mobile */}
              {showShare && (
                <button
                  onClick={handleShare}
                  className="flex md:hidden cursor-pointer items-center justify-center rounded-xl h-9 w-9 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all active:scale-90 shadow-sm border border-gray-100"
                >
                  <span className="material-symbols-outlined !text-[22px]">ios_share</span>
                </button>
              )}

              {/* Favorites Icon - Hidden on mobile, as it is in bottom nav */}
              <Link href={ROUTES.FAVORITES} className="hidden md:flex">
                <button className="flex cursor-pointer items-center justify-center rounded-xl h-9 w-9 sm:h-10 sm:w-10 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all active:scale-90 shadow-sm border border-gray-100 sm:border-transparent">
                  <span className="material-symbols-outlined !text-[22px]">favorite</span>
                </button>
              </Link>

              {/* Messages Icon - Hidden on mobile, as it is in bottom nav */}
              <Link href={isAuthenticated ? ROUTES.MESSAGES : ROUTES.LOGIN} className="hidden md:flex">
                <button className="flex cursor-pointer items-center justify-center rounded-xl h-9 w-9 sm:h-10 sm:w-10 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all active:scale-90 shadow-sm border border-gray-100 sm:border-transparent">
                  <span className="material-symbols-outlined !text-[22px]">chat_bubble</span>
                </button>
              </Link>
            </div>

            {/* Auth State: Profile or Login */}
            <div className="flex items-center">
              {isAuthenticated ? (
                <Link href={ROUTES.PROFILE}>
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 sm:size-10 bg-gray-50 border border-gray-200 hover:ring-2 hover:ring-primary transition-all cursor-pointer flex items-center justify-center overflow-hidden"
                    style={user?.profilePhoto ? { backgroundImage: `url("${getImageUrl(user.profilePhoto)}")` } : {}}
                  >
                    {!user?.profilePhoto && (
                      <span className="material-symbols-outlined text-gray-400 !text-[20px] sm:!text-[24px]">person</span>
                    )}
                  </div>
                </Link>
              ) : (
                <>
                  <Link href={ROUTES.LOGIN} className="hidden sm:block">
                    <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-5 bg-primary text-white text-[14px] font-bold leading-normal hover:bg-primary-dark transition-colors shadow-sm active:scale-95">
                      Daxil ol
                    </button>
                  </Link>
                  <Link href={ROUTES.LOGIN} className="sm:hidden">
                    <button className="flex cursor-pointer items-center justify-center rounded-xl h-9 w-9 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all active:scale-90 shadow-sm border border-gray-100">
                      <span className="material-symbols-outlined !text-[22px]">person</span>
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>


        {/* ─── Mobile Search Row ─── */}
        <div className="md:hidden px-3 pb-3">
          <SearchAutocomplete
            placeholder="Əşya və ya xidmət axtarışı"
            buttonLabel={<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>}
          />
        </div>
      </header>
      <CategoryDropdown isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
    </>
  );
}
