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
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-5 sm:py-10 px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <UserSidebar />

          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              {/* Page Heading */}
              <div className="mb-8">
                <h1 className="text-gray-900 text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] mb-2 uppercase">
                  Ödənişlər
                </h1>
                <p className="text-gray-500 text-base font-medium">
                  Balans artımı və xidmət alışları tarixcəniz.
                </p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin h-10 w-10 text-primary border-4 border-primary/20 border-t-primary rounded-full" />
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                  {error}
                </div>
              ) : transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-4 px-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Tarix</th>
                        <th className="py-4 px-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Xidmət / Təsvir</th>
                        <th className="py-4 px-4 text-gray-500 text-xs font-bold uppercase tracking-wider text-right">Məbləğ</th>
                        <th className="py-4 px-4 text-gray-500 text-xs font-bold uppercase tracking-wider text-center">Növ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-5 px-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {new Date(t.date).toLocaleDateString('az-AZ', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-[11px] text-gray-400 font-medium">
                             {new Date(t.date).toLocaleTimeString('az-AZ', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>
                          <td className="py-5 px-4">
                             <div className="text-sm font-bold text-gray-900">{t.title}</div>
                             <div className="text-xs text-gray-500">{t.description}</div>
                          </td>
                          <td className="py-5 px-4 text-right">
                             <span className={`text-sm font-black ${t.type === 'Deposit' ? 'text-green-600' : 'text-gray-900'}`}>
                               {t.type === 'Deposit' ? '+' : '-'}{t.amount.toFixed(2)} AZN
                             </span>
                          </td>
                          <td className="py-5 px-4 text-center">
                             <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-tight ${
                               t.type === 'Deposit' 
                               ? 'bg-green-100 text-green-700' 
                               : 'bg-blue-100 text-blue-700'
                             }`}>
                               {t.type === 'Deposit' ? 'Mədaxil' : 'Xərc'}
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                   <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-gray-300 text-3xl">receipt_long</span>
                   </div>
                   <h3 className="text-gray-900 text-lg font-bold">Heç bir ödəniş yoxdur</h3>
                   <p className="text-gray-500 text-sm mt-1">Hələ ki balansınızda hərəkət qeydə alınmayıb.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
