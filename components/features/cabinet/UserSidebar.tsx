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
  { href: '/cabinet/notifications', icon: 'notifications', labelKey: 'cabinet.nav.notifications' },
  { href: '/cabinet/settings', icon: 'settings', labelKey: 'cabinet.nav.settings' },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const { user: authUser, logout } = useAuth();
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language } = useLanguage();

  // Use auth user data if available, fallback to defaults
  const user = {
    name: authUser?.fullName || (authUser ? t('cabinet.userNameFallback') : t('cabinet.guest')),
    email: authUser?.email || (authUser ? 'istifadeci@email.com' : t('cabinet.notLoggedIn')),
    avatar: authUser?.profilePhoto ? getImageUrl(authUser.profilePhoto) : null,
    balance: authUser?.balance || 0,
  };

  const isAuthenticated = !!authUser;

  const isAdminOrModerator = authUser?.roles?.some(role =>
    ['SuperAdmin', 'Admin', 'Moderator'].includes(role)
  );

  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://13.140.173.54:3002';
  const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')) : '';
  const refreshToken = typeof window !== 'undefined' ? (localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')) : '';

  const adminAutoLoginUrl = token && refreshToken
    ? `${adminUrl}/autologin?token=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refreshToken)}`
    : `${adminUrl}/signin`;

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = ROUTES.HOME;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isMainCabinet = pathname === '/cabinet';

  return (
    <>
      {/* Mobile Profile Summary & Balance Card for Main Cabinet Page */}
      {isMainCabinet && (
        <div className="lg:hidden w-full flex flex-col gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 flex items-center justify-center bg-gray-100 flex-shrink-0 ${!user.avatar ? 'border border-gray-200' : ''}`}
                style={user.avatar ? { backgroundImage: `url("${user.avatar}")` } : {}}
                role="img"
                aria-label={user.name}
              >
                {!user.avatar && (
                  <span className="material-symbols-outlined text-gray-400">person</span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-gray-900 text-[15px] font-black flex items-center gap-2">
                  <span className="truncate max-w-[160px]">{user.name}</span>
                  {isAuthenticated && (
                    <Link href="/cabinet/settings?edit=profile" className="text-gray-400 hover:text-primary transition-colors flex items-center p-0.5 hover:bg-gray-50 rounded-md">
                      <span className="material-symbols-outlined !text-[18px]">edit</span>
                    </Link>
                  )}
                </h3>
                {isAuthenticated && (
                  <p className="text-gray-500 text-[10px] font-bold truncate max-w-[180px] mt-0.5">
                    {user.email}
                  </p>
                )}
                {isAuthenticated && (authUser as any).createdDate && (
                  <p className="text-gray-500 text-[9px] font-bold mt-0.5">
                    {new Date((authUser as any).createdDate).toLocaleDateString(language === 'az' ? 'az-AZ' : 'ru-RU')} tarixindən 2El.az-da
                  </p>
                )}
              </div>
            </div>

            {/* Mobile Actions Container (Gear + Admin) */}
            {isAuthenticated && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isAdminOrModerator && (
                  <a
                    href={adminAutoLoginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center p-2 rounded-xl shadow-md border border-violet-100 cursor-pointer animate-in zoom-in duration-200"
                    title={t('cabinet.nav.adminPanel') || 'Admin Panel'}
                  >
                    <span className="material-symbols-outlined !text-[20px] text-white">
                      admin_panel_settings
                    </span>
                  </a>
                )}
                <Link href="/cabinet/settings" className="text-gray-500 hover:text-primary transition-colors flex items-center justify-center p-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 active:scale-95 duration-200">
                  <span className="material-symbols-outlined !text-[20px]">settings</span>
                </Link>
              </div>
            )}
          </div>

          {/* Balance card */}
          {isAuthenticated && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mt-2">
              <div className="flex flex-col min-w-0">
                <span className="text-gray-500 text-[10px] font-black tracking-wider mb-0.5">{t('cabinet.balanceShort') || 'Şəxsi Hesab'}</span>
                <span className="text-gray-900 text-lg font-extrabold whitespace-nowrap">
                  {user.balance.toFixed(2)} <span className="text-sm font-medium text-gray-400">₼</span>
                </span>
              </div>
              <button
                onClick={() => setIsTopUpModalOpen(true)}
                className="px-4 h-9 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md hover:brightness-110 transition-all active:scale-95 border-0"
              >
                <span className="material-symbols-outlined !text-[14px]">add</span>
                <span>{t('cabinet.topUp') || 'Artır'}</span>
              </button>
            </div>
          )}

          {/* Guest login banner */}
          {!isAuthenticated && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mt-2 text-center">
              <p className="text-gray-500 text-xs font-semibold mb-3">{t('cabinet.loginRegisterDesc') || 'Elanlarınızı idarə etmək və balansı artırmaq üçün daxil olun'}</p>
              <Link
                href={ROUTES.LOGIN}
                className="w-full flex items-center justify-center h-10 rounded-xl bg-primary text-white text-sm font-bold active:scale-95 shadow-md shadow-primary/10"
              >
                {t('cabinet.loginRegister') || 'Daxil ol / Qeydiyyat'}
              </Link>
            </div>
          )}

          {/* Shortcut actions grid for mobile */}
          {isAuthenticated && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Link href="/cabinet/transactions" className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-all text-center group">
                <span className="material-symbols-outlined text-gray-500 group-hover:text-primary transition-colors !text-[24px] mb-1">history</span>
                <span className="text-[10px] text-gray-700 font-bold leading-tight">{t('cabinet.nav.transactions') || 'Əməliyyatlar'}</span>
              </Link>
              <Link href="/cabinet/ad-placement-limits" className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-all text-center group">
                <span className="material-symbols-outlined text-gray-500 group-hover:text-primary transition-colors !text-[24px] mb-1">bar_chart_4_bars</span>
                <span className="text-[10px] text-gray-700 font-bold leading-tight">{t('cabinet.nav.limits') || 'Limitlər'}</span>
              </Link>
              <Link href="/cabinet/payments" className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-all text-center group">
                <span className="material-symbols-outlined text-gray-500 group-hover:text-primary transition-colors !text-[24px] mb-1">account_balance_wallet</span>
                <span className="text-[10px] text-gray-700 font-bold leading-tight">{t('cabinet.nav.payments') || 'Ödənişlər'}</span>
              </Link>
            </div>
          )}

          {/* Settings & Sub-pages list transitions (excluding duplicates and messages) - Collapsible */}
          {isAuthenticated && (
            <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden mt-3 animate-in fade-in duration-300">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100/50 transition-colors text-left border-0 bg-transparent cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-gray-400 !text-[20px]">widgets</span>
                  <span className="text-xs font-bold text-gray-800">{t('cabinet.nav.otherSections') || 'Digər Bölmələr'}</span>
                </div>
                <span className={`material-symbols-outlined text-gray-400 !text-[18px] transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>

              {isMobileMenuOpen && (
                <div className="divide-y divide-gray-100/70 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Link
                    href="/cabinet/invoices"
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-gray-400 !text-[20px]">receipt_long</span>
                      <span className="text-xs font-bold text-gray-800">{t('cabinet.nav.invoices') || 'Ödənişlər'}</span>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 !text-[16px]">chevron_right</span>
                  </Link>

                  {((authUser as any)?.userType?.toString().toLowerCase() === 'store' ||
                    (authUser as any)?.userType?.toString() === '1' ||
                    (authUser as any)?.hasStore === true) && (
                      <Link
                        href="/cabinet/business"
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-gray-400 !text-[20px]">domain</span>
                          <span className="text-xs font-bold text-gray-800">{t('cabinet.nav.business') || 'Biznes Kabineti'}</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-400 !text-[16px]">chevron_right</span>
                      </Link>
                    )}

                  <Link
                    href="/cabinet/notifications"
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-gray-400 !text-[20px]">notifications</span>
                      <span className="text-xs font-bold text-gray-800">{t('cabinet.nav.notifications') || 'Bildirişlər'}</span>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 !text-[16px]">chevron_right</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:block w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24">
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
                    <span className="text-gray-500 text-[10px] font-semibold tracking-wider mb-0.5">{t('cabinet.balanceShort')}</span>
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

          {/* Admin Panel Link */}
          {isAdminOrModerator && (
            <div className="lg:border-t lg:border-gray-100 lg:pt-4 mt-2">
              <a
                href={adminAutoLoginUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-row items-center justify-center lg:justify-start gap-3 px-4 py-3 lg:py-2.5 rounded-xl transition-all bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-indigo-100 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-full"
              >
                <span className="material-symbols-outlined !text-[22px] text-white">
                  admin_panel_settings
                </span>
                <p className="text-sm font-bold text-center lg:text-left leading-tight text-white">
                  {t('cabinet.nav.adminPanel')}
                </p>
              </a>
            </div>
          )}

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
