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

  // Prevent body scroll on mobile when menu is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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

      {/* Background Overlay (Mobile only) */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[-1] transition-opacity duration-300 sm:hidden cursor-pointer ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`absolute top-14 left-0 w-[calc(100vw-1.5rem)] sm:w-[800px] max-h-[85vh] sm:max-h-[calc(100vh-100px)] bg-white rounded-2xl sm:rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.15)] border border-slate-100 overflow-y-auto no-scrollbar transform origin-top-left transition-all duration-300 ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
          }`}
      >
        <div className="flex flex-col sm:flex-row gap-10 sm:gap-16 p-6 sm:p-10">
          {/* Column 1 */}
          <div className="flex flex-col gap-4 min-w-[150px]">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 sm:mb-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              Əsas
            </h4>
            <Link href="/shops" onClick={() => setIsOpen(false)} className="text-slate-700 hover:text-primary font-bold transition-all hover:translate-x-1 flex items-center gap-2">
              Mağazalar
            </Link>
            <Link href="/help" onClick={() => setIsOpen(false)} className="text-slate-700 hover:text-primary font-bold transition-all hover:translate-x-1 flex items-center gap-2">
              Yardım
            </Link>
            <Link href="/business" onClick={() => setIsOpen(false)} className="text-slate-700 hover:text-primary font-bold transition-all hover:translate-x-1 flex items-center gap-2 group">
              Biznes <span className="bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider group-hover:scale-110 transition-transform">Yeni</span>
            </Link>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-3.5 min-w-[200px]">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 sm:mb-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              Dəstək və Qaydalar
            </h4>
            {[
              { href: '/help/populyar-suallar', label: 'Top 10 sual' },
              { href: '/pages/limits_by_category', label: 'Kateqoriyalar üzrə limitlər' },
              { href: '/pages/packages', label: 'Ödənişli xidmətlər' },
              { href: '/pages/packages', label: 'Paketlər' },
              { href: '/pages/rules', label: 'Qaydalar' },
              { href: '/pages/terms-and-conditions', label: 'İstifadəçi razılaşması' },
              { href: '/pages/proposal', label: 'İctimai oferta' },
              { href: '/pages/privacy', label: 'Məxfilik siyasəti' },
              { href: '/pages/about', label: 'Haqqımızda' },
            ].map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-primary font-bold text-sm transition-all hover:translate-x-1"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Column 3 - Contact */}
          <div className="flex flex-col gap-6 sm:ml-auto">
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">DİL</h4>
              <button className="flex items-center gap-3 text-slate-700 hover:text-primary font-bold transition-all w-fit group cursor-pointer">
                <span className="material-symbols-outlined !text-[22px] group-hover:rotate-12 transition-transform">language</span>
                Русский язык
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">ƏLAQƏ</h4>
              <div className="flex flex-col gap-4">
                <a href={`tel:${settings?.contactPhone?.replace(/\D/g, '') || '0123456789'}`} className="text-slate-900 font-black text-lg flex items-center gap-3 hover:text-primary transition-all hover:translate-x-1">
                  <div className="size-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined !text-[18px]">call</span>
                  </div>
                  {settings?.contactPhone || '(012) 345-67-89'}
                </a>
                <a href={`mailto:${settings?.email || 'elan@elan.az'}`} className="text-slate-600 font-bold hover:text-primary transition-all flex items-center gap-3 hover:translate-x-1">
                  <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined !text-[18px]">mail</span>
                  </div>
                  {settings?.email || 'elan@elan.az'}
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 text-center sm:text-left">SOSİAL</h4>
              <div className="flex gap-3 justify-center sm:justify-start">
                <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined !text-[20px]">share</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
