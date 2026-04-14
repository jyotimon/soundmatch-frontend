'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { PersonalityBadge, Skeleton, Empty } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { getCommunities, joinCommunity, leaveCommunity } from '@/lib/api';

const GENRE_EMOJI: Record<string, string> = {
  indie:      '🎸',
  electronic: '🎛️',
  'hip-hop':  '🎤',
  jazz:       '🎷',
  pop:        '🎵',
  metal:      '🤘',
  classical:  '🎻',
};

export default function CommunityPage() {
  const { auth, loading } = useAuth();
  const router = useRouter();
  const [communities, setCommunities] = useState<any[]>([]);
  const [fetching,    setFetching]    = useState(true);
  const [toggling,    setToggling]    = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !auth) { router.push('/'); return; }
    if (auth) {
      getCommunities()
        .then(setCommunities)
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [auth, loading, router]);

  const handleToggle = async (id: string, isMember: boolean) => {
    setToggling(id);
    try {
      if (isMember) {
        await leaveCommunity(id);
        setCommunities((prev) => prev.map((c) =>
          c.id === id ? { ...c, is_member: false, member_count: Math.max(0, c.member_count - 1) } : c
        ));
      } else {
        await joinCommunity(id);
        setCommunities((prev) => prev.map((c) =>
          c.id === id ? { ...c, is_member: true, member_count: c.member_count + 1 } : c
        ));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10 animate-slide-up">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Communities</h1>
          <p className="text-zinc-500 text-sm">Join groups of people who share your music taste</p>
        </div>

        {fetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
          </div>
        ) : communities.length === 0 ? (
          <Empty title="No communities yet" body="Communities are seeded from the database. Run the migration to add defaults." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((c: any) => (
              <div key={c.id} className={`card card-hover p-5 flex flex-col gap-3 ${c.is_member ? 'border-zinc-600' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" style={{ fontSize: 28 }}>
                      {GENRE_EMOJI[c.genre_tag] ?? '🎶'}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-zinc-500">{c.member_count.toLocaleString()} members</p>
                    </div>
                  </div>
                  {c.is_member && (
                    <span className="text-xs bg-[#1DB954]/20 text-[#1DB954] px-2 py-0.5 rounded-full font-medium">
                      Joined
                    </span>
                  )}
                </div>

                {c.description && (
                  <p className="text-zinc-500 text-xs leading-relaxed">{c.description}</p>
                )}

                <button
                  onClick={() => handleToggle(c.id, c.is_member)}
                  disabled={toggling === c.id}
                  className={`mt-auto text-sm py-2 px-4 rounded-full border transition-all disabled:opacity-40 ${
                    c.is_member
                      ? 'border-zinc-700 hover:border-red-800 hover:text-red-400 text-zinc-400'
                      : 'btn-ghost'
                  }`}
                >
                  {toggling === c.id ? '…' : c.is_member ? 'Leave' : 'Join community'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
