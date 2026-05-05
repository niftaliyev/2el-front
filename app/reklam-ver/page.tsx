'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Container } from '@/components/layout';
import { Button } from '@/components/ui';
import { bannerService, AdApplicationRequest, AdvertisingSettingDto } from '@/services/banner.service';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export default function AdvertisingPage() {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<AdvertisingSettingDto | null>(null);
  const [formData, setFormData] = useState<AdApplicationRequest>({
    fullName: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    message: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await bannerService.getSettings(language);
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch advertising settings:', error);
      }
    };
    fetchSettings();
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phoneNumber) {
      toast.error(t('advertising.validationError'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(t('auth.emailInvalid') || 'Düzgün e-poçt ünvanı daxil edin');
      return;
    }

    const phoneRegex = /^(?:\+994|0)(?:10|50|51|55|70|77|99)\d{7}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error(t('auth.phoneError'));
      return;
    }

    try {
      setIsSubmitting(true);
      await bannerService.applyForAd(formData);
      toast.success(t('advertising.successMessage'));
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        companyName: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(t('advertising.errorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] sm:h-[500px] w-full bg-gray-900 overflow-hidden">
        <Image
          src="/ads/hero.png"
          alt="Advertising on Elan.az"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        <Container className="relative h-full flex flex-col justify-center items-center text-center px-4">
          <h1 
            className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700"
            dangerouslySetInnerHTML={{ __html: t('advertising.heroTitle') }}
          />
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {t('advertising.heroSubtitle')}
          </p>
        </Container>
      </section>

      <Container className="py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Information Section */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">{t('advertising.whyUs')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl font-bold">groups</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{t('advertising.feature1Title')}</h3>
                  <p className="text-gray-600 leading-relaxed">{t('advertising.feature1Desc')}</p>
                </div>
                <div className="space-y-4">
                  <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl font-bold">target</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{t('advertising.feature2Title')}</h3>
                  <p className="text-gray-600 leading-relaxed">{t('advertising.feature2Desc')}</p>
                </div>
                <div className="space-y-4">
                  <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl font-bold">support_agent</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{t('advertising.feature3Title')}</h3>
                  <p className="text-gray-600 leading-relaxed">{t('advertising.feature3Desc')}</p>
                </div>
                <div className="space-y-4">
                  <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl font-bold">design_services</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{t('advertising.feature4Title')}</h3>
                  <p className="text-gray-600 leading-relaxed">{t('advertising.feature4Desc')}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('advertising.contactInfo')}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-gray-100">
                    <span className="material-symbols-outlined text-[20px]">call</span>
                  </div>
                  <p className="text-gray-700 font-semibold">{settings?.contactPhone || '(012) 345-67-89 / (050) 123-45-67'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-gray-100">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <p className="text-gray-700 font-semibold">{settings?.email || 'ads@elan.az'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-gray-100">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                  </div>
                  <p className="text-gray-700 font-semibold">
                    {language === 'ru' ? settings?.addressRu : settings?.address}
                    {!settings && (language === 'ru' ? 'Баку, пр. Гейдара Алиева 115' : 'Bakı şəhəri, Heydər Əliyev pr. 115')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10 sticky top-24">
            <div className="mb-10">
              <h2 className="text-2xl font-black text-gray-900 mb-2">{t('advertising.formTitle')}</h2>
              <p className="text-gray-500 font-medium">{t('advertising.formSubtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">{t('advertising.fullName')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    placeholder={t('advertising.fullNamePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">{t('advertising.phone')} *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    placeholder={t('advertising.phonePlaceholder')}
                    pattern="^(?:\+994|0)(?:10|50|51|55|70|77|99)\d{7}$"
                    title={t('auth.phoneError')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{t('advertising.email')} *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                  placeholder={t('advertising.emailPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{t('advertising.companyName')}</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                  placeholder={t('advertising.companyNamePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{t('advertising.message')}</label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium resize-none"
                  placeholder={t('advertising.messagePlaceholder')}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-base font-black uppercase tracking-wider rounded-xl shadow-xl shadow-primary/20"
                isLoading={isSubmitting}
              >
                {t('advertising.submit')}
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
