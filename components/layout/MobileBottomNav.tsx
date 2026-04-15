'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { key: 'home', icon: 'home', label: 'Əsas', authDest: ROUTES.HOME },
  { key: 'favs', icon: 'favorite', label: 'Seçilmişlər', authDest: ROUTES.FAVORITES, guestDest: ROUTES.LOGIN },
  { key: 'center', icon: null, label: null, authDest: ROUTES.CREATE_LISTING, guestDest: ROUTES.LOGIN },
  { key: 'messages', icon: 'chat_bubble', label: 'Mesajlar', authDest: ROUTES.MESSAGES, guestDest: ROUTES.LOGIN },
  { key: 'cabinet', icon: 'person', label: 'Kabinet', authDest: ROUTES.PROFILE, guestDest: ROUTES.LOGIN },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center h-[54px]">
        {NAV_ITEMS.map((item) => {
          const href = isAuthenticated
            ? item.authDest
            : (item.guestDest ?? item.authDest);

          /* ── Mərkəz "Elan yarat" düyməsi ── */
          if (item.key === 'center') {
            return (
              <div key="center" className="flex-1 flex flex-col items-center justify-center">
                <Link
                  href={href}
                  className="flex flex-col items-center gap-0.5 group"
                  aria-label="Yeni elan"
                >
                  {/* Kiçik, yuvarlaq, gradient düymə */}
                  <div className="w-[46px] h-[46px] -mt-5 rounded-full bg-gradient-to-br from-primary to-[#4d62c9] flex items-center justify-center shadow-md shadow-primary/30 group-active:scale-95 transition-transform">
                    <span className="material-symbols-outlined !text-[22px] text-white" style={{ fontVariationSettings: "'wght' 600" }}>
                      add
                    </span>
                  </div>
                  <span className="text-[9.5px] text-gray-500 leading-none mt-0.5">Elan yarat</span>
                </Link>
              </div>
            );
          }

          /* ── Adi tab nişanı ── */
          const active = isActive(href);
          return (
            <Link
              key={item.key}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-[3px] h-full transition-colors ${active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <span
                className="material-symbols-outlined !text-[22px] leading-none"
                style={{ fontVariationSettings: active ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400" }}
              >
                {item.icon}
              </span>
              <span className="text-[9.5px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
