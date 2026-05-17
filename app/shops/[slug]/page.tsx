import { Metadata } from 'next';
import StoreDetailClient from './StoreDetailClient';
import { storeService } from '@/services/store.service';
import { StoreDetail } from '@/types/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function resolveStore(slug: string): Promise<StoreDetail | null> {
  const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  try {
    if (isGuid) {
      try {
        return await storeService.getStore(slug);
      } catch (err) {
        return await storeService.getStoreBySlug(slug);
      }
    } else {
      return await storeService.getStoreBySlug(slug);
    }
  } catch (err) {
    console.error('Error resolving store in page.tsx:', err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const unwrappedParams = await params;
  const slug = unwrappedParams.slug;
  const store = await resolveStore(slug);

  if (!store) {
    return {
      title: 'Mağaza tapılmadı — 2El.az',
      description: 'Axtardığınız mağaza tapılmadı və ya silinib.'
    };
  }

  const titleText = `${store.storeName} — Bakı, Azərbaycan | Mağazalar — 2El.az`;
  const descText = store.description 
    ? store.description.slice(0, 160) 
    : `${store.storeName} mağazasının bütün elanları, əlaqə vasitələri və ünvan məlumatları 2El.az elanlar portalında.`;
  
  const logoUrl = store.storeLogoUrl || 'https://2el.az/logo.png';

  return {
    title: {
      absolute: titleText
    },
    description: descText,
    openGraph: {
      title: titleText,
      description: descText,
      type: 'website',
      url: `https://2el.az/shops/${slug}`,
      images: [{ url: logoUrl, alt: store.storeName }]
    }
  };
}

export default async function StoreDetailPage({ params }: PageProps) {
  const unwrappedParams = await params;
  const slug = unwrappedParams.slug;
  const store = await resolveStore(slug);

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800">Mağaza tapılmadı</h1>
        <a href="/shops" className="text-primary hover:underline mt-4">Mağazalar səhifəsinə geri qayıt</a>
      </div>
    );
  }

  // Inject Breadcrumbs and Store schemas in server layout
  const jsonLdData = [
    {
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
          "name": "Mağazalar",
          "item": "https://2el.az/shops"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": store.storeName,
          "item": `https://2el.az/shops/${slug}`
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": store.storeName,
      "image": store.storeLogoUrl || "https://2el.az/logo.png",
      "telephone": store.contactNumber || "+994-50-123-45-67",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": store.address || "Bakı, Azərbaycan",
        "addressLocality": store.cityName || "Bakı",
        "addressCountry": "AZ"
      },
      "url": `https://2el.az/shops/${slug}`,
      "description": store.description || store.storeName
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdData)
        }}
      />
      <StoreDetailClient initialStore={store} slug={slug} />
    </>
  );
}
