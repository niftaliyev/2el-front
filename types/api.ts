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
  description: string;
  price: number;
  status: string; // "Active" | "Pending" | "Inactive" | "Rejected"
  image?: string;
  createdDate: string;
  categoryId?: string;
  isVip: boolean;
  isPremium: boolean;
  isBoosted: boolean;
  boostedAt?: string;
  city?: string;
  category?: string;
  adType?: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  isNew: boolean;
  isDeliverable: boolean;
  viewCount: number;
  expiresAt?: string;
  isStore: boolean;
  isFavourite: boolean;
}

// Matches AdDetailDto
export interface AdDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  createdDate: string;
  expiresAt?: string;
  status: string;
  rejectReason?: string;
  images: string[];
  category?: string;
  categoryId?: string;
  subCategory?: string;
  subCategoryId?: string;
  city?: string;
  cityId?: string;
  adType?: string;
  adTypeId?: string;
  isNew: boolean;
  isDeliverable: boolean;
  fullName: string;
  phoneNumber: string;
  email: string;
  isVip: boolean;
  isPremium: boolean;
  isBoosted: boolean;
  isFavourite: boolean;
  viewCount: number;
  dynamicFields: AdFieldDto[];
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
}

export interface CategoryFieldDto {
  id: string;
  name: string;
  fieldType: string;
  isRequired: boolean;
  optionsJson?: string;
}

export interface AdFieldDto {
  categoryFieldId: string;
  name: string;
  value: string;
}

export interface SubCategoryDto {
  id: string;
  name: string;
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
  parentId?: string;
  imageUrl?: string;
  children?: CategoryDto[];
  categoryFields?: CategoryFieldDto[];
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

export interface StoreAdItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  createdDate: string;
  isStore?: boolean;
}

export interface StoreDetail {
  id: string;
  storeName: string;
  description: string;
  contactNumber: string;
  address: string;
  storeLogoUrl?: string;
  storeCoverUrl?: string;
  website?: string;
  followerCount: number;
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
  packageType: string;
}

// ================================
// LOOKUP / SYSTEM TYPES
// ================================

export interface LookupItem {
  id: string;
  name: string;
}

// ================================
// PAGINATION (matches ResponsePaginationModel)
// ================================

export interface PaginatedResponse<T> {
  data: T;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  isSuccess: boolean;
}

// ================================
// ADMIN TYPES
// ================================

export interface PendingBalanceRequest {
  amount: number;
  userId: string;
  image: string;
  userName: string;
}

export interface CreditUserRequest {
  userId: string;
  amount: number;
}

export interface RoleItem {
  id: string;
  name: string;
  permissions: string[];
}
