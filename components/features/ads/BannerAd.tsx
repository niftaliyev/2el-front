'use client';

import { useState, useEffect, useId } from 'react';
import { bannerService, BannerDto, AdPosition } from '@/services/banner.service';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui';

interface BannerAdProps {
  position: AdPosition;
  categoryId?: string;
  cityId?: string;
  search?: string;
  className?: string;
  noBoard?: boolean;
}

export default function BannerAd({ position, categoryId, cityId, search, className = '', noBoard = false }: BannerAdProps) {
  const { t, language } = useLanguage();
  const [banners, setBanners] = useState<BannerDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const componentId = useId();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await bannerService.getActiveBanners(position, categoryId, cityId, language, search);
        setBanners(data || []);

        // Tracking views for initial banners if they exist
        if (data && data.length > 0) {
          try {
            bannerService.incrementView(data[0].id);
          } catch (trackError) {
            console.warn('Failed to track banner view:', trackError);
          }
        }
      } catch (err) {
        console.error('Failed to fetch banners:', err);
        setError('Failed to load advertisements');
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [position, categoryId, cityId, language, search]);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % banners.length;
        // Track view for the new banner
        try {
          bannerService.incrementView(banners[next].id);
        } catch (trackError) {
          // Silent error for tracking
        }
        return next;
      });
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [banners]);

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

  if (isLoading) {
    return (
      <div className={`w-full overflow-hidden ${noBoard ? '' : 'rounded-2xl bg-gray-50 border border-gray-100'} flex items-center justify-center min-h-[200px] ${className}`}>
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (error || banners.length === 0) {
    // Show a premium-looking placeholder for empty ads
    return (
      <div className={`w-full overflow-hidden ${noBoard ? '' : 'rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/50 shadow-sm'} flex flex-col items-center justify-center p-6 text-center min-h-[250px] ${className}`}>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
          <span className="material-symbols-outlined text-[#607afb] !text-[24px]">campaign</span>
        </div>
        <h4 className="text-[14px] font-bold text-[#212121] mb-2">{t('advertising.yourAdHere')}</h4>
        <p className="text-[12px] text-gray-500 mb-4 px-2 leading-relaxed">
          {t('advertising.reachThousands')}
        </p>
        <a
          href="/reklam-ver"
          className="text-[12px] font-bold text-[#607afb] hover:text-[#4a63e6] transition-colors flex items-center gap-1"
        >
          {t('advertising.learnMore')}
          <span className="material-symbols-outlined !text-[14px]">arrow_forward</span>
        </a>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];
  const isCodeAd = !!currentBanner.scriptCode;

  const handleBannerClick = async () => {
    try {
      await bannerService.incrementClick(currentBanner.id);
    } catch (err) {
      // Silent error for tracking
    }
  };

  const getAbsoluteUrl = (url?: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  return (
    <div className={`group relative w-full overflow-hidden transition-all ${noBoard ? '' : 'rounded-2xl bg-white border border-gray-200/50 shadow-sm hover:shadow-md'} ${className}`}>
      {/* Ad Badge Removed */}

      {isCodeAd ? (
        <iframe
          title={currentBanner.title}
          srcDoc={`
            <html>
              <head>
                <style>
                  body { margin: 0; padding: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; }
                  * { max-width: 100%; }
                </style>
              </head>
              <body>
                ${currentBanner.scriptCode}
                <script>
                  document.body.onclick = function() { window.parent.postMessage({ type: 'ad-click', id: '${currentBanner.id}', sourceId: '${componentId}', url: '${currentBanner.targetUrl || ''}' }, '*'); };
                </script>
              </body>
            </html>
          `}
          className="w-full h-full min-h-[200px] border-none overflow-hidden"
          sandbox="allow-scripts allow-popups allow-forms"
        />
      ) : (
        <a
          href={getAbsoluteUrl(currentBanner.targetUrl)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleBannerClick}
          className="block w-full h-full"
        >
          <img
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              // Handle image load error
              (e.target as HTMLImageElement).src = '/placeholders/ad-placeholder.png';
            }}
          />
        </a>
      )}


      {/* Pagination Indicators if multiple banners */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-3">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-white shadow-sm' : 'w-1 bg-white/50 hover:bg-white/80'}`}
              aria-label={`Go to banner ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

