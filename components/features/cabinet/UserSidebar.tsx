'use client';

import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants';
import { useState } from 'react';
import TopUpBalanceModal from './TopUpBalanceModal';
import { useLanguage } from '@/contexts/LanguageContext';

interface NavItem {
  href: string;
  icon: string;
  labelKey: string;
  filled?: boolean;
}

const navItems: NavItem[] = [
  { href: '/cabinet', icon: 'list_alt', labelKey: 'cabinet.nav.listings', filled: true },
  { href: '/cabinet/transactions', icon: 'history', labelKey: 'cabinet.nav.transactions' },
  { href: '/cabinet/invoices', icon: 'receipt_long', labelKey: 'cabinet.nav.invoices' },
  { href: '/cabinet/payments', icon: 'account_balance_wallet', labelKey: 'cabinet.nav.payments' },
  { href: '/cabinet/business', icon: 'storefront', labelKey: 'cabinet.nav.business' },
  { href: '/cabinet/ad-placement-limits', icon: 'bar_chart_4_bars', labelKey: 'cabinet.nav.limits' },
  { href: '/cabinet/favorites', icon: 'favorite', labelKey: 'cabinet.nav.favorites' },
  { href: '/cabinet/messages', icon: 'chat_bubble', labelKey: 'cabinet.nav.messages' },
  { href: '/cabinet/settings', icon: 'settings', labelKey: 'cabinet.nav.settings' },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const { user: authUser, logout } = useAuth();
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const { t } = useLanguage();

  // Use auth user data if available, fallback to defaults
  const user = {
    name: authUser?.fullName || (authUser ? t('cabinet.userNameFallback') : t('cabinet.guest')),
    email: authUser?.email || (authUser ? 'istifadeci@email.com' : t('cabinet.notLoggedIn')),
    avatar: authUser?.profilePhoto ? getImageUrl(authUser.profilePhoto) : null,
    balance: authUser?.balance || 0,
  };

  const isAuthenticated = !!authUser;

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = ROUTES.HOME;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24">
        <div className="flex flex-col gap-4 lg:gap-6 bg-white shadow-sm border border-gray-200 p-4 lg:p-6 rounded-2xl">

          {/* User and Balance Section */}
          <div className="flex lg:flex-col items-center lg:items-stretch justify-between lg:justify-start gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className={`bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 lg:size-12 flex items-center justify-center bg-gray-100 flex-shrink-0 ${!user.avatar ? 'border border-gray-200' : ''}`}
                style={user.avatar ? { backgroundImage: `url("${user.avatar}")` } : {}}
                role="img"
                aria-label={user.name}
              >
                {!user.avatar && (
                  <span className="material-symbols-outlined text-gray-400">person</span>
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <h3 className="text-gray-900 text-sm lg:text-base font-bold truncate">
                  {user.name}
                </h3>
                <p className="text-gray-500 text-[10px] lg:text-xs truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex lg:flex flex-col lg:p-4 bg-gray-50 rounded-xl border border-gray-100 lg:mt-2 px-4 py-2 flex-shrink-0 text-right lg:text-left">
                  <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">{t('cabinet.balance')}</p>
                  <div className="flex items-center justify-end lg:justify-between gap-3">
                    <span className="text-gray-900 text-base lg:text-xl font-bold">{user.balance.toFixed(2)} <span className="text-[10px] lg:text-sm font-medium text-gray-400">₼</span></span>
                    <button
                      onClick={() => setIsTopUpModalOpen(true)}
                      className="size-7 lg:size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined !text-[18px] lg:!text-[20px]">add</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Balance Box */}
                <div className="sm:hidden flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex flex-col min-w-0">
                    <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-0.5">{t('cabinet.balanceShort')}</span>
                    <span className="text-gray-900 text-lg font-bold whitespace-nowrap">
                      {user.balance.toFixed(2)} <span className="text-sm font-medium text-gray-400">₼</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setIsTopUpModalOpen(true)}
                    className="px-3 h-8 rounded-lg bg-primary text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined !text-[14px]">add</span>
                    <span>{t('cabinet.topUp')}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex lg:flex flex-col gap-2 mt-2">
                <Link
                  href={ROUTES.LOGIN}
                  className="w-full flex items-center justify-center h-10 rounded-xl bg-primary text-white text-xs font-bold transition-all active:scale-95 shadow-lg shadow-primary/20"
                >
                  {t('cabinet.login')}
                </Link>
              </div>
            )}
          </div>

          {/* Guest Mobile Login Button */}
          {!isAuthenticated && (
            <div className="sm:hidden p-3 bg-gray-50 rounded-xl border border-gray-100">
              <Link
                href={ROUTES.LOGIN}
                className="w-full flex items-center justify-center h-10 rounded-xl bg-primary text-white text-sm font-bold active:scale-95"
              >
                {t('cabinet.loginRegister')}
              </Link>
            </div>
          )}

          {/* Navigation */}
          <div className="lg:border-t lg:border-gray-100 lg:pt-4">
            <nav className="grid grid-cols-3 sm:grid-cols-4 lg:flex lg:flex-col gap-2 lg:gap-1">
              {navItems.map((item) => {
                // Show "Biznes" only if user is a store owner or has an active store
                if (item.href === '/cabinet/business') {
                  const isStore = authUser?.userType?.toString().toLowerCase() === 'store' ||
                    authUser?.userType?.toString() === '1' ||
                    authUser?.hasStore === true;

                  if (!isStore) return null;
                }

                // Hide everything except favorites for guests
                if (!isAuthenticated && item.href !== '/cabinet/favorites') return null;

                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col lg:flex-row items-center lg:items-center gap-1.5 lg:gap-3 px-2 lg:px-4 py-3 lg:py-2.5 rounded-xl transition-all ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <span
                      className={`material-symbols-outlined !text-[22px] lg:!text-[22px] ${isActive ? 'text-primary' : 'text-gray-500'}`}
                      style={item.filled && isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400" } : undefined}
                    >
                      {item.icon}
                    </span>
                    <p className={`text-[10px] lg:text-sm font-medium text-center lg:text-left leading-tight ${isActive ? 'text-primary font-bold' : ''}`}>
                      {t(item.labelKey)}
                    </p>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Logout */}
          {isAuthenticated && (
            <>
              <div className="hidden lg:block border-t border-gray-100 pt-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all w-full text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <p className="text-sm font-medium">{t('cabinet.logout')}</p>
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="lg:hidden flex items-center justify-center size-10 rounded-xl bg-gray-50 text-gray-500 flex-shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </>
          )}
        </div>
      </aside>

      <TopUpBalanceModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
      />
    </>
  );
}
