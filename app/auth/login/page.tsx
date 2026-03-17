'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      // Redirect to home page after successful login
      router.push(ROUTES.HOME);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Daxil olma zamanı xəta baş verdi');
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
                Xoş Gəlmisiniz!
              </h1>
              <p className="mt-2 text-base text-gray-500">
                Hesabınıza daxil olun
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="E-poçt və ya telefon nömrəsi"
                type="text"
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
                  placeholder="Şifrənizi daxil edin"
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

              <div className="flex justify-end">
                <Link
                  href="#"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Şifrəni unutmusunuz?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-12 text-base font-bold"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Daxil ol
              </Button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Hesabınız yoxdur?{' '}
                  <Link
                    href={ROUTES.REGISTER}
                    className="font-medium text-primary hover:underline"
                  >
                    Qeydiyyatdan keçin
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
  );
}
