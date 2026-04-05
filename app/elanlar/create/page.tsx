'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import Select, { SelectOption } from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { adService } from '@/services/ad.service';
import { CategoryDto, CategoryFieldDto, LookupItem, PackageItem } from '@/types/api';
import { parseCurrency } from '@/lib/utils';
import PromotionPackages from '@/components/listings/PromotionPackages';

// cityOptions removed - now fetched from API

export default function CreateListingPage() {
  const router = useRouter();
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
  const [adTypes, setAdTypes] = useState<SelectOption[]>([]);
  const [cities, setCities] = useState<SelectOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [isLoadingAdTypes, setIsLoadingAdTypes] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [showSubcategory, setShowSubcategory] = useState(false);

  const [brands, setBrands] = useState<SelectOption[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [showBrands, setShowBrands] = useState(false);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItemIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);
  const createdUrlsRef = useRef<string[]>([]);

  // Dynamic category fields
  const [categoryFields, setCategoryFields] = useState<CategoryFieldDto[]>([]);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null);
  const [categoryUsage, setCategoryUsage] = useState<number | null>(null);

  // Promotion Packages state
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  // Fetch parent categories on mount
  useEffect(() => {
    const fetchParentCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const categories = await adService.getCategories();
        const options: SelectOption[] = categories.map(cat => ({
          value: cat.id.toString(),
          label: cat.name,
        }));
        setParentCategories(options);
      } catch (err: any) {
        setError('Kateqoriyaları yükləmək mümkün olmadı');
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchParentCategories();
  }, []);

  // Auto-fill contact info from logged-in user
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const info = await adService.getContactInfo();
        setFormData(prev => ({
          ...prev,
          name: info.fullName || prev.name,
          email: info.email || prev.email,
          phone: info.phoneNumber || prev.phone,
        }));
      } catch (err) {
        // User not logged in or no contact info - ignore
      }
    };
    fetchContactInfo();
  }, []);

  // Fetch ad types on mount
  useEffect(() => {
    const fetchAdTypes = async () => {
      setIsLoadingAdTypes(true);
      try {
        const types = await adService.getAdTypes();
        const options: SelectOption[] = types.map(type => ({
          value: type.id.toString(),
          label: type.name,
        }));
        setAdTypes(options);
      } catch (err: any) {
        setError('Elan növlərini yükləmək mümkün olmadı');
        console.error('Error fetching ad types:', err);
      } finally {
        setIsLoadingAdTypes(false);
      }
    };

    fetchAdTypes();
  }, []);

  // Fetch cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const categories = await adService.getCities();
        const options: SelectOption[] = categories.map(city => ({
          value: city.id.toString(),
          label: city.name,
        }));
        setCities(options);
      } catch (err: any) {
        console.error('Error fetching cities:', err);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // Fetch promotion packages on mount
  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoadingPackages(true);
      try {
        const pkgs = await adService.getAllPackages();
        setPackages(pkgs);
      } catch (err: any) {
        console.error('Error fetching packages:', err);
      } finally {
        setIsLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  // Fetch subcategories when parent category is selected
  useEffect(() => {
    if (formData.categoryId) {
      const fetchSubCategories = async () => {
        setIsLoadingSubCategories(true);
        setShowSubcategory(true);
        setSubCategories([]);
        setFormData(prev => ({ ...prev, subcategoryId: '' }));
        try {
          const categories = await adService.getCategories(formData.categoryId || undefined);
          const options: SelectOption[] = categories.map(cat => ({
            value: cat.id.toString(),
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
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    }
  }, [formData.categoryId]);

  // Load category fields when subcategory (child category) is selected
  useEffect(() => {
    if (formData.subcategoryId) {
      // Find the selected child category from subCategories and get its parent's fields
      // The fields come from the selected child category (which is the actual category with fields)
      const loadCategoryFields = async () => {
        try {
          const cats = await adService.getCategories(formData.categoryId || undefined);
          const selectedCat = cats.find(c => c.id === formData.subcategoryId);
          if (selectedCat) {
            setSelectedCategory(selectedCat);
            if (selectedCat.categoryFields && selectedCat.categoryFields.length > 0) {
              setCategoryFields(selectedCat.categoryFields);
            } else {
              setCategoryFields([]);
            }

            // Fetch usage for this category
            try {
              const usage = await adService.getCategoryUsage(selectedCat.id);
              setCategoryUsage(usage);
            } catch {
              setCategoryUsage(null);
            }
          } else {
            setSelectedCategory(null);
            setCategoryFields([]);
            setCategoryUsage(null);
          }
        } catch {
          setSelectedCategory(null);
          setCategoryFields([]);
          setCategoryUsage(null);
        }
      };
      loadCategoryFields();
    } else {
      setCategoryFields([]);
    }
    setDynamicFieldValues({});
  }, [formData.subcategoryId, formData.categoryId]);

  // Fetch brands/types when subcategory (child category) is selected
  useEffect(() => {
    if (formData.subcategoryId) {
      const fetchBrands = async () => {
        setIsLoadingBrands(true);
        setBrands([]);
        setFormData(prev => ({ ...prev, brandId: '' }));
        try {
          const fetchedBrands = await adService.getSubCategories(formData.subcategoryId);
          if (fetchedBrands && fetchedBrands.length > 0) {
            const options: SelectOption[] = fetchedBrands.map(b => ({
              value: b.id.toString(),
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
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke the URL to free up memory and remove from created list
      const url = prev[index];
      try {
        URL.revokeObjectURL(url);
      } catch (e) { }
      createdUrlsRef.current = createdUrlsRef.current.filter(u => u !== url);
      return newPreviews;
    });
  };

  // Preview drag-and-drop handlers for reordering
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

    setImages(prev => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });

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
      const categoryId = formData.subcategoryId || formData.categoryId;

      if (!categoryId) {
        setError('Zəhmət olmasa kateqoriya seçin');
        setIsSubmitting(false);
        return;
      }

      if (images.length === 0) {
        setError('Zəhmət olmasa ən azı bir şəkil yükləyin');
        setIsSubmitting(false);
        return;
      }

      await adService.createAd({
        CityId: formData.cityId,
        Price: parseCurrency(formData.price),
        IsDeliverable: formData.isDeliverable,
        IsNew: formData.isNew,
        PhoneNumber: formData.phone,
        AdTypeId: formData.adTypeId,
        Title: formData.title,
        Images: images,
        CategoryId: categoryId,
        SubCategoryId: formData.brandId || undefined,
        FullName: formData.name,
        Email: formData.email,
        Description: formData.description,
        DynamicFieldsJson: Object.keys(dynamicFieldValues).length > 0
          ? JSON.stringify(dynamicFieldValues)
          : undefined,
        PackagePriceId: selectedPackageId || undefined,
      });

      // Redirect to home page on success
      router.push(ROUTES.HOME);
    } catch (err: any) {
      let errorMessage = 'Elan yerləşdirilərkən xəta baş verdi';
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

      // Check if it's a limit/balance error to show a better UI
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
      console.error('Error creating ad:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span className="text-gray-900 text-sm font-medium leading-normal">Yeni elan</span>
          </div>
        </div>

        {/* Page Title */}
        <h1 className="text-gray-900 text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] mb-8">
          Yeni elan yerləşdirin
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
                  isLoading={isLoadingSubCategories}
                />
              )}

              {/* Brand/Type - Hidden until child category is selected and has brands */}
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
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
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
                    // Default: text field
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

          {/* Section 4: Promotion Packages */}
          {packages.length > 0 && (
            <PromotionPackages 
              packages={packages} 
              selectedPackageId={selectedPackageId} 
              onSelect={setSelectedPackageId} 
            />
          )}

          {/* Section 5: Contact Information */}
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
            <Link href={ROUTES.HOME}>
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
              {isSubmitting ? 'Yüklənir...' : 'Elanı Dərc Et'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
