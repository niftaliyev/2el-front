'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants';
import { authService } from '@/services/auth.service';
import { useLanguage } from '@/contexts/LanguageContext';

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordsNotMatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.newPassword')); // Typically validation message
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({
        email,
        token,
        newPassword: password,
      });

      setSuccess(t('auth.passwordResetSuccess'));
      setPassword('');
      setConfirmPassword('');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err?.response?.data?.message || err?.message || t('auth.passwordResetError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8 text-center">
        <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Yanlış link</h2>
        <p className="text-sm text-gray-500 mb-6">
          Şifrə sıfırlama linki yararsızdır və ya eksik məlumat var.
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          {t('auth.backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8 transition-all hover:shadow-xl">
      {/* Page Heading */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-black tracking-tight text-gray-900">
          {t('auth.resetPasswordTitle')}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {t('auth.resetPasswordSubtitle')}
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

      {/* Reset Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label={t('auth.password')}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.enterPassword')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || !!success}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>

        <Input
          label={t('auth.confirmPassword')}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading || !!success}
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full h-12 text-base font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all"
          isLoading={isLoading}
          disabled={isLoading || !!success}
        >
          {t('auth.resetPasswordButton')}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 bg-gray-50/50 dark:bg-gray-950/20">
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
          </div>
        }
      >
        <ResetPasswordFormContent />
      </Suspense>
    </main>
  );
}
