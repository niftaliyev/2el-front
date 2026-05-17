import { Metadata } from 'next';
import HelpCategoryClient from './HelpCategoryClient';
import { helpService } from '@/services/help.service';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function resolveCategory(slug: string) {
  try {
    return await helpService.getCategory(slug);
  } catch (err) {
    console.error('Error resolving FAQ category:', err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const unwrappedParams = await params;
  const slug = unwrappedParams.slug;
  const category = await resolveCategory(slug);

  if (!category) {
    return {
      title: 'Yardım və Dəstək — 2El.az',
      description: 'Yardım və Dəstək elanlar portalı 2El.az.'
    };
  }

  const titleText = `Yardım — ${category.name} — 2El.az`;
  const cleanDesc = category.helpItems && category.helpItems.length > 0 
    ? category.helpItems.map(item => item.question).join(', ').slice(0, 160)
    : `2El.az elan portalında ${category.name} ilə əlaqəli kömək və tez-tez verilən suallar.`;

  return {
    title: {
      absolute: titleText
    },
    description: cleanDesc,
    openGraph: {
      title: titleText,
      description: cleanDesc,
      type: 'website',
      url: `https://2el.az/help/${slug}`
    }
  };
}

export default async function HelpCategoryPage({ params }: PageProps) {
  const unwrappedParams = await params;
  const slug = unwrappedParams.slug;
  const category = await resolveCategory(slug);

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
        "name": "Yardım və Dəstək",
        "item": "https://2el.az/help"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": category ? category.name : "Kateqoriya",
        "item": `https://2el.az/help/${slug}`
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
      <HelpCategoryClient initialData={category} slug={slug} />
    </>
  );
}
