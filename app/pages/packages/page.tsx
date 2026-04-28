'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function ServicesAndPackagesPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-4">
        {t('burgerMenu.paidServices')}
      </h1>

      <div className="space-y-12">
        {/* VIP Ads */}
        <section className="flex flex-col md:flex-row gap-6">
          <div className="size-16 sm:size-20 bg-[#fff5f5] rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined !text-4xl text-red-500">diamond</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              {t('listings.vipAds')}
              <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">VIP</span>
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium mb-4">
              {t('paidServices.vip.desc')}
            </p>
            <ul className="list-disc list-inside text-gray-500 space-y-1 font-medium text-sm">
              <li>{t('paidServices.vip.benefit1')}</li>
              <li>{t('paidServices.vip.benefit2')}</li>
              <li>{t('paidServices.vip.benefit3')}</li>
            </ul>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Premium Ads */}
        <section className="flex flex-col md:flex-row gap-6">
          <div className="size-16 sm:size-20 bg-yellow-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined !text-4xl text-yellow-600">stars</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              {t('promoteModal.premium')}
              <span className="bg-yellow-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Premıum</span>
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium mb-4">
              {t('paidServices.premium.desc')}
            </p>
            <ul className="list-disc list-inside text-gray-500 space-y-1 font-medium text-sm">
              <li>{t('paidServices.premium.benefit1')}</li>
              <li>{t('paidServices.premium.benefit2')}</li>
              <li>{t('paidServices.premium.benefit3')}</li>
            </ul>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Boost Ads */}
        <section className="flex flex-col md:flex-row gap-6">
          <div className="size-16 sm:size-20 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined !text-4xl text-blue-500">arrow_upward</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {t('promoteModal.boost')} (Boost)
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium mb-4">
              {t('paidServices.boost.desc')}
            </p>
            <ul className="list-disc list-inside text-gray-500 space-y-1 font-medium text-sm">
              <li>{t('paidServices.boost.benefit1')}</li>
              <li>{t('paidServices.boost.benefit2')}</li>
              <li>{t('paidServices.boost.benefit3')}</li>
            </ul>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Business Packages */}
        <section className="flex flex-col md:flex-row gap-6">
          <div className="size-16 sm:size-20 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined !text-4xl text-white">storefront</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {t('paidServices.business.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium mb-4">
              {t('paidServices.business.desc')}
            </p>
            <div className="mb-4">
              <a href="/business" className="text-primary font-bold hover:underline text-sm flex items-center gap-1">
                {t('paidServices.business.link')} <span className="material-symbols-outlined !text-sm">arrow_forward</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
