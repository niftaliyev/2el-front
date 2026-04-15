'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { accountService } from '@/services/account.service';

export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<{ contactPhone?: string; email?: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch settings once
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await accountService.getCompanySettings();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching company settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-center rounded-xl size-10 text-primary hover:bg-primary/5 transition-all group relative"
      >
        <div className="flex flex-col gap-[5px] w-6 items-center justify-center">
          <span className={`block h-[2px] w-full bg-current rounded-full transition-all duration-300 transform origin-center ${isOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block h-[2px] w-full bg-current rounded-full transition-all duration-300 ${isOpen ? 'opacity-0 scale-0' : 'opacity-100'}`} />
          <span className={`block h-[2px] w-full bg-current rounded-full transition-all duration-300 transform origin-center ${isOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </div>
      </button>

      <div
        className={`absolute top-14 left-0 w-[calc(100vw-2rem)] sm:w-[700px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden transform origin-top-left transition-all duration-300 ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }`}
      >
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 p-8">
          {/* Column 1 */}
          <div className="flex flex-col gap-4">
            <Link href="/shops" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary font-medium transition-colors">
              Mağazalar
            </Link>
            <Link href="#" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary font-medium transition-colors">
              Yardım
            </Link>
            <Link href="/business" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary font-medium transition-colors flex items-center gap-2">
              Biznes <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Yeni</span>
            </Link>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-4">
            <Link href="#" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary font-medium transition-colors">
              Layihə haqqında
            </Link>
            <Link href="/pages/limits_by_category" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary font-medium transition-colors">
              Kateqoriyalar üzrə limitlər
            </Link>
            <Link href="#" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary font-medium transition-colors">
              İstifadəçi razılaşması
            </Link>
            <Link href="#" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary font-medium transition-colors">
              Məxfilik siyasəti
            </Link>
            <Link href="#" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary font-medium transition-colors">
              Reklam yerləşdirin
            </Link>
          </div>

          {/* Column 3 - Contact */}
          <div className="flex flex-col gap-4 sm:ml-auto">
            <button className="flex items-center gap-2 text-gray-700 hover:text-primary font-medium transition-colors w-fit">
              <span className="material-symbols-outlined !text-[20px]">language</span>
              Русский язык
            </button>
            <div className="mt-2 text-gray-400 text-sm">Bizimlə əlaqə</div>
            <a href={`tel:${settings?.contactPhone?.replace(/\D/g, '') || '0123456789'}`} className="text-gray-900 font-bold flex items-center gap-2 hover:text-primary transition-colors">
              <span className="material-symbols-outlined !text-[20px]">call</span>
              {settings?.contactPhone || '(012) 345-67-89'}
            </a>
            <a href={`mailto:${settings?.email || 'elan@elan.az'}`} className="text-gray-600 font-medium hover:text-primary transition-colors ml-7">
              {settings?.email || 'elan@elan.az'}
            </a>
            <div className="flex gap-4 mt-2 ml-7">
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined !text-[18px]">share</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
