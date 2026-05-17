'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { VipIcon, PremiumIcon } from '@/components/ui/AdIcons';

export default function ServicesAndPackagesPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-4">
        {t('burgerMenu.paidServices')}
      </h1>

      <div className="space-y-12">
        {/* Boost Ads */}
        <section className="flex flex-col md:flex-row gap-6">
          <div className="size-16 sm:size-20 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-green-100">
            <span className="material-symbols-outlined !text-4xl text-green-600">rocket_launch</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              {t('promoteModal.boost')}
              <span className="bg-green-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">BOOST</span>
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium mb-4">
              {t('paidServices.boost.desc')}
            </p>
            <ul className="list-disc list-inside text-gray-500 space-y-1 font-medium text-sm mb-4">
              <li>{t('paidServices.boost.benefit1')}</li>
              <li>{t('paidServices.boost.benefit2')}</li>
              <li>{t('paidServices.boost.benefit3')}</li>
            </ul>
            {t('paidServices.boost.bonus') && (
              <div className="inline-flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 text-green-700 text-xs font-black">
                <span className="material-symbols-outlined !text-sm">redeem</span>
                {t('paidServices.boost.bonus')}
              </div>
            )}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Premium Ads */}
        <section className="flex flex-col md:flex-row gap-6">
          <div className="size-16 sm:size-20 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-100">
            <PremiumIcon size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              {t('promoteModal.premium')}
              <span className="bg-[#FF9D00] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">PREMIUM</span>
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium mb-4">
              {t('paidServices.premium.desc')}
            </p>
            <ul className="list-disc list-inside text-gray-500 space-y-1 font-medium text-sm mb-4">
              <li>{t('paidServices.premium.benefit1')}</li>
              <li>{t('paidServices.premium.benefit2')}</li>
              <li>{t('paidServices.premium.benefit3')}</li>
            </ul>
            {t('paidServices.premium.bonus') && (
              <div className="inline-flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100 text-yellow-700 text-xs font-black">
                <span className="material-symbols-outlined !text-sm">redeem</span>
                {t('paidServices.premium.bonus')}
              </div>
            )}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* VIP Ads */}
        <section className="flex flex-col md:flex-row gap-6">
          <div className="size-16 sm:size-20 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-orange-100">
            <VipIcon size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              {t('listings.vipAds')}
              <span className="bg-[#FF4F08] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">VIP</span>
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium mb-4">
              {t('paidServices.vip.desc')}
            </p>
            <ul className="list-disc list-inside text-gray-500 space-y-1 font-medium text-sm mb-4">
              <li>{t('paidServices.vip.benefit1')}</li>
              <li>{t('paidServices.vip.benefit2')}</li>
              <li>{t('paidServices.vip.benefit3')}</li>
            </ul>
            {t('paidServices.vip.bonus') && (
              <div className="inline-flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 text-orange-700 text-xs font-black">
                <span className="material-symbols-outlined !text-sm">redeem</span>
                {t('paidServices.vip.bonus')}
              </div>
            )}
          </div>
        </section>

        <hr className="border-gray-100" />
      </div>
    </div>
  );
}
