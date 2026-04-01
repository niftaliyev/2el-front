'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { accountService } from '@/services/account.service';

export default function AdminPaymentDetailsPage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await accountService.getPaymentDetail();
        if (res && res.content) {
          setContent(res.content);
        }
      } catch (err) {
        console.error('Failed to fetch payment detail', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await adminService.updatePaymentDetail(content);
      setMessage({ type: 'success', text: 'Ödəniş məlumatları uğurla yeniləndi' });
    } catch (err: any) {
      console.error('Update failed', err);
      setMessage({ type: 'error', text: 'Yenilənmə zamanı xəta baş verdi' });
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-5xl mx-auto space-y-10 py-10 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight uppercase italic">Ödəniş Məlumatları</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Platforma rekvizitlərini idarə edin</p>
        </div>
        <div className="bg-white size-16 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Editor Side */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center gap-4">
              <span className="material-symbols-outlined text-gray-400">edit_note</span>
              <h3 className="text-gray-900 font-black text-xs uppercase tracking-[0.25em]">MƏLUMAT REDAKTORU</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-96 px-8 py-8 rounded-3xl border-2 border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-[1rem] focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-gray-900 text-lg leading-relaxed placeholder:text-gray-300 shadow-inner"
                  placeholder={'Məsələn:\n🔹 BANK: ABB\n🔹 HESAB: 1234 5678 9012 3456\n🔹 AD: ElanAz Platforması'}
                  required
                />
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest px-4">
                  <span className="material-symbols-outlined !text-sm">code</span>
                  <span>HTML teqlərdən (&lt;b&gt;, &lt;br /&gt;) istifadə edə bilərsiniz.</span>
                </div>
              </div>

              {message && (
                <div className={`p-6 rounded-3xl border-2 flex items-center gap-5 animate-in slide-in-from-bottom-4 duration-500 ${message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  : 'bg-red-50 border-red-100 text-red-700'
                  }`}>
                  <div className={`size-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                    } text-white shadow-lg`}>
                    <span className="material-symbols-outlined !text-2xl font-black">
                      {message.type === 'success' ? 'verified' : 'report'}
                    </span>
                  </div>
                  <p className="font-black italic uppercase tracking-tight text-sm">{message.text}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-20 rounded-3xl bg-primary text-white font-black uppercase tracking-[0.3em] hover:bg-primary/90 transition-all shadow-2xl shadow-primary/40 flex items-center justify-center gap-5 active:scale-[0.97] disabled:opacity-50 group"
              >
                {isSubmitting ? (
                  <div className="animate-spin h-8 w-8 border-4 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    <span className="material-symbols-outlined !text-3xl font-black group-hover:rotate-12 transition-transform">save</span>
                    <span className="text-xl italic">YADDA SAXLA</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Tip Side */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-gradient-to-br from-indigo-900 to-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden group">
            {/* Decorative Background Icon */}
            <span className="material-symbols-outlined absolute -right-10 -bottom-10 !text-[15rem] opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000 select-none">
              lightbulb
            </span>

            <div className="relative z-10">
              <div className="size-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/10">
                <span className="material-symbols-outlined text-amber-400 !text-3xl">lightbulb</span>
              </div>
              <h4 className="font-black text-xl uppercase tracking-tight mb-6 italic italic underline decoration-amber-400/50 underline-offset-8">MÜHÜM QEYD</h4>
              <p className="text-gray-300 text-sm font-bold leading-loose uppercase tracking-[0.05em] opacity-80">
                Burada etdiyiniz dəyişikliklər dərhal bütün istifadəçilər tərəfindən <b>Balans artır</b> səhifəsində görünəcək. Rekvizitlərin dəqiq olduğuna əmin olun (kopyalayıb yoxlamaq tövsiyə olunur).
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/10">
            <h5 className="text-gray-900 font-black text-xs uppercase tracking-[0.25em] mb-8 flex items-center gap-3">
              <span className="size-2 bg-emerald-400 rounded-full" />
              GÖRNÜŞÜN YAXŞILAŞDIRILMASI
            </h5>
            <div className="space-y-6">
              <div className="flex gap-5">
                <div className="size-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 flex-shrink-0">
                  <span className="material-symbols-outlined !text-lg">format_bold</span>
                </div>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Başlıqları qara (bold) etmək üçün &lt;b&gt;B&lt;/b&gt; istifadə edin.</p>
              </div>
              <div className="flex gap-5">
                <div className="size-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 flex-shrink-0">
                  <span className="material-symbols-outlined !text-lg">keyboard_return</span>
                </div>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Yeni sətirə keçmək üçün birbaşa Enter düyməsini sıxın.</p>
              </div>
              <div className="flex gap-5">
                <div className="size-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 flex-shrink-0">
                  <span className="material-symbols-outlined !text-lg">emoji_emotions</span>
                </div>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Mətnə emojilər (Məs: 💳, 🏦) əlavə edərək daha müasir görünüş yaradın.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
