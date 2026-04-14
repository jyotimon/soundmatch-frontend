'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { ScoreRing, TrackRow, Skeleton, Empty } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { api, createPlaylist } from '@/lib/api';

export default function MatchRoomPage({ params }: { params: { matchId: string } }) {
  const { auth, loading } = useAuth();
  const router = useRouter();
  const [match,     setMatch]     = useState<any>(null);
  const [fetching,  setFetching]  = useState(true);
  const [creating,  setCreating]  = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!loading && !auth) { router.push('/'); return; }
    if (auth) {
      api.get(`/api/matches/${params.matchId}`)
        .then((r) => setMatch(r.data.data))
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [auth, loading, params.matchId, router]);

  const handleCreatePlaylist = async () => {
    setCreating(true);
    try {
      const result = await createPlaylist(params.matchId);
      setPlaylistUrl(result.playlist_url);
      setMatch((prev: any) => ({ ...prev, shared_playlist_id: result.match?.shared_playlist_id }));
    } catch {
      setMsg('Could not create playlist. Make sure both users have premium Spotify or try again.');
    } finally {
      setCreating(false);
    }
  };

  if (fetching) {
    return (
      <>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
        </div>
      </>
    );
  }

  if (!match) return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-20">
        <Empty title="Match not found" body="This match doesn't exist or you don't have access." />
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10 animate-slide-up">

        {/* Header */}
        <div className="card p-6 mb-5 flex items-center justify-between">
          <div>
            <p className="text-zinc-500 text-xs mb-1">Match room</p>
            <h1 className="text-xl font-bold">Your musical connection</h1>
            <p className="text-sm text-zinc-400 mt-1 capitalize">Status: {match.status}</p>
          </div>
          <ScoreRing score={Number(match.compatibility_score)} size={72} />
        </div>

        {/* Shared playlist */}
        <div className="card p-6 mb-5">
          <h2 className="font-semibold mb-1">Shared playlist</h2>
          <p className="text-zinc-500 text-xs mb-5">
            Generated from tracks both of you love
          </p>

          {match.shared_playlist_id ? (
            <a
              href={`https://open.spotify.com/playlist/${match.shared_playlist_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-spotify text-sm justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Open playlist on Spotify
            </a>
          ) : (
            <>
              <button
                onClick={handleCreatePlaylist}
                disabled={creating || match.status !== 'matched'}
                className="btn-spotify text-sm w-full justify-center disabled:opacity-40"
              >
                {creating ? 'Creating playlist…' : 'Create our shared playlist'}
              </button>
              {match.status !== 'matched' && (
                <p className="text-xs text-zinc-600 text-center mt-2">
                  Both users must accept the match before creating a playlist.
                </p>
              )}
            </>
          )}

          {playlistUrl && (
            <a href={playlistUrl} target="_blank" rel="noopener noreferrer"
              className="block mt-3 text-center text-[#1DB954] text-sm hover:underline">
              Open on Spotify →
            </a>
          )}
          {msg && <p className="text-xs text-red-400 mt-3">{msg}</p>}
        </div>

        {/* Actions */}
        {match.status === 'matched' && (
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Actions</h2>
            <div className="flex gap-3">
              <button
                onClick={() => api.put(`/api/matches/${params.matchId}`, { status: 'unmatched' }).then(() => router.push('/matches'))}
                className="btn-ghost text-sm text-red-400 border-red-900/50 hover:border-red-700"
              >
                Unmatch
              </button>
            </div>
          </div>
        )}

        {match.status === 'pending' && auth?.user.id !== match.user_a_id && (
          <div className="card p-6">
            <h2 className="font-semibold mb-2">Pending connection request</h2>
            <p className="text-zinc-500 text-sm mb-4">Accept to unlock the shared playlist and full match features.</p>
            <div className="flex gap-3">
              <button
                onClick={() => api.put(`/api/matches/${params.matchId}`, { status: 'matched' }).then(() => setMatch((p: any) => ({ ...p, status: 'matched' })))}
                className="btn-primary text-sm"
              >
                Accept
              </button>
              <button
                onClick={() => api.put(`/api/matches/${params.matchId}`, { status: 'declined' }).then(() => router.push('/matches'))}
                className="btn-ghost text-sm"
              >
                Decline
              </button>
            </div>
          </div>
        )}

      </main>
    </>
  );
}
