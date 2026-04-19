'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { accountService } from '@/services/account.service';
import { storeService } from '@/services/store.service';
import { toast } from 'sonner';

export default function AdminPaymentDetailsPage() {
  const [content, setContent] = useState('');
  const [minBalance, setMinBalance] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingsSubmitting, setIsSettingsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentRes, balanceRes] = await Promise.all([
          accountService.getPaymentDetail(),
          storeService.getMinStoreBalance()
        ]);
        
        if (paymentRes && paymentRes.content) {
          setContent(paymentRes.content);
        }
        setMinBalance(balanceRes);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminService.updatePaymentDetail(content);
      toast.success('Ödəniş məlumatları uğurla yeniləndi');
    } catch (err: any) {
      toast.error('Ödəniş məlumatları yenilənərkən xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSettingsSubmitting(true);
    try {
      await adminService.updateSystemSettings(minBalance);
      toast.success('Sistem tənzimləmələri uğurla yeniləndi');
    } catch (err: any) {
      toast.error('Tənzimləmələr yenilənərkən xəta baş verdi');
    } finally {
      setIsSettingsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-2xl h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-10 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight uppercase italic">Admin Tənzimləmələri</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Platforma və ödəniş tənzimləmələrini idarə edin</p>
        </div>
        <div className="bg-white size-16 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-3xl">settings</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Payment Details Editor (Large Section) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center gap-4 text-gray-900">
              <span className="material-symbols-outlined">account_balance_wallet</span>
              <h3 className="font-black text-xs uppercase tracking-[0.25em]">Ödəniş Rekvizitləri</h3>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-8 space-y-8">
              <div className="space-y-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-80 px-8 py-8 rounded-3xl border-2 border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-[1rem] focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-gray-900 text-lg leading-relaxed placeholder:text-gray-300"
                  placeholder={'Məsələn:\n🔹 BANK: ABB\n🔹 HESAB: 1234...\n🔹 AD: ElanAz'}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-16 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isSubmitting ? <div className="animate-spin h-6 w-6 border-2 border-white/30 border-t-white rounded-full" /> : 'Yadda Saxla'}
              </button>
            </form>
          </div>
        </div>

        {/* System Settings (Sidebar Section) */}
        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center gap-4 text-gray-900">
              <span className="material-symbols-outlined">store</span>
              <h3 className="font-black text-xs uppercase tracking-[0.25em]">Mağaza Tələbləri</h3>
            </div>

            <form onSubmit={handleSettingsSubmit} className="p-8 space-y-8">
               <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Minimum Balans (₼)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={minBalance}
                      onChange={(e) => setMinBalance(Number(e.target.value))}
                      className="w-full h-16 px-8 rounded-2xl border-2 border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-[1rem] focus:ring-primary/5 focus:border-primary transition-all outline-none font-black text-gray-900 text-2xl"
                      placeholder="50"
                      min={0}
                      required
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-300 text-sm">₼</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed px-2">
                    İstifadəçi mağaza müraciəti göndərmək üçün balansında ən azı bu məbləğ olmalıdır.
                  </p>
               </div>

               <button
                  type="submit"
                  disabled={isSettingsSubmitting}
                  className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {isSettingsSubmitting ? <div className="animate-spin h-6 w-6 border-2 border-white/30 border-t-white rounded-full" /> : 'Yenilə'}
                </button>
            </form>
          </div>

          <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white">
             <div className="flex items-center gap-4 mb-6">
                <span className="material-symbols-outlined text-amber-400">info</span>
                <h4 className="font-black text-sm uppercase tracking-widest">Məlumat</h4>
             </div>
             <p className="text-indigo-100 text-xs font-bold leading-loose opacity-80">
                Minimum balans tələbi "Spam" sorğuların qarşısını almaq üçündür. Buradakı dəyişiklik real vaxtda müraciət sisteminə tətbiq olunur.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}
