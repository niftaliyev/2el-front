'use client';

import { useState } from 'react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants';
import { authService } from '@/services/auth.service';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(t('auth.resetLinkSent'));
      setEmail('');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err?.response?.data?.message || err?.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 bg-gray-50/50 dark:bg-gray-950/20">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8 transition-all hover:shadow-xl">
          {/* Page Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t('auth.forgotPasswordTitle')}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {t('auth.forgotPasswordSubtitle')}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-600 border border-green-200 flex items-start gap-2 animate-fade-in">
              <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">check_circle</span>
              <span>{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200 flex items-start gap-2 animate-fade-in">
              <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.email')}
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-base font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {t('auth.sendResetLink')}
            </Button>

            <div className="mt-4 text-center">
              <Link
                href={ROUTES.LOGIN}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                {t('auth.backToLogin')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
