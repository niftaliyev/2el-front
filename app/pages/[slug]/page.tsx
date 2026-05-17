import { Metadata } from 'next';
import PageDetailClient from './PageDetailClient';
import { helpService } from '@/services/help.service';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function resolvePageData(slug: string) {
  try {
    const policy = await helpService.getLegalPolicy(slug);
    return policy;
  } catch {
    try {
      const privacy = await helpService.getPrivacyPolicy(slug);
      return privacy;
    } catch {
      try {
        const page = await helpService.getStaticPage(slug);
        return page;
      } catch {
        return null;
      }
    }
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const unwrappedParams = await params;
  const slug = unwrappedParams.slug;
  const data = await resolvePageData(slug);

  if (!data) {
    return {
      title: 'Səhifə tapılmadı — 2El.az',
      description: 'Axtardığınız səhifə tapılmadı və ya silinib.'
    };
  }

  const titleText = `${data.title} — 2El.az`;
  const cleanDesc = data.content 
    ? data.content.replace(/<[^>]*>/g, '').slice(0, 160) 
    : `2El.az elan portalında ${data.title} ilə tanış olun.`;

  return {
    title: {
      absolute: titleText
    },
    description: cleanDesc,
    openGraph: {
      title: titleText,
      description: cleanDesc,
      type: 'website',
      url: `https://2el.az/pages/${slug}`
    }
  };
}

export default async function PageDetailPage({ params }: PageProps) {
  const unwrappedParams = await params;
  const slug = unwrappedParams.slug;
  const data = await resolvePageData(slug);

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Səhifə",
        "item": "https://2el.az"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": data ? data.title : "Səhifə",
        "item": `https://2el.az/pages/${slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdData)
        }}
      />
      <PageDetailClient initialData={data} slug={slug} />
    </>
  );
}
