'use client';

import { useState, useRef, useEffect } from 'react';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import { accountService } from '@/services/account.service';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

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
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-50 pb-8">
                <div>
                  <h1 className="text-gray-900 text-2xl sm:text-4xl font-black leading-tight tracking-tight mb-2">
                    Balans artırılması
                  </h1>
                  <p className="text-gray-500 text-[11px] sm:text-sm font-medium">
                    Hesabınızı bank köçürməsi vasitəsilə sürətli artırın
                  </p>
                </div>
                <div className="bg-primary/5 px-5 py-3 rounded-2xl border border-primary/10 flex flex-col items-center sm:items-end justify-center">
                  <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.1em] mb-1">Cari Balans</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-primary font-black text-2xl sm:text-3xl tabular-nums leading-none">
                      {user?.balance?.toFixed(2) || '0.00'}
                    </span>
                    <span className="text-xs text-primary/60 font-bold">₼</span>
                  </div>
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
                    <div className={cn(
                      "bg-white rounded-2xl border transition-all duration-300 overflow-hidden",
                      step1Open ? "border-primary shadow-lg ring-1 ring-primary/10" : "border-gray-100 shadow-sm"
                    )}>
                      <div 
                        onClick={() => setStep1Open(!step1Open)}
                        className={cn(
                          "px-5 sm:px-6 py-4 flex items-center justify-between cursor-pointer transition-colors group",
                          step1Open ? "bg-primary/5" : "bg-white hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "size-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-all duration-300",
                            step1Open ? "bg-primary scale-110" : "bg-gray-200"
                          )}>
                            <span className="text-sm font-black">1</span>
                          </div>
                          <div>
                            <h3 className="text-gray-900 font-black text-xs sm:text-sm tracking-tight mb-0.5">ÖDƏNİŞ MƏLUMATLARI</h3>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest opacity-70">Pul köçürməsi üçün rekvizitlər</p>
                          </div>
                        </div>
                        <span className={`material-symbols-outlined text-primary font-bold transition-transform duration-500 ${step1Open ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </div>
                      
                      <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${step1Open ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-5 sm:p-8 border-t border-primary/5 bg-gradient-to-b from-primary/[0.02] to-transparent">
                          <div className="flex flex-col xl:flex-row gap-8">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary !text-lg">account_balance</span>
                                <h4 className="text-gray-900 text-[11px] font-black uppercase tracking-[0.15em]">Bank Rekvizitləri</h4>
                              </div>
                              <div 
                                className="text-gray-800 text-[13px] sm:text-base font-medium whitespace-pre-wrap leading-relaxed bg-white p-5 sm:p-7 rounded-2xl border border-gray-100/80 shadow-inner translate-y-0 hover:-translate-y-1 transition-transform"
                                dangerouslySetInnerHTML={{ __html: paymentDetail.replace(/\n/g, '<br />') }}
                              />
                            </div>
                            <div className="xl:w-64 bg-amber-50/30 rounded-2xl p-6 border border-amber-100/50 flex flex-col gap-4">
                               <div className="flex items-start gap-2">
                                  <span className="material-symbols-outlined text-amber-600 !text-xl">warning</span>
                                  <div>
                                     <h5 className="text-amber-900 font-black text-[10px] uppercase tracking-wider mb-1">Mühüm Qeyd</h5>
                                     <p className="text-amber-700/70 text-[11px] font-medium leading-relaxed">
                                        Ödənişi tamaladıqdan sonra qəbzin şəklini mütləq 2-ci addımda bizə göndərin. Balansınız moderator tərəfindən yoxlanıldıqdan sonra artırılacaq.
                                     </p>
                                  </div>
                               </div>
                               <div className="mt-auto pt-4 border-t border-amber-100/50">
                                  <p className="text-[9px] text-amber-600 font-black uppercase tracking-widest">Dəstək</p>
                                  <p className="text-[11px] text-gray-500 font-bold">+994 50 216 00 00</p>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: SUBMISSION FORM */}
                  <div className={cn(
                    "bg-white rounded-2xl border transition-all duration-300 overflow-hidden",
                    step2Open ? "border-primary shadow-lg ring-1 ring-primary/10" : "border-gray-100 shadow-sm"
                  )}>
                    <div 
                      onClick={() => setStep2Open(!step2Open)}
                      className={cn(
                         "px-5 sm:px-6 py-4 flex items-center justify-between cursor-pointer transition-colors group",
                         step2Open ? "bg-primary/5" : "bg-white hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "size-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-all duration-300",
                          step2Open ? "bg-primary scale-110" : "bg-gray-200"
                        )}>
                          <span className="text-sm font-black">2</span>
                        </div>
                        <div>
                          <h3 className="text-gray-900 font-black text-xs sm:text-sm tracking-tight mb-0.5">QƏBZİ TƏQDİM EDİN</h3>
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest opacity-70">Ödənişi təsdiqlənməsi üçün</p>
                        </div>
                      </div>
                      <span className={`material-symbols-outlined text-primary font-bold transition-transform duration-500 ${step2Open ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>

                    <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${step2Open ? 'max-h-[1400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="p-5 sm:p-8 border-t border-primary/5">
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
                          {/* Form Side */}
                          <form onSubmit={handleSubmit} className="xl:col-span-7 space-y-8">
                            <div className="space-y-3">
                              <label className="block text-gray-500 text-[11px] font-black uppercase tracking-[0.2em] px-1">Məbləğ</label>
                              <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 font-black text-xl">₼</div>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="1"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  className="w-full h-16 pl-12 pr-16 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all outline-none font-black text-2xl sm:text-3xl text-gray-900 tabular-nums shadow-inner"
                                  placeholder="0.00"
                                  required
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 font-black text-[10px] uppercase tracking-widest">₼</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="block text-gray-500 text-[11px] font-black uppercase tracking-[0.2em] px-1">Təsdiqedici Sənəd (Qəbz)</label>
                              <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative aspect-video sm:aspect-[16/7] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                                  preview 
                                  ? 'border-primary bg-white shadow-xl scale-[1.01]' 
                                  : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-primary/50'
                                }`}
                              >
                                {preview ? (
                                  <>
                                    <img src={preview} alt="Receipt Preview" className="w-full h-full object-contain p-4 rounded-2xl" />
                                    <div className="absolute inset-0 bg-primary/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[4px] rounded-2xl">
                                      <div className="size-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
                                        <span className="material-symbols-outlined !text-2xl animate-spin-slow">cached</span>
                                      </div>
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dəyişmək üçün klikləyin</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center px-6 group">
                                    <div className="size-16 rounded-3xl bg-white border border-gray-100 flex items-center justify-center mb-4 mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                      <span className="material-symbols-outlined text-primary !text-4xl">cloud_upload</span>
                                    </div>
                                    <p className="text-gray-900 font-black text-sm tracking-tight">Qəbz şəklini yükləyin</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-60">PNG, JPG, PDF (MAKS. 5MB)</p>
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
                                <span className="material-symbols-outlined text-red-500 font-bold">report</span>
                                <p className="text-red-700 text-[11px] sm:text-xs font-black uppercase tracking-tight">{error}</p>
                              </div>
                            )}

                            <button
                              type="submit"
                              className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-xs sm:text-sm hover:bg-primary-dark hover:shadow-2xl hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 group cursor-pointer"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                                  <span>GÖNDƏRİLİR...</span>
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined !text-xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">send</span>
                                  <span>SORĞUNU GÖNDƏR</span>
                                </>
                              )}
                            </button>
                          </form>

                          {/* Instructions Side */}
                          <div className="xl:col-span-5">
                            <div className="bg-gray-50/80 rounded-3xl p-6 sm:p-8 border border-gray-100/50 h-full flex flex-col">
                              <h3 className="text-gray-400 text-[9px] font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
                                <span className="w-4 h-0.5 bg-primary/30" />
                                Necə işləyir?
                              </h3>
                              
                              <div className="space-y-10 relative flex-1">
                                <div className="absolute left-[13px] top-6 bottom-6 w-[1.5px] bg-gradient-to-b from-primary/5 via-primary/50 to-primary/5" />
                                
                                <div className="relative flex gap-6">
                                  <div className="size-7 bg-white border-2 border-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 z-10 shadow-sm font-black text-[10px] text-primary group hover:bg-primary hover:text-white transition-colors">01</div>
                                  <div className="pt-0.5">
                                    <p className="text-gray-900 text-sm font-black tracking-tight mb-1">Transferi Edin</p>
                                    <p className="text-gray-500 text-[11px] font-medium leading-relaxed">Addım 1-dəki rekvizitlərə istənilən bankdan köçürmə edin.</p>
                                  </div>
                                </div>

                                <div className="relative flex gap-6">
                                  <div className="size-7 bg-white border-2 border-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 z-10 shadow-sm font-black text-[10px] text-primary">02</div>
                                  <div className="pt-0.5">
                                    <p className="text-gray-900 text-sm font-black tracking-tight mb-1">Qəbzi Yükləyin</p>
                                    <p className="text-gray-500 text-[11px] font-medium leading-relaxed">Ödəniş qəbzini və ya ekran görüntüsünü (screenshot) bizə göndərin.</p>
                                  </div>
                                </div>

                                <div className="relative flex gap-6">
                                  <div className="size-7 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 z-10 shadow-lg font-black text-[10px] text-white animate-bounce-slow">03</div>
                                  <div className="pt-0.5">
                                    <p className="text-primary text-sm font-black tracking-tight mb-1">Balans Artacaq</p>
                                    <p className="text-gray-500 text-[11px] font-medium leading-relaxed">Moderator yoxlamasından sonra (adətən 5-15 dəq) balansınız artacaq.</p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-12 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 transform hover:scale-[1.02] transition-transform">
                                <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0">
                                   <span className="material-symbols-outlined !text-xl animate-pulse">verified_user</span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-widest">
                                  Bütün əməliyyatlar rəsmi rekvizitlərlə təhlükəsiz şəkildə həyata keçirilir.
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
