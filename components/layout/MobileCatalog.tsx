'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { adService } from '@/services/ad.service';
import { generateSlug } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

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
  'Telefonlar': 'smartphone',
  'Məişət texnikası': 'local_laundry_service',
};

const LOCAL_IMAGES: Record<string, string> = {
  'Elektronika': '/category-images/elektronika_cat.png',
  'Nəqliyyat': '/category-images/neqliyyat_cat.png',
  'Ev və bağ üçün': '/category-images/ev_ve_bag_ucun_cat.png',
  'Daşınmaz əmlak': '/category-images/dasinmaz_emlak_cat.png',
  'Xidmətlər və biznes': '/category-images/xidmetler_ve_biznes_cat.png',
  'Şəxsi əşyalar': '/category-images/sexsi_esyalar_cat.png',
  'Hobbi və asudə': '/category-images/hobbi_ve_asude_cat.png',
  'Uşaq aləmi': '/category-images/usaq_alemi_cat.png',
  'Heyvanlar': '/category-images/heyvanlar_cat.png',
  'İş elanları': '/category-images/is_elanlari_cat.png',
  'Ehtiyat hissələri və aksesuarlar (avto)': '/category-images/ehtiyyat_hisseleri_ve_aksesuarlar_avto_cat.png',
  'Məktəblilər üçün': '/category-images/mektebliler_ucun_cat.png',
  'Telefonlar': '/category-images/telefonlar_cat.png',
  'Məişət texnikası': '/category-images/meiset_texnikasi_cat.png',
  'Mağazalar': '/category-images/magazalar.png'
};

export default function MobileCatalog() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<any | null>(null);
  const [isLoadingSub, setIsLoadingSub] = useState(false);

  // Fetch Category Tree from API on mount/language change
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const tree = await adService.getCategoryTree();
        if (tree && tree.length > 0) {
          const parentCategories = tree.map((cat: any) => {
            const displayName = language === 'ru' && cat.nameRu ? cat.nameRu : cat.name;
            return {
              id: cat.id,
              name: displayName,
              slug: generateSlug(cat.name),
              icon: ICONS[cat.name] || 'category',
              image: LOCAL_IMAGES[cat.name] || (cat.imageUrl ? cat.imageUrl : null),
              children: cat.children?.map((c: any) => ({
                id: c.id,
                name: language === 'ru' && c.nameRu ? c.nameRu : c.name,
                slug: generateSlug(c.name)
              })) || []
            };
          });

          const extraCategories: any[] = [];

          // 1. Telefonlar under Elektronika
          const electronics = tree.find((c: any) => c.name === 'Elektronika');
          const phones = electronics?.children?.find((c: any) => c.name === 'Telefonlar');
          if (electronics && phones) {
            extraCategories.push({
              id: phones.id,
              name: language === 'ru' && phones.nameRu ? phones.nameRu : phones.name,
              slug: `${generateSlug(electronics.name)}/${generateSlug(phones.name)}`,
              icon: 'smartphone',
              image: LOCAL_IMAGES['Telefonlar'] || null,
              children: [],
              hasDynamicSubCategories: true
            });
          }

          // 2. Məişət texnikası under Ev və bağ üçün
          const evVeBag = tree.find((c: any) => c.name === 'Ev və bağ üçün');
          const meiset = evVeBag?.children?.find((c: any) => c.name === 'Məişət texnikası');
          if (evVeBag && meiset) {
            extraCategories.push({
              id: meiset.id,
              name: language === 'ru' && meiset.nameRu ? meiset.nameRu : meiset.name,
              slug: `${generateSlug(evVeBag.name)}/${generateSlug(meiset.name)}`,
              icon: 'local_laundry_service',
              image: LOCAL_IMAGES['Məişət texnikası'] || null,
              children: [],
              hasDynamicSubCategories: true
            });
          }

          const allCategories = [...parentCategories, ...extraCategories];
          // Sort alphabetically matching AZ/RU
          allCategories.sort((a, b) => a.name.localeCompare(b.name, language === 'ru' ? 'ru' : 'az'));

          setCategories(allCategories);
        }
      } catch (e) {
        console.error('Error fetching mobile catalog categories:', e);
      }
    };
    fetchTree();
  }, [language]);

  // Listen for custom event to open
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('open-mobile-catalog', handleOpen);
    return () => {
      window.removeEventListener('open-mobile-catalog', handleOpen);
    };
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
        document.documentElement.style.overflow = '';
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    // Reset active category on close so next time it starts at Level 1
    setTimeout(() => {
      setActiveCategory(null);
    }, 300);
  };

  const selectCategory = async (category: any) => {
    if (category.hasDynamicSubCategories) {
      setIsLoadingSub(true);
      setActiveCategory({
        ...category,
        children: []
      });
      try {
        const data = await adService.getSubCategories(category.id);
        const mappedChildren = data.map((d: any) => ({
          id: d.id,
          name: language === 'ru' && d.nameRu ? d.nameRu : d.name,
          slug: generateSlug(d.name)
        }));
        setActiveCategory({
          ...category,
          children: mappedChildren
        });
      } catch (e) {
        console.error('Error fetching dynamic subcategories:', e);
      } finally {
        setIsLoadingSub(false);
      }
    } else if (category.children && category.children.length > 0) {
      setActiveCategory(category);
    } else {
      const getHref = () => {
        if (!category.slug) return ROUTES.CATEGORY(category.id);
        if (category.slug.startsWith('/')) return category.slug;
        return ROUTES.CATEGORY(category.slug);
      };
      
      handleClose();
      router.push(getHref());
    }
  };

  const goBack = () => {
    setActiveCategory(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[190] bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 animate-in fade-in"
        onClick={handleClose}
      />

      {/* Slider Panel Drawer */}
      <div
        className={`fixed inset-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[450px] z-[200] bg-white flex flex-col overscroll-contain overflow-hidden transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full'
        }`}
      >
        {/* Double-Panel Slide Container */}
        <div
          className="flex flex-1 w-[200%] h-full transition-transform duration-300 ease-out"
          style={{
            transform: activeCategory ? 'translateX(-50%)' : 'translateX(0%)',
          }}
        >
          {/* ================= PANEL 1: MAIN CATEGORIES ================= */}
          <div className="w-1/2 flex flex-col h-full bg-white flex-shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 bg-white flex-shrink-0">
              <button
                onClick={handleClose}
                className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 active:scale-95 transition-all text-gray-700 cursor-pointer"
              >
                <span className="material-symbols-outlined !text-[26px]">close</span>
              </button>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">{t('nav.catalog')}</h2>
              <div className="size-10" /> {/* Spacer to center the header title */}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 pb-[env(safe-area-inset-bottom)]">
              {categories.map((category: any) => {
                const subtext = category.children?.map((c: any) => c.name).join(', ') || '';

                return (
                  <button
                    key={category.id}
                    onClick={() => selectCategory(category)}
                    className="flex items-center gap-4 px-5 py-4 w-full text-left hover:bg-gray-50/60 active:bg-gray-100/50 transition-colors border-none bg-transparent cursor-pointer"
                  >
                    {/* Category Image Box */}
                    <div className="flex items-center justify-center size-12 rounded-2xl bg-gray-50 border border-gray-100 flex-shrink-0 shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-[70%] h-[70%] object-contain"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-gray-400 text-[24px]">
                          {category.icon}
                        </span>
                      )}
                    </div>

                    {/* Labels */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-gray-900 leading-tight">
                        {category.name}
                      </p>
                      {subtext && (
                        <p className="text-[12px] text-gray-400 font-semibold leading-tight mt-1 truncate pr-2">
                          {subtext}
                        </p>
                      )}
                    </div>

                    {/* Arrow Chevron */}
                    <span className="material-symbols-outlined text-gray-300 text-[20px] flex-shrink-0">
                      chevron_right
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= PANEL 2: SUBCATEGORIES ================= */}
          <div className="w-1/2 flex flex-col h-full bg-white flex-shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 bg-white flex-shrink-0">
              <button
                onClick={goBack}
                className="flex items-center justify-center size-10 rounded-full hover:bg-gray-105 active:scale-95 transition-all text-gray-700 cursor-pointer"
              >
                <span className="material-symbols-outlined !text-[26px]">chevron_left</span>
              </button>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">
                {activeCategory?.name || ''}
              </h2>
              <div className="size-10" /> {/* Spacer to center the header title */}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)] divide-y divide-gray-100">
              {isLoadingSub ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                  <span className="text-sm font-semibold mt-2">{t('common.loading')}</span>
                </div>
              ) : activeCategory && (
                <>
                  {/* Option 1: View all ads under this category */}
                  <Link
                    href={ROUTES.CATEGORY(activeCategory.slug)}
                    onClick={handleClose}
                    className="flex items-center px-6 py-4 text-[15px] font-black text-primary hover:bg-primary/5 active:bg-primary/10 transition-colors w-full cursor-pointer"
                  >
                    {t('nav.allListings')}
                  </Link>

                  {/* Option 2: Child subcategories */}
                  {activeCategory.children?.map((sub: any) => (
                    <Link
                      key={sub.id}
                      href={ROUTES.SUBCATEGORY(activeCategory.slug, sub.slug)}
                      onClick={handleClose}
                      className="flex items-center px-6 py-4 text-[15px] font-bold text-gray-750 hover:bg-gray-50 active:bg-gray-100 transition-colors w-full cursor-pointer animate-in fade-in duration-200"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
