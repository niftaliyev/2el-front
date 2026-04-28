'use client';

import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Returns a language-aware relative time formatter function.
 * Usage: const formatRelativeTime = useFormatRelativeTime();
 */
export function useFormatRelativeTime() {
  const { t, language } = useLanguage();

  return function formatRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();

    // Calculate calendar days difference
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffInDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / (1000 * 3600 * 24));

    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    // Today
    if (diffInDays === 0) {
      return `${t('product.today')}, ${hours}:${minutes}`;
    }

    // Yesterday
    if (diffInDays === 1) {
      return `${t('product.yesterday')}, ${hours}:${minutes}`;
    }

    // Days ago
    if (diffInDays < 7) {
      return `${diffInDays} ${t('product.daysAgo')}`;
    }

    // Weeks ago
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${t('product.weeksAgo')}`;
    }

    // Months ago
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${t('product.monthsAgo')}`;
    }

    // Fallback: full date
    return new Intl.DateTimeFormat(language === 'az' ? 'az-AZ' : 'ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  };
}
