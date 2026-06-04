import { Suspense } from 'react';
import { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import ListingsContent from '@/components/features/listings/ListingsContent';
import ProductDetailContent from '@/components/features/products/ProductDetailContent';
import { adService } from '@/services/ad.service';
import { generateSlug, toAccusativeCaseAz, getSiteUrl } from '@/lib/utils';
import { SearchFilters } from '@/types';
import { AdDetail } from '@/types/api';

interface CategoryNode {
  id: string;
  name: string;
  nameRu?: string;
  children?: CategoryNode[];
}

function findCategoryPath(tree: CategoryNode[], targetId: string, currentPath: CategoryNode[] = []): CategoryNode[] | null {
  for (const node of tree) {
    const path = [...currentPath, node];
    if (node.id === targetId) {
      return path;
    }
    if (node.children && node.children.length > 0) {
      const found = findCategoryPath(node.children, targetId, path);
      if (found) return found;
    }
  }
  return null;
}

// Helper to resolve the parameters from slug array on the server
async function resolveSlugPath(slug: string[]) {
  let productId: string | null = null;
  let resolvedFilters: Partial<SearchFilters> = {};
  let categoryName = '';
  let subCategoryName = '';
  let categoryId = '';
  let subCategoryId = '';
  let seoPage: any = null;
  let categoryPath: CategoryNode[] | null = null;

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

  // If not a product page, check if it's a custom SEO page!
  if (!productId && slug.length === 1) {
    try {
      const { seoService } = await import('@/services/seo.service');
      const pageData = await seoService.getPageBySlug(slug[0]);
      if (pageData) {
        seoPage = pageData;
        resolvedFilters = { categoryId: pageData.categoryId, seoPageId: pageData.id };
        if (pageData.categoryId) {
          const tree = await adService.getCategoryTree();
          categoryPath = findCategoryPath(tree, pageData.categoryId);
        }
      }
    } catch (e) {
      console.error('Error fetching SEO page:', e);
    }
  }

  // If not a product page and not an SEO page, resolve category/subcategory hierarchy
  if (!productId && !seoPage && slug.length > 0) {
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
    subCategoryName,
    seoPage,
    categoryPath
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
  const siteUrl = getSiteUrl();

  const { productId, categoryName, seoPage } = await resolveSlugPath(slug);

  if (productId) {
    try {
      const product = await adService.getAdById(productId);
      
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
        : `${siteUrl}/logo.png`;

      return {
        title: {
          absolute: browserTitle
        },
        description: cleanDesc,
        alternates: {
          canonical: `${siteUrl}/elanlar/${slug.join('/')}`,
        },
        openGraph: {
          title: product.title,
          description: cleanDesc,
          type: 'website',
          url: `${siteUrl}/elanlar/${slug.join('/')}`,
          images: [{ url: imageUrl, alt: product.title }]
        },
        twitter: {
          card: 'summary_large_image',
          title: product.title,
          description: cleanDesc,
          images: [imageUrl]
        }
      };
    } catch (err) {
      console.error('Error generating metadata for product:', err);
    }
  }

  // SEO Page
  if (seoPage) {
    const cleanDesc = seoPage.contentTop
      ? seoPage.contentTop.replace(/<[^>]*>/g, '').slice(0, 160)
      : `2El.az elan portalında ${seoPage.titleH1} sərfəli qiymətə elanlar.`;

    return {
      title: {
        absolute: `${seoPage.titleH1} — Bakı, Azərbaycan | 2El.az`
      },
      description: cleanDesc,
      alternates: {
        canonical: `${siteUrl}/elanlar/${slug.join('/')}`,
      },
      openGraph: {
        title: seoPage.titleH1,
        description: cleanDesc,
        type: 'website',
        url: `${siteUrl}/elanlar/${slug.join('/')}`,
      }
    };
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
      alternates: {
        canonical: `${siteUrl}/elanlar/${slug.join('/')}`,
      },
      openGraph: {
        title: catTitle,
        description: catDesc,
        type: 'website',
        url: `${siteUrl}/elanlar/${slug.join('/')}`,
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
      alternates: {
        canonical: `${siteUrl}/elanlar?search=${encodeURIComponent(query)}`,
      },
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
    description: 'Bütün elanlar Bakı, Azərbaycan. 2El.az elan portalında hər növ məhsul və xidmətləri sərfəli alın və ya satın.',
    alternates: {
      canonical: `${siteUrl}/elanlar`,
    }
  };
}

export default async function ElanlarDynamicPage({ params, searchParams }: PageProps) {
  const unwrappedParams = await params;
  const slug = unwrappedParams.slug || [];
  const siteUrl = getSiteUrl();

  const { productId, resolvedFilters, categoryName, subCategoryName, seoPage, categoryPath } = await resolveSlugPath(slug);

  if (seoPage && slug.length > 0) {
    permanentRedirect(`/${slug[0]}`);
  }

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
      "item": siteUrl
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Bütün Elanlar",
      "item": `${siteUrl}/elanlar`
    }
  ];

  if (seoPage) {
    if (categoryPath && categoryPath.length > 0) {
      let currentSlugPath = '';
      categoryPath.forEach((catNode, index) => {
        const catSlug = generateSlug(catNode.name);
        currentSlugPath = currentSlugPath ? `${currentSlugPath}/${catSlug}` : catSlug;
        breadcrumbElements.push({
          "@type": "ListItem",
          "position": 3 + index,
          "name": catNode.name,
          "item": `${siteUrl}/elanlar/${currentSlugPath}`
        });
      });
    }
    // Add the custom SEO page itself
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3 + (categoryPath ? categoryPath.length : 0),
      "name": seoPage.titleH1,
      "item": `${siteUrl}/elanlar/${slug.join('/')}`
    });
  } else if (slug.length >= 1 && categoryName) {
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3,
      "name": categoryName,
      "item": `${siteUrl}/elanlar/${slug[0]}`
    });

    if (slug.length >= 2 && subCategoryName) {
      breadcrumbElements.push({
        "@type": "ListItem",
        "position": 4,
        "name": subCategoryName,
        "item": `${siteUrl}/elanlar/${slug[0]}/${slug[1]}`
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
      : [`${siteUrl}/logo.png`];

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
        "url": `${siteUrl}/elanlar/${slug.join('/')}`,
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
          <ListingsContent
            initialFilters={resolvedFilters}
            seoPage={seoPage}
            initialCategoryName={categoryName || undefined}
            initialSubCategoryName={subCategoryName || undefined}
          />
        </Suspense>
      )}
    </>
  );
}
