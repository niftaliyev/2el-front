import { helpService } from '@/services/help.service';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    let title = 'ElanAz';
    try {
      const policy = await helpService.getLegalPolicy(slug);
      title = policy.title;
    } catch {
      const page = await helpService.getStaticPage(slug);
      title = page.title;
    }
    return {
      title: `${title} - ElanAz`,
    };
  } catch {
    return { title: 'Səhifə tapılmadı' };
  }
}

export default async function PageDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let content = null;
  let legalInfo = null;

  try {
    const policy = await helpService.getLegalPolicy(slug);
    content = policy;
    legalInfo = {
      version: policy.version,
      publishedDate: policy.publishedDate,
      effectiveDate: policy.effectiveDate
    };
  } catch {
    try {
      const privacy = await helpService.getPrivacyPolicy(slug);
      content = privacy;
      legalInfo = {
        version: privacy.version,
        publishedDate: privacy.publishedDate,
        effectiveDate: privacy.effectiveDate
      };
    } catch {
      try {
        const page = await helpService.getStaticPage(slug);
        content = page;
      } catch {
        notFound();
      }
    }
  }

  if (!content) notFound();

  return (
    <article className="max-w-none">
      {legalInfo && (
        <div className="flex flex-col gap-1 text-[13px] text-gray-400 mb-8 font-medium">
          <div>Redaksiya nömrəsi: № {legalInfo.version}</div>
          <div>Dərc olunma tarixi: {format(new Date(legalInfo.publishedDate), 'dd.MM.yyyy')}</div>
          <div>Qüvvəyə mindiyi tarix: {format(new Date(legalInfo.effectiveDate), 'dd.MM.yyyy')}</div>
        </div>
      )}

      <h1 className="text-[32px] font-black text-primary mb-10 leading-tight">
        {content.title}
      </h1>

      <div 
        className="static-content text-[#444] leading-[1.8] space-y-6 text-base font-medium"
        dangerouslySetInnerHTML={{ __html: content.content }}
      />
    </article>
  );
}
