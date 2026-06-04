import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ListingsContent from '@/components/features/listings/ListingsContent';
import { seoService } from '@/services/seo.service';
import { adService } from '@/services/ad.service';
import { getSiteUrl, generateSlug } from '@/lib/utils';
import { SearchFilters } from '@/types';

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

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const unwrappedParams = await params;
  const slug = unwrappedParams.slug;
  const siteUrl = getSiteUrl();

  const seoPage = await seoService.getPageBySlug(slug);
  if (!seoPage) {
    return {};
  }

  const title = seoPage.metaTitle || `${seoPage.titleH1} — Bakı, Azərbaycan | 2El.az`;
  const cleanDesc = seoPage.metaDescription || (seoPage.contentTop
    ? seoPage.contentTop.replace(/<[^>]*>/g, '').slice(0, 160)
    : `2El.az elan portalında ${seoPage.titleH1} sərfəli qiymətə elanlar.`);

  return {
    title: {
      absolute: title
    },
    description: cleanDesc,
    alternates: {
      canonical: `${siteUrl}/${slug}`,
    },
    openGraph: {
      title: title,
      description: cleanDesc,
      type: 'website',
      url: `${siteUrl}/${slug}`,
    }
  };
}

export default async function SeoDynamicPage({ params }: Props) {
  const unwrappedParams = await params;
  const slug = unwrappedParams.slug;
  const siteUrl = getSiteUrl();

  const seoPage = await seoService.getPageBySlug(slug);
  if (!seoPage) {
    notFound();
  }

  const resolvedFilters: Partial<SearchFilters> = {
    categoryId: seoPage.categoryId,
    seoPageId: seoPage.id
  };

  let categoryPath: CategoryNode[] | null = null;
  if (seoPage.categoryId) {
    try {
      const tree = await adService.getCategoryTree();
      categoryPath = findCategoryPath(tree, seoPage.categoryId);
    } catch (e) {
      console.error('Error fetching categories for SEO page:', e);
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
    "item": `${siteUrl}/${slug}`
  });

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbElements
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdData)
        }}
      />
      <Suspense fallback={<div className="flex justify-center items-center py-20 min-h-screen animate-pulse text-gray-400">Yüklənir...</div>}>
        <ListingsContent
          initialFilters={resolvedFilters}
          seoPage={seoPage}
        />
      </Suspense>
    </>
  );
}
