import { useState, useEffect } from 'react';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-700 rounded ${className}`} />;
}

function SentimentGauge({ score, label }) {
  const color = score > 65 ? 'bg-emerald-500' : score > 45 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = score > 65 ? 'text-emerald-400' : score > 45 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="metric-card">
      <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Overall Sentiment</p>
      <div className="flex items-center gap-5">
        <div className={`font-serif text-5xl font-bold ${textColor}`}>{score}</div>
        <div className="flex-1">
          <p className={`font-medium mb-2 ${textColor}`}>{label}</p>
          <div className="progress-track h-3">
            <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SentimentTrends({ niche }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/sentiment/${niche}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [niche]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="section-heading">Sentiment & Trends</h2>
        <p className="text-slate-500 text-sm mt-1">
          Reddit & social monitoring for {niche} keywords · Last 30 days
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-700 p-4 text-red-300 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment gauge */}
        <div>
          {loading ? (
            <Skeleton className="h-32" />
          ) : (
            <>
              <SentimentGauge
                score={data?.sentiment?.score ?? 50}
                label={data?.sentiment?.label ?? 'Neutral'}
              />
              <div className="metric-card mt-4">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Summary</p>
                <p className="text-slate-300 text-sm leading-relaxed">{data?.sentiment?.summary || '—'}</p>
              </div>
            </>
          )}
        </div>

        {/* Keyword cloud */}
        <div className="metric-card">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-4">Top Keywords</p>
          {loading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-full" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(data?.keywords || []).map(kw => (
                <span
                  key={kw.keyword}
                  className="pill bg-brand-600/20 text-brand-300 border border-brand-600/30"
                >
                  {kw.keyword}
                  <span className="ml-1.5 text-brand-500 text-xs">({kw.mentions})</span>
                </span>
              ))}
              {(!data?.keywords || data.keywords.length === 0) && (
                <p className="text-slate-500 text-sm">No keyword data yet. Run the Reddit monitoring pipeline.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-slate-600 text-xs mt-6">
        Week 3: Live Reddit monitoring via snoowrap. Configure REDDIT_CLIENT_ID in .env.
      </p>
    </div>
  );
}
