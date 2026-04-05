'use client';

import { useState, useRef } from 'react';
import { adService } from '@/services/ad.service';
import { toast } from 'sonner';

interface TopUpBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TopUpBalanceModal({ isOpen, onClose, onSuccess }: TopUpBalanceModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Şəkil ölçüsü 5MB-dan çox olmamalıdır');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Zəhmət olmasa düzgün məbləğ daxil edin');
      return;
    }
    if (!file) {
      setError('Zəhmət olmasa ödəniş qəbzinin şəklini yükləyin');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await adService.increaseBalance(parseFloat(amount), file);
      // Success
      toast.success('Balans artırma sorğusu göndərildi', {
        description: 'Moderator tərəfindən təsdiqləndikdən sonra balansınız yenilənəcək.',
        duration: 5000,
      });
      onSuccess?.();
      onClose();
      // Reset state
      setAmount('');
      setFile(null);
      setPreview(null);
    } catch (err: any) {
      console.error('Top-up failed:', err);
      setError(err.message || 'Sorğu göndərilərkən xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Balansı Artır</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-500">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Məbləğ (AZN)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="0.00"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₼</span>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ödəniş qəbzi (şəkil)</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                  preview ? 'border-primary' : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                }`}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Receipt Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Şəkli dəyiş</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center px-4">
                    <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">upload_file</span>
                    <p className="text-sm text-gray-500">Qəbz şəklini bura yükləyin</p>
                    <p className="text-xs text-gray-400 mt-1">Maks. 5MB (JPG, PNG)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                İmtina
              </button>
              <button
                type="submit"
                className="flex-[2] h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Göndərilir...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined !text-lg text-white">send</span>
                    <span>Təsdiq et</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
