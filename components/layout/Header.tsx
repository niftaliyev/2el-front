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

export default function Header() {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === '/';


  return (
    <header className="w-full bg-white border-b border-solid border-gray-200 sticky top-0 z-50">
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

          <Link href={ROUTES.HOME} className="flex items-center gap-2 cursor-pointer">
            <div className="size-7 text-primary flex-shrink-0">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
              </svg>
            </div>
            <span className="text-gray-900 text-[20px] font-extrabold leading-tight tracking-[-0.02em] hidden xs:block sm:block">
              Elan.az
            </span>
          </Link>
        </div>

        {/* Center: Katalog + Search (desktop) */}
        <div className="hidden md:flex flex-1 items-center gap-3 max-w-2xl mx-4">
          {/* Katalog button */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setIsCatalogOpen(!isCatalogOpen)}
              className={`flex items-center cursor-pointer gap-2.5 px-5 h-11 rounded-xl font-bold text-[14.5px] transition-all shadow-sm ${
                isCatalogOpen ? 'bg-primary text-white' : 'bg-primary text-white hover:brightness-110 active:scale-95'
              }`}
            >
              <span className="material-symbols-outlined font-bold text-[22px]">
                {isCatalogOpen ? 'close' : 'menu'}
              </span>
              <span className="tracking-wide hidden lg:inline">Kataloq</span>
            </button>
            <CategoryDropdown isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
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
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Desktop: Elan yerləşdir (Always visible on sm+) */}
          <Link href={isAuthenticated ? ROUTES.CREATE_LISTING : ROUTES.LOGIN} className="hidden sm:block">
            <button className="flex cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-primary text-white text-[14px] font-bold leading-normal hover:bg-primary-dark transition-colors shadow-sm whitespace-nowrap">
              <span className="material-symbols-outlined !text-[20px] mr-1.5">add_circle</span>
              <span className="hidden lg:inline">Elan yerləşdir</span>
              <span className="lg:hidden">Yeni elan</span>
            </button>
          </Link>

          {isAuthenticated ? (
            <>
              {/* Favorites - visible on sm+ on desktop */}

              {/* Favorites - visible on sm+ on desktop */}
              <Link href={ROUTES.FAVORITES} className="hidden md:flex">
                <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 bg-gray-100 text-gray-600 gap-2 text-sm font-bold leading-normal min-w-0 px-2.5 hover:bg-gray-200 transition-colors">
                  <span className="material-symbols-outlined !text-[20px]">favorite</span>
                </button>
              </Link>

              {/* Messages */}
              <Link href={ROUTES.MESSAGES} className="hidden md:flex">
                <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 bg-gray-100 text-gray-600 gap-2 text-sm font-bold leading-normal min-w-0 px-2.5 hover:bg-gray-200 transition-colors">
                  <span className="material-symbols-outlined !text-[20px]">chat_bubble</span>
                </button>
              </Link>

              {/* Avatar */}
              <Link href={ROUTES.PROFILE}>
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 bg-gray-100 border border-gray-200 hover:ring-2 hover:ring-primary transition-all cursor-pointer flex items-center justify-center overflow-hidden"
                  style={user?.profilePhoto ? { backgroundImage: `url("${getImageUrl(user.profilePhoto)}")` } : {}}
                >
                  {!user?.profilePhoto && (
                    <span className="material-symbols-outlined text-gray-400 !text-[20px]">person</span>
                  )}
                </div>
              </Link>
            </>
          ) : (
            <>
              {/* Desktop Daxil ol */}
              <Link href={ROUTES.LOGIN} className="hidden sm:block">
                <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-5 bg-primary text-white text-[14px] font-bold leading-normal hover:bg-primary-dark transition-colors shadow-sm">
                  Daxil ol
                </button>
              </Link>
              {/* Mobile - just person icon */}
              <Link href={ROUTES.LOGIN} className="sm:hidden">
                <button className="flex cursor-pointer items-center justify-center rounded-xl h-10 w-10 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                  <span className="material-symbols-outlined !text-[22px]">person</span>
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ─── Mobile Search Row ─── */}
      <div className="md:hidden px-3 pb-3">
        <SearchAutocomplete
          placeholder="Əşya və ya xidmət axtarışı"
          buttonLabel={<span className="material-symbols-outlined" style={{fontSize:'20px'}}>search</span>}
        />
        {/* Mobile CategoryDropdown */}
        <CategoryDropdown isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
      </div>
    </header>

  );
}
