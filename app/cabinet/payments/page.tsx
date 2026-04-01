'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [paymentDetail, setPaymentDetail] = useState<string | null>(null);
  const [step1Open, setStep1Open] = useState(false);
  const [step2Open, setStep2Open] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await accountService.getPaymentDetail();
        if (res && res.content) {
          setPaymentDetail(res.content);
        }
      } catch (err) {
        console.error('Failed to fetch payment detail', err);
      }
    };
    fetchDetail();
  }, []);

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
    <main className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <UserSidebar />

          <div className="flex-1 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
              {/* Page Heading */}
              <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-50 pb-8">
                <div>
                  <h1 className="text-gray-900 text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-2 uppercase tracking-wide">
                    Balans artırılması
                  </h1>
                  <p className="text-gray-500 text-sm font-medium">
                    Hesabınızı rahat və sürətli şəkildə artırın
                  </p>
                </div>
                <div className="bg-primary/5 px-6 py-4 rounded-xl border border-primary/10 text-right">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Cari Balansınız</p>
                  <span className="text-primary font-bold text-2xl tabular-nums">{user?.balance?.toFixed(2) || '0.00'} AZN</span>
                </div>
              </div>

              <div className="max-w-4xl mx-auto overflow-hidden">
                {success && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 mb-8 flex items-start gap-4 animate-in slide-in-from-top">
                    <div className="size-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-lg">
                      <span className="material-symbols-outlined !text-xl font-bold">check_circle</span>
                    </div>
                    <div>
                      <h3 className="text-emerald-900 font-bold text-lg">Sorğu uğurla göndərildi!</h3>
                      <p className="text-emerald-700/80 text-sm mt-1 font-medium leading-relaxed">
                        Ödəniş qəbziniz yoxlanılması üçün moderatorlarımıza göndərildi. Təsdiq edildikdən sonra məbləğ balansınıza əlavə olunacaq.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* STEP 1: PAYMENT INFO */}
                  {paymentDetail && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                      <div 
                        onClick={() => setStep1Open(!step1Open)}
                        className="bg-primary/5 px-6 py-4 border-b border-primary/10 flex items-center justify-between cursor-pointer hover:bg-primary/[0.08] transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md">
                            <span className="text-base font-bold">1</span>
                          </div>
                          <div>
                            <h3 className="text-gray-900 font-bold text-sm tracking-wide">ADDIM 1</h3>
                            <p className="text-primary text-[10px] font-bold uppercase tracking-wider opacity-70">Ödəniş məlumatları</p>
                          </div>
                        </div>
                        <span className={`material-symbols-outlined text-primary font-bold transition-transform duration-300 ${step1Open ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </div>
                      
                      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${step1Open ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-6 sm:p-8">
                          <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                            <div className="flex-1">
                              <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-4">BANK VƏ KART REKVİZİTLƏRİ</h4>
                              <div 
                                className="text-gray-900 text-base font-bold whitespace-pre-wrap leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100"
                                dangerouslySetInnerHTML={{ __html: paymentDetail.replace(/\n/g, '<br />') }}
                              />
                            </div>
                            <div className="lg:w-72 bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex flex-col justify-between">
                               <div>
                                  <h5 className="text-blue-900 font-bold text-xs uppercase tracking-wide mb-2">QR Ödəmə</h5>
                                  <p className="text-blue-700/60 text-[11px] font-medium leading-relaxed mb-4">
                                     Tezliklə aktiv olacaq. Hələlik hesaba köçürmə istifadə edin.
                                  </p>
                               </div>
                               <div className="aspect-square bg-white rounded-xl border border-blue-100 flex items-center justify-center relative opacity-40">
                                  <span className="material-symbols-outlined !text-6xl text-gray-200">qr_code_2</span>
                                  <div className="absolute inset-x-0 bottom-4 text-center">
                                     <span className="px-2 py-0.5 bg-gray-100 rounded text-[9px] text-gray-400 font-bold uppercase tracking-wider">Passiv</span>
                                  </div>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: SUBMISSION FORM */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                    <div 
                      onClick={() => setStep2Open(!step2Open)}
                      className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-100/80 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-md">
                          <span className="text-base font-bold">2</span>
                        </div>
                        <div>
                          <h3 className="text-gray-900 font-bold text-sm tracking-wide">ADDIM 2</h3>
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider opacity-70">Qəbzi təqdim edin</p>
                        </div>
                      </div>
                      <span className={`material-symbols-outlined text-gray-400 font-bold transition-transform duration-300 ${step2Open ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>

                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${step2Open ? 'max-h-[1400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="p-6 sm:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                          {/* Form Side */}
                          <form onSubmit={handleSubmit} className="lg:col-span-12 xl:col-span-7 space-y-6">
                            <div className="space-y-3">
                              <label className="block text-gray-500 text-[11px] font-bold uppercase tracking-wider px-1">Ödənilən Məbləğ (AZN)</label>
                              <div className="relative group">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="1"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  className="w-full h-14 px-6 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-2xl text-gray-900 tabular-nums"
                                  placeholder="0.00"
                                  required
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">AZN</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="block text-gray-500 text-[11px] font-bold uppercase tracking-wider px-1">Qəbz Şəkli</label>
                              <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative aspect-video sm:aspect-[16/6] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                                  preview 
                                  ? 'border-primary bg-white' 
                                  : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-primary/50'
                                }`}
                              >
                                {preview ? (
                                  <>
                                    <img src={preview} alt="Receipt Preview" className="w-full h-full object-contain p-4" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                                      <span className="material-symbols-outlined !text-3xl mb-1">cached</span>
                                      <span className="text-xs font-bold uppercase tracking-wider">Şəkli Dəyiş</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center px-6">
                                    <span className="material-symbols-outlined text-gray-300 text-4xl mb-2">receipt_long</span>
                                    <p className="text-gray-900 font-bold text-sm">Şəkli seçin və ya bura sürüşdürün</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 opacity-60">PNG, JPG (MAX. 5MB)</p>
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
                              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 animate-in shake">
                                <span className="material-symbols-outlined text-red-500 font-bold">warning</span>
                                <p className="text-red-700 text-sm font-bold leading-tight">{error}</p>
                              </div>
                            )}

                            <button
                              type="submit"
                              className="w-full h-14 rounded-xl bg-primary text-white font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                                  <span>Göndərilir...</span>
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined !text-xl group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">send</span>
                                  <span>Sorğunu Göndər</span>
                                </>
                              )}
                            </button>
                          </form>

                          {/* Instructions Side */}
                          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 h-full">
                              <h3 className="text-gray-900 font-bold text-[11px] uppercase tracking-wider mb-8">PROSESİN GEDİŞATI</h3>
                              <div className="space-y-8 relative">
                                <div className="absolute left-[13px] top-4 bottom-4 w-0.5 border-l border-gray-200" />
                                
                                <div className="relative flex gap-5">
                                  <div className="size-7 bg-white border border-gray-200 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm font-bold text-[10px] text-gray-400">01</div>
                                  <div className="pt-0.5">
                                    <p className="text-gray-900 text-sm font-bold mb-1">Transferi Edin</p>
                                    <p className="text-gray-500 text-xs">Hesaba köçürmə edin.</p>
                                  </div>
                                </div>

                                <div className="relative flex gap-5">
                                  <div className="size-7 bg-white border border-gray-200 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm font-bold text-[10px] text-gray-400">02</div>
                                  <div className="pt-0.5">
                                    <p className="text-gray-900 text-sm font-bold mb-1">Qəbzi Göndərin</p>
                                    <p className="text-gray-500 text-xs text-nowrap">Qəbz şəklini bura yükləyin.</p>
                                  </div>
                                </div>

                                <div className="relative flex gap-5">
                                  <div className="size-7 bg-primary rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-md font-bold text-[10px] text-white">03</div>
                                  <div className="pt-0.5">
                                    <p className="text-primary text-sm font-bold mb-1">Təsdiqi Gözləyin</p>
                                    <p className="text-gray-500 text-xs">Balans tezliklə artacaq.</p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-10 p-5 bg-white rounded-xl border border-gray-100 flex items-start gap-3">
                                <span className="material-symbols-outlined !text-xl text-emerald-500">verified_user</span>
                                <p className="text-[10px] text-gray-400 font-medium leading-relaxed uppercase tracking-wide">
                                  Əməliyyatlar şifrələnir və təhlükəsizdir.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
