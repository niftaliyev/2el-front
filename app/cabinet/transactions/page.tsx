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
                          <tr key={t.id} className="hover:bg-gray-50/30 transition-all group">
                            <td className="py-5 px-6">
                              <div className="text-sm font-bold text-gray-900">
                                {new Date(t.date).toLocaleDateString('az-AZ', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-[10px] text-gray-400 font-medium">
                               {new Date(t.date).toLocaleTimeString('az-AZ', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </td>
                            <td className="py-5 px-6">
                               <div className="text-sm font-bold text-gray-900">{t.title}</div>
                               <div className="text-[11px] text-gray-500 leading-relaxed max-w-sm">{t.description}</div>
                            </td>
                            <td className="py-5 px-6 text-right">
                               <div className={`text-base font-bold tabular-nums ${t.type === 'Deposit' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                 {t.type === 'Deposit' ? '+' : '-'}{t.amount.toFixed(2)} AZN
                               </div>
                            </td>
                            <td className="py-6 px-6 text-center">
                               <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                 t.type === 'Deposit' 
                                 ? 'bg-emerald-50 text-emerald-600' 
                                 : 'bg-indigo-50 text-indigo-600'
                               }`}>
                                 {t.type === 'Deposit' ? 'Mədaxil' : 'Xərc'}
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
                       <div key={t.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                             <div className="flex items-center gap-3 pr-2">
                                <div className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                   t.type === 'Deposit' ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'
                                }`}>
                                   <span className="material-symbols-outlined !text-xl font-bold">
                                       {t.type === 'Deposit' ? 'add_card' : 'payments'}
                                   </span>
                                </div>
                                <div className="overflow-hidden">
                                   <p className="text-gray-900 font-bold text-sm truncate">{t.title}</p>
                                   <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{t.type === 'Deposit' ? 'Mədaxil' : 'Xərc'}</p>
                                </div>
                             </div>
                             <div className="text-right flex-shrink-0">
                                <p className={`text-base font-bold tabular-nums ${t.type === 'Deposit' ? 'text-emerald-500' : 'text-gray-900'}`}>
                                   {t.type === 'Deposit' ? '+' : '-'}{t.amount.toFixed(2)}
                                </p>
                                <p className="text-gray-400 text-[10px] font-bold uppercase">AZN</p>
                             </div>
                          </div>
                          <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                             <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined !text-xs font-bold">event</span>
                                <span>{new Date(t.date).toLocaleDateString('az-AZ')}</span>
                             </div>
                             <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined !text-xs font-bold">schedule</span>
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
