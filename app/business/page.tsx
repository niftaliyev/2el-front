import { Metadata } from 'next';
import BusinessClientContent from './BusinessClientContent';

export const metadata: Metadata = {
  title: '2El.az-da biznes: 2El.az-da mağaza yaradın',
  description: '2El.az-da mağaza yaradın və onlayn satışa başlayın. Məhsullarınızı yerləşdirin, sifariş qəbul edin, reklam və irəliçəkmə ilə satışları artırın.',
  openGraph: {
    title: '2El.az-da biznes: 2El.az-da mağaza yaradın',
    description: '2El.az-da mağaza yaradın və onlayn satışa başlayın. Məhsullarınızı yerləşdirin, sifariş qəbul edin, reklam və irəliçəkmə ilə satışları artırın.',
    type: 'website',
    url: 'https://2el.az/business',
    images: [{ url: 'https://2el.az/logo.png', alt: 'Biznes | 2El.az' }]
  }
};

export default function BusinessPage() {
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
        "name": "Biznes",
        "item": "https://2el.az/business"
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
      <BusinessClientContent />
    </>
  );
}
