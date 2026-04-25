'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { StatCard, GenreTags, ArtistRow, TrackRow, PersonalityBadge, AudioBars, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { syncProfile, getMyProfile, api } from '@/lib/api';


export default function DashboardPage() {
  const { auth, loading } = useAuth();
  const router = useRouter();

  // FIX: ALL hooks must be at the top — before any conditional returns.
  // Previously useState and useEffect were called after "if (loading || !auth) return"
  // which violates Rules of Hooks and crashes React.
  const [profileData, setProfileData] = useState<any>(null);
  const [syncing, setSyncing]         = useState(false);
  const [syncMsg, setSyncMsg]         = useState('');
  const [persona,   setPersona]   = useState('');
  const [profile, setProfile] = useState<any>(null);

   // 2. Redirect effect
  useEffect(() => {
    if (!loading && !auth) router.push('/');
  }, [auth, loading, router]);

  // 3. Fetch profile effect
  useEffect(() => {
    if (!auth) return;
    getMyProfile().then(setProfile).catch(() => null);
  }, [auth]);

  // 4. Fetch persona effect — AFTER profile is declared
  useEffect(() => {
    if (!profile) return;
    api.get('/api/users/me/persona')
      .then(r => setPersona(r.data.data.description))
      .catch(() => null);
  }, [profile]);  // ← runs when profile changes



// In the JSX, below the audio profile card:
{persona && (
  <div className="card p-6 mb-5 border-zinc-700">
    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">Your music soul</p>
    <p className="text-zinc-200 leading-relaxed italic">"{persona}"</p>
  </div>
)}

{persona && (
  <div className="card p-6 mb-5">
    <p className="text-xs text-zinc-500 mb-3 uppercase tracking-widest font-medium">
      Your music soul
    </p>
    <p className="text-zinc-200 leading-relaxed italic text-sm">
      "{persona}"
    </p>
  </div>
)}

  // Show skeletons while auth is being checked
  if (loading || !auth) {
    return (
      <>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </>
    );
  }

  const { user } = auth;

  // FIX: Safely parse audio_features_avg — Supabase/PostgreSQL JSONB can come back
  // as either a parsed object or a JSON string depending on the query method.
  const rawAf = profileData?.audio_features_avg;
  const af = rawAf
    ? (typeof rawAf === 'string' ? JSON.parse(rawAf) : rawAf)
    : null;

  // Same safe parse for JSONB arrays
  const topGenres = profileData?.top_genres
    ? (typeof profileData.top_genres === 'string' ? JSON.parse(profileData.top_genres) : profileData.top_genres)
    : [];

  const topArtists = profileData?.top_artists_medium
    ? (typeof profileData.top_artists_medium === 'string' ? JSON.parse(profileData.top_artists_medium) : profileData.top_artists_medium)
    : [];

  const topTracks = profileData?.top_tracks_medium
    ? (typeof profileData.top_tracks_medium === 'string' ? JSON.parse(profileData.top_tracks_medium) : profileData.top_tracks_medium)
    : [];

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      await syncProfile();
      setSyncMsg('Sync started… fetching your Spotify data.');

      // Poll for updated profile after a short delay
      setTimeout(async () => {
        try {
          const data = await getMyProfile();
          setProfileData(data);
          setSyncMsg('Profile updated!');
        } catch {
          setSyncMsg('Still processing — refresh in a few seconds.');
        }
      }, 6000);
    } catch {
      setSyncMsg('Sync failed. Try again shortly.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10 animate-slide-up">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {user.avatar_url
              ? <img src={user.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
              : <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold">
                  {user.display_name[0]?.toUpperCase()}
                </div>
            }
            <div>
              <h1 className="text-2xl font-bold">{user.display_name}</h1>
              {profileData?.personality_type && (
                <div className="mt-1"><PersonalityBadge type={profileData.personality_type} /></div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn-ghost text-sm py-2 px-4 disabled:opacity-40"
            >
              {syncing ? 'Syncing…' : '↻ Sync Spotify'}
            </button>
            <Link href="/matches" className="btn-primary text-sm py-2 px-4">
              View matches →
            </Link>
          </div>
        </div>

        {syncMsg && (
          <div className="mb-6 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-300">
            {syncMsg}
          </div>
        )}

        {!profileData ? (
          <div className="card p-12 text-center">
            <p className="text-zinc-300 font-semibold mb-2">Building your music profile…</p>
            <p className="text-zinc-600 text-sm">This takes about 30 seconds after your first login.</p>
            <p className="text-zinc-600 text-sm mt-1">
              Click <strong className="text-zinc-400">↻ Sync Spotify</strong> above to trigger it manually, then refresh.
            </p>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <StatCard label="Personality"   value={profileData.personality_type} />
              <StatCard label="Energy"        value={`${Math.round((af?.energy ?? 0) * 100)}%`}       sub="Music intensity" />
              <StatCard label="Positivity"    value={`${Math.round((af?.valence ?? 0) * 100)}%`}      sub="Musical happiness" />
              <StatCard label="Danceability"  value={`${Math.round((af?.danceability ?? 0) * 100)}%`} sub="Rhythm & groove" />
            </div>

            {/* Genres */}
            {topGenres.length > 0 && (
              <div className="card p-6 mb-5">
                <h2 className="font-semibold mb-4">Your top genres</h2>
                <GenreTags genres={topGenres} max={14} />
              </div>
            )}

            {/* Audio features */}
            {af && (
              <div className="card p-6 mb-5">
                <h2 className="font-semibold mb-4">Audio profile</h2>
                <AudioBars features={af} />
              </div>
            )}

            {/* Artists + Tracks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {topArtists.length > 0 && (
                <div className="card p-5">
                  <h2 className="font-semibold mb-3">Top artists</h2>
                  {topArtists.slice(0, 8).map((a: any, i: number) => (
                    <ArtistRow key={a.id} artist={a} rank={i + 1} />
                  ))}
                </div>
              )}
              {topTracks.length > 0 && (
                <div className="card p-5">
                  <h2 className="font-semibold mb-3">Top tracks</h2>
                  {topTracks.slice(0, 8).map((t: any, i: number) => (
                    <TrackRow key={t.id} track={t} rank={i + 1} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
