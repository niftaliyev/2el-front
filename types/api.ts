// ================================
// AD TYPES (matches DTOs/Ad)
// ================================

export interface AdImage {
  id: string;
  url: string;
}

// Matches AdListDto
export interface AdListItem {
  id: string;
  title: string;
  slug?: string;
  parentCategoryName?: string;
  parentCategoryNameRu?: string;
  parentCategorySlug?: string;
  childCategorySlug?: string;
  description: string;
  price: number;
  status: string; // "Active" | "Pending" | "Inactive" | "Rejected"
  image?: string;
  createdDate: string;
  categoryId?: string;
  subCategoryId?: string;
  isVip: boolean;
  isPremium: boolean;
  isBoosted: boolean;
  boostedAt?: string;
  vipExpiresAt?: string;
  premiumExpiresAt?: string;
  totalBoostsRemaining: number;
  city?: string;
  cityRu?: string;
  category?: string;
  categoryRu?: string;
  adType?: string;
  adTypeRu?: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  isNew: boolean;
  isDeliverable: boolean;
  viewCount: number;
  expiresAt?: string;
  isStore: boolean;
  storeName?: string;
  storeSlug?: string;
  storeLogoUrl?: string;
  storeHeadline?: string;
  storeHeadlineRu?: string;
  isFavourite: boolean;
}

// Matches AdDetailDto
export interface AdDetail {
  id: string;
  userId: string;
  title: string;
  slug?: string;
  parentCategoryName?: string;
  parentCategoryNameRu?: string;
  parentCategorySlug?: string;
  childCategorySlug?: string;
  description: string;
  price: number;
  createdDate: string;
  expiresAt?: string;
  status: string;
  rejectReason?: string;
  images: string[];
  category?: string;
  categoryRu?: string;
  categoryId?: string;
  subCategory?: string;
  subCategoryRu?: string;
  subCategoryId?: string;
  city?: string;
  cityRu?: string;
  cityId?: string;
  adType?: string;
  adTypeRu?: string;
  adTypeId?: string;
  isNew: boolean;
  isDeliverable: boolean;
  fullName: string;
  phoneNumber: string;
  email: string;
  isVip: boolean;
  isPremium: boolean;
  isBoosted: boolean;
  boostedAt?: string;
  vipExpiresAt?: string;
  premiumExpiresAt?: string;
  totalBoostsRemaining: number;
  isFavourite: boolean;
  viewCount: number;
  isStore: boolean;
  storeId?: string;
  storeName?: string;
  storeSlug?: string;
  storeLogoUrl?: string;
  storeHeadline?: string;
  storeHeadlineRu?: string;
  storeDescription?: string;
  storeAddress?: string;
  contactNumber2?: string;
  contactNumber3?: string;
  storeAdCount?: number;
  isFollowingStore?: boolean;
  storeWebsite?: string;
  storeInstagram?: string;
  storeTikTok?: string;
  storeFacebook?: string;
  storeWorkSchedules?: StoreWorkSchedule[];
  dynamicFields: AdFieldDto[];
}

export interface StoreWorkSchedule {
  dayOfWeek: number;
  openTime?: string;
  closeTime?: string;
  isOpen24Hours: boolean;
}

// Matches AdEditDto
export interface AdEditData {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId?: string;
  subCategoryId?: string;
  brandId?: string;
  cityId?: string;
  adTypeId?: string;
  isNew: boolean;
  isDeliverable: boolean;
  fullName: string;
  phoneNumber: string;
  email: string;
  images: AdImage[];
  dynamicFields: AdFieldDto[];
}

// For create request (form)
export interface CreateAdRequest {
  CityId: string;
  Price: number;
  IsDeliverable: boolean;
  IsNew: boolean;
  PhoneNumber: string;
  AdTypeId: string;
  Title: string;
  Images: File[];
  CategoryId: string;
  SubCategoryId?: string;
  FullName: string;
  Email: string;
  Description: string;
  DynamicFieldsJson?: string;
  PackagePriceId?: string;
}

export interface CategoryFieldDto {
  id: string;
  name: string;
  nameRu?: string;
  fieldType: string;
  isRequired: boolean;
  optionsJson?: string;
  optionsJsonRu?: string;
}

export interface AdFieldDto {
  categoryFieldId: string;
  name: string;
  nameRu?: string;
  value: string;
  valueRu?: string;
}

export interface SubCategoryDto {
  id: string;
  name: string;
  nameRu?: string;
  slug?: string;
  imageUrl?: string;
  categoryId: string;
}

export interface ContactInfo {
  fullName: string;
  phoneNumber: string;
  email: string;
}

export interface CategoryDto {
  id: string;
  name: string;
  nameRu?: string;
  slug?: string;
  parentId?: string;
  imageUrl?: string;
  icon?: string;
  children?: CategoryDto[];
  subCategories?: SubCategoryDto[];
  categoryFields?: CategoryFieldDto[];
  freeLimit: number;
  paidPrice1: number;
  paidPrice3: number;
  paidPrice5: number;
  paidPrice10: number;
  paidPrice20: number;
  paidPrice25: number;
  paidPrice50: number;
  paidPrice75: number;
  paidPrice80: number;
}


// ================================
// STORE TYPES (matches DTOs/Store)
// ================================

export interface StoreWorkSchedule {
  dayOfWeek: number; // 0=Sunday ... 6=Saturday
  openTime?: string;
  closeTime?: string;
  isOpen24Hours: boolean;
}

export interface StoreListItem {
  id: string;
  storeName: string;
  description: string;
  descriptionRu?: string;
  storeLogoUrl?: string;
  storeCoverUrl?: string;
  headline?: string;
  headlineRu?: string;
  followerCount: number;
  viewCount: number;
  adCount: number;
  slug?: string;
  cityId?: string;
  cityName?: string;
  cityNameRu?: string;
  contactNumber?: string;
  categories: string[];
  categoriesRu: string[];
}

export interface StoreAdItem {
  id: string;
  title: string;
  slug?: string;
  price: number;
  image?: string;
  createdDate: string;
  isStore?: boolean;
  categoryName?: string;
  categoryNameRu?: string;
  city?: string;
  cityRu?: string;
  isNew: boolean;
  isVip?: boolean;
  isPremium?: boolean;
  isBoosted?: boolean;
  isFavourite: boolean;
}

export interface StoreDetail {
  id: string;
  storeName: string;
  description: string;
  descriptionRu?: string;
  contactNumber: string;
  contactNumber2?: string;
  contactNumber3?: string;
  address: string;
  storeLogoUrl?: string;
  storeCoverUrl?: string;
  website?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  headline?: string;
  headlineRu?: string;
  followerCount: number;
  viewCount: number;
  adCount: number;
  slug?: string;
  cityId?: string;
  cityName?: string;
  cityNameRu?: string;
  isFollowing?: boolean;
  workSchedules: StoreWorkSchedule[];
  photos: string[];
}

// ================================
// PACKAGE TYPES (matches DTOs/Package)
// ================================

export interface PackageItem {
  id: string;
  price: number;
  intervalDay?: number;
  intervalHours?: number;
  boostCount?: number;
  description: string;
  descriptionRu?: string;
  packageType: string;
}

export interface BusinessPackageDto {
  id: string;
  name: string;
  nameRu?: string;
  basePrice: number;
  serviceBalance: number;
  adLimit: number;
  serviceDiscountPercentage: number;
  discount60Days: number;
  discount90Days: number;
  discount180Days: number;
  description?: string;
  descriptionRu?: string;
}

// ================================
// LOOKUP / SYSTEM TYPES
// ================================

export interface LookupItem {
  id: string;
  name: string;
  nameRu?: string;
}

// ================================
// PAGINATION (matches ResponsePaginationModel)
// ================================

export interface PaginatedResponse<T> {
  data: T;
  page?: number;        // New format
  currentPage?: number; // Old format
  totalPages: number;
  pageSize: number;
  totalCount: number;
  isSuccess?: boolean;
}

// ================================
// ADMIN TYPES
// ================================

export interface PendingBalanceRequest {
  id: string;
  amount: number;
  userId: string;
  image: string;
  userName: string;
}

export interface CreditUserRequest {
  userId: string;
  amount: number;
  increaseBalanceId?: string;
}

export interface RoleItem {
  id: string;
  name: string;
  permissions: string[];
}

// ================================
// REPORT TYPES
// ================================

export enum ReportReason {
  FalseInformation = 1,
  Fraud = 2,
  OffensiveContent = 3,
  Duplicate = 4,
  WrongCategory = 5,
  IllegalItem = 6,
  Other = 99
}

export interface CreateAdReportRequest {
  adId: string;
  reason: ReportReason;
  note: string;
}

export interface CreateStoreReportRequest {
  storeId: string;
  reason: ReportReason;
  note: string;
}

export interface ReportReasonLookup {
  value: number;
  name: string;
}
