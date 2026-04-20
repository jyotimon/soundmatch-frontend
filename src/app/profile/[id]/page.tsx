'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { ScoreRing, ScoreBar, GenreTags, ArtistRow, TrackRow, PersonalityBadge, AudioBars, Skeleton, Empty } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { getUser, requestMatch } from '@/lib/api';

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { auth, loading } = useAuth();
  const router = useRouter();
  const [data,       setData]       = useState<any>(null);
  const [fetching,   setFetching]   = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connected,  setConnected]  = useState(false);

  useEffect(() => {
    if (!loading && !auth) { router.push('/'); return; }
    if (auth) {
      getUser(params.id)
        .then(setData)
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [auth, loading, params.id, router]);

  const handleConnect = async () => {
  setConnecting(true);
  try {
    await requestMatch(params.id);
    setConnected(true);
    alert('Connection request sent to ' + user.display_name + '!');
  } catch (err: any) {
    if (err.response?.status === 409) {
      setConnected(true); // already matched
    } else {
      alert('Failed to send request. Try again.');
    }
  } finally {
    setConnecting(false);
  }
};

  if (fetching) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
          <Skeleton className="h-60" />
        </div>
      </>
    );
  }

  if (!data) return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-20">
        <Empty title="User not found" body="This profile doesn't exist or hasn't been set up yet." />
      </div>
    </>
  );

  const { user, compatibility } = data;
  const profile = user;
  const af      = typeof profile.audio_features_avg === 'string'
    ? JSON.parse(profile.audio_features_avg)
    : profile.audio_features_avg;
  const genres   = typeof profile.top_genres === 'string' ? JSON.parse(profile.top_genres) : (profile.top_genres ?? []);
  const artists  = typeof profile.top_artists_medium === 'string' ? JSON.parse(profile.top_artists_medium) : (profile.top_artists_medium ?? []);
  const tracks   = typeof profile.top_tracks_medium  === 'string' ? JSON.parse(profile.top_tracks_medium)  : (profile.top_tracks_medium  ?? []);

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10 animate-slide-up">

        {/* Profile header */}
        <div className="card p-6 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                : <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-bold">
                    {user.display_name[0]?.toUpperCase()}
                  </div>
              }
              <div>
                <h1 className="text-2xl font-bold">{user.display_name}</h1>
                {profile.personality_type && <div className="mt-1"><PersonalityBadge type={profile.personality_type} /></div>}
              </div>
            </div>
            {compatibility && (
              <div className="text-center shrink-0">
                <ScoreRing score={Number(compatibility.total_score)} size={72} />
                <p className="text-xs text-zinc-500 mt-1">compatibility</p>
              </div>
            )}
          </div>

          {/* Connect button */}
          {auth?.user.id !== params.id && (
            <button
              onClick={handleConnect}
              disabled={connecting || connected}
              className="mt-5 btn-primary text-sm w-full disabled:opacity-50"
            >
              {connected ? 'Connection request sent ✓' : connecting ? 'Sending…' : 'Connect with ' + user.display_name}
            </button>
          )}
        </div>

        {/* Compatibility breakdown */}
        {compatibility && (
          <div className="card p-6 mb-5">
            <h2 className="font-semibold mb-4">Compatibility breakdown</h2>
            <div className="space-y-3">
              <ScoreBar label="Genre similarity"   value={Number(compatibility.genre_score)}   color="#1DB954" />
              <ScoreBar label="Artist overlap"     value={Number(compatibility.artist_score)}  color="#534AB7" />
              <ScoreBar label="Mood & energy"      value={Number(compatibility.mood_score)}    color="#ef4444" />
              <ScoreBar label="Listening patterns" value={Number(compatibility.pattern_score)} color="#f59e0b" />
            </div>
            {compatibility.shared_artists?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">Shared artists</p>
                <div className="flex flex-wrap gap-1.5">
                  {compatibility.shared_artists.map((a: string) => (
                    <span key={a} className="genre-tag">{a}</span>
                  ))}
                </div>
              </div>
            )}
            {compatibility.shared_genres?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-zinc-500 mb-2">Shared genres</p>
                <div className="flex flex-wrap gap-1.5">
                  {compatibility.shared_genres.map((g: string) => (
                    <span key={g} className="genre-tag">{g}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Genres */}
        {genres.length > 0 && (
          <div className="card p-6 mb-5">
            <h2 className="font-semibold mb-4">Top genres</h2>
            <GenreTags genres={genres} max={12} />
          </div>
        )}

        {/* Audio profile */}
        {af && (
          <div className="card p-6 mb-5">
            <h2 className="font-semibold mb-4">Audio profile</h2>
            <AudioBars features={af} />
          </div>
        )}

        {/* Artists + Tracks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {artists.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold mb-3">Top artists</h2>
              {artists.slice(0, 8).map((a: any, i: number) => <ArtistRow key={a.id} artist={a} rank={i + 1} />)}
            </div>
          )}
          {tracks.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold mb-3">Top tracks</h2>
              {tracks.slice(0, 8).map((t: any, i: number) => <TrackRow key={t.id} track={t} rank={i + 1} />)}
            </div>
          )}
        </div>

      </main>
    </>
  );
}
