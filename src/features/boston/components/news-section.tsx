'use client';

import { useEffect, useState } from 'react';
import type { NewsItem } from '@/app/api/news/route';

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
      <section style={{ padding: '16px 0 24px' }}>
        <h2 className="t-serif text-[#091f2f]" style={{ fontSize: '18px', fontWeight: 700, margin: '0 16px 12px' }}>
          Boston News
        </h2>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-boston-gray-100" style={{ height: '68px', margin: '0 0 1px' }} />
        ))}
      </section>
    );
  }

  return (
    <section style={{ paddingBottom: '24px' }}>
      <h2 className="t-serif text-[#091f2f]" style={{ fontSize: '18px', fontWeight: 700, margin: '16px 16px 4px' }}>
        Boston News
      </h2>
      <div>
        {items.slice(0, 8).map((item, i) => (
          <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
            className="bg-white"
            style={{ display: 'block', padding: '11px 16px', borderBottom: '1px solid #e5e5e5', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="t-sans" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: item.sourceColor }}>
                {item.source}
              </span>
              {timeAgo(item.pubDate) && (
                <span className="t-sans-gray" style={{ fontSize: '10px' }}>
                  {timeAgo(item.pubDate)}
                </span>
              )}
            </div>
            <p className="t-sans-navy" style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', fontWeight: 500 }}>
              {item.title}
            </p>
          </a>
        ))}
      </div>
      <p className="t-sans-gray" style={{ margin: '8px 16px 0', fontSize: '10px' }}>
        From Universal Hub, WBUR, and Boston Herald
      </p>
    </section>
  );
}
