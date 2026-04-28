'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { storeService } from '@/services/store.service';
import { adService } from '@/services/ad.service';
import { toast } from 'sonner';
import { Modal, Button, Input, Textarea } from '@/components/ui';
import { CategoryDto, BusinessPackageDto } from '@/types/api';
import { CATEGORIES } from '@/constants';
import { useLanguage } from '@/contexts/LanguageContext';


export default function BusinessLandingPage() {
    return (
        <Suspense fallback={null}>
            <BusinessPageInner />
        </Suspense>
    );
}

function BusinessPageInner() {
    const { t, language } = useLanguage();
    const { user, isAuthenticated } = useAuth();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        storeName: '',
        fullName: '',
        phoneNumber: '',
        email: '',
        description: '',
    });
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [businessPackages, setBusinessPackages] = useState<BusinessPackageDto[]>([]);
    const [showPackagesModal, setShowPackagesModal] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const categoryRef = useRef<HTMLDivElement>(null);

    const [logo, setLogo] = useState<File | null>(null);
    const [cover, setCover] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isPackagesLoading, setIsPackagesLoading] = useState(false);
    const [storeStatus, setStoreStatus] = useState<{ hasStore: boolean; hasPendingRequest: boolean } | null>(null);
    const [isStatusLoading, setIsStatusLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const tree = await adService.getCategoryTree();
                const flatCategories: CategoryDto[] = [];

                const importantSubNames = ['Telefonlar', 'Məişət texnikası', 'Məktəblilər üçün', 'Ehtiyat hissələri və aksesuarlar'];

                tree.forEach(root => {
                    const rootConfig = CATEGORIES.find(c => c.name === root.name);
                    flatCategories.push({
                        ...root,
                        icon: rootConfig?.icon || 'category'
                    });

                    if (root.children) {
                        root.children.forEach((sub: any) => {
                            if (importantSubNames.includes(sub.name)) {
                                // Find sub icon from categories config if available
                                const subConfig = (rootConfig as any)?.children?.find((c: any) => c.name === sub.name);
                                flatCategories.push({
                                    ...sub,
                                    name: `${sub.name}`,
                                    icon: subConfig?.icon || 'subdirectory_arrow_right'
                                });
                            }
                        });
                    }
                });

                setCategories(flatCategories);
            } catch (error) {
                console.error('Kategoriyalar yüklənmədi', error);
                toast.error(t('businessLanding.categoriesLoadingError') || 'Kateqoriyalar yüklənmədi');
            }
        };
        fetchCategories();

        const fetchStatus = async () => {
            if (isAuthenticated) {
                try {
                    const status = await storeService.getUserStoreStatus();
                    setStoreStatus(status);
                } catch (error) {
                    console.error('Status yüklənmədi');
                } finally {
                    setIsStatusLoading(false);
                }
            } else {
                setIsStatusLoading(false);
            }
        };
        fetchStatus();

        const handleClickOutside = (event: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setShowCategoryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isAuthenticated]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'packages') {
            fetchPackages();
        }
    }, [searchParams]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCover(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const fetchPackages = async () => {
        setIsPackagesLoading(true);
        try {
            const pkgs = await adService.getBusinessPackages();
            setBusinessPackages(pkgs);
            setShowPackagesModal(true);
        } catch (error) {
            toast.error(t('businessLanding.packagesLoadingError') || 'Biznes paketlər yüklənmədi');
        } finally {
            setIsPackagesLoading(false);
        }
    };

    const handleCategoryToggle = (id: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getSelectedCategoryNames = () => {
        return categories
            .filter(cat => selectedCategoryIds.includes(cat.id!))
            .map(cat => language === 'ru' && cat.nameRu ? cat.nameRu : cat.name)
            .join(', ');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error(t('auth.loginRequired') || 'Zəhmət olmasa, əvvəlcə sayta daxil olun.');
            return;
        }

        if (selectedCategoryIds.length === 0) {
            toast.error(t('businessLanding.categoryRequired') || 'Ən azı bir kateqoriya seçilməlidir.');
            return;
        }

        setIsLoading(true);
        try {
            const data = new FormData();
            data.append('StoreName', formData.storeName);
            selectedCategoryIds.forEach(id => data.append('CategoryIds', id));
            data.append('FullName', formData.fullName || '');
            data.append('PhoneNumber', formData.phoneNumber || '');
            data.append('Email', formData.email || '');
            data.append('Description', formData.description || '');
            if (logo) data.append('Logo', logo);
            if (cover) data.append('Cover', cover);

            const res = await storeService.createStoreRequest(data);
            toast.success(res.message || t('businessLanding.requestSuccess') || 'Sorğunuz uğurla göndərildi!');

            setFormData({
                storeName: '',
                fullName: '',
                phoneNumber: '',
                email: '',
                description: '',
            });
            setSelectedCategoryIds([]);
            setLogo(null);
            setCover(null);
            setLogoPreview(null);
            setCoverPreview(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Xəta baş verdi');
        } finally {
            setIsLoading(false);
        }
    };

    const benefits = [
        { icon: 'payments', title: '0 ₼', desc: t('businessLanding.benefits.adPrice'), color: 'text-green-500' },
        { icon: 'rocket_launch', title: '35%-dək', desc: t('businessLanding.benefits.paidBenefit'), color: 'text-primary' },
        { icon: 'support_agent', title: t('businessLanding.benefits.support'), desc: t('businessLanding.benefits.supportDesc'), color: 'text-indigo-500' },
        { icon: 'business_center', title: t('businessLanding.benefits.businessOps'), desc: t('businessLanding.benefits.businessOpsDesc'), color: 'text-purple-500' },
        { icon: 'group', title: '160 min', desc: t('businessLanding.benefits.dailyCustomers'), color: 'text-red-500' },
        { icon: 'visibility', title: '4,5 mln', desc: t('businessLanding.benefits.dailyViews'), color: 'text-blue-600' },
        { icon: 'handshake', title: '500+', desc: t('businessLanding.benefits.activePartners'), color: 'text-teal-500' },
        { icon: 'category', title: '100+', desc: t('businessLanding.benefits.productCategories'), color: 'text-amber-600' },
    ];

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col font-sans py-8 sm:py-16">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-8 sm:mb-16">
                    <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight">
                        {t('businessLanding.title')}
                    </h1>
                    <p className="text-gray-500 font-bold text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed px-4">
                        {t('businessLanding.desc')}
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center">

                    {/* Left Side: Benefits Grid */}
                    <div className="w-full lg:flex-1 space-y-8">
                        <div className="bg-white rounded-[30px] sm:rounded-[40px] p-6 sm:p-12 border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mt-32 blur-3xl"></div>

                            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-8 sm:mb-10 flex items-center gap-3">
                                <span className="w-1.5 h-6 sm:w-2 sm:h-8 bg-primary rounded-full"></span>
                                {t('businessLanding.whyStore')}
                            </h3>

                            {/* Benefits Container: Grid on desktop, Scroll on mobile */}
                            <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-0 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
                                {benefits.map((item, idx) => (
                                    <div key={idx} className="flex-shrink-0 w-64 sm:w-auto flex items-center gap-4 sm:gap-5 p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all border border-transparent hover:border-gray-100 group cursor-default">
                                        <div className={`size-12 sm:size-14 rounded-2xl bg-white shadow-sm flex items-center justify-center ${item.color} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                            <span className="material-symbols-outlined !text-2xl sm:!text-3xl font-bold">{item.icon}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="font-black text-gray-900 text-lg sm:text-xl leading-none mb-1 sm:mb-1.5">{item.title}</div>
                                            <p className="text-xs sm:text-sm text-gray-500 font-bold tracking-tight">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4">
                                <Button
                                    variant="outline"
                                    className="h-14 sm:h-16 px-6 sm:px-10 rounded-2xl text-sm sm:text-base font-black border-2 border-gray-100 text-gray-600 hover:border-primary/20 hover:bg-primary/5 hover:text-primary flex-1"
                                    onClick={fetchPackages}
                                    isLoading={isPackagesLoading}
                                >
                                    <span className="material-symbols-outlined mr-2">inventory_2</span>
                                    {t('businessLanding.viewPackages')}
                                </Button>
                                <Link href="/pages/packages" className="flex-1">
                                    <Button variant="ghost" className="h-14 sm:h-16 px-6 sm:px-10 rounded-2xl text-sm sm:text-base font-black text-primary hover:bg-primary/5 w-full">
                                        {t('businessLanding.learnMore')}
                                        <span className="material-symbols-outlined ml-2">arrow_forward</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Request Form */}
                    <div className="w-full lg:w-[480px] bg-white rounded-[30px] sm:rounded-[40px] p-8 sm:p-12 shadow-2xl shadow-gray-200/60 border border-gray-50 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                        <div className="mb-8 relative">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 sm:mb-3 tracking-tight">{t('businessLanding.requestTitle')}</h2>
                            <p className="text-gray-400 font-bold text-xs sm:text-sm leading-relaxed">{t('businessLanding.requestDesc')}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 relative">
                            <div className="space-y-5">
                                <Input
                                    label={t('businessLanding.storeName')}
                                    placeholder={t('businessLanding.storeNamePlaceholder')}
                                    required
                                    className="h-12 sm:h-14 rounded-xl border-gray-200 focus:ring-primary/20"
                                    value={formData.storeName}
                                    onChange={(e: any) => setFormData({ ...formData, storeName: e.target.value })}
                                />

                                <div className="relative" ref={categoryRef}>
                                    <label className="block text-sm font-black text-gray-700 mb-1.5 sm:mb-2">
                                        {t('businessLanding.categories')} <span className="text-primary">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                        className={`w-full h-12 sm:h-14 px-4 flex items-center justify-between rounded-xl border-2 transition-all text-left ${showCategoryDropdown ? 'border-primary ring-2 ring-primary/10' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className={`truncate text-sm font-bold ${selectedCategoryIds.length > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {selectedCategoryIds.length > 0 ? getSelectedCategoryNames() : t('businessLanding.selectCategory')}
                                        </span>
                                        <span className={`material-symbols-outlined transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`}>
                                            expand_more
                                        </span>
                                    </button>

                                    {showCategoryDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-2 space-y-1">
                                                {categories.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => handleCategoryToggle(cat.id!)}
                                                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${selectedCategoryIds.includes(cat.id!) ? 'bg-primary/5 text-primary' : 'hover:bg-gray-50 text-gray-700'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className={`material-symbols-outlined text-lg ${cat.parentId ? 'text-gray-400 scale-90' : ''}`}>
                                                                {cat.icon || 'category'}
                                                            </span>
                                                            <span className={`text-sm font-bold ${cat.parentId ? 'ml-2 text-gray-600' : ''}`}>{language === 'ru' && cat.nameRu ? cat.nameRu : cat.name}</span>
                                                        </div>
                                                        <div className={`size-5 rounded border-2 flex items-center justify-center transition-all ${selectedCategoryIds.includes(cat.id!) ? 'bg-primary border-primary' : 'border-gray-300 bg-white'
                                                            }`}>
                                                            {selectedCategoryIds.includes(cat.id!) && (
                                                                <span className="material-symbols-outlined !text-[14px] text-white font-black">check</span>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label={t('businessLanding.fullName')}
                                        placeholder={t('businessLanding.fullNamePlaceholder')}
                                        required
                                        className="h-12 sm:h-14 rounded-xl border-gray-200 focus:ring-primary/20"
                                        value={formData.fullName}
                                        onChange={(e: any) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                    <Input
                                        label={t('businessLanding.mobileNumber')}
                                        type="tel"
                                        placeholder={t('businessLanding.mobileNumberPlaceholder')}
                                        required
                                        className="h-12 sm:h-14 rounded-xl border-gray-200 focus:ring-primary/20"
                                        value={formData.phoneNumber}
                                        onChange={(e: any) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        pattern="^(?:\+994|0)(?:10|50|51|55|70|77|99)\d{7}$"
                                        title={t('businessLanding.mobileNumberError')}
                                    />
                                </div>

                                <Input
                                    label={t('businessLanding.email')}
                                    type="email"
                                    placeholder={t('businessLanding.emailPlaceholder')}
                                    className="h-12 sm:h-14 rounded-xl border-gray-200 focus:ring-primary/20"
                                    value={formData.email}
                                    onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                                />

                                {/* Logo & Cover Uploads */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('businessLanding.logo')}</label>
                                        <label className="relative flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-gray-50 transition-all overflow-hidden group">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo" className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center text-gray-400 group-hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                                                    <span className="text-[10px] font-bold mt-1 uppercase">{t('businessLanding.upload')}</span>
                                                </div>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                                        </label>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('businessLanding.cover')}</label>
                                        <label className="relative flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-gray-50 transition-all overflow-hidden group">
                                            {coverPreview ? (
                                                <img src={coverPreview} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center text-gray-400 group-hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-2xl">wallpaper</span>
                                                    <span className="text-[10px] font-bold mt-1 uppercase">{t('businessLanding.upload')}</span>
                                                </div>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
                                        </label>
                                    </div>
                                </div>

                                <Textarea
                                    label={t('businessLanding.aboutStore')}
                                    placeholder={t('businessLanding.aboutStorePlaceholder')}
                                    rows={2}
                                    className="rounded-xl border-gray-200 focus:ring-primary/20 resize-none text-sm"
                                    value={formData.description}
                                    onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="pt-2 sm:pt-4">
                                {isStatusLoading ? (
                                    <Button className="w-full h-14 sm:h-16 rounded-2xl" isLoading disabled>Yüklənir...</Button>
                                ) : storeStatus?.hasStore ? (
                                    <div className="p-6 rounded-2xl bg-primary/5 border-2 border-primary/20 text-center">
                                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                            <span className="material-symbols-outlined text-primary font-black">check_circle</span>
                                        </div>
                                        <p className="font-black text-gray-900 mb-2">{t('businessLanding.alreadyHasStore')}</p>
                                        <p className="text-sm text-gray-500 font-bold mb-4">{t('businessLanding.alreadyHasStoreDesc')}</p>
                                        <Link href="/cabinet/settings">
                                            <Button className="w-full rounded-xl bg-primary text-white font-black">{t('businessLanding.goToCabinet')}</Button>
                                        </Link>
                                    </div>
                                ) : storeStatus?.hasPendingRequest ? (
                                    <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-200 text-center">
                                        <div className="size-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                            <span className="material-symbols-outlined text-amber-600 font-black">schedule</span>
                                        </div>
                                        <p className="font-black text-gray-900 mb-2">{t('businessLanding.pendingRequest')}</p>
                                        <p className="text-sm text-gray-500 font-bold">{t('businessLanding.pendingRequestDesc')}</p>
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            type="submit"
                                            className="w-full h-14 sm:h-16 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-lg sm:text-xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] uppercase tracking-widest border-none"
                                            isLoading={isLoading}
                                        >
                                            {isLoading ? t('businessLanding.sending') : t('businessLanding.send')}
                                        </Button>
                                        <p className="text-[10px] text-gray-400 text-center mt-5 px-4 leading-relaxed font-bold uppercase tracking-wider">
                                            {t('businessLanding.agreementPrefix')} <Link href="#" className="text-primary hover:underline">{t('businessLanding.userAgreement')}</Link> {t('businessLanding.agreementSuffix')}
                                        </p>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Business Packages Modal */}
                <Modal
                    isOpen={showPackagesModal}
                    onClose={() => setShowPackagesModal(false)}
                    title={t('businessLanding.modalTitle')}
                    size="xl"
                >
                    <div className="py-4 md:p-8">
                        <div className="mb-6 md:mb-12 text-center px-2">
                            <h3 className="text-xl sm:text-3xl font-black text-gray-900 mb-2 sm:mb-4 tracking-tight leading-tight">{t('businessLanding.modalSubtitle')}</h3>
                            <p className="text-gray-400 font-bold text-xs sm:text-base leading-relaxed">{t('businessLanding.modalDesc')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 overflow-y-auto max-h-[70vh] sm:max-h-none px-2">
                            {businessPackages.length > 0 ? businessPackages.map((pkg) => (
                                <div key={pkg.id} className="relative bg-white border-2 border-gray-50 rounded-[30px] sm:rounded-[35px] p-6 sm:p-8 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all group overflow-hidden flex flex-col">
                                    {pkg.name === 'Gold' || pkg.name === 'Platinum' ? (
                                        <div className="absolute -top-1 -right-1">
                                            <div className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl rounded-tr-[30px] sm:rounded-tr-[35px]">
                                                {t('businessLanding.popular')}
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="mb-6 sm:mb-8">
                                        <div className="text-primary font-black uppercase tracking-[0.2em] text-[10px] sm:text-[11px] mb-1 sm:mb-2">{t('businessLanding.package')}</div>
                                        <h4 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter uppercase">{language === 'ru' && pkg.nameRu ? pkg.nameRu : pkg.name}</h4>
                                        {pkg.description && (
                                            <p className="text-gray-500 text-xs sm:text-sm font-bold mt-2 leading-relaxed">
                                                {language === 'ru' && pkg.descriptionRu ? pkg.descriptionRu : pkg.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mb-6 sm:mb-8 flex items-baseline gap-2">
                                        <span className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter">{pkg.basePrice}</span>
                                        <span className="text-gray-400 font-black text-[10px] sm:text-sm uppercase tracking-widest">{t('businessLanding.perMonth')}</span>
                                    </div>

                                    <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-12 flex-1">
                                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-black text-gray-600">
                                            <div className="size-5 sm:size-6 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                                                <span className="material-symbols-outlined !text-sm sm:!text-base font-black">check</span>
                                            </div>
                                            {pkg.adLimit} {t('businessLanding.adLimit')}
                                        </div>
                                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-black text-gray-600">
                                            <div className="size-5 sm:size-6 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                                                <span className="material-symbols-outlined !text-sm sm:!text-base font-black">check</span>
                                            </div>
                                            {pkg.serviceBalance} {t('businessLanding.bonusBalance')}
                                        </div>
                                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-black text-gray-600">
                                            <div className="size-5 sm:size-6 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                                                <span className="material-symbols-outlined !text-sm sm:!text-base font-black">check</span>
                                            </div>
                                            %{pkg.serviceDiscountPercentage} {t('businessLanding.serviceDiscount')}
                                        </div>
                                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-black text-gray-600">
                                            <div className="size-5 sm:size-6 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                                                <span className="material-symbols-outlined !text-sm sm:!text-base font-black">check</span>
                                            </div>
                                            {t('businessLanding.personalUrl')}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowPackagesModal(false)}
                                        className="w-full py-4 rounded-2xl bg-primary/10 text-primary font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95 mt-auto"
                                    >
                                        {t('businessLanding.apply')}
                                    </button>
                                </div>
                            )) : (
                                <div className="col-span-full py-12 sm:py-24 text-center">
                                    <div className="inline-flex size-16 sm:size-20 rounded-full bg-gray-50 items-center justify-center mb-6">
                                        <span className="material-symbols-outlined !text-3xl sm:!text-4xl text-gray-200 animate-spin">progress_activity</span>
                                    </div>
                                    <p className="text-gray-300 font-black tracking-widest uppercase text-sm">{t('businessLanding.packagesLoading')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            </div>
        </main>
    );
}



