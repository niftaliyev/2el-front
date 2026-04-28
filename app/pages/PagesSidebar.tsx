'use client';

import { LegalPolicy, StaticPage, PrivacyPolicy, HelpCategory } from '@/types/help';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface PagesSidebarProps {
  helpCategories?: HelpCategory[];
  legalPolicies: LegalPolicy[];
  staticPages: StaticPage[];
  privacyPolicy: PrivacyPolicy | null;
}

export default function PagesSidebar({ helpCategories = [], legalPolicies, staticPages, privacyPolicy }: PagesSidebarProps) {
  const { t, language } = useLanguage();
  const pathname = usePathname();

  const specialLinks = [
    { name: t('burgerMenu.categoryLimits'), href: '/pages/limits_by_category' },
    { name: t('burgerMenu.paidServices'), href: '/pages/packages' },
  ];

  const renderLink = (name: string, href: string) => {
    const isActive = pathname === href;

    return (
      <Link
        key={`${name}-${href}`}
        href={href}
        className={cn(
          "px-4 py-2 rounded-lg text-[14px] font-semibold transition-all flex items-center justify-between group",
          isActive 
            ? "bg-primary text-white shadow-sm" 
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )}
      >
        <span className="truncate">{name}</span>
        {isActive && (
          <span className="w-1.5 h-1.5 rounded-full bg-white ml-2 flex-shrink-0" />
        )}
      </Link>
    );
  };

  return (
    <div className="flex flex-col sticky top-24 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
      {/* SECTION 1: Help / FAQ */}
      <div className="flex flex-col gap-0.5">
        {helpCategories.map(cat => renderLink(language === 'ru' && (cat.nameRu || cat.NameRu) ? (cat.nameRu || cat.NameRu)! : cat.name, `/help/${cat.slug}`))}
        
        {helpCategories.length === 0 && (
          <Link
            href="/help"
            className="px-4 py-2 rounded-lg text-[14px] font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            {t('burgerMenu.help')}
          </Link>
        )}
      </div>

      {/* SEPARATOR */}
      <div className="my-4 border-t border-gray-200/50 mx-2" />

      {/* SECTION 2: Legal & Rules */}
      <div className="flex flex-col gap-0.5">
        {/* Legal Policies */}
        {legalPolicies.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map(policy => 
          renderLink(language === 'ru' && (policy.titleRu || policy.TitleRu) ? (policy.titleRu || policy.TitleRu)! : policy.title, `/pages/${policy.slug}`)
        )}
        
        {/* Dynamic / Special Pages */}
        {specialLinks.map(link => renderLink(link.name, link.href))}

        {/* Privacy Policy */}
        {privacyPolicy && renderLink(language === 'ru' && (privacyPolicy.titleRu || privacyPolicy.TitleRu) ? (privacyPolicy.titleRu || privacyPolicy.TitleRu)! : privacyPolicy.title, `/pages/${privacyPolicy.slug}`)}

        {/* Static Pages */}
        {staticPages.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map(page => 
          renderLink(language === 'ru' && (page.titleRu || page.TitleRu) ? (page.titleRu || page.TitleRu)! : page.title, `/pages/${page.slug}`)
        )}
      </div>
    </div>
  );
}
