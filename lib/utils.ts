import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = '₼'): string {
  return `${price.toLocaleString('en-US')} ${currency}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatRelativeTime(date: Date | string, language: string = 'az'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Calculate calendar days difference
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffInDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / (1000 * 3600 * 24));

  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  const isRu = language === 'ru';

  // Today
  if (diffInDays === 0) {
    return isRu ? `Сегодня, ${hours}:${minutes}` : `Bugün, ${hours}:${minutes}`;
  }

  // Yesterday
  if (diffInDays === 1) {
    return isRu ? `Вчера, ${hours}:${minutes}` : `Dünən, ${hours}:${minutes}`;
  }

  // Days ago
  if (diffInDays < 7) {
    if (isRu) {
      if (diffInDays === 1) return '1 день назад';
      if (diffInDays >= 2 && diffInDays <= 4) return `${diffInDays} дня назад`;
      return `${diffInDays} дней назад`;
    }
    return `${diffInDays} gün əvvəl`;
  }

  // Weeks ago
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    if (isRu) {
      if (weeks === 1) return '1 неделю назад';
      if (weeks >= 2 && weeks <= 4) return `${weeks} недели назад`;
      return `${weeks} недель назад`;
    }
    return `${weeks} həftə əvvəl`;
  }

  // Months ago
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    if (isRu) {
      if (months === 1) return '1 месяц назад';
      if (months >= 2 && months <= 4) return `${months} месяца назад`;
      return `${months} месяцев назад`;
    }
    return `${months} ay əvvəl`;
  }

  return d.toLocaleDateString(isRu ? 'ru-RU' : 'az-AZ');
}

/**
 * Translates common Azerbaijani service description patterns in cabinet/invoices
 */
export function translateCabinetService(text: string, language: string): string {
  if (language !== 'ru') return text;
  
  let translated = text;
  
  // Promotion types
  translated = translated.replace(/Irəli çək xidməti/g, 'Услуга поднятия');
  translated = translated.replace(/VIP xidməti/g, 'VIP услуга');
  translated = translated.replace(/Premium xidməti/g, 'Premium услуга');
  
  // Limits
  translated = translated.replace(/Limitdən artıq elan yerləşdirilməsi/g, 'Размещение объявления сверх лимита');
  
  // Discounts
  translated = translated.replace(/Biznes Endirimi/g, 'Бизнес-скидка');
  
  // Entities
  translated = translated.replace(/\(Elan:/g, '(Объявление:');
  
  // Package names
  translated = translated.replace(/Mini paketi/g, 'Мини пакет');
  translated = translated.replace(/Standart paketi/g, 'Стандартный пакет');
  translated = translated.replace(/Premium paketi/g, 'Премиум пакет');
  translated = translated.replace(/Full paketi/g, 'Полный пакет');
  translated = translated.replace(/paketi/g, 'пакет');
  
  // Common phrases
  translated = translated.replace(/Razılaşma yolu ilə/g, 'По договоренности');
  
  return translated;
}

export function getDaysLeft(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = d.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 3600 * 24));
  return diffInDays > 0 ? diffInDays : 0;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateSlug(text: string | null | undefined): string {
  if (!text) return '';
  const azMap: Record<string, string> = {
    'ə': 'e', 'ı': 'i', 'ö': 'o', 'ü': 'u', 'ç': 'c', 'ş': 's', 'ğ': 'g',
    'Ə': 'e', 'I': 'i', 'Ö': 'o', 'Ü': 'u', 'Ç': 'c', 'Ş': 's', 'Ğ': 'g'
  };
  
  return text
    .split('')
    .map(char => azMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Get full image URL from relative path
 */
export function getImageUrl(imagePath: string | undefined | null): string {
  // Handle missing, empty, or whitespace-only paths
  if (!imagePath || !imagePath.trim()) return '';
  
  // If already a full URL (including blobs), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('blob:')) {
    return imagePath;
  }
  
  // Local Development: 'http://localhost:5156'
  // Local  Docker: 'http://localhost:5000'
  // Prod Development: 'http://84.247.184.186:5000'
  const baseUrl = 'http://84.247.184.186:5000';
  
  // Build normalized path (ensuring it starts with / and doesn't overlap)
  const cleanPath = imagePath.trim();
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Parse a price string into a number, handling dots and commas based on AZ/TR locale
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  
  // Remove all non-digit and non-punctuation characters (like spaces, currency symbols)
  let sanitized = value.replace(/[^\d.,-]/g, '');
  
  // If it has both , and .
  if (sanitized.includes(',') && sanitized.includes('.')) {
    // Assume the last one is the decimal separator
    const commaIndex = sanitized.lastIndexOf(',');
    const dotIndex = sanitized.lastIndexOf('.');
    if (commaIndex > dotIndex) {
      // 800.000,50 -> 800000.50
      sanitized = sanitized.replace(/\./g, '').replace(',', '.');
    } else {
      // 800,000.50 -> 800000.50
      sanitized = sanitized.replace(/,/g, '');
    }
  } else if (sanitized.includes(',')) {
    // If only comma exists, check if it's thousands or decimal
    const parts = sanitized.split(',');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      // 800,000 -> 800000
      sanitized = sanitized.replace(/,/g, '');
    } else {
      // 800,50 -> 800.50
      sanitized = sanitized.replace(',', '.');
    }
  } else if (sanitized.includes('.')) {
    // If only dot exists, check if it's thousands or decimal
    const parts = sanitized.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      // 800.000 -> 800000
      sanitized = sanitized.replace(/\./g, '');
    }
    // Else it's 800.50 which is already fine for parseFloat
  }
  
  return parseFloat(sanitized) || 0;
}
