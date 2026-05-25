import { useState, useEffect } from 'react';

function AffinityBar({ pct }) {
  return (
    <div className="progress-track mt-2">
      <div
        className="bg-brand-500 h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-700 rounded ${className}`} />;
}

export default function AffinityInsights({ niche }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/affinity/${niche}`)
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
        <h2 className="section-heading">What {niche} Audiences Also Watch</h2>
        <p className="text-slate-500 text-sm mt-1">
          Cross-niche affinity signals — overlap strength between audience segments
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-700 p-4 text-red-300 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="metric-card">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))
          : data.map(aff => (
              <div key={aff.category} className="metric-card group hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-serif text-xl font-semibold text-white">{aff.category}</h3>
                  <span className="text-brand-400 font-bold text-lg">{aff.engagement_pct}%</span>
                </div>
                <p className="text-slate-400 text-sm mb-3">{aff.description}</p>
                <AffinityBar pct={aff.engagement_pct} />
                {aff.examples && aff.examples.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {aff.examples.map(ex => (
                      <span key={ex} className="pill bg-slate-700 text-slate-300">{ex}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
      </div>

      <p className="text-slate-600 text-xs mt-6">
        Affinity scores reflect audience overlap signals. Week 3 upgrade: real-time data from BigQuery.
      </p>
    </div>
  );
}
