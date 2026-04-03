'use client';

import { PackageItem } from '@/types/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PromotionPackagesProps {
  packages: PackageItem[];
  selectedPackageId: string | null;
  onSelect: (id: string | null) => void;
}

export default function PromotionPackages({ packages, selectedPackageId, onSelect }: PromotionPackagesProps) {
  // Sort and pick most relevant packages for each type to keep it clean
  const vips = packages.filter(p => p.packageType === 'Vip').sort((a, b) => (a.price || 0) - (b.price || 0));
  const premiums = packages.filter(p => p.packageType === 'Premium').sort((a, b) => (a.price || 0) - (b.price || 0));
  const boosts = packages.filter(p => p.packageType === 'Boost').sort((a, b) => (a.price || 0) - (b.price || 0));

  const renderPackageCard = (pkg: PackageItem) => {
    const isSelected = selectedPackageId === pkg.id;
    const typeLabel = pkg.packageType === 'Vip' ? 'VİP' : pkg.packageType === 'Premium' ? 'PREMİUM' : 'İrəli çək';
    const icon = pkg.packageType === 'Vip' ? 'grade' : pkg.packageType === 'Premium' ? 'diamond' : 'rocket_launch';

    let colorClass = 'border-gray-200 hover:border-primary/50';
    let iconClass = 'text-gray-400';
    let badgeClass = 'bg-gray-100 text-gray-600';

    if (pkg.packageType === 'Vip') {
      colorClass = isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-primary/50';
      iconClass = isSelected ? 'text-primary' : 'text-amber-500';
      badgeClass = 'bg-amber-100 text-amber-700 font-bold';
    } else if (pkg.packageType === 'Premium') {
      colorClass = isSelected ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600' : 'border-gray-200 hover:border-purple-300';
      iconClass = isSelected ? 'text-purple-600' : 'text-purple-500';
      badgeClass = 'bg-purple-100 text-purple-700 font-bold';
    } else if (pkg.packageType === 'Boost') {
      colorClass = isSelected ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'border-gray-200 hover:border-emerald-300';
      iconClass = isSelected ? 'text-emerald-600' : 'text-emerald-500';
      badgeClass = 'bg-emerald-100 text-emerald-700 font-bold';
    }

    return (
      <div
        key={pkg.id}
        onClick={() => onSelect(isSelected ? null : pkg.id)}
        className={twMerge(
          "relative flex flex-col p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group hover:shadow-md",
          colorClass
        )}
      >
        <div className="flex justify-between items-start mb-3">
          <span className={twMerge("text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider", badgeClass)}>
            {typeLabel}
          </span>
          <span className={twMerge("material-symbols-outlined !text-2xl transition-transform group-hover:scale-110", iconClass)}>
            {icon}
          </span>
        </div>

        <h3 className="text-gray-900 font-black text-xl mb-1">{pkg.price} AZN</h3>
        <div className="flex flex-col gap-1 mb-4 h-12">
          <p className="text-gray-900 text-[12px] font-bold">
            {pkg.intervalDay} Günlük {typeLabel}
          </p>
          <p className="text-gray-500 text-[11px] leading-tight line-clamp-2">
            {pkg.packageType === 'Premium'
              ? "VIP + Gündəlik irəli çəkmə daxil"
              : pkg.packageType === 'Vip'
                ? "Gündəlik irəli çəkmə daxil"
                : pkg.description || "Elanınızı siyahıda önə çəkin"}
          </p>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <div className={twMerge(
            "w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-all",
            isSelected ? "border-current bg-current" : "border-gray-300 bg-white"
          )} style={{ color: pkg.packageType === 'Premium' ? '#9333ea' : pkg.packageType === 'Boost' ? '#059669' : '#607afb' }}>
            {isSelected && <span className="material-symbols-outlined !text-[14px] text-white font-bold">check</span>}
          </div>
          <span className={twMerge("text-xs font-bold", isSelected ? "opacity-100" : "opacity-40")}>
            {isSelected ? "Seçildi" : "Seç"}
          </span>
        </div>

        {/* Hover Highlight */}
        <div className={twMerge(
          "absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none",
          pkg.packageType === 'Premium' ? "bg-purple-600" : pkg.packageType === 'Boost' ? "bg-emerald-600" : "bg-primary"
        )} />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-primary/10 p-6 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined !text-3xl fill">rocket_launch</span>
          </div>
          <div>
            <h2 className="text-gray-900 text-xl font-black tracking-tight leading-tight">Daha çox baxış qazanın</h2>
            <p className="text-gray-500 text-sm font-medium">Elanınızı sürətlə satın və ya fərqləndirin</p>
          </div>
        </div>

        {!selectedPackageId && (
          <div className="hidden lg:block animate-bounce px-3 py-1 bg-amber-100 border border-amber-200 rounded-full">
            <span className="text-amber-800 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined !text-[12px]">trending_up</span>
              Satışı 10x sürətləndirin
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Standard option */}
        <div
          onClick={() => onSelect(null)}
          className={twMerge(
            "relative flex flex-col p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group hover:shadow-md",
            !selectedPackageId ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wider font-bold">
              STANDART
            </span>
            <span className={twMerge("material-symbols-outlined !text-2xl transition-all", !selectedPackageId ? "text-primary scale-110" : "text-gray-400 opacity-40")}>
              check_circle
            </span>
          </div>

          <h3 className="text-gray-900 font-black text-xl mb-1">Pulsuz</h3>
          <p className="text-gray-500 text-[11px] leading-tight mb-4 h-8 uppercase tracking-tighter font-medium">
            Heç bir əlavə xidmət olmadan elan yerləşdirin
          </p>

          <div className="mt-auto flex items-center gap-2">
            <div className={twMerge(
              "w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-all",
              !selectedPackageId ? "border-primary bg-primary" : "border-gray-300 bg-white"
            )}>
              {!selectedPackageId && <span className="material-symbols-outlined !text-[14px] text-white font-bold">check</span>}
            </div>
            <span className={twMerge("text-xs font-bold", !selectedPackageId ? "text-primary opacity-100" : "text-gray-400 opacity-40")}>
              {!selectedPackageId ? "Seçildi" : "Seç"}
            </span>
          </div>
        </div>

        {/* Show one for each type */}
        {boosts.length > 0 && renderPackageCard(boosts[0])}
        {vips.length > 0 && renderPackageCard(vips[0])}
        {premiums.length > 0 && renderPackageCard(premiums[0])}
      </div>

      {/* Show hint that it's optional */}
      <div className="mt-8 flex items-center justify-center">
        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-100 select-none">
          <span className="material-symbols-outlined !text-[14px] text-emerald-500">verified</span>
          Xidmət seçimi məcburi deyil
        </div>
      </div>
    </div>
  );
}
