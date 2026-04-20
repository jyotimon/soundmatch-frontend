'use client';
import clsx from 'clsx';

// ─── Spinning loader ──────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return <div className={clsx(s, 'border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin')} />;
}

// ─── Page-level loading skeleton ──────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse bg-zinc-800 rounded-xl', className)} />;
}

// ─── Score ring (SVG circle) ──────────────────────────────────────────────────
export function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (Math.min(score, 100) / 100) * circ;
  const color = score >= 70 ? '#1DB954' : score >= 50 ? '#f59e0b' : '#818cf8';
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#3f3f46" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.7s ease' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-bold text-sm">
        {Math.round(score)}%
      </span>
    </div>
  );
}

// ─── Horizontal score bar ─────────────────────────────────────────────────────
export function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{label}</span><span>{Math.round(value)}%</span>
      </div>
      <div className="score-bar">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── Genre pill tags ──────────────────────────────────────────────────────────
export function GenreTags({ genres, max = 6 }: { genres: Array<{ genre: string }> | string[]; max?: number }) {
  const items = (genres as any[]).slice(0, max).map((g) => (typeof g === 'string' ? g : g.genre));
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((g) => <span key={g} className="genre-tag">{g}</span>)}
    </div>
  );
}

// ─── Artist row ───────────────────────────────────────────────────────────────
export function ArtistRow({ artist, rank }: { artist: any; rank: number }) {
  const img = artist.images?.[0]?.url;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-zinc-800/60 last:border-0">
      <span className="text-xs text-zinc-600 w-4 text-right shrink-0">{rank}</span>
      {img
        ? <img src={img} alt={artist.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
        : <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0" />
      }
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">{artist.name}</p>
        <p className="text-xs text-zinc-500 truncate">{artist.genres?.slice(0, 2).join(', ')}</p>
      </div>
    </div>
  );
}

// ─── Track row ────────────────────────────────────────────────────────────────
export function TrackRow({ track, rank }: { track: any; rank: number }) {
  const img = track.album?.images?.[0]?.url;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-zinc-800/60 last:border-0">
      <span className="text-xs text-zinc-600 w-4 text-right shrink-0">{rank}</span>
      {img
        ? <img src={img} alt={track.name} className="w-9 h-9 rounded object-cover shrink-0" />
        : <div className="w-9 h-9 rounded bg-zinc-800 shrink-0" />
      }
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{track.name}</p>
        <p className="text-xs text-zinc-500 truncate">{track.artists?.map((a: any) => a.name).join(', ')}</p>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-2xl font-bold truncate">{value}</p>
      {sub && <p className="text-xs text-zinc-600 mt-1 truncate">{sub}</p>}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center py-20 px-4">
      <p className="text-zinc-400 font-medium mb-2">{title}</p>
      <p className="text-zinc-600 text-sm max-w-xs mx-auto">{body}</p>
    </div>
  );
}

// ─── Personality badge ────────────────────────────────────────────────────────
const PERSONALITY_COLORS: Record<string, string> = {
  'The Wanderer':         'bg-purple-500/20  text-purple-300',
  'The Dreamer':          'bg-blue-500/20    text-blue-300',
  'The Energiser':        'bg-green-500/20   text-green-300',
  'The Philosopher':      'bg-amber-500/20   text-amber-300',
  'The Night Owl':        'bg-indigo-500/20  text-indigo-300',
  'The Explorer':         'bg-pink-500/20    text-pink-300',
  'The Rebel':            'bg-red-500/20     text-red-300',
  'The Romantic':         'bg-rose-500/20    text-rose-300',
  'The Purist':           'bg-teal-500/20    text-teal-300',
  'The Optimist':         'bg-yellow-500/20  text-yellow-300',
  'The Social Butterfly': 'bg-orange-500/20  text-orange-300',
  'The Seeker':           'bg-violet-500/20  text-violet-300',
  'The Nostalgic':        'bg-stone-400/20   text-stone-300',
  'The Root Keeper':      'bg-lime-500/20    text-lime-300',
  'The Time Traveller':   'bg-cyan-500/20    text-cyan-300',
  'The Storyteller':      'bg-emerald-500/20 text-emerald-300',
  'The Calm Soul':        'bg-sky-500/20     text-sky-300',
};
export function PersonalityBadge({ type }: { type: string }) {
  return (
    <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', PERSONALITY_COLORS[type] ?? 'bg-zinc-700 text-zinc-300')}>
      {type}
    </span>
  );
}

// ─── Audio feature bar set ────────────────────────────────────────────────────
export function AudioBars({ features }: { features: any }) {
  if (!features) return null;
  const bars = [
    { label: 'Energy',       value: features.energy        * 100, color: '#ef4444' },
    { label: 'Positivity',   value: features.valence       * 100, color: '#1DB954' },
    { label: 'Danceability', value: features.danceability  * 100, color: '#f59e0b' },
    { label: 'Acousticness', value: features.acousticness  * 100, color: '#60a5fa' },
  ];
  return (
    <div className="space-y-2.5">
      {bars.map((b) => <ScoreBar key={b.label} label={b.label} value={b.value} color={b.color} />)}
    </div>
  );
}
