'use client';

import { useEffect, useState } from 'react';
import type { NewsItem } from '@/app/api/news/route';
import { ExternalLink } from '@/neynar-farcaster-sdk/mini';

interface NewsSectionProps {
  cachedNews: NewsItem[] | null;
  onNewsLoaded: (items: NewsItem[]) => void;
}

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diff)) return '';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  } catch { return ''; }
}

export function NewsSection({ cachedNews, onNewsLoaded }: NewsSectionProps) {
  const [items, setItems] = useState<NewsItem[]>(cachedNews ?? []);
  const [loading, setLoading] = useState(!cachedNews);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cachedNews) return;
    fetch('/api/news')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: { items: NewsItem[] }) => {
        const loaded = data.items ?? [];
        setItems(loaded);
        onNewsLoaded(loaded);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error || (!loading && items.length === 0)) return null;

  if (loading) {
    return (
      <section className="news-loading-section">
        <h2 className="t-serif text-[#091f2f] news-loading-heading">
          Boston News
        </h2>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-boston-gray-100 news-skeleton" />
        ))}
      </section>
    );
  }

  return (
    <section className="news-section mt-6">
      <div className="px-4">
        <div className="today-section-header">
          <h2 className="today-section-title">Boston News</h2>
          <span className="today-section-eyebrow">Latest</span>
        </div>
      </div>
      <div>
        {items.slice(0, 8).map((item, i) => (
          <ExternalLink key={i} href={item.link}
            className="bg-white news-item-link no-underline text-inherit">
            <div className="news-item-meta">
              <span className="t-sans news-source-label" style={{ color: item.sourceColor }}>
                {item.source}
              </span>
              {timeAgo(item.pubDate) && (
                <span className="t-sans-gray text-xs">
                  {timeAgo(item.pubDate)}
                </span>
              )}
            </div>
            <p className="t-sans-navy news-headline">
              {item.title}
            </p>
          </ExternalLink>
        ))}
      </div>
      <p className="t-sans-gray news-disclaimer">
        From Universal Hub, WBUR, Boston Herald, and Boston Business Journal
      </p>
    </section>
  );
}
