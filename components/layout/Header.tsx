'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ROUTES } from '@/constants';
import { getImageUrl } from '@/lib/utils';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { toast } from 'sonner';
import BurgerMenu from './BurgerMenu';
import CategoryDropdown from './CategoryDropdown';
import SearchAutocomplete from '@/components/features/search/SearchAutocomplete';
import NotificationBell from './NotificationBell';
import { chatService } from '@/services/chat.service';

export default function Header() {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const isVisible = useScrollDirection();
  const { t } = useLanguage();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAdFavorite, setIsAdFavorite] = useState(false);

  const isHome = pathname === '/';
  const isCabinet = pathname.startsWith('/cabinet');
  const isShops = pathname === '/shops' || pathname.startsWith('/shops/');
  const isShopsMain = pathname === '/shops';

  const lastSegment = pathname.split('/').pop() || '';
  const isAdDetail = 
    (pathname.includes('/elanlar/') && (/(?:^|-)[0-9]{5,}$/.test(lastSegment) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment))) || 
    pathname.startsWith('/products/');
  const showShare = isAdDetail;

  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: url,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error(t('product.shareError'));
        }
      }
    } else {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(url);
          toast.success(t('product.linkCopied'));
        } catch (error) {
          console.error('Error copying to clipboard:', error);
        }
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadMessagesCount(0);
      return;
    }

    const handleUpdate = (count: number) => {
      setUnreadMessagesCount(count);
    };

    const setupChatNotifications = async () => {
      try {
        // Initial fetch
        const count = await chatService.getTotalUnreadCount();
        setUnreadMessagesCount(count);

        // Start SignalR
        await chatService.startConnection();

        // Listen for updates
        chatService.onUnreadCountUpdate(handleUpdate);
      } catch (err) {
        console.error('Error setting up chat notifications:', err);
      }
    };

    setupChatNotifications();

    // Reset count locally when on messages page
    if (pathname.startsWith(ROUTES.MESSAGES)) {
      setUnreadMessagesCount(0);
    }

    return () => {
      chatService.off('UpdateUnreadCount', handleUpdate);
    };
  }, [isAuthenticated, pathname]);

  // Profile dropdown click outside handler
  useEffect(() => {
    if (!isProfileDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const container = document.getElementById('profile-dropdown-container');
      if (container && !container.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Close profile dropdown on path change
  useEffect(() => {
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  // Sync ad favorite status with the page component
  useEffect(() => {
    const handleStatusChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsAdFavorite(customEvent.detail.isFavorite);
    };
    window.addEventListener('ad-favorite-status', handleStatusChange);
    
    // Request initial status when Header mounts or path changes
    window.dispatchEvent(new CustomEvent('request-ad-favorite-status'));

    return () => {
      window.removeEventListener('ad-favorite-status', handleStatusChange);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t('cabinet.logoutSuccess') || 'Uğurla çıxış edildi');
      router.push(ROUTES.HOME);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    let number = cleaned;
    if (number.startsWith('994') && number.length === 12) {
      number = number.slice(3);
    }
    if (number.length === 9) {
      return `(0${number.slice(0, 2)}) ${number.slice(2, 5)}-${number.slice(5, 7)}-${number.slice(7, 9)}`;
    }
    if (number.length === 10 && number.startsWith('0')) {
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6, 8)}-${number.slice(8, 10)}`;
    }
    return phone;
  };

  return (
    <>
      <header className={`w-full bg-white border-b border-solid border-gray-200 sticky top-0 z-[100] transition-transform duration-300 ease-in-out md:transform-none ${isVisible || isCatalogOpen ? 'transform-none' : '-translate-y-full'} ${isCabinet ? 'hidden md:block' : ''}`}>
        {/* ─── Main Row ─── */}
        <div className={`flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 gap-3 ${isShops ? 'relative md:static' : ''}`}>

          {/* Left: back button (mobile) + burger + logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {!isHome && !isShopsMain && (
              <button
                onClick={() => router.back()}
                className="flex md:hidden items-center justify-center size-9 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined !text-[24px]">chevron_left</span>
              </button>
            )}

            <BurgerMenu />

            <Link href={ROUTES.HOME} className={`flex items-center gap-1.5 sm:gap-2 cursor-pointer group ${isShops ? 'absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0' : ''}`}>
              <div className="size-6 sm:size-7 text-primary flex-shrink-0 transition-transform group-hover:scale-110">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
                </svg>
              </div>
              <span className="text-gray-900 text-[18px] sm:text-[21px] font-black leading-tight tracking-tight block">
                2El<span className="text-primary">.az</span>
              </span>
            </Link>
          </div>

          {/* Center: Katalog + Search (desktop) */}
          <div className="hidden lg:flex flex-1 items-center gap-3 max-w-2xl mx-4">
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
                <span className="tracking-wide hidden lg:inline">{t('nav.catalog')}</span>
              </button>
            </div>

            {/* Search bar — SearchAutocomplete ilə əvəz edildi */}
            <div className="flex-1">
              <SearchAutocomplete
                placeholder={t('nav.searchPlaceholder')}
                buttonLabel={t('common.search')}
              />
            </div>
          </div>

          {/* Right side nav links - desktop only */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700 flex-shrink-0">
            <Link href={ROUTES.LISTINGS} className="hover:text-primary transition-colors whitespace-nowrap">
              {t('nav.allListings')}
            </Link>
            <Link href="/shops" className="hover:text-primary transition-colors whitespace-nowrap">
              {t('nav.shops')}
            </Link>
          </div>

          {/* Right side: action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Desktop: Elan yerləşdir (Always visible on sm+) */}
            <Link href={isAuthenticated ? ROUTES.CREATE_LISTING : ROUTES.LOGIN} className="hidden sm:block">
              <button className="flex cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-primary text-white text-[14px] font-bold leading-normal hover:bg-primary-dark transition-colors shadow-sm whitespace-nowrap active:scale-95">
                <span className="material-symbols-outlined !text-[20px] mr-1.5">add_circle</span>
                <span className="hidden lg:inline">{t('nav.addListing')}</span>
                <span className="lg:hidden">{t('nav.newListing')}</span>
              </button>
            </Link>

            {/* Action Icons: Favorites & Messages & Notifications */}
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

              {/* Favorite Icon - only on ad detail pages on mobile */}
              {isAdDetail && (
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('toggle-favorite-ad'))}
                  className={`flex md:hidden cursor-pointer items-center justify-center rounded-xl h-9 w-9 transition-all active:scale-90 shadow-sm border ${
                    isAdFavorite
                      ? 'bg-red-50 text-red-500 border-red-100'
                      : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  <span className="material-symbols-outlined !text-[22px]" style={{ fontVariationSettings: isAdFavorite ? "'FILL' 1" : "'FILL' 0" }}>
                    favorite
                  </span>
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
                <button className="flex relative cursor-pointer items-center justify-center rounded-xl h-9 w-9 sm:h-10 sm:w-10 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all active:scale-90 shadow-sm border border-gray-100 sm:border-transparent">
                  <span className="material-symbols-outlined !text-[22px]">chat_bubble</span>
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 border-2 border-white animate-in zoom-in">
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </span>
                  )}
                </button>
              </Link>

              {/* Notification Bell */}
              <NotificationBell />
            </div>

            {/* Auth State: Profile or Login */}
            <div className="flex items-center">
              {isAuthenticated ? (
                <>
                  {/* Mobile Link */}
                  <Link href={ROUTES.PROFILE} className="md:hidden">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 bg-gray-50 border border-gray-200 hover:ring-2 hover:ring-primary transition-all cursor-pointer flex items-center justify-center overflow-hidden"
                      style={user?.profilePhoto ? { backgroundImage: `url("${getImageUrl(user.profilePhoto)}")` } : {}}
                    >
                      {!user?.profilePhoto && (
                        <span className="material-symbols-outlined text-gray-400 !text-[20px]">person</span>
                      )}
                    </div>
                  </Link>

                  {/* Desktop Dropdown */}
                  <div className="hidden md:block relative" id="profile-dropdown-container">
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className={`flex items-center gap-1 h-10 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer select-none active:scale-95 ${
                        isProfileDropdownOpen ? 'bg-gray-50 border-gray-300 ring-2 ring-primary/10' : ''
                      }`}
                    >
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-7 bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0"
                        style={user?.profilePhoto ? { backgroundImage: `url("${getImageUrl(user.profilePhoto)}")` } : {}}
                      >
                        {!user?.profilePhoto && (
                          <span className="material-symbols-outlined text-gray-400 !text-[16px]">person</span>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-gray-500 !text-[18px] transition-transform duration-200 select-none" style={{ transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        expand_more
                      </span>
                    </button>

                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 top-[calc(100%+8px)] z-[150] w-[290px] bg-white rounded-2xl border border-gray-200 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Profile Info Section */}
                        <div className="flex items-center gap-3 pb-3.5 border-b border-gray-100">
                          <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 bg-slate-100 border border-gray-150 flex items-center justify-center overflow-hidden flex-shrink-0"
                            style={user?.profilePhoto ? { backgroundImage: `url("${getImageUrl(user.profilePhoto)}")` } : {}}
                          >
                            {!user?.profilePhoto && (
                              <span className="material-symbols-outlined text-slate-400 !text-[26px]">person</span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h4 className="text-gray-900 text-[15px] font-black truncate leading-tight">
                              {formatPhoneNumber(user?.phoneNumber) || user?.email}
                            </h4>
                            <p className="text-gray-500 text-[11px] font-semibold mt-0.5 truncate max-w-[180px]" title={user?.fullName || ''}>
                              {user?.fullName || '-'}
                            </p>
                            {user?.balance !== undefined && (
                              <p className="text-primary text-[11px] font-bold mt-0.5">
                                {t('cabinet.balanceShort') || 'Şəxsi Hesab'}: {user.balance.toFixed(2)} ₼
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex flex-col gap-1 mt-2.5">
                          <Link
                            href={ROUTES.PROFILE}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[14.5px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all"
                          >
                            <span className="material-symbols-outlined text-gray-400 !text-[20px]">list_alt</span>
                            <span>{t('cabinet.myListings')}</span>
                          </Link>
                          
                          <Link
                            href="/cabinet/payments"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[14.5px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all"
                          >
                            <span className="material-symbols-outlined text-gray-400 !text-[20px]">account_balance_wallet</span>
                            <span>{t('cabinet.nav.payments')}</span>
                          </Link>

                          <Link
                            href={ROUTES.FAVORITES}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[14.5px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all"
                          >
                            <span className="material-symbols-outlined text-gray-400 !text-[20px]">favorite</span>
                            <span>{t('cabinet.favorites.title')}</span>
                          </Link>

                          <div className="h-px bg-gray-100 my-1.5" />

                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[14.5px] font-semibold text-red-500 hover:bg-red-50 transition-all w-full text-left border-0 bg-transparent cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-red-400 !text-[20px]">logout</span>
                            <span>{t('cabinet.logout')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href={ROUTES.LOGIN} className="hidden sm:block">
                    <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-5 bg-primary text-white text-[14px] font-bold leading-normal hover:bg-primary-dark transition-colors shadow-sm active:scale-95">
                      {t('nav.login')}
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
        {!isShops && !isAdDetail && (
          <div className="lg:hidden px-3 pb-2">
            <SearchAutocomplete
              placeholder={t('nav.searchPlaceholder')}
              buttonLabel={<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>}
            />
          </div>
        )}
      </header>
      <CategoryDropdown isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
    </>
  );
}
