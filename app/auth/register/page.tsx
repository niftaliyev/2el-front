'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Şifrələr uyğun gəlmir');
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
      setError(err?.message || 'Qeydiyyat zamanı xəta baş verdi');
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
                Qeydiyyat
              </h1>
              <p className="mt-2 text-base text-gray-500">
                Yeni hesab yaradın
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Ad və Soyad"
                type="text"
                placeholder="Ad və soyadınızı daxil edin"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={isLoading}
                required
              />

              <Input
                label="Telefon nömrəsi"
                type="tel"
                placeholder="+994XX XXX XX XX"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                disabled={isLoading}
                required
              />

              <Input
                label="E-poçt"
                type="email"
                placeholder="nümunə@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                required
              />

              <div className="relative">
                <Input
                  label="Şifrə"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Yeni şifrə yaradın"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
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

              <div className="relative">
                <Input
                  label="Şifrənin təkrarı"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Şifrənizi təsdiqləyin"
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
                Qeydiyyatdan keçməklə, saytın{' '}
                <Link href="#" className="font-medium text-primary hover:underline">
                  İstifadəçi Razılaşmasını
                </Link>{' '}
                qəbul edirsiniz.
              </p>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-12 text-base font-bold"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Qeydiyyatdan keç
              </Button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Artıq hesabınız var?{' '}
                  <Link
                    href={ROUTES.LOGIN}
                    className="font-medium text-primary hover:underline"
                  >
                    Daxil olun
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
  );
}
