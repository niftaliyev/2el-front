'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV_ITEMS } from '@/constants';

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="flex h-full flex-col rounded-xl bg-white shadow-sm border border-gray-200 p-6">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-12 bg-primary/10 rounded-full">
              <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <h2 className="text-gray-900 text-base font-bold">Admin Panel</h2>
              <p className="text-gray-500 text-sm">İdarəetmə paneli</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {ADMIN_NAV_ITEMS.map((item) => {
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
                  style={item.filled && isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <p className={`text-sm leading-normal ${
                  isActive ? 'text-primary font-bold' : 'text-gray-900 font-medium'
                }`}>
                  {item.label}
                </p>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full"
          >
            <span className="material-symbols-outlined text-gray-600">arrow_back</span>
            <p className="text-gray-900 text-sm font-medium">Sayta qayıt</p>
          </Link>
        </div>
      </div>
    </aside>
  );
}
