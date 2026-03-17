'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  // Mock user data - replace with actual user data from context/API
  const user = {
    name: 'İstifadəçi Adı',
    email: 'istifadeci@email.com',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9h-XmVJv6N25dPs8zT8pri_Ur0Um5gDYqnDIF31Uehc_Csxkdog8jdZQxy2Klbty1deZ-l3MRyd3N_yEz0aqPsNbFYksypbKUHRgyL5w82hnkJCjHbyX5paO56i3kj1vRYDSdAfIlgaqInGlqrNGhDNhGV00D2BGn6TKaJuDds2s-DK3UlcBGDNoUSzRespVXdXSkut4Ib9pFWVutQHDlGsZUPJNBwB5Qzkrfs_8isy3B55TWNeJdyyqErZJ7EoCwXi3UwVK4WnE'
  };

  const handleLogout = () => {
    // Implement logout functionality
    console.log('Logging out...');
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="flex h-full flex-col justify-between rounded-xl bg-white shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12"
              style={{ backgroundImage: `url("${user.avatar}")` }}
              role="img"
              aria-label={user.name}
            />
            <div className="flex flex-col">
              <h1 className="text-gray-900 text-base font-medium leading-normal">
                {user.name}
              </h1>
              <p className="text-gray-500 text-sm font-normal leading-normal">
                {user.email}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-2 pt-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined ${
                      isActive ? 'text-primary' : 'text-gray-600'
                    }`}
                    style={item.filled && isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <p className={`text-sm leading-normal ${
                    isActive
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
  );
}
