import { Suspense } from 'react';
import { Metadata } from 'next';
import ListingsContent from '@/components/features/listings/ListingsContent';
import ProductDetailContent from '@/components/features/products/ProductDetailContent';
import { adService } from '@/services/ad.service';
import { generateSlug, toAccusativeCaseAz } from '@/lib/utils';
import { SearchFilters } from '@/types';
import { AdDetail } from '@/types/api';

// Helper to resolve the parameters from slug array on the server
async function resolveSlugPath(slug: string[]) {
  let productId: string | null = null;
  let resolvedFilters: Partial<SearchFilters> = {};
  let categoryName = '';
  let subCategoryName = '';
  let categoryId = '';
  let subCategoryId = '';

  if (slug.length > 0) {
    const lastSegment = slug[slug.length - 1];
    
    // Check for PinCode (tap.az style)
    const numericMatch = lastSegment.match(/(?:^|-)([0-9]{5,})$/);
    const detectedPinCode = numericMatch ? numericMatch[1] : null;

    if (detectedPinCode) {
      productId = detectedPinCode;
    } else {
      // Check for GUID (legacy support)
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (guidRegex.test(lastSegment)) {
        productId = lastSegment;
      }
    }
  }

  // If not a product page, resolve category/subcategory hierarchy
  if (!productId && slug.length > 0) {
    try {
      const tree = await adService.getCategoryTree();

      if (slug.length >= 1) {
        const rootCat = tree.find((c: any) => generateSlug(c.name) === slug[0]);
        if (rootCat) {
          categoryId = rootCat.id;
          categoryName = rootCat.name;

          if (slug.length >= 2) {
            const childCat = (rootCat.children || []).find((c: any) => generateSlug(c.name) === slug[1]);
            if (childCat) {
              categoryId = childCat.id;
              categoryName = childCat.name;

              if (slug.length >= 3) {
                // Segment 3 is usually a brand (technical subcategory)
                const brands = await adService.getSubCategories(childCat.id);
                const brand = brands.find((b: any) => generateSlug(b.name) === slug[2]);
                if (brand) {
                  subCategoryId = brand.id;
                  subCategoryName = brand.name;
                }
              }
            } else {
              // If segment 2 is not a child category, check if it's a brand of the root
              const brands = await adService.getSubCategories(rootCat.id);
              const brand = brands.find((b: any) => generateSlug(b.name) === slug[1]);
              if (brand) {
                subCategoryId = brand.id;
                subCategoryName = brand.name;
              }
            }
          }
        }
      }
      resolvedFilters = { categoryId, subCategoryId };
    } catch (error) {
      console.error('Error resolving slug category tree:', error);
    }
  }

  return {
    productId,
    resolvedFilters,
    categoryName,
    subCategoryName
  };
}

interface PageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Next.js Server Component metadata generator
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const unwrappedParams = await params;
  const unwrappedSearchParams = await searchParams;
  const slug = unwrappedParams.slug || [];

  const { productId, categoryName } = await resolveSlugPath(slug);

  if (productId) {
    try {
      const product = await adService.getAdById(productId);
      const titleText = `${product.title}: ${product.price} AZN — ${product.city || 'Bakı'}, Azərbaycan | ${product.pinCode || product.id} — 2El.az`;
      const plainTitle = product.title;
      const cleanDesc = product.description
        ? product.description.replace(/<[^>]*>/g, '').slice(0, 160)
        : `2El.az elan portalında ${product.title} sərfəli qiymətə alın və ya tez satın.`;
      
      const imageUrl = product.images && product.images.length > 0 
        ? product.images[0] 
        : 'https://2el.az/logo.png';

      return {
        title: {
          absolute: titleText
        },
        description: cleanDesc,
        openGraph: {
          title: plainTitle,
          description: cleanDesc,
          type: 'website',
          url: `https://2el.az/elanlar/${slug.join('/')}`,
          images: [{ url: imageUrl, alt: plainTitle }]
        }
      };
    } catch (err) {
      console.error('Error generating metadata for product:', err);
    }
  }

  // Category Page
  if (categoryName) {
    const accCase = toAccusativeCaseAz(categoryName);
    const catTitle = `${categoryName} elanları — Bakı, Azərbaycan | 2El.az`;
    const catDesc = `${categoryName} elanları Bakı, Azərbaycan. 2El.az elan portalında ${accCase} sərfəli alın və ya tez satın.`;

    return {
      title: {
        absolute: catTitle
      },
      description: catDesc,
      openGraph: {
        title: catTitle,
        description: catDesc,
        type: 'website',
        url: `https://2el.az/elanlar/${slug.join('/')}`,
      }
    };
  }

  // Search Results Page
  const query = typeof unwrappedSearchParams.search === 'string' 
    ? unwrappedSearchParams.search 
    : typeof unwrappedSearchParams.q === 'string' 
      ? unwrappedSearchParams.q 
      : '';
  
  if (query) {
    const searchTitle = `${query} — Bütün kateqoriyalar — Bakı, Azərbaycan | 2El.az`;
    const searchDesc = `Ucuz qiymətə ${query} tap – 2El.az pulsuz elanlar portalında axtarış nəticələri.`;
    return {
      title: {
        absolute: searchTitle
      },
      description: searchDesc,
      openGraph: {
        title: searchTitle,
        description: searchDesc,
        type: 'website',
      }
    };
  }

  return {
    title: {
      absolute: 'Bütün elanlar — Bakı, Azərbaycan | 2El.az'
    },
    description: 'Bütün elanlar Bakı, Azərbaycan. 2El.az elan portalında hər növ məhsul və xidmətləri sərfəli alın və ya satın.'
  };
}

export default async function ElanlarDynamicPage({ params, searchParams }: PageProps) {
  const unwrappedParams = await params;
  const slug = unwrappedParams.slug || [];

  const { productId, resolvedFilters, categoryName, subCategoryName } = await resolveSlugPath(slug);

  let initialProduct: AdDetail | null = null;
  if (productId) {
    try {
      initialProduct = await adService.getAdById(productId);
    } catch (err) {
      console.error('Error pre-fetching product detail:', err);
    }
  }

  // Generate dynamic breadcrumb schemas
  const breadcrumbElements = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Ana Səhifə",
      "item": "https://2el.az"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Bütün Elanlar",
      "item": "https://2el.az/elanlar"
    }
  ];

  if (slug.length >= 1 && categoryName) {
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3,
      "name": categoryName,
      "item": `https://2el.az/elanlar/${slug[0]}`
    });

    if (slug.length >= 2 && subCategoryName) {
      breadcrumbElements.push({
        "@type": "ListItem",
        "position": 4,
        "name": subCategoryName,
        "item": `https://2el.az/elanlar/${slug[0]}/${slug[1]}`
      });
    }
  }

  const jsonLdData: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbElements
    }
  ];

  // If it's a product, inject Product and Offer schemas!
  if (initialProduct) {
    const imageUrls = initialProduct.images && initialProduct.images.length > 0
      ? initialProduct.images
      : ['https://2el.az/logo.png'];
    
    jsonLdData.push({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": initialProduct.title,
      "image": imageUrls,
      "description": initialProduct.description || initialProduct.title,
      "sku": initialProduct.pinCode || initialProduct.id,
      "mpn": initialProduct.pinCode || initialProduct.id,
      "offers": {
        "@type": "Offer",
        "url": `https://2el.az/elanlar/${slug.join('/')}`,
        "priceCurrency": "AZN",
        "price": initialProduct.price,
        "priceValidUntil": new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
        "itemCondition": initialProduct.isNew ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": initialProduct.isStore ? "LocalBusiness" : "Person",
          "name": initialProduct.fullName || initialProduct.storeName || "Fərdi satıcı",
          "image": initialProduct.storeLogoUrl || undefined
        }
      }
    });
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdData)
        }}
      />
      {productId ? (
        <ProductDetailContent id={productId} initialProduct={initialProduct || undefined} />
      ) : (
        <Suspense fallback={<div className="flex justify-center items-center py-20 min-h-screen animate-pulse text-gray-400">Yüklənir...</div>}>
          <ListingsContent initialFilters={resolvedFilters} />
        </Suspense>
      )}
    </>
  );
}
