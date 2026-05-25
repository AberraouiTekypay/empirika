import { useState, useEffect } from 'react';
import { formatNumber, formatDuration, downloadCSV } from '../lib/utils';

function MetricCard({ label, value, sub }) {
  return (
    <div className="metric-card">
      <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className="font-serif text-3xl font-semibold text-white">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-700 rounded ${className}`} />;
}

export default function AudienceOverview({ niche }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/audience/${niche}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [niche]);

  const totalViews       = data.reduce((s, r) => s + (r.total_views || 0), 0);
  const totalWatchHours  = data.reduce((s, r) => s + (r.total_watch_hours || 0), 0);
  const avgDuration      = data.length
    ? data.reduce((s, r) => s + (r.avg_view_duration_seconds || 0), 0) / data.length
    : 0;
  const totalSubscribers = data.reduce((s, r) => s + (r.total_subscribers_gained || 0), 0);

  if (error) {
    return (
      <div className="rounded-lg bg-red-900/30 border border-red-700 p-6 text-red-300">
        <p className="font-medium">Could not load audience data</p>
        <p className="text-sm mt-1 text-red-400">{error}</p>
        <p className="text-xs mt-2 text-red-500">Check that BigQuery is configured and data has been fetched.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-heading">{niche} Audience</h2>
          <p className="text-slate-500 text-sm mt-1">Last 30 days · {data.length} channel{data.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => downloadCSV(data, `empirika-${niche.toLowerCase()}-audience.csv`)}
          disabled={data.length === 0}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-sm rounded-lg transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <MetricCard label="Total Views (30d)"   value={formatNumber(totalViews)}       sub="across all channels" />
            <MetricCard label="Watch Hours (30d)"   value={formatNumber(totalWatchHours)}  sub="estimated" />
            <MetricCard label="Avg Watch Duration"  value={formatDuration(avgDuration)}    sub="per video" />
            <MetricCard label="New Subscribers"     value={`+${formatNumber(totalSubscribers)}`} sub="30-day net" />
          </>
        )}
      </div>

      {/* Channel breakdown table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h3 className="font-medium text-slate-200">Channel Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-widest">
                <th className="text-left px-6 py-3">Channel</th>
                <th className="text-right px-4 py-3">Subscribers</th>
                <th className="text-right px-4 py-3">Views (30d)</th>
                <th className="text-right px-4 py-3">Watch Hrs</th>
                <th className="text-right px-6 py-3">Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No data yet. Run <code className="text-slate-400 bg-slate-700 px-1 rounded">node scripts/fetchAnalytics.js</code> to populate.
                  </td>
                </tr>
              ) : (
                data.map(ch => (
                  <tr key={ch.channel_id} className="border-b border-slate-700/40 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-white">{ch.channel_name}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{formatNumber(ch.subscriber_count)}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{formatNumber(ch.total_views)}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{formatNumber(Math.round(ch.total_watch_hours))}</td>
                    <td className="px-6 py-3 text-right text-slate-300">{formatDuration(ch.avg_view_duration_seconds)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
