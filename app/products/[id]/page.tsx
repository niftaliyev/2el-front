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

    const segments: string[] = [];
    const rootSlug = product.parentCategorySlug || (typeof product.category === 'object' ? (product.category as any)?.slug : null);
    if (rootSlug && rootSlug !== 'elanlar' && rootSlug !== 'unknown') {
      segments.push(rootSlug);
    }
    const childSlug = product.childCategorySlug || (typeof product.subCategory === 'object' ? (product.subCategory as any)?.slug : null);
    if (childSlug && childSlug !== 'unknown' && childSlug !== rootSlug) {
      segments.push(childSlug);
    }
    segments.push(product.pinCode?.toString() || product.id);
    const path = segments
      .filter(s => s && s.toLowerCase() !== 'elanlar' && s.toLowerCase() !== 'unknown')
      .join('/');

    const imageUrl = product.images && product.images.length > 0
      ? product.images[0]
      : `https://2el.az/logo.png`;

    return {
      title: browserTitle,
      description: cleanDesc,
      alternates: {
        canonical: `https://2el.az/elanlar/${path}`,
      },
      openGraph: {
        title: product.title,
        description: cleanDesc,
        type: 'website',
        url: `https://2el.az/elanlar/${path}`,
        images: [{ url: imageUrl, alt: product.title }]
      },
      twitter: {
        card: 'summary_large_image',
        title: product.title,
        description: cleanDesc,
        images: [imageUrl]
      }
    };
  } catch (error) {
    console.error('Error generating metadata for product page:', error);
    return {};
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  let initialProduct = null;
  try {
    initialProduct = await adService.getAdById(id);
  } catch (err) {
    console.error('Error loading product page server side:', err);
  }

  return <ProductDetailContent id={id} initialProduct={initialProduct || undefined} />;
}
