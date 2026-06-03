import { seoService } from '@/services/seo.service';
import { getSiteUrl } from '@/lib/utils';

export async function GET() {
  try {
    const pages = await seoService.getSitemapPages();
    const siteUrl = getSiteUrl();
    const sitemapRows = pages.map(page => {
      const url = `${siteUrl}/elanlar/${page.slug}`;
      const lastmod = new Date(page.lastModified).toISOString().split('T')[0];

      return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
    console.error('Error generating seo sitemap:', error);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}
