import { seoService } from '@/services/seo.service';
import { getSiteUrl } from '@/lib/utils';

export async function GET() {
  try {
    const ads = await seoService.getSitemapAds();
    const siteUrl = getSiteUrl();
    const sitemapRows = ads.map(ad => {
      const segments: string[] = [];
      if (ad.parentCategorySlug && ad.parentCategorySlug !== 'elanlar') {
        segments.push(ad.parentCategorySlug);
      }
      if (ad.childCategorySlug && ad.childCategorySlug !== ad.parentCategorySlug) {
        segments.push(ad.childCategorySlug);
      }
      segments.push(ad.pinCode?.toString() || ad.id);
      
      const path = segments.join('/');
      const url = `${siteUrl}/elanlar/${path}`;
      const lastmod = new Date(ad.lastModified).toISOString().split('T')[0];

      return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapRows}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Error generating ads sitemap:', error);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}
