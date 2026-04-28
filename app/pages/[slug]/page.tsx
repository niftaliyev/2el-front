'use client';

import { useEffect, useState } from 'react';
import { helpService } from '@/services/help.service';
import { notFound, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { StaticPage, LegalPolicy, PrivacyPolicy } from '@/types/help';

export default function PageDetail() {
  const { slug } = useParams() as { slug: string };
  const { t, language } = useLanguage();
  const [content, setContent] = useState<any>(null);
  const [legalInfo, setLegalInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data = null;
        let info = null;

        try {
          const policy = await helpService.getLegalPolicy(slug);
          data = policy;
          info = {
            version: policy.version,
            publishedDate: policy.publishedDate,
            effectiveDate: policy.effectiveDate
          };
        } catch {
          try {
            const privacy = await helpService.getPrivacyPolicy(slug);
            data = privacy;
            info = {
              version: privacy.version,
              publishedDate: privacy.publishedDate,
              effectiveDate: privacy.effectiveDate
            };
          } catch {
            try {
              const page = await helpService.getStaticPage(slug);
              data = page;
            } catch {
              notFound();
              return;
            }
          }
        }

        setContent(data);
        setLegalInfo(info);
      } catch (err) {
        console.error('Error fetching page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!content) return null;

  const displayTitle = (language === 'ru' && (content.titleRu || content.TitleRu)) ? (content.titleRu || content.TitleRu) : content.title;
  const displayContent = (language === 'ru' && (content.contentRu || content.ContentRu)) ? (content.contentRu || content.ContentRu) : content.content;

  return (
    <article className="max-w-none">
      {legalInfo && (
        <div className="flex flex-col gap-1 text-[13px] text-gray-400 mb-8 font-medium">
          <div>{language === 'ru' ? 'Номер редакции' : 'Redaksiya nömrəsi'}: № {legalInfo.version}</div>
          <div>{language === 'ru' ? 'Дата публикации' : 'Dərc olunma tarixi'}: {format(new Date(legalInfo.publishedDate), 'dd.MM.yyyy')}</div>
          <div>{language === 'ru' ? 'Дата вступления в силу' : 'Qüvvəyə mindiyi tarix'}: {format(new Date(legalInfo.effectiveDate), 'dd.MM.yyyy')}</div>
        </div>
      )}

      <h1 className="text-[32px] font-black text-primary mb-10 leading-tight">
        {displayTitle}
      </h1>

      <div 
        className="static-content text-[#444] leading-[1.8] space-y-6 text-base font-medium"
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />
    </article>
  );
}
