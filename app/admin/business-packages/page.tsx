'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { Edit2, Trash2, Plus, X, Check, Package, TrendingUp, Users, Info, Settings, BadgePercent, Wallet } from 'lucide-react';

export default function AdminBusinessPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [userPackages, setUserPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'packages' | 'purchases'>('packages');
  const [editingPackage, setEditingPackage] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    serviceBalance: 0,
    adLimit: 0,
    serviceDiscountPercentage: 0,
    discount60Days: 10,
    discount90Days: 15,
    discount180Days: 20
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pkgs, upkgs] = await Promise.all([
        adminService.getAdminBusinessPackages(),
        adminService.getUserBusinessPackages()
      ]);
      setPackages(pkgs);
      setUserPackages(upkgs);
    } catch (error) {
      toast.error('Məlumatları yükləmək mümkün olmadı');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (pkg: any = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        description: pkg.description || '',
        basePrice: pkg.basePrice,
        serviceBalance: pkg.serviceBalance,
        adLimit: pkg.adLimit,
        serviceDiscountPercentage: pkg.serviceDiscountPercentage,
        discount60Days: pkg.discount60Days,
        discount90Days: pkg.discount90Days,
        discount180Days: pkg.discount180Days
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: '',
        description: '',
        basePrice: 0,
        serviceBalance: 0,
        adLimit: 0,
        serviceDiscountPercentage: 0,
        discount60Days: 10,
        discount90Days: 15,
        discount180Days: 20
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.upsertBusinessPackage({
        id: editingPackage?.id,
        ...formData
      });
      toast.success(editingPackage ? 'Paket yeniləndi' : 'Yeni paket yaradıldı');
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Xəta baş verdi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu paketi silmək istədiyinizə əminsiniz?')) return;
    try {
      await adminService.deleteBusinessPackage(id);
      toast.success('Paket silindi');
      loadData();
    } catch (error) {
      toast.error('Xəta baş verdi');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 bg-gray-50/30 min-h-screen">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Package className="text-primary" size={32} /> Biznes Paketləri
            </h1>
            <p className="text-slate-500 font-medium mt-1">Mağazalar üçün təklif olunan paketlərin idarə edilməsi</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 transition-all self-start md:self-auto"
          >
            <Plus size={20} strokeWidth={3} /> Yeni Paket Yarat
          </button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktiv Paket Çeşidi</p>
              <p className="text-2xl font-black text-slate-900">{packages.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cəmi Abunəçi</p>
              <p className="text-2xl font-black text-slate-900">{userPackages.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cəmi Gəlir (₼)</p>
              <p className="text-2xl font-black text-slate-900">
                {userPackages.reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white p-1 rounded-2xl mb-8 border border-slate-100 max-w-sm">
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all ${activeTab === 'packages' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Paketlər
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all ${activeTab === 'purchases' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Alış Tarixçəsi
          </button>
        </div>

        {/* Content */}
        {activeTab === 'packages' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {packages.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                  <Package size={80} />
                </div>

                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-900">{pkg.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(pkg)}
                      className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-3xl p-6 mb-6 border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Baza Qiymət (30 GÜN)</p>
                  <p className="text-3xl font-black text-slate-900">{pkg.basePrice.toFixed(0)} <span className="text-lg">₼</span></p>
                </div>

                {pkg.description && (
                  <p className="text-slate-500 text-xs font-medium mb-6 line-clamp-2 italic">
                    {pkg.description}
                  </p>
                )}

                <div className="flex-1 space-y-4 mb-8">
                  {[
                    { label: 'Elan Limiti', val: pkg.adLimit, icon: Check, color: 'green' },
                    { label: 'Xidmət Balansı', val: `${pkg.serviceBalance} ₼`, icon: Wallet, color: 'blue' },
                    { label: 'Xidmət Endirimi', val: `-${pkg.serviceDiscountPercentage}%`, icon: BadgePercent, color: 'amber' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full bg-${item.color}-50 text-${item.color}-500 flex items-center justify-center shrink-0`}>
                        <item.icon size={12} strokeWidth={4} />
                      </div>
                      <span className="text-slate-600 text-sm font-semibold">{item.label}: <strong className="text-slate-900">{item.val}</strong></span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-300 uppercase mb-1">60 GÜN</p>
                    <p className="text-xs font-black text-green-600">-{pkg.discount60Days}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-300 uppercase mb-1">90 GÜN</p>
                    <p className="text-xs font-black text-green-600">-{pkg.discount90Days}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-300 uppercase mb-1">180 GÜN</p>
                    <p className="text-xs font-black text-green-600">-{pkg.discount180Days}%</p>
                  </div>
                </div>
              </div>
            ))}

            {packages.length === 0 && (
              <div className="col-span-full py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
                <div className="p-6 bg-slate-50 rounded-full text-slate-200">
                  <Package size={64} />
                </div>
                <p className="text-slate-400 font-bold">Heç bir paket tapılmadı</p>
                <button onClick={() => handleOpenModal()} className="text-primary font-black uppercase text-xs hover:underline">İlk paketi yaradın</button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-50 bg-slate-50/30">
                    <th className="px-8 py-5">Abunəçi</th>
                    <th className="px-8 py-5">Paket</th>
                    <th className="px-8 py-5">Məbləğ</th>
                    <th className="px-8 py-5">Daimilik</th>
                    <th className="px-8 py-5">Bitmə tarixi</th>
                    <th className="px-8 py-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {userPackages.map(up => (
                    <tr key={up.id} className="text-sm group hover:bg-slate-50/50 transition-all font-medium text-slate-600">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900">{up.userName || 'İstifadəçi'}</span>
                          <span className="text-xs text-slate-400">ID: {up.id.split('-')[0]}...</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-black text-slate-900">{up.name}</td>
                      <td className="px-8 py-5 font-black text-primary">{up.price.toFixed(2)} ₼</td>
                      <td className="px-8 py-5">
                        <span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">{up.durationDays || 30} GÜN</span>
                      </td>
                      <td className="px-8 py-5 font-black">{new Date(up.expireDate).toLocaleDateString('az-AZ')}</td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${up.isExpired ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {up.isExpired ? 'Müddəti Bitib' : 'Aktiv'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{editingPackage ? 'Paketi Redaktə Et' : 'Yeni Paket Yarat'}</h2>
                <p className="text-slate-400 text-sm font-medium">Bütün xüsusiyyətləri dəqiq daxil edin</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-full hover:bg-slate-100 transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Paket Adı</label>
                  <input
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-primary focus:bg-white rounded-2xl p-4 font-bold text-slate-900 outline-none transition-all"
                    placeholder="Məsələn: Gümüş, Qızıl, Platinum"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Təsvir (Opsional)</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-primary focus:bg-white rounded-2xl p-4 font-bold text-slate-900 outline-none transition-all min-h-[100px] resize-none"
                    placeholder="Paket haqqında qısa məlumat..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Baza Qiymət (30 GÜN)</label>
                  <input
                    type="number"
                    required
                    value={formData.basePrice}
                    onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-primary focus:bg-white rounded-2xl p-4 font-bold text-slate-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Elan Limiti (30 GÜN)</label>
                  <input
                    type="number"
                    required
                    value={formData.adLimit}
                    onChange={e => setFormData({ ...formData, adLimit: Number(e.target.value) })}
                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-primary focus:bg-white rounded-2xl p-4 font-bold text-slate-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Xidmət Balansı (30 GÜN)</label>
                  <input
                    type="number"
                    required
                    value={formData.serviceBalance}
                    onChange={e => setFormData({ ...formData, serviceBalance: Number(e.target.value) })}
                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-primary focus:bg-white rounded-2xl p-4 font-bold text-slate-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Xidmət Endirimi (%)</label>
                  <input
                    type="number"
                    required
                    min="0" max="100"
                    value={formData.serviceDiscountPercentage}
                    onChange={e => setFormData({ ...formData, serviceDiscountPercentage: Number(e.target.value) })}
                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-primary focus:bg-white rounded-2xl p-4 font-bold text-slate-900 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2 pt-2">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">
                    <BadgePercent size={14} className="text-primary" /> MÜDDƏT ÜZRƏ ENDİRİMLƏR (%)
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">60 GÜNLÜK</label>
                      <input
                        type="number"
                        value={formData.discount60Days}
                        onChange={e => setFormData({ ...formData, discount60Days: Number(e.target.value) })}
                        className="w-full bg-slate-100 border-none rounded-xl p-3 font-black text-center text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">90 GÜNLÜK</label>
                      <input
                        type="number"
                        value={formData.discount90Days}
                        onChange={e => setFormData({ ...formData, discount90Days: Number(e.target.value) })}
                        className="w-full bg-slate-100 border-none rounded-xl p-3 font-black text-center text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">180 GÜNLÜK</label>
                      <input
                        type="number"
                        value={formData.discount180Days}
                        onChange={e => setFormData({ ...formData, discount180Days: Number(e.target.value) })}
                        className="w-full bg-slate-100 border-none rounded-xl p-3 font-black text-center text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl font-black text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl font-black text-white bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
                >
                  {editingPackage ? 'Dəyişiklikləri Saxla' : 'Paketi Tamamla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
