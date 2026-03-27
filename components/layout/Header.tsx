'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/lib/utils';
import CategoryDropdown from './CategoryDropdown';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = ROUTES.HOME;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `${ROUTES.LISTINGS}?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="w-full bg-white border-b border-solid border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between whitespace-nowrap px-4 sm:px-10 py-3">
        
        {/* Left side */}
        <div className="flex items-center gap-3 sm:gap-8">
          {/* Mobile hamburger - opens catalog on mobile */}
          <button
            className="lg:hidden flex items-center justify-center rounded-lg size-10 text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsCatalogOpen(true)}
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-4 text-gray-900">
            <Link href={ROUTES.HOME} className="flex items-center gap-4">
              <div className="size-6 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
                </svg>
              </div>
              <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-[-0.015em]">Elan.az</h2>
            </Link>
          </div>

          {/* Desktop Katalog button */}
          <div className="relative hidden lg:block">
            <button 
              onClick={() => setIsCatalogOpen(!isCatalogOpen)}
              className={`flex items-center gap-2 px-5 h-12 rounded-xl font-black text-sm transition-all shadow-sm ${
                isCatalogOpen ? 'bg-primary text-white' : 'bg-primary text-white hover:brightness-110 active:scale-95'
              }`}
            >
              <span className="material-symbols-outlined font-bold text-[22px]">
                {isCatalogOpen ? 'close' : 'menu'}
              </span>
              <span className="tracking-wide">Kataloq</span>
            </button>
            <CategoryDropdown isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
          </div>

          {/* Mobile CategoryDropdown (rendered outside the hidden div) */}
          <div className="lg:hidden">
            <CategoryDropdown isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
          </div>

          {/* Desktop search bar */}
          <label className="hidden md:flex flex-col min-w-[300px] !h-12 max-w-[500px]">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full overflow-hidden border border-gray-100 shadow-sm">
              <div className="text-gray-400 flex bg-white items-center justify-center pl-4">
                <span className="material-symbols-outlined text-[22px]">search</span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-gray-900 focus:outline-0 focus:ring-0 border-none bg-white focus:border-none h-full placeholder:text-gray-400 px-4 pl-3 text-[15px] font-medium leading-normal"
                placeholder="Əşya və ya xidmət axtarışı"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button 
                onClick={handleSearch}
                className="bg-primary text-white px-6 font-bold text-sm hover:brightness-110 transition-all font-sans"
              >
                Tap
              </button>
            </div>
          </label>
        </div>

        {/* Right side */}
        <div className="flex flex-1 justify-end gap-4 md:gap-8">
          <div className="hidden lg:flex items-center gap-9">
            <Link href={ROUTES.LISTINGS} className="text-gray-900 text-sm font-medium leading-normal hover:text-primary transition-colors">
              Bütün elanlar
            </Link>
            <Link href="/stores" className="text-gray-900 text-sm font-medium leading-normal hover:text-primary transition-colors">
              Mağazalar
            </Link>
            <Link href="#" className="text-gray-900 text-sm font-medium leading-normal hover:text-primary transition-colors">
              Yardım
            </Link>
          </div>

          <div className="flex gap-2">
            {isAuthenticated ? (
              <>
                <Link href={ROUTES.CREATE_LISTING}>
                  <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-3 sm:px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary-dark transition-colors">
                    <span className="material-symbols-outlined sm:hidden">add</span>
                    <span className="hidden sm:inline truncate">Elan yerləşdir</span>
                  </button>
                </Link>
                <Link href={ROUTES.FAVORITES}>
                  <button className="hidden sm:flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-gray-100 text-gray-600 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-gray-200 transition-colors">
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                </Link>
                <Link href={ROUTES.MESSAGES}>
                  <button className="hidden sm:flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-gray-100 text-gray-600 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-gray-200 transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                  </button>
                </Link>
              </>
            ) : (
              <Link href={ROUTES.LOGIN}>
                <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-3 sm:px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary-dark transition-colors">
                  <span className="truncate">Daxil ol</span>
                </button>
              </Link>
            )}
          </div>

          {isAuthenticated && (
            <Link href={ROUTES.PROFILE}>
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gray-100 border border-gray-200 hover:ring-2 hover:ring-primary transition-all cursor-pointer flex items-center justify-center overflow-hidden"
                style={user?.profilePhoto ? { backgroundImage: `url("${getImageUrl(user.profilePhoto)}")` } : {}}
              >
                {!user?.profilePhoto && (
                  <span className="material-symbols-outlined text-gray-400">person</span>
                )}
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
