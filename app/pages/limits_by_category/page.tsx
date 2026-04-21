'use client';

import { useEffect, useState, Fragment } from 'react';
import { adService } from '@/services/ad.service';
import { CategoryDto } from '@/types/api';
import { cn } from '@/lib/utils';

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
    <div className="space-y-10">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Elan yerləşdirmə limitləri
        </h1>
        <p className="text-gray-500 font-medium">
          Hər bir bölmə üzrə pulsuz elan limitləri və ödənişli paketlərin qiymətləri.
        </p>
      </div>

      {/* Search */}
      <div className="relative group max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined group-focus-within:text-primary transition-colors">search</span>
        <input
          type="text"
          placeholder="Kateqoriya axtar..."
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all text-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex flex-col gap-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined !text-xl">calendar_today</span>
          </div>
          <div>
            <h3 className="font-bold text-blue-900 text-sm mb-1">30 günlük period</h3>
            <p className="text-xs text-blue-700/70 font-medium leading-relaxed">Pulsul limitlər 30 gün üçün hesablanır.</p>
          </div>
        </div>
        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 flex flex-col gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined !text-xl">package_2</span>
          </div>
          <div>
            <h3 className="font-bold text-emerald-900 text-sm mb-1">Sərfəli Paketlər</h3>
            <p className="text-xs text-emerald-700/70 font-medium leading-relaxed">Çox sayda elan üçün paketlər daha qənaətlidir.</p>
          </div>
        </div>
        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 flex flex-col gap-3">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined !text-xl">rocket_launch</span>
          </div>
          <div>
            <h3 className="font-bold text-amber-900 text-sm mb-1">VIP = Limitsiz</h3>
            <p className="text-xs text-amber-700/70 font-medium leading-relaxed">VIP/Premium elanlar limitdən çıxılmır.</p>
          </div>
        </div>
      </div>

      {/* Limits Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[11px] font-black text-gray-500 uppercase tracking-widest sticky left-0 bg-gray-50 z-10">KATEQORİYA</th>
                  <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center border-l border-gray-100">LİMİT</th>
                  <th colSpan={9} className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center border-l border-gray-100 bg-gray-100/30">
                    QİYMƏT (₼)
                  </th>
                </tr>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400">
                  <th className="px-6 py-2 sticky left-0 bg-gray-50/50"></th>
                  <th className="px-4 py-2 text-center border-l border-gray-100">30 GÜN</th>
                  {[1, 3, 5, 10, 20, 25, 50, 75, 80].map(n => (
                    <th key={n} className="px-4 py-2 text-center border-l border-gray-100">{n}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCategories.map((parent) => (
                  <Fragment key={parent.id}>
                    <tr className="bg-gray-50/30">
                      <td colSpan={11} className="px-6 py-3 text-gray-900 font-extrabold text-xs uppercase tracking-wider">
                        {parent.name}
                      </td>
                    </tr>
                    {parent.children?.map((child) => (
                      <tr key={child.id} className="hover:bg-primary/5 transition-colors border-b border-gray-50 group">
                        <td className="px-8 py-4 text-gray-700 font-semibold text-sm">
                          {child.name}
                        </td>
                        <td className="px-4 py-4 text-center border-l border-gray-50">
                          <span className={cn(
                            "inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-md text-[11px] font-black",
                            child.freeLimit > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          )}>
                            {child.freeLimit}
                          </span>
                        </td>
                        {[1, 3, 5, 10, 20, 25, 50, 75, 80].map(n => {
                          const priceKey = `paidPrice${n}` as keyof CategoryDto;
                          const price = child[priceKey] as number;
                          return (
                            <td key={n} className="px-4 py-4 text-center border-l border-gray-50 text-gray-700 font-bold text-xs tabular-nums">
                              {price > 0 ? price.toFixed(2) : '-'}
                            </td>
                          );
                        })}
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
  );
}
