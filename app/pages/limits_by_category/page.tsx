'use client';

import { useEffect, useState, Fragment } from 'react';
import { adService } from '@/services/ad.service';
import { CategoryDto } from '@/types/api';
import Container from '@/components/layout/Container';

export default function LimitsByCategory() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const tree = await adService.getCategoryTree();
        setCategories(tree);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.children?.some(child => child.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="bg-gray-50 min-h-screen py-12">
      <Container>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Elan yerləşdirmə limitləri
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hər bir bölmə üzrə pulsuz elan limitləri və ödənişli paketlərin qiymətləri.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">30 günlük period</h3>
              <p className="text-sm text-gray-500">Limit – hər hansısa kateqoriyada 30 gün müddətində ödənişsiz yerləşdirə biləcəyiniz elanların sayıdır.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">package_2</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Sərfəli Paketlər</h3>
              <p className="text-sm text-gray-500">Daha çox elan yerləşdirmək istədikdə, 3-dən 80-ə qədər olan paketləri alaraq qənaət edə bilərsiniz.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">rocket_launch</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">VIP/Prm = Limitsiz</h3>
              <p className="text-sm text-gray-500">VIP və ya Premium statusu alınan hər hansı bir elan kateqoriya limitinizdən çıxılmır.</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-8 max-w-lg mx-auto group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined group-focus-within:text-primary transition-colors">search</span>
            <input
              type="text"
              placeholder="Məs: Elektronika, Geyim, Mebellər..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-3xl shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Limits Table */}
          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
            {loading ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <p className="text-gray-400 font-medium animate-pulse">Kateqoriyalar yüklənir...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="px-8 py-6 text-xs font-black text-gray-800 uppercase tracking-widest sticky left-0 bg-gray-50 z-10 w-1/4">KATEQORİYALAR</th>
                      <th className="px-4 py-6 text-xs font-black text-gray-800 uppercase tracking-widest text-center border-l border-gray-100 w-24">LİMİT</th>
                      <th colSpan={9} className="px-4 py-6 text-xs font-black text-gray-800 uppercase tracking-widest text-center border-l border-gray-100 bg-gray-100/40">
                        ELAN SAYI / QİYMƏT, AZN
                      </th>
                    </tr>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-black text-gray-500">
                      <th className="px-8 py-3 sticky left-0 bg-gray-50/50"></th>
                      <th className="px-4 py-3 text-center border-l border-gray-100">30 GÜN</th>
                      <th className="px-4 py-3 text-center border-l border-gray-100 bg-emerald-50/20">1</th>
                      <th className="px-4 py-3 text-center border-l border-gray-100 bg-emerald-50/20">3</th>
                      <th className="px-4 py-3 text-center border-l border-gray-100 bg-emerald-50/20">5</th>
                      <th className="px-4 py-3 text-center border-l border-gray-100 bg-emerald-50/20">10</th>
                      <th className="px-4 py-3 text-center border-l border-gray-100 bg-emerald-50/20">20</th>
                      <th className="px-4 py-3 text-center border-l border-gray-100 bg-emerald-50/20">25</th>
                      <th className="px-4 py-3 text-center border-l border-gray-100 bg-emerald-50/20">50</th>
                      <th className="px-4 py-3 text-center border-l border-gray-100 bg-emerald-50/20">75</th>
                      <th className="px-4 py-3 text-center border-l border-gray-100 bg-emerald-50/20">80</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredCategories.map((parent) => (
                      <Fragment key={parent.id}>
                        {/* Group Header */}
                        <tr className="bg-gray-100/80">
                          <td colSpan={11} className="px-8 py-3.5 text-black font-black text-[13px] uppercase tracking-wider backdrop-blur-sm sticky top-0 z-10 border-y border-gray-200/50">
                            <div className="flex items-center gap-3">
                              <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                              {parent.name}
                            </div>
                          </td>
                        </tr>
                        {/* Subcategories */}
                        {parent.children?.map((child) => (
                          <tr key={child.id} className="hover:bg-blue-50/30 transition-all duration-200 border-b border-gray-50 group">
                            <td className="px-10 py-4.5 text-gray-800 font-bold text-[14px] group-hover:text-primary transition-colors">
                              {child.name}
                            </td>
                            <td className="px-4 py-4.5 text-center border-l border-gray-50">
                              <span className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2.5 rounded-lg text-xs font-black ${child.freeLimit > 0
                                ? 'bg-emerald-100/60 text-emerald-800 border boder-emerald-200'
                                : 'bg-rose-50 text-rose-500 border border-rose-100'
                                }`}>
                                {child.freeLimit}
                              </span>
                            </td>
                            <td className="px-4 py-4.5 text-center border-l border-gray-50 font-black text-gray-900 tabular-nums">
                              {child.paidPrice1 > 0 ? child.paidPrice1.toFixed(2) : '-'}
                            </td>
                            <td className="px-4 py-4.5 text-center border-l border-gray-50 text-gray-600 font-bold tabular-nums">
                              {child.paidPrice3 > 0 ? child.paidPrice3.toFixed(2) : '-'}
                            </td>
                            <td className="px-4 py-4.5 text-center border-l border-gray-50 text-gray-600 font-bold tabular-nums">
                              {child.paidPrice5 > 0 ? child.paidPrice5.toFixed(2) : '-'}
                            </td>
                            <td className="px-4 py-4.5 text-center border-l border-gray-50 text-gray-600 font-bold tabular-nums">
                              {child.paidPrice10 > 0 ? child.paidPrice10.toFixed(2) : '-'}
                            </td>
                            <td className="px-4 py-4.5 text-center border-l border-gray-50 text-gray-600 font-bold tabular-nums">
                              {child.paidPrice20 > 0 ? child.paidPrice20.toFixed(2) : '-'}
                            </td>
                            <td className="px-4 py-4.5 text-center border-l border-gray-50 text-gray-600 font-bold tabular-nums">
                              {child.paidPrice25 > 0 ? child.paidPrice25.toFixed(2) : '-'}
                            </td>
                            <td className="px-4 py-4.5 text-center border-l border-gray-50 text-gray-600 font-bold tabular-nums">
                              {child.paidPrice50 > 0 ? child.paidPrice50.toFixed(2) : '-'}
                            </td>
                            <td className="px-4 py-4.5 text-center border-l border-gray-50 text-gray-600 font-bold tabular-nums">
                              {child.paidPrice75 > 0 ? child.paidPrice75.toFixed(2) : '-'}
                            </td>
                            <td className="px-4 py-4.5 text-center border-l border-gray-50 text-gray-600 font-bold tabular-nums">
                              {child.paidPrice80 > 0 ? child.paidPrice80.toFixed(2) : '-'}
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
