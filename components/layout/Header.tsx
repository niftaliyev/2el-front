'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = ROUTES.HOME;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="w-full bg-white border-b border-solid border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between whitespace-nowrap px-4 sm:px-10 py-3">
        <div className="flex items-center gap-8">
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
          <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-gray-500 flex border-none bg-gray-100 items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 focus:outline-0 focus:ring-0 border-none bg-gray-100 focus:border-none h-full placeholder:text-gray-500 px-4 pl-2 text-base font-normal leading-normal"
                placeholder="Axtarış"
              />
            </div>
          </label>
        </div>

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

            {/* Mobile menu button */}
            <button
              className="lg:hidden flex items-center justify-center rounded-lg h-10 px-2.5 bg-gray-100 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="material-symbols-outlined">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>

          {isAuthenticated && (
            <Link href={ROUTES.PROFILE}>
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gray-300 hover:ring-2 hover:ring-primary transition-all cursor-pointer" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-3">
              <Link href={ROUTES.LISTINGS} className="text-gray-900 hover:text-primary transition-colors py-2">
                Bütün elanlar
              </Link>
              <Link href="/stores" className="text-gray-900 hover:text-primary transition-colors py-2">
                Mağazalar
              </Link>
              <Link href="#" className="text-gray-900 hover:text-primary transition-colors py-2">
                Yardım
              </Link>
              <Link href={ROUTES.FAVORITES} className="text-gray-900 hover:text-primary transition-colors py-2 sm:hidden">
                Favoritlər
              </Link>
              <Link href={ROUTES.MESSAGES} className="text-gray-900 hover:text-primary transition-colors py-2 sm:hidden">
                Bildirişlər
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
