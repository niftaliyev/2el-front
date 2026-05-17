import { Metadata } from 'next';
import VipClientContent from './VipClientContent';

export const metadata: Metadata = {
  title: 'VIP elanlar — Bakı, Azərbaycan | 2El.az',
  description: 'VIP elanlar Bakı, Azərbaycan. 2El.az elanlar portalında ən son VIP və premium səviyyəli pulsuz elanlar. Tez satılan və seçilən məhsullar.',
  openGraph: {
    title: 'VIP elanlar — Bakı, Azərbaycan | 2El.az',
    description: 'VIP elanlar Bakı, Azərbaycan. 2El.az elanlar portalında ən son VIP və premium səviyyəli pulsuz elanlar. Tez satılan və seçilən məhsullar.',
    type: 'website',
    url: 'https://2el.az/listings/vip',
    images: [{ url: 'https://2el.az/logo.png', alt: 'VIP elanlar | 2El.az' }]
  }
};

export default function VipPage() {
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
        "name": "VIP elanlar",
        "item": "https://2el.az/listings/vip"
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
      <VipClientContent />
    </>
  );
}
