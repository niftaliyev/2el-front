'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsNotMatch'));
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
      });

      // Redirect to home page after successful registration
      router.push(ROUTES.HOME);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.message || t('auth.registrationError'));

      if (err?.validationErrors) {
        setFieldErrors(err.validationErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
          {/* Page Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t('auth.registration')}
            </h1>
            <p className="mt-2 text-base text-gray-500">
              {t('auth.createAccount')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 mb-6 border border-red-100">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base mt-0.5">error</span>
                <div className="flex-1">
                  <p className="font-semibold mb-1">{t('auth.errorOccurred')}</p>
                  {error.includes(',') ? (
                    <ul className="list-disc list-inside space-y-0.5 text-xs opacity-90">
                      {error.split(',').map((err, i) => (
                        <li key={i}>{err.trim()}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{error}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.fullName')}
              type="text"
              placeholder={t('auth.fullNamePlaceholder')}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              disabled={isLoading}
              required
              error={fieldErrors['fullName']?.[0] || fieldErrors['FullName']?.[0]}
            />

            <Input
              label={t('auth.phoneNumber')}
              type="tel"
              placeholder={t('auth.phonePlaceholder')}
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              disabled={isLoading}
              required
              pattern="^(?:\+994|0)(?:10|50|51|55|70|77|99)\d{7}$"
              title={t('auth.phoneError')}
              error={fieldErrors['phoneNumber']?.[0] || fieldErrors['PhoneNumber']?.[0]}
            />

            <Input
              label={t('auth.email')}
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
              required
              error={fieldErrors['email']?.[0] || fieldErrors['Email']?.[0]}
            />

            <div className="relative">
              <Input
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.newPassword')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                required
                error={fieldErrors['password']?.[0] || fieldErrors['Password']?.[0]}
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

            <div className="relative">
              <Input
                label={t('auth.confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              {t('auth.agreeTerms')}{' '}
              <Link href="#" className="font-medium text-primary hover:underline">
                {t('auth.userAgreement')}
              </Link>{' '}
              {t('auth.agreeTermsEnd')}
            </p>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-base font-bold"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {t('auth.registerButton')}
            </Button>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.alreadyHaveAccount')}{' '}
                <Link
                  href={ROUTES.LOGIN}
                  className="font-medium text-primary hover:underline"
                >
                  {t('auth.loginLink')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
