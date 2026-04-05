import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Redirect /listings to /elanlar
  if (pathname === '/listings') {
    const url = request.nextUrl.clone();
    url.pathname = '/elanlar';
    return NextResponse.redirect(url, { status: 301 });
  }

  // 2. Redirect /products/[id] to /elanlar/elan/detal/[id]
  const productMatch = pathname.match(/^\/products\/([^/]+)$/);
  if (productMatch) {
    const id = productMatch[1];
    const url = request.nextUrl.clone();
    url.pathname = `/elanlar/elan/detal/${id}`;
    return NextResponse.redirect(url, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/listings/:path*',
    '/products/:path*',
  ],
};
