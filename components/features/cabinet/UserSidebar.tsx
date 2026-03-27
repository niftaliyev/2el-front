'use client';

import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants';
import { useState } from 'react';
import TopUpBalanceModal from './TopUpBalanceModal';

interface NavItem {
  href: string;
  icon: string;
  label: string;
  filled?: boolean;
}

const navItems: NavItem[] = [
  { href: '/cabinet', icon: 'list_alt', label: 'Elanlarım', filled: true },
  { href: '/cabinet/favorites', icon: 'favorite', label: 'Seçilmiş Elanlar' },
  { href: '/cabinet/messages', icon: 'chat_bubble', label: 'Mesajlar' },
  { href: '/cabinet/settings', icon: 'settings', label: 'Parametrlər' },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const { user: authUser, logout } = useAuth();
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  // Use auth user data if available, fallback to defaults
  const user = {
    name: authUser?.fullName || 'İstifadəçi Adı',
    email: authUser?.email || 'istifadeci@email.com',
    avatar: authUser?.profilePhoto ? getImageUrl(authUser.profilePhoto) : null,
    balance: authUser?.balance || 0,
  };

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
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="flex h-full flex-col justify-between rounded-xl bg-white shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div
              className={`bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 flex items-center justify-center bg-gray-100 ${!user.avatar ? 'border border-gray-200' : ''}`}
              style={user.avatar ? { backgroundImage: `url("${user.avatar}")` } : {}}
              role="img"
              aria-label={user.name}
            >
              {!user.avatar && (
                <span className="material-symbols-outlined text-gray-400">person</span>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-gray-900 text-base font-medium leading-normal truncate">
                {user.name}
              </h1>
              <p className="text-gray-500 text-xs font-normal leading-normal truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Balance Section */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mt-2">
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-1">Cari Balans</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-900 text-xl font-black">{user.balance} <span className="text-sm font-bold text-gray-500">AZN</span></span>
              <button
                onClick={() => setIsTopUpModalOpen(true)}
                className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-all shadow-sm"
                title="Sürətli balans artırma"
              >
                <span className="material-symbols-outlined !text-[20px]">add</span>
              </button>
            </div>
            <button
               onClick={() => setIsTopUpModalOpen(true)}
               className="w-full mt-3 h-9 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined !text-[16px]">account_balance_wallet</span>
              <span>Balans Artır</span>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-2 pt-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <span
                    className={`material-symbols-outlined ${isActive ? 'text-primary' : 'text-gray-600'
                      }`}
                    style={item.filled && isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <p className={`text-sm leading-normal ${isActive
                      ? 'text-primary font-bold'
                      : 'text-gray-900 font-medium'
                    }`}>
                    {item.label}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Logout */}
        <div className="flex flex-col gap-1 mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined text-gray-600">
              logout
            </span>
            <p className="text-gray-900 text-sm font-medium leading-normal">
              Çıxış
            </p>
          </button>
        </div>
      </div>
    </aside>

    <TopUpBalanceModal
      isOpen={isTopUpModalOpen}
      onClose={() => setIsTopUpModalOpen(false)}
    />
    </>
  );
}
