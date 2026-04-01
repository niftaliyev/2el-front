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

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInSeconds / 3600);
  const diffInDays = Math.floor(diffInSeconds / 86400);

  // Today
  if (diffInDays === 0) {
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `Bugün, ${hours}:${minutes}`;
  }

  // Yesterday
  if (diffInDays === 1) {
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `Dünən, ${hours}:${minutes}`;
  }

  // Days ago
  if (diffInDays < 7) {
    return `${diffInDays} gün əvvəl`;
  }

  // Weeks ago
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} həftə əvvəl`;
  }

  // Months ago
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} ay əvvəl`;
  }

  return formatDate(d);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateSlug(text: string): string {
  return text
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
  const baseUrl = 'http://34.118.33.240';
  
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
