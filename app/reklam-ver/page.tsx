import { Metadata } from 'next';
import AdvertisingClient from './AdvertisingClient';

export const metadata: Metadata = {
  title: 'Biznesiniz üçün Reklam yerləşdirin — 2El.az',
  description: '2El.az elan portalında banner və biznes reklamları yerləşdirin. Biznesinizin tanıdılması və satışlarınızın artırılması üçün effektiv media reklam.',
  openGraph: {
    title: 'Biznesiniz üçün Reklam yerləşdirin — 2El.az',
    description: '2El.az elan portalında banner və biznes reklamları yerləşdirin. Biznesinizin tanıdılması və satışlarınızın artırılması üçün effektiv media reklam.',
    type: 'website',
    url: 'https://2el.az/reklam-ver',
    images: [{ url: 'https://2el.az/logo.png', alt: 'Reklam Yerləşdirin | 2El.az' }]
  }
};

export default function AdvertisingPage() {
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
        "name": "Reklam yerləşdirin",
        "item": "https://2el.az/reklam-ver"
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
      <AdvertisingClient />
    </>
  );
}
