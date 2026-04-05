'use client';

import { useState, useEffect } from 'react';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import { accountService, Transaction } from '@/services/account.service';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await accountService.getTransactions();
        setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Büdcə tarixçəsini yükləmək mümkün olmadı');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <main className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <UserSidebar />

          <div className="flex-1 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
              {/* Page Heading */}
              <div className="mb-8 border-b border-gray-50 pb-6">
                <h1 className="text-gray-900 text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-2 uppercase tracking-wide">
                  Ödəniş Tarixçəsi
                </h1>
                <p className="text-gray-500 text-sm font-medium">
                  Balans artımı və xidmət alışları tarixcəniz
                </p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin h-10 w-10 text-primary border-4 border-primary/20 border-t-primary rounded-full shadow-lg shadow-primary/10" />
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-xl text-center font-bold text-sm">
                  <span className="material-symbols-outlined block text-3xl mb-2">error</span>
                  {error}
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-4">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-hidden rounded-xl border border-gray-100">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="py-4 px-6 text-gray-400 text-[10px] font-bold uppercase tracking-wider">Tarix</th>
                          <th className="py-4 px-6 text-gray-400 text-[10px] font-bold uppercase tracking-wider">Təsvir</th>
                          <th className="py-4 px-6 text-gray-400 text-[10px] font-bold uppercase tracking-wider text-right">Məbləğ</th>
                          <th className="py-4 px-6 text-gray-400 text-[10px] font-bold uppercase tracking-wider text-center">Növ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {transactions.map((t) => (
                          <tr key={t.id} className="hover:bg-gray-50/40 transition-all group border-b border-gray-50 last:border-0">
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-4">
                                <div className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 ${['Deposit', 'Refund'].includes(t.type)
                                  ? 'bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100/50'
                                  : t.type === 'Withdrawal'
                                    ? 'bg-rose-50 text-rose-600 shadow-sm shadow-rose-100/50'
                                    : 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50'
                                  }`}>
                                  <span className="material-symbols-outlined !text-xl font-bold">
                                    {t.type === 'Deposit' ? 'add_card' :
                                      t.type === 'Refund' ? 'history' :
                                        t.type === 'Withdrawal' ? 'outbox' : 'payments'}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900">
                                    {new Date(t.date).toLocaleDateString('az-AZ', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    })}
                                  </div>
                                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    {new Date(t.date).toLocaleTimeString('az-AZ', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <div className="text-sm font-extrabold text-gray-800 tracking-tight">{t.title}</div>
                              {t.description && t.description !== t.title && (
                                <div className="text-[11px] text-gray-500 font-medium leading-relaxed max-w-xs truncate">{t.description}</div>
                              )}
                            </td>
                            <td className="py-5 px-6 text-right">
                              <div className={`text-base font-black tabular-nums tracking-tight ${['Deposit', 'Refund'].includes(t.type) ? 'text-emerald-600' : 'text-gray-900'}`}>
                                {['Deposit', 'Refund'].includes(t.type) ? '+' : '-'}{t.amount.toFixed(2)} <span className="text-[10px] font-bold opacity-70">AZN</span>
                              </div>
                            </td>
                            <td className="py-5 px-6 text-center">
                              <span className={`inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${['Deposit', 'Refund'].includes(t.type)
                                ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100'
                                : 'bg-indigo-50/50 text-indigo-600 border-indigo-100'
                                }`}>
                                {t.type === 'Deposit' ? 'Mədaxil' : t.type === 'Refund' ? 'Geri qaytarma' : 'Xərc'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card-List View */}
                  <div className="md:hidden space-y-4">
                    {transactions.map((t) => (
                      <div key={t.id} className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 pr-2 overflow-hidden">
                            <div className={`size-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${['Deposit', 'Refund'].includes(t.type)
                              ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100/30'
                              : 'bg-indigo-50 text-indigo-600 shadow-indigo-100/30'
                              }`}>
                              <span className="material-symbols-outlined !text-2xl font-bold">
                                {t.type === 'Deposit' ? 'add_card' : t.type === 'Refund' ? 'history' : 'payments'}
                              </span>
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-gray-900 font-black text-sm truncate tracking-tight">{t.title}</p>
                              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                {t.type === 'Deposit' ? 'Mədaxil' : t.type === 'Refund' ? 'Geri qaytarma' : 'Xərc'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 bg-gray-50/50 py-1.5 px-3 rounded-xl border border-gray-100">
                            <p className={`text-base font-black tabular-nums tracking-tighter ${['Deposit', 'Refund'].includes(t.type) ? 'text-emerald-500' : 'text-gray-900'}`}>
                              {['Deposit', 'Refund'].includes(t.type) ? '+' : '-'}{t.amount.toFixed(2)}
                            </p>
                            <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest leading-none">AZN</p>
                          </div>
                        </div>

                        {t.description && t.description !== t.title && (
                          <div className="px-4 py-3 bg-gray-50/30 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic line-clamp-2">
                              {t.description}
                            </p>
                          </div>
                        )}

                        <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-gray-400 text-[9px] font-black uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-lg bg-gray-50 flex items-center justify-center">
                              <span className="material-symbols-outlined !text-xs font-bold text-gray-400">event</span>
                            </div>
                            <span>{new Date(t.date).toLocaleDateString('az-AZ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-lg bg-gray-50 flex items-center justify-center">
                              <span className="material-symbols-outlined !text-xs font-bold text-gray-400">schedule</span>
                            </div>
                            <span>{new Date(t.date).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
                  <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-gray-300 text-4xl">receipt_long</span>
                  </div>
                  <h3 className="text-gray-900 text-lg font-bold">Heç bir ödəniş yoxdur</h3>
                  <p className="text-gray-500 text-sm mt-1">Hələ ki balansınızda əməliyyat qeydə alınmayıb.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
