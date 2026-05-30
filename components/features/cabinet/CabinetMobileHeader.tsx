'use client';

import { useRouter } from 'next/navigation';

interface CabinetMobileHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function CabinetMobileHeader({ title, onBack }: CabinetMobileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/cabinet');
    }
  };

  return (
    <div className="md:hidden flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <button
        onClick={handleBack}
        className="flex items-center justify-center size-8 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer"
        aria-label="Geri"
      >
        <span className="material-symbols-outlined !text-[22px]">chevron_left</span>
      </button>
      <span className="font-extrabold text-[17px] text-gray-900 leading-none">{title}</span>
    </div>
  );
}
