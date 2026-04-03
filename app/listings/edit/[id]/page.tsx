'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ROUTES } from '@/constants';
import Select, { SelectOption } from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { adService } from '@/services/ad.service';
import { AdImage, AdFieldDto, CategoryFieldDto, CategoryDto } from '@/types/api';
import { parseCurrency } from '@/lib/utils';

// const SERVER_URL = 'http://34.118.33.240';
// const SERVER_URL = 'http://localhost:5156';
const SERVER_URL = 'http://34.118.33.240';

export default function EditListingPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [formData, setFormData] = useState({
        categoryId: '',
        subcategoryId: '',
        brandId: '',
        adTypeId: '',
        title: '',
        description: '',
        price: '',
        name: '',
        email: '',
        phone: '',
        cityId: '',
        isDeliverable: false,
        isNew: false,
    });

    const [parentCategories, setParentCategories] = useState<SelectOption[]>([]);
    const [subCategories, setSubCategories] = useState<SelectOption[]>([]);
    const [brands, setBrands] = useState<SelectOption[]>([]);
    const [adTypes, setAdTypes] = useState<SelectOption[]>([]);
    const [cities, setCities] = useState<SelectOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
    const [isLoadingBrands, setIsLoadingBrands] = useState(false);
    const [isLoadingAdTypes, setIsLoadingAdTypes] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [showSubcategory, setShowSubcategory] = useState(false);
    const [showBrands, setShowBrands] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null);
    const [categoryUsage, setCategoryUsage] = useState<number | null>(null);

    // Dynamic category fields
    const [categoryFields, setCategoryFields] = useState<CategoryFieldDto[]>([]);
    const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, string>>({});

    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<AdImage[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
    const [overIdx, setOverIdx] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragItemIndex = useRef<number | null>(null);
    const dragOverIndex = useRef<number | null>(null);
    const createdUrlsRef = useRef<string[]>([]);

    const isFirstLoad = useRef(true);

    // Initialize data
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                // Fetch basic lookups first
                await Promise.all([
                    fetchParentCategories(),
                    fetchAdTypes(),
                    fetchCities()
                ]);
                // Then fetch ad data
                await fetchAdData();
            } catch (err: any) {
                console.error('Error initializing page:', err);
                setError('Məlumatları yükləmək mümkün olmadı');
            } finally {
                setIsLoading(false);
                // After loading all data, we can allow the category useEffects to run normally
                setTimeout(() => { isFirstLoad.current = false; }, 200);
            }
        };
        init();
    }, [id]);

    const fetchParentCategories = async () => {
        try {
            setIsLoadingCategories(true);
            const categories = await adService.getCategories();
            const options: SelectOption[] = categories.map(cat => ({
                value: cat.id.toString().toLowerCase(),
                label: cat.name,
            }));
            setParentCategories(options);
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setIsLoadingCategories(false);
        }
    };

    const fetchAdTypes = async () => {
        try {
            setIsLoadingAdTypes(true);
            const types = await adService.getAdTypes();
            const options: SelectOption[] = types.map(type => ({
                value: type.id.toString().toLowerCase(),
                label: type.name,
            }));
            setAdTypes(options);
        } catch (err) {
            console.error('Error fetching ad types:', err);
        } finally {
            setIsLoadingAdTypes(false);
        }
    };

    const fetchCities = async () => {
        try {
            setIsLoadingCities(true);
            const citiesList = await adService.getCities();
            const options: SelectOption[] = citiesList.map(city => ({
                value: city.id.toString().toLowerCase(),
                label: city.name,
            }));
            setCities(options);
        } catch (err) {
            console.error('Error fetching cities:', err);
        } finally {
            setIsLoadingCities(false);
        }
    };

    const fetchAdData = async () => {
        if (!id) return;
        try {
            const ad = await adService.getEditData(id);

            // Map the data from AdEditData to formData
            setFormData({
                categoryId: ad.categoryId?.toLowerCase() || '',
                subcategoryId: ad.subCategoryId?.toLowerCase() || '',
                brandId: ad.brandId?.toLowerCase() || '', // We'll handle brand if it's there (backend calls it subCategoryId too)
                adTypeId: ad.adTypeId?.toLowerCase() || '',
                title: ad.title,
                description: ad.description,
                price: ad.price.toString(),
                name: ad.fullName,
                email: ad.email,
                phone: ad.phoneNumber,
                cityId: ad.cityId?.toLowerCase() || '',
                isDeliverable: ad.isDeliverable,
                isNew: ad.isNew,
            });

            // Handle Dynamic Fields
            if (ad.dynamicFields && ad.dynamicFields.length > 0) {
                const fieldValues: Record<string, string> = {};
                ad.dynamicFields.forEach(field => {
                    fieldValues[field.categoryFieldId] = field.value;
                });
                setDynamicFieldValues(fieldValues);
            }

            // Pre-load subcategories if present
            if (ad.categoryId) {
                setShowSubcategory(true);
                setIsLoadingSubCategories(true);
                try {
                    const categories = await adService.getCategories(ad.categoryId);
                    const options: SelectOption[] = categories.map(cat => ({
                        value: cat.id.toString().toLowerCase(),
                        label: cat.name,
                    }));
                    setSubCategories(options);

                    // If a subcategory exists, fetch brands and fields for it
                    if (ad.subCategoryId) {
                        // We need to fetch fields from this category
                        const selectedChild = categories.find(c => c.id.toLowerCase() === ad.subCategoryId?.toLowerCase());
                        if (selectedChild?.categoryFields) {
                            setCategoryFields(selectedChild.categoryFields);
                        }
                        setSelectedCategory(selectedChild || null);

                        // Fetch usage
                        if (selectedChild) {
                            try {
                                const usage = await adService.getCategoryUsage(selectedChild.id);
                                setCategoryUsage(usage);
                            } catch {
                                setCategoryUsage(null);
                            }
                        }

                        // Also check if this subcategory has brands
                        const fetchedBrands = await adService.getSubCategories(ad.subCategoryId);
                        if (fetchedBrands && fetchedBrands.length > 0) {
                            const brandOptions: SelectOption[] = fetchedBrands.map(b => ({
                                value: b.id.toString().toLowerCase(),
                                label: b.name,
                            }));
                            setBrands(brandOptions);
                            setShowBrands(true);

                            // Wait, does the ad have a brand selected?
                            // In our model, Root=CategoryId, Child=SubCategoryId.
                            // If there is a 3rd level (Brand), where is it stored?
                            // Let's assume for now that if we have a brand, we'd need another field in AdEditDto.
                            // But usually brands are just Level 3.
                        }
                    }
                } catch (err) {
                    console.error('Error fetching initial category data:', err);
                } finally {
                    setIsLoadingSubCategories(false);
                }
            }

            // Set existing images
            if (ad.images && ad.images.length > 0) {
                setExistingImages(ad.images);
                // Prepend SERVER_URL if image path is relative
                setImagePreviews(ad.images.map(img =>
                    img.url.startsWith('http') ? img.url : `${SERVER_URL}${img.url}`
                ));
            }

        } catch (err) {
            console.error('Error fetching ad data:', err);
            setError('Elan məlumatlarını yükləmək mümkün olmadı');
        }
    };

    // Fetch subcategories when parent category is selected
    useEffect(() => {
        if (isFirstLoad.current) return;

        if (formData.categoryId) {
            const fetchSubCategories = async () => {
                setIsLoadingSubCategories(true);
                setShowSubcategory(true);
                setSubCategories([]);
                // Clear subcategoryId and brandId when parent category changes manually
                setFormData(prev => ({ ...prev, subcategoryId: '', brandId: '' }));
                setCategoryFields([]);
                setDynamicFieldValues({});
                try {
                    const categories = await adService.getCategories(formData.categoryId);
                    const options: SelectOption[] = categories.map(cat => ({
                        value: cat.id.toString().toLowerCase(),
                        label: cat.name,
                    }));
                    setSubCategories(options);
                } catch (err: any) {
                    setError('Alt kateqoriyaları yükləmək mümkün olmadı');
                    console.error('Error fetching subcategories:', err);
                } finally {
                    setIsLoadingSubCategories(false);
                }
            };

            fetchSubCategories();
        } else {
            setShowSubcategory(false);
            setSubCategories([]);
            setFormData(prev => ({ ...prev, subcategoryId: '', brandId: '' }));
            setCategoryFields([]);
            setDynamicFieldValues({});
        }
    }, [formData.categoryId]);

    // Load category fields when subcategory is selected
    useEffect(() => {
        if (isFirstLoad.current) return;

        if (formData.subcategoryId) {
            const loadCategoryFields = async () => {
                try {
                    const cats = await adService.getCategories(formData.categoryId);
                    const selectedCat = cats.find(c => c.id.toLowerCase() === formData.subcategoryId.toLowerCase());
                    if (selectedCat?.categoryFields && selectedCat.categoryFields.length > 0) {
                        setCategoryFields(selectedCat.categoryFields);
                    } else {
                        setCategoryFields([]);
                    }
                    setSelectedCategory(selectedCat || null);

                    // Fetch usage
                    if (selectedCat) {
                        try {
                            const usage = await adService.getCategoryUsage(selectedCat.id);
                            setCategoryUsage(usage);
                        } catch {
                            setCategoryUsage(null);
                        }
                    }
                } catch {
                    setCategoryFields([]);
                }
                setDynamicFieldValues({});
            };
            loadCategoryFields();
        } else {
            setCategoryFields([]);
            setDynamicFieldValues({});
        }
    }, [formData.subcategoryId, formData.categoryId]);

    // Fetch brands when subcategory is selected
    useEffect(() => {
        if (isFirstLoad.current) return;

        if (formData.subcategoryId) {
            const fetchBrands = async () => {
                setIsLoadingBrands(true);
                setBrands([]);
                setFormData(prev => ({ ...prev, brandId: '' }));
                try {
                    const fetchedBrands = await adService.getSubCategories(formData.subcategoryId);
                    if (fetchedBrands && fetchedBrands.length > 0) {
                        const options: SelectOption[] = fetchedBrands.map(b => ({
                            value: b.id.toString().toLowerCase(),
                            label: b.name,
                        }));
                        setBrands(options);
                        setShowBrands(true);
                    } else {
                        setShowBrands(false);
                    }
                } catch (err: any) {
                    console.error('Error fetching brands:', err);
                    setShowBrands(false);
                } finally {
                    setIsLoadingBrands(false);
                }
            };

            fetchBrands();
        } else {
            setShowBrands(false);
            setBrands([]);
            setFormData(prev => ({ ...prev, brandId: '' }));
        }
    }, [formData.subcategoryId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files);
        const newPreviews = newFiles.map(file => {
            const url = URL.createObjectURL(file);
            createdUrlsRef.current.push(url);
            return url;
        });

        setImages(prev => [...prev, ...newFiles]);
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        handleImageUpload(files);
    };

    const removeImage = (index: number) => {
        const isExisting = index < existingImages.length;

        if (isExisting) {
            const removedImage = existingImages[index];
            setDeletedImageIds(prev => [...prev, removedImage.id]);
            setExistingImages(prev => prev.filter((_, i) => i !== index));
        } else {
            const newImageIndex = index - existingImages.length;
            setImages(prev => prev.filter((_, i) => i !== newImageIndex));
        }

        setImagePreviews(prev => {
            const newPreviews = prev.filter((_, i) => i !== index);
            // Revoke the URL to free up memory (only for new images)
            if (!isExisting) {
                const url = prev[index];
                try {
                    URL.revokeObjectURL(url);
                } catch (e) { }
                createdUrlsRef.current = createdUrlsRef.current.filter(u => u !== url);
            }
            return newPreviews;
        });
    };

    // Preview drag-and-drop handlers for reordering
    // Note: Reordering is currently visual only, as we don't send order to backend in this simplified version
    const handlePreviewDragStart = (e: React.DragEvent, index: number) => {
        dragItemIndex.current = index;
        setDraggingIdx(index);
        setIsReordering(true);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handlePreviewDragEnter = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        dragOverIndex.current = index;
        setOverIdx(index);
    };

    const handlePreviewDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handlePreviewDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const from = dragItemIndex.current;
        const to = dragOverIndex.current;
        if (from === null || to === null || from === to) {
            dragItemIndex.current = null;
            dragOverIndex.current = null;
            setDraggingIdx(null);
            setOverIdx(null);
            setIsReordering(false);
            return;
        }

        // Handle complex reordering across existing and new images
        // For now, let's keep it simple: just reorder previews
        // In a real app, you'd need to reorder both state arrays carefully
        setImagePreviews(prev => {
            const arr = [...prev];
            const [item] = arr.splice(from, 1);
            arr.splice(to, 0, item);
            return arr;
        });

        dragItemIndex.current = null;
        dragOverIndex.current = null;
        setDraggingIdx(null);
        setOverIdx(null);
        setIsReordering(false);
    };

    const handlePreviewDragEnd = () => {
        dragItemIndex.current = null;
        dragOverIndex.current = null;
        setDraggingIdx(null);
        setOverIdx(null);
        setIsReordering(false);
    };

    // Revoke any created object URLs on unmount
    useEffect(() => {
        return () => {
            createdUrlsRef.current.forEach(url => {
                try {
                    URL.revokeObjectURL(url);
                } catch (e) { }
            });
            createdUrlsRef.current = [];
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // Determine which category to use (subcategory if selected, otherwise parent)
            const categoryId = formData.categoryId;
            const subCategoryId = formData.subcategoryId;
            const brandId = formData.brandId;

            if (!categoryId) {
                setError('Zəhmət olmasa kateqoriya seçin');
                setIsSubmitting(false);
                return;
            }

            if (images.length === 0 && existingImages.length === 0) {
                setError('Zəhmət olmasa ən azı bir şəkil yükləyin');
                setIsSubmitting(false);
                return;
            }

            const firstPreviewUrl = imagePreviews[0];
            let mainImageId: string | undefined = undefined;
            let newMainImageIndex: number | undefined = undefined;

            if (firstPreviewUrl) {
                const matchedExisting = existingImages.find(img => {
                    const fullUrl = img.url.startsWith('http') ? img.url : `${SERVER_URL}${img.url}`;
                    return fullUrl === firstPreviewUrl;
                });

                if (matchedExisting) {
                    mainImageId = matchedExisting.id;
                } else {
                    newMainImageIndex = createdUrlsRef.current.indexOf(firstPreviewUrl);
                    if (newMainImageIndex === -1) newMainImageIndex = undefined;
                }
            }

            await adService.updateAd(id, {
                CityId: formData.cityId,
                Price: parseCurrency(formData.price),
                IsDeliverable: formData.isDeliverable,
                IsNew: formData.isNew,
                PhoneNumber: formData.phone,
                AdTypeId: formData.adTypeId,
                Title: formData.title,
                Images: images, // These are the NewImages
                CategoryId: subCategoryId || categoryId, // Backend expects the child-most category here
                SubCategoryId: brandId || undefined, // SubCategoryId in backend is for Brands
                FullName: formData.name,
                Email: formData.email,
                Description: formData.description,
                DeletedImageIds: deletedImageIds,
                DynamicFieldsJson: Object.keys(dynamicFieldValues).length > 0
                    ? JSON.stringify(dynamicFieldValues)
                    : undefined,
                MainImageId: mainImageId,
                NewMainImageIndex: newMainImageIndex,
            });

            // Redirect to cabinet on success
            router.push('/cabinet');
        } catch (err: any) {
            let errorMessage = 'Elan yenilənərkən xəta baş verdi';
            let isLimitError = false;

            if (err.message) {
                errorMessage = err.message;
            } else if (err.data) {
                if (typeof err.data === 'string') {
                    errorMessage = err.data;
                } else if (err.data.message) {
                    errorMessage = err.data.message;
                } else if (err.data.error) {
                    errorMessage = err.data.error;
                }
            }

            if (typeof errorMessage === 'string' && (errorMessage.toLowerCase().includes('limit') || errorMessage.toLowerCase().includes('balans'))) {
                isLimitError = true;
            }

            setError(isLimitError ? (
                <div className="flex flex-col gap-2">
                    <span>{errorMessage}</span>
                    <Link href="/cabinet" className="text-white underline font-bold mt-1">
                        Balansı artırmaq üçün şəxsi kabinetə keçin →
                    </Link>
                </div>
            ) : errorMessage);
            console.error('Error updating ad:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-gray-500 text-sm">Yüklənir...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="w-full flex justify-center py-5 sm:py-10 px-4 bg-white min-h-screen">
            <div className="container mx-auto max-w-4xl">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        <Link href={ROUTES.HOME} className="text-gray-500 text-sm font-medium leading-normal hover:text-primary transition-colors">
                            Ana Səhifə
                        </Link>
                        <span className="text-gray-500 text-sm font-medium leading-normal">/</span>
                        <Link href="/cabinet" className="text-gray-500 text-sm font-medium leading-normal hover:text-primary transition-colors">
                            Kabinet
                        </Link>
                        <span className="text-gray-500 text-sm font-medium leading-normal">/</span>
                        <span className="text-gray-900 text-sm font-medium leading-normal">Düzəliş et</span>
                    </div>
                </div>

                {/* Page Title */}
                <h1 className="text-gray-900 text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] mb-8">
                    Elanına düzəliş et
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className={`p-4 rounded-xl border flex items-start gap-3 ${typeof error === 'string' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-amber-600 border-amber-700 text-white'}`}>
                            <span className="material-symbols-outlined mt-0.5">error</span>
                            <div className="text-sm font-medium">{error}</div>
                        </div>
                    )}
                    {/* Section 1: Basic Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-gray-900 text-xl font-bold mb-6">Əsas Məlumatlar</h2>

                        <div className="space-y-4">
                            {/* Category */}
                            <Select
                                label="Kateqoriya"
                                options={parentCategories}
                                value={parentCategories.find(option => option.value === formData.categoryId)}
                                onChange={(option) => setFormData(prev => ({ ...prev, categoryId: option?.value || '' }))}
                                placeholder={isLoadingCategories ? 'Yüklənir...' : 'Kateqoriya seçin'}
                                isClearable
                                required
                                isLoading={isLoadingCategories}
                            />

                            {/* Subcategory - Hidden until parent category is selected */}
                            {showSubcategory && (
                                <Select
                                    label="Alt kateqoriya"
                                    options={subCategories}
                                    value={subCategories.find(option => option.value === formData.subcategoryId)}
                                    onChange={(option) => setFormData(prev => ({ ...prev, subcategoryId: option?.value || '' }))}
                                    placeholder={isLoadingSubCategories ? 'Yüklənir...' : 'Alt kateqoriya seçin'}
                                    isClearable
                                    required
                                    isLoading={isLoadingSubCategories}
                                />
                            )}

                            {showBrands && (
                                <Select
                                    label="Marka / Çeşid / Sahə"
                                    options={brands}
                                    value={brands.find(option => option.value === formData.brandId)}
                                    onChange={(option) => setFormData(prev => ({ ...prev, brandId: option?.value || '' }))}
                                    placeholder={isLoadingBrands ? 'Yüklənir...' : 'Marka / Çeşid / Sahə seçin'}
                                    isClearable
                                    isLoading={isLoadingBrands}
                                />
                            )}

                            {/* Ad Type */}
                            <Select
                                label="Elan növü"
                                options={adTypes}
                                value={adTypes.find(option => option.value === formData.adTypeId)}
                                onChange={(option) => setFormData(prev => ({ ...prev, adTypeId: option?.value || '' }))}
                                placeholder={isLoadingAdTypes ? 'Yüklənir...' : 'Elan növü seçin'}
                                isClearable
                                required
                                isLoading={isLoadingAdTypes}
                            />

                            {/* Limit Information */}
                            {selectedCategory && (
                                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3 mb-4">
                                    <span className="material-symbols-outlined text-blue-600 !text-2xl mt-0.5">info</span>
                                    <div className="flex-1">
                                        <p className="text-gray-900 text-sm font-semibold">Kateqoriya məlumatı</p>
                                        <div className="text-gray-600 text-xs mt-1 leading-relaxed">
                                            {selectedCategory.freeLimit > 0 ? (
                                                <>Bu bölmədə pulsuz elan limiti: <span className="font-bold text-gray-900">{selectedCategory.freeLimit}</span></>
                                            ) : (
                                                <span className="text-amber-700 font-bold">Bu bölmədə bütün elanlar ödənişlidir.</span>
                                            )}

                                            {categoryUsage !== null && (
                                                <div className="mt-1 text-gray-500 italic">
                                                    Mövcud istifadə: <span className={`font-bold ${categoryUsage >= selectedCategory.freeLimit ? 'text-error' : 'text-emerald-600'}`}>
                                                        {categoryUsage} / {selectedCategory.freeLimit}
                                                    </span> (son 30 gündə)
                                                </div>
                                            )}

                                            {selectedCategory.paidPrice1 > 0 && (
                                                <div className="mt-1 border-t border-blue-100/50 pt-1">
                                                    Qiymət: <span className="font-bold text-gray-900">{selectedCategory.paidPrice1.toFixed(2)} AZN</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Link href="/pages/limits_by_category" className="text-primary text-[10px] font-bold uppercase tracking-wider hover:underline">
                                                Bütün limitlərə bax
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* City */}
                            <Select
                                label="Şəhər"
                                options={cities}
                                value={cities.find(option => option.value === formData.cityId)}
                                onChange={(option) => setFormData(prev => ({ ...prev, cityId: option?.value || '' }))}
                                placeholder={isLoadingCities ? 'Yüklənir...' : 'Şəhər seçin'}
                                isClearable
                                required
                                isLoading={isLoadingCities}
                            />

                            {/* Title */}
                            <Input
                                label="Elanın başlığı"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Məsələn: iPhone 13 Pro Max 256GB"
                                required
                            />

                            {/* Description */}
                            <Textarea
                                label="Təsvir"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={6}
                                placeholder="Məhsul haqqında ətraflı məlumat yazın..."
                                required
                            />

                            {/* Price */}
                            <Input
                                label="Qiymət (₼)"
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder="0"
                                required
                            />

                            {/* Checkboxes - Hidden for service/job categories */}
                            {!['Xidmətlər və biznes', 'İş elanları', 'Daşınmaz əmlak'].some(cat => parentCategories.find(p => p.value === formData.categoryId)?.label?.toLowerCase() === cat.toLowerCase()) && (
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isNew}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
                                        />
                                        <span className="text-gray-900 text-sm font-medium">Yeni məhsul</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isDeliverable}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isDeliverable: e.target.checked }))}
                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
                                        />
                                        <span className="text-gray-900 text-sm font-medium">Çatdırılma mümkündür</span>
                                    </label>
                                </div>
                            )}

                            {/* Dynamic Category Fields */}
                            {categoryFields.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <h3 className="text-gray-700 text-sm font-semibold">Kateqoriyaya aid məlumatlar</h3>
                                    {categoryFields.map((field) => {
                                        if (field.fieldType === 'select' || field.fieldType === 'dependent_select') {
                                            let parsedOptions: string[] = [];
                                            try {
                                                const parsed = field.optionsJson ? JSON.parse(field.optionsJson) : [];

                                                if (Array.isArray(parsed)) {
                                                    parsedOptions = parsed;
                                                } else if (parsed && typeof parsed === 'object' && field.fieldType === 'dependent_select') {
                                                    // Handle dependent select (e.g. Model depends on Brand)
                                                    // Check for selected brand label first
                                                    const selectedBrandLabel = brands.find(b => b.value === formData.brandId)?.label;
                                                    if (selectedBrandLabel && Array.isArray(parsed[selectedBrandLabel])) {
                                                        parsedOptions = parsed[selectedBrandLabel];
                                                    } else {
                                                        // Try by ID as fallback
                                                        if (formData.brandId && Array.isArray(parsed[formData.brandId])) {
                                                            parsedOptions = parsed[formData.brandId];
                                                        }
                                                    }
                                                }
                                            } catch (e) {
                                                console.error('Error parsing optionsJson:', e);
                                            }

                                            const options: SelectOption[] = parsedOptions.map((opt: string) => ({ value: opt, label: opt }));
                                            return (
                                                <Select
                                                    key={field.id}
                                                    label={field.name + (field.isRequired ? ' *' : '')}
                                                    options={options}
                                                    value={options.find(o => o.value === dynamicFieldValues[field.id])}
                                                    onChange={(opt) => setDynamicFieldValues(prev => ({ ...prev, [field.id]: opt?.value || '' }))}
                                                    placeholder={`${field.name} seçin`}
                                                    isClearable
                                                />
                                            );
                                        }
                                        if (field.fieldType === 'number') {
                                            return (
                                                <Input
                                                    key={field.id}
                                                    label={field.name + (field.isRequired ? ' *' : '')}
                                                    type="number"
                                                    value={dynamicFieldValues[field.id] || ''}
                                                    onChange={(e) => setDynamicFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                    placeholder={field.name}
                                                />
                                            );
                                        }
                                        if (field.fieldType === 'checkbox') {
                                            return (
                                                <label key={field.id} className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={dynamicFieldValues[field.id] === 'true'}
                                                        onChange={(e) => setDynamicFieldValues(prev => ({ ...prev, [field.id]: e.target.checked.toString() }))}
                                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
                                                    />
                                                    <span className="text-gray-900 text-sm font-medium">{field.name}</span>
                                                </label>
                                            );
                                        }
                                        return (
                                            <Input
                                                key={field.id}
                                                label={field.name + (field.isRequired ? ' *' : '')}
                                                type="text"
                                                value={dynamicFieldValues[field.id] || ''}
                                                onChange={(e) => setDynamicFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                placeholder={field.name}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Images */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-gray-900 text-xl font-bold mb-6">Şəkillər</h2>

                        {/* Upload Area */}
                        <div
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-500 !text-4xl">
                                        cloud_upload
                                    </span>
                                </div>
                                <div>
                                    <p className="text-gray-900 font-medium mb-1">
                                        Şəkilləri yükləyin
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        və ya bu sahəyə sürüşdürün
                                    </p>
                                </div>
                                <p className="text-xs text-gray-400">
                                    PNG, JPG, JPEG (Maks. 10 MB)
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleImageUpload(e.target.files)}
                                className="hidden"
                            />
                        </div>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                                {imagePreviews.map((preview, index) => {
                                    const isDragged = isReordering && draggingIdx === index;
                                    const isOverTarget = isReordering && overIdx === index && draggingIdx !== index;

                                    return (
                                        <div
                                            key={index}
                                            draggable
                                            onDragStart={(e) => handlePreviewDragStart(e, index)}
                                            onDragEnter={(e) => handlePreviewDragEnter(e, index)}
                                            onDragOver={handlePreviewDragOver}
                                            onDrop={handlePreviewDrop}
                                            onDragEnd={handlePreviewDragEnd}
                                            className={`relative aspect-square rounded-lg overflow-hidden border border-gray-200 group transition-transform duration-200 select-none ${isDragged ? 'scale-105 z-30 shadow-xl rotate-[1deg] cursor-grabbing' : 'cursor-grab'} ${isOverTarget ? 'ring-2 ring-dashed ring-primary/60 bg-primary/5 drop-border-pulse' : ''}`}
                                        >
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className={`w-full h-full object-cover transition-transform duration-200 ${isDragged ? 'scale-110' : ''}`}
                                            />

                                            {isOverTarget && (
                                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg animate-bounce swap-bubble">
                                                        <span className="material-symbols-outlined">swap_horiz</span>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage(index);
                                                }}
                                                className="absolute top-2 right-2 w-8 h-8 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="material-symbols-outlined !text-lg">close</span>
                                            </button>

                                            {index === 0 && (
                                                <div className="absolute bottom-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                                                    Əsas
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Section 3: Contact Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-gray-900 text-xl font-bold mb-6">Əlaqə Məlumatları</h2>

                        <div className="space-y-4">
                            {/* Name */}
                            <Input
                                label="Ad, Soyad"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Ad və soyadınızı daxil edin"
                                required
                            />

                            {/* Email */}
                            <Input
                                label="E-mail"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="email@example.com"
                                required
                            />

                            {/* Phone */}
                            <Input
                                label="Telefon"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+994 XX XXX XX XX"
                                required
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-error/10 border border-error rounded-lg p-4">
                            <div className="text-error text-sm font-medium">{error}</div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
                        <Link href="/cabinet">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-6 h-12 rounded-lg border border-gray-300 bg-white text-gray-900 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                İmtina et
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-6 h-12 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Yüklənir...' : 'Yadda saxla'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
