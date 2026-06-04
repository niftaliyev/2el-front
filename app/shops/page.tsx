import { Metadata } from 'next';
import ShopsClientContent from './ShopsClientContent';

export const metadata: Metadata = {
  title: 'Mağazalar — Bakı, Azərbaycan',
  description: 'Mağazalar Bakı, Azərbaycan. 2El.az elan portalında rəsmi mağazaların və dükanların siyahısı. Telefon mağazaları, geyim dükanları və digər kateqoriyalar.',
  openGraph: {
    title: 'Mağazalar — Bakı, Azərbaycan | 2El.az',
    description: 'Mağazalar Bakı, Azərbaycan. 2El.az elan portalında rəsmi mağazaların və dükanların siyahısı. Telefon mağazaları, geyim dükanları və digər kateqoriyalar.',
    type: 'website',
    url: 'https://2el.az/shops',
    images: [{ url: 'https://2el.az/logo.png', alt: 'Mağazalar | 2El.az' }]
  }
};

export default function ShopsPage() {
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
        "name": "Mağazalar",
        "item": "https://2el.az/shops"
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
      <ShopsClientContent />
    </>
  );
}
