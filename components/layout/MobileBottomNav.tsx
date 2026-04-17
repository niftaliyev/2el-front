'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useScrollDirection } from '@/hooks/useScrollDirection';

const NAV_ITEMS = [
  { key: 'home', icon: 'home', label: 'Əsas', authDest: ROUTES.HOME },
  { key: 'favs', icon: 'favorite', label: 'Seçilmişlər', authDest: ROUTES.FAVORITES, guestDest: ROUTES.FAVORITES },
  { key: 'center', icon: null, label: null, authDest: ROUTES.CREATE_LISTING, guestDest: ROUTES.LOGIN },
  { key: 'messages', icon: 'chat_bubble', label: 'Mesajlar', authDest: ROUTES.MESSAGES, guestDest: ROUTES.LOGIN },
  { key: 'cabinet', icon: 'person', label: 'Kabinet', authDest: ROUTES.PROFILE, guestDest: ROUTES.LOGIN },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const isVisible = useScrollDirection();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';

    // Exact match check first
    if (pathname === href) return true;

    // Special handling for Cabinet to not highlight when on Messages or Favorites
    if (href === ROUTES.PROFILE) {
      const isSubNav = pathname.startsWith(ROUTES.MESSAGES) || pathname.startsWith(ROUTES.FAVORITES);
      return pathname.startsWith(ROUTES.PROFILE) && !isSubNav;
    }

    return pathname.startsWith(href);
  };

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-[150%]'}`}
      style={{ paddingBottom: 'max(9px, env(safe-area-inset-bottom))' }}>
      <div className="flex items-stretch h-[54px]">
        {NAV_ITEMS.map((item) => {
          const href = isAuthenticated
            ? item.authDest
            : (item.guestDest ?? item.authDest);

          /* ── Mərkəz "Elan yarat" düyməsi ── */
          if (item.key === 'center') {
            return (
              <div key="center" className="flex-1 flex flex-col items-center justify-center relative">
                <Link
                  href={href}
                  className="flex flex-col items-center group touch-none"
                  aria-label="Yeni elan"
                >
                  <div className="w-[48px] h-[48px] -mt-7 rounded-full bg-gradient-to-br from-primary to-[#4d62c9] flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-transform border-4 border-white">
                    <span className="material-symbols-outlined !text-[24px] text-white" style={{ fontVariationSettings: "'wght' 600" }}>
                      add
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium mt-1">Elan yarat</span>
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
              className={`flex-1 flex flex-col items-center justify-center gap-[2px] h-full transition-all active:scale-95 ${active ? 'text-primary' : 'text-gray-400'
                }`}
            >
              <div className="relative">
                <span
                  className={`material-symbols-outlined !text-[24px] transition-all ${active ? 'fill' : ''}`}
                  style={{ fontVariationSettings: active ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400" }}
                >
                  {item.icon}
                </span>
              </div>
              <span className={`text-[10px] font-medium transition-colors ${active ? 'text-primary' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
