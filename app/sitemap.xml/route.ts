import { getSiteUrl } from "@/lib/utils";

export async function GET() {
  const siteUrl = getSiteUrl();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap-ads.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap-seo.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600'
    }
  });
}
