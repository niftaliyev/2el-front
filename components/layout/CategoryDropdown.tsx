'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { CATEGORIES, ROUTES } from '@/constants';
import { Category } from '@/types';
import { adService } from '@/services/ad.service';
import { generateSlug } from '@/lib/utils';

const ICONS: Record<string, string> = {
  'Elektronika': 'devices',
  'Nəqliyyat': 'directions_car',
  'Ev və bağ üçün': 'chair',
  'Ehtiyat hissələri və aksesuarlar (avto)': 'build',
  'Daşınmaz əmlak': 'home',
  'Xidmətlər və biznes': 'home_repair_service',
  'Şəxsi əşyalar': 'watch',
  'Hobbi və asudə': 'sports_esports',
  'Uşaq aləmi': 'stroller',
  'Heyvanlar': 'pets',
  'İş elanları': 'work',
  'Məktəblilər üçün': 'school',
  'Mağazalar': 'store',
};

interface CategoryDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryDropdown({ isOpen, onClose }: CategoryDropdownProps) {
  const [categories, setCategories] = useState<any[]>([...CATEGORIES]);
  const [activeMain, setActiveMain] = useState<any>(null);
  const [activeSub, setActiveSub] = useState<any>(null);
  const [subCategoriesForActive, setSubCategoriesForActive] = useState<any[]>([]);
  const [isLoadingSub, setIsLoadingSub] = useState(false);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const tree = await adService.getCategoryTree();
        if (tree && tree.length > 0) {
          const dynamicTree = tree.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: generateSlug(cat.name),
            icon: ICONS[cat.name] || 'category',
            description: '',
            children: cat.children?.map(c => ({
              id: c.id,
              name: c.name,
              slug: generateSlug(c.name)
            })) || []
          }));
          setCategories(dynamicTree);
          if (!activeMain) setActiveMain(dynamicTree[0]);
        }
      } catch (e) { }
    };
    fetchTree();
  }, []);

  const handleActiveSubChange = async (sub: any) => {
    setActiveSub(sub);
    setIsLoadingSub(true);
    try {
      const data = await adService.getSubCategories(sub.id);
      if (data && data.length > 0) {
        setSubCategoriesForActive(data.map((d: any) => ({
          id: d.id,
          name: d.name,
          slug: generateSlug(d.name)
        })));
      } else {
        setSubCategoriesForActive([]);
      }
    } catch (e) {
      setSubCategoriesForActive([]);
    } finally {
      setIsLoadingSub(false);
    }
  };

  // Reset states when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      if (categories.length > 0) setActiveMain(categories[0]);
      setActiveSub(null);
      setSubCategoriesForActive([]);
    }
  }, [isOpen, categories]);

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* ==================== MOBILE VIEW ==================== */}
      <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-700">close</span>
          </button>
          <h2 className="text-lg font-bold text-gray-900">Kataloq</h2>
          <div className="size-10" /> {/* Spacer for centering */}
        </div>

        {/* Mobile Category List */}
        <div className="flex-1 overflow-y-auto">
          {categories.map((category: any) => (
            <Link
              key={category.id}
              href={ROUTES.CATEGORY(category.slug)}
              className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              {/* Icon */}
              <div className="flex items-center justify-center size-12 rounded-xl bg-gray-100 flex-shrink-0">
                <span className="material-symbols-outlined text-gray-500 text-[24px]">
                  {category.icon}
                </span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-gray-900 leading-tight">
                  {category.name}
                </p>
                {category.description && (
                  <p className="text-[13px] text-gray-400 leading-tight mt-0.5 truncate">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Chevron */}
              <span className="material-symbols-outlined text-gray-300 text-[20px] flex-shrink-0">
                chevron_right
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ==================== DESKTOP VIEW ==================== */}
      {/* Backdrop */}
      <div
        className="hidden lg:block fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Desktop Dropdown */}
      <div className="hidden lg:flex absolute top-full left-0 mt-3 w-screen max-w-6xl bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden h-[500px]">

        {/* Column 1: Main Categories */}
        <div className="w-[280px] border-r border-gray-100 overflow-y-auto bg-gray-50/50">
          <div className="py-2">
            {categories.map((category: any) => (
              <div
                key={category.id}
                onMouseEnter={() => {
                  setActiveMain(category);
                  setActiveSub(null);
                }}
                className={`group flex items-center justify-between px-6 py-3 cursor-pointer transition-colors ${activeMain?.id === category.id ? 'bg-white text-primary' : 'text-gray-700 hover:bg-white hover:text-primary'
                  }`}
              >
                <Link
                  href={ROUTES.CATEGORY(category.slug)}
                  className="flex items-center gap-4"
                  onClick={onClose}
                >
                  <span className={`material-symbols-outlined text-[20px] ${activeMain?.id === category.id ? 'text-primary' : 'text-gray-400 group-hover:text-primary'
                    }`}>
                    {category.icon}
                  </span>
                  <span className="text-[15px] font-semibold leading-tight">
                    {category.name}
                  </span>
                </Link>
                <span className="material-symbols-outlined text-[18px] text-gray-300">
                  chevron_right
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Sub-categories */}
        <div className="w-[300px] border-r border-gray-100 overflow-y-auto">
          {activeMain?.children && (
            <div className="py-2">
              {activeMain.children.map((sub: any) => (
                <div
                  key={sub.id}
                  onMouseEnter={() => handleActiveSubChange(sub)}
                  className={`group flex items-center justify-between px-6 py-3 cursor-pointer transition-colors ${activeSub?.id === sub.id ? 'bg-gray-50 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                    }`}
                >
                  <Link
                    href={ROUTES.SUBCATEGORY(activeMain?.slug, sub.slug)}
                    className="text-[14px] font-medium"
                    onClick={onClose}
                  >
                    {sub.name}
                  </Link>
                  {sub.children && (
                    <span className="material-symbols-outlined text-[16px] text-gray-300">
                      chevron_right
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 3: Detailed Items */}
        <div className="flex-1 overflow-y-auto bg-white p-6">
          {isLoadingSub ? (
            <div className="h-full flex flex-col justify-center items-center p-8">
              <span className="material-symbols-outlined text-3xl animate-spin text-primary">progress_activity</span>
            </div>
          ) : subCategoriesForActive && subCategoriesForActive.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {subCategoriesForActive.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/elanlar/${activeMain?.slug}/${activeSub?.slug}/${item.slug}`}
                  className="px-4 py-2 text-[14px] text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          ) : activeMain?.children && !activeSub ? (
            <div className="h-full flex flex-col justify-center items-center text-center text-gray-400 p-8">
              <span className="material-symbols-outlined text-5xl mb-4 opacity-20">
                category
              </span>
              <p className="text-sm font-medium">Alt kateqoriya seçin</p>
            </div>
          ) : activeSub && subCategoriesForActive.length === 0 ? (
            <div className="grid grid-cols-1 gap-4">
              <Link
                href={ROUTES.SUBCATEGORY(activeMain?.slug, activeSub.slug)}
                className="text-lg font-bold text-gray-900 hover:text-primary transition-colors flex items-center gap-2"
                onClick={onClose}
              >
                {activeSub.name} bölməsinə keç
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <div className="h-[2px] w-12 bg-primary rounded-full" />
              <p className="text-sm text-gray-500">
                Bu bölmədəki bütün elanları görmək üçün yuxarıdakı keçidə klikləyin.
              </p>
            </div>
          ) : null}
        </div>

      </div>
    </>
  );
}
