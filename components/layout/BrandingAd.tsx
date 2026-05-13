'use client';

import { useState, useEffect, useId } from 'react';
import { bannerService, BannerDto, AdPosition } from '@/services/banner.service';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BrandingAd() {
  const { language } = useLanguage();
  const [brandingAd, setBrandingAd] = useState<BannerDto | null>(null);
  const componentId = useId();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ad-click' && event.data.sourceId === componentId) {
        const adId = event.data.id;
        const targetUrl = event.data.url;
        
        if (adId) {
          bannerService.incrementClick(adId).catch(console.error);
        }
        
        if (targetUrl && targetUrl.trim() !== '') {
          let url = targetUrl;
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          window.open(url, '_blank');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const data = await bannerService.getActiveBanners(AdPosition.Branding, undefined, undefined, language);
        if (data && data.length > 0) {
          // Use the first active branding ad
          setBrandingAd(data[0]);
          bannerService.incrementView(data[0].id).catch(() => {});
        } else {
          setBrandingAd(null);
        }
      } catch (err) {
        console.error('Failed to fetch branding ad:', err);
        setBrandingAd(null);
      }
    };

    fetchBranding();
  }, [language]);

  useEffect(() => {
    if (brandingAd) {
      // Find the main element and make it transparent to show the background
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.classList.remove('bg-gray-50');
        mainElement.style.backgroundColor = 'transparent';
      }
      document.body.style.backgroundColor = '#f8f9fa';
    } else {
      const mainElement = document.querySelector('main');
      if (mainElement) {
        // Restore if needed, though usually Home component sets it
        mainElement.style.backgroundColor = '';
      }
    }
  }, [brandingAd]);

  if (!brandingAd) return null;

  const handleClick = async () => {
    if (brandingAd.id) {
      bannerService.incrementClick(brandingAd.id).catch(() => {});
    }
  };

  // Helper to ensure targetUrl is absolute
  const getAbsoluteUrl = (url?: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  // If it's a code-based ad, we handle it differently (though branding usually uses images)
  const isCodeAd = !!brandingAd.scriptCode;
  const targetUrl = getAbsoluteUrl(brandingAd.targetUrl);

  return (
    <>
      {/* Background/Script Container */}
      <div 
        className="fixed inset-0 z-[-1] hidden lg:block"
        style={{
          backgroundImage: !isCodeAd && brandingAd.imageUrl ? `url(${brandingAd.imageUrl})` : 'none',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover', // Fill the entire area
          backgroundColor: 'transparent',
          pointerEvents: isCodeAd ? 'auto' : 'none' // Allow interaction if it's code-based
        }}
      >
        {isCodeAd && (
          <iframe
            title={brandingAd.title}
            srcDoc={`
              <html>
                <head>
                  <style>
                    body { margin: 0; padding: 0; overflow: hidden; background: transparent; }
                    ${brandingAd.scriptCode}
                  </style>
                </head>
                <body>
                  <script>
                    document.body.onclick = function() { window.parent.postMessage({ type: 'ad-click', id: '${brandingAd.id}', sourceId: '${componentId}', url: '${brandingAd.targetUrl || ''}' }, '*'); };
                  </script>
                </body>
              </html>
            `}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-popups allow-forms"
          />
        )}
      </div>
      
      {/* Clickable Wings - Positioned outside the 1280px content area */}
      {!isCodeAd && (
        <>
          {/* Left Wing */}
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="fixed top-0 left-0 bottom-0 z-[60] hidden lg:block"
            style={{ width: 'calc((100vw - 1280px) / 2)', cursor: 'pointer' }}
            title={brandingAd.title}
          />

          {/* Right Wing */}
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="fixed top-0 right-0 bottom-0 z-[60] hidden lg:block"
            style={{ width: 'calc((100vw - 1280px) / 2)', cursor: 'pointer' }}
            title={brandingAd.title}
          />
        </>
      )}
    </>
  );
}

