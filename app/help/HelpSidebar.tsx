'use client';

import { HelpCategory } from '@/types/help';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface HelpSidebarProps {
  categories: HelpCategory[];
}

export default function HelpSidebar({ categories }: HelpSidebarProps) {
  const pathname = usePathname();
  const { language } = useLanguage();

  return (
    <div className="flex flex-col gap-1 sticky top-24">
      {categories.map((category) => {
        const href = `/help/${category.slug}`;
        const isActive = pathname === href || (pathname === '/help' && category.displayOrder === 1);
        const displayName = language === 'ru' ? (category.nameRu || category.NameRu || category.name) : category.name;

        return (
          <Link
            key={category.id}
            href={href}
            className={cn(
              "px-5 py-4 rounded-2xl text-[15px] font-semibold transition-all flex items-center justify-between group",
              isActive 
                ? "bg-white text-primary shadow-md" 
                : "text-gray-500 hover:bg-white/50 hover:text-gray-900"
            )}
          >
            {displayName}
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
