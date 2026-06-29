import { Metadata } from 'next';
import ProductDetailContent from '@/components/features/products/ProductDetailContent';
import { adService } from '@/services/ad.service';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await adService.getAdById(id);
    if (!product) return {};

    const priceText = `${product.price} AZN`;
    const cityText = `${product.city || 'Bakı'}, Azərbaycan`;
    const pinText = product.pinCode || product.id;
    let browserTitle = '';
    if (product.isStore && product.storeName) {
      browserTitle = `${product.title}: ${priceText} - ${product.storeName} - Mağazalar — ${cityText} | ${pinText} — 2El.az`;
    } else {
      browserTitle = `${product.title}: ${priceText} — ${cityText} | ${pinText} — 2El.az`;
    }

    const cleanDesc = product.description
      ? product.description.replace(/<[^>]*>/g, '').slice(0, 160)
      : `2El.az elan portalında ${product.title} sərfəli qiymətə alın və ya tez satın.`;

    const imageUrl = product.images && product.images.length > 0
      ? product.images[0]
      : `https://2el.az/logo.png`;

    return {
      title: browserTitle,
      description: cleanDesc,
      openGraph: {
        title: product.title,
        description: cleanDesc,
        images: [{ url: imageUrl, alt: product.title }]
      }
    };
  } catch (error) {
    console.error('Error generating metadata for product page:', error);
    return {};
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  return <ProductDetailContent id={id} />;
}
