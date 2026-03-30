'use client';

import { useState, useRef } from 'react';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import { accountService } from '@/services/account.service';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentsPage() {
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('image', file);
      
      await accountService.topUpBalance(formData);
      
      setSuccess(true);
      setAmount('');
      setFile(null);
      setPreview(null);
      refreshUser();
    } catch (err: any) {
      console.error('Top-up failed:', err);
      setError(err.response?.data?.message || err.message || 'Sorğu göndərilərkən xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-5 sm:py-10 px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <UserSidebar />

          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              {/* Page Heading */}
              <div className="mb-8 border-b border-gray-100 pb-8">
                <h1 className="text-gray-900 text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] mb-2 uppercase">
                  Balans artırılması
                </h1>
                <p className="text-gray-500 text-base font-medium">
                  Cari balansınız: <span className="text-primary font-black text-xl">{user?.balance?.toFixed(2) || '0.00'} AZN</span>
                </p>
              </div>

              <div className="max-w-2xl">
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 flex items-start gap-4 animate-in slide-in-from-top duration-300">
                    <div className="size-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-green-600">check_circle</span>
                    </div>
                    <div>
                      <h3 className="text-green-900 font-bold text-lg">Sorğu göndərildi!</h3>
                      <p className="text-green-700 text-sm mt-1">
                        Ödəniş qəbziniz yoxlanılması üçün moderatora göndərildi. Təsdiq edildikdən sonra məbləğ balansınıza əlavə olunacaq.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Form Side */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Məbləğ (AZN)</label>
                      <div className="relative group">
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-black text-xl text-gray-900"
                          placeholder="0.00"
                          required
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl group-focus-within:text-primary transition-colors">₼</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Ödəniş qəbzi</label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative aspect-[4/3] rounded-2xl border-3 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                          preview 
                          ? 'border-primary bg-white shadow-inner' 
                          : 'border-gray-200 bg-gray-50/50 hover:border-primary hover:bg-white hover:shadow-xl'
                        }`}
                      >
                        {preview ? (
                          <>
                            <img src={preview} alt="Receipt Preview" className="w-full h-full object-contain p-2" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                               <span className="material-symbols-outlined text-3xl mb-1">cached</span>
                               <span className="text-xs font-black uppercase tracking-widest">Şəkli dəyiş</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center px-6 group">
                            <div className="size-16 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                               <span className="material-symbols-outlined text-gray-400 text-3xl group-hover:text-primary transition-colors">add_photo_alternate</span>
                            </div>
                            <p className="text-sm text-gray-900 font-bold mb-1">Qəbz şəklini yükləyin</p>
                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Maks. 5MB (JPG, PNG)</p>
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

                    {error && (
                      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-center gap-3">
                         <span className="material-symbols-outlined text-red-500">error</span>
                         <p className="text-red-700 text-sm font-bold">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-6 w-6 border-3 border-white/30 border-t-white rounded-full" />
                          <span>GÖNDƏRİLİR...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined font-black">send</span>
                          <span>TƏSDİQ ET</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Info Side */}
                  <div className="bg-gray-50 rounded-2xl p-6 h-fit border border-gray-100 shadow-inner">
                     <h3 className="text-gray-900 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined !text-lg">info</span>
                        MƏLUMAT
                     </h3>
                     <ul className="space-y-4">
                        <li className="flex gap-3">
                           <div className="size-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary font-black text-[10px]">1</div>
                           <p className="text-gray-600 text-sm font-medium leading-relaxed">Balansınızı terminal (milliÖN, eManat) və ya bank kartı vasitəsilə artıra bilərsiniz.</p>
                        </li>
                        <li className="flex gap-3">
                           <div className="size-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary font-black text-[10px]">2</div>
                           <p className="text-gray-600 text-sm font-medium leading-relaxed">Ödəniş etdikdən sonra aldığınız qəbzin şəklini bura yükləməyiniz kifayətdir.</p>
                        </li>
                        <li className="flex gap-3">
                           <div className="size-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary font-black text-[10px]">3</div>
                           <p className="text-gray-600 text-sm font-medium leading-relaxed">Məbləğ 15-30 dəqiqə ərzində (iş saatlarında) balansınıza əlavə olunacaq.</p>
                        </li>
                     </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
