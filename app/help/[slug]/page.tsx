'use client';

import { useEffect, useState } from 'react';
import { helpService } from '@/services/help.service';
import HelpAccordion from '@/app/help/HelpAccordion';
import { notFound, useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { HelpCategory } from '@/types/help';

export default function HelpCategoryPage() {
  const { slug } = useParams() as { slug: string };
  const { language, t } = useLanguage();
  const [category, setCategory] = useState<HelpCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const data = await helpService.getCategory(slug);
        setCategory(data);
      } catch (err) {
        console.error('Error fetching help category:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!category) {
    notFound();
    return null;
  }

  const displayName = language === 'ru' && (category.nameRu || category.NameRu) ? (category.nameRu || category.NameRu) : category.name;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">
        {displayName}
      </h2>
      
      <div className="flex flex-col gap-4">
        {category.helpItems.length > 0 ? (
          category.helpItems.map((item) => (
            <HelpAccordion key={item.id} item={item} />
          ))
        ) : (
          <p className="text-gray-500 italic">
            {language === 'ru' ? 'В этой категории пока нет вопросов.' : 'Bu kateqoriya üzrə hələ ki, sual yoxdur.'}
          </p>
        )}
      </div>
    </div>
  );
}
