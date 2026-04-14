'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { ScoreRing, GenreTags, PersonalityBadge, Skeleton, Empty } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { getMatches, requestMatch } from '@/lib/api';

export default function MatchesPage() {
  const { auth, loading } = useAuth();
  const router = useRouter();
  const [matches,   setMatches]   = useState<any[]>([]);
  const [fetching,  setFetching]  = useState(true);
  const [requested, setRequested] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !auth) { router.push('/'); return; }
    if (auth) {
      getMatches({ limit: 30, min_score: 20 })
        .then(setMatches)
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [auth, loading, router]);

  const handleConnect = async (userId: string) => {
    try {
      await requestMatch(userId);
      setRequested((prev) => new Set([...prev, userId]));
    } catch (err: any) {
      // 409 = already matched — that's fine
      if (err.response?.status !== 409) console.error(err);
      setRequested((prev) => new Set([...prev, userId]));
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10 animate-slide-up">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Your matches</h1>
          <p className="text-zinc-500 text-sm">Ranked by music compatibility</p>
        </div>

        {fetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
          </div>
        ) : matches.length === 0 ? (
          <Empty
            title="No matches yet"
            body="Sync your Spotify data first. Matches appear once your profile is built and other users have joined."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m: any) => {
              const uid   = m.matched_user_id;
              const done  = requested.has(uid);
              const genres = typeof m.top_genres === 'string' ? JSON.parse(m.top_genres) : (m.top_genres ?? []);

              return (
                <div key={m.id ?? uid} className="card card-hover p-5 flex gap-4 items-start">
                  {/* Avatar */}
                  {m.avatar_url
                    ? <img src={m.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                    : <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold shrink-0">
                        {m.display_name?.[0]?.toUpperCase()}
                      </div>
                  }

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold">{m.display_name}</p>
                        {m.personality_type && <div className="mt-1"><PersonalityBadge type={m.personality_type} /></div>}
                      </div>
                      <ScoreRing score={Number(m.total_score)} size={56} />
                    </div>

                    {genres.length > 0 && <div className="mb-3"><GenreTags genres={genres} max={4} /></div>}

                    {m.shared_artists?.length > 0 && (
                      <p className="text-xs text-zinc-500 mb-3">
                        Shared artists: {m.shared_artists.slice(0, 3).join(', ')}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Link href={`/profile/${uid}`} className="btn-ghost text-xs py-1.5 px-3">
                        View profile
                      </Link>
                      <button
                        onClick={() => handleConnect(uid)}
                        disabled={done}
                        className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
                      >
                        {done ? 'Request sent ✓' : 'Connect'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
