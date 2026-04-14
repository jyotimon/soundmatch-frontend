'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL 

export default function LandingPage() {
  const { auth, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && auth) router.push('/dashboard');
  }, [auth, loading, router]);

  return (
    <main className="min-h-screen flex flex-col">

      {/* Nav */}
      <header className="border-b border-zinc-800 h-14 flex items-center justify-between px-6 max-w-5xl mx-auto w-full">
        <span className="font-bold text-lg"><span className="text-[#1DB954]">Sound</span>Match</span>
        <a href={`${API_URL}/auth/login`} className="btn-spotify text-sm py-2 px-4">
          Login with Spotify
        </a>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full text-xs text-zinc-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse-slow" />
          Powered by Spotify data
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight max-w-2xl">
          Find your people<br />
          <span className="text-[#1DB954]">through music</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
          We analyse your listening history to match you with people who share your musical soul — not just a playlist.
        </p>
        <a href={`${API_URL}/auth/login`} className="btn-spotify text-base py-4 px-10">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Connect with Spotify — it's free
        </a>
        <p className="text-zinc-600 text-xs mt-4">We only read your listening data. We never post or modify anything.</p>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-800 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-bold mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { n: '01', t: 'Connect Spotify',       b: 'Securely log in — we use official Spotify OAuth. No passwords stored.' },
              { n: '02', t: 'We analyse your taste', b: 'Top artists, tracks, genres, audio features and listening times.' },
              { n: '03', t: 'See your matches',      b: 'Scored on genre, artist overlap, mood energy and listening patterns.' },
              { n: '04', t: 'Build a shared mix',    b: 'Create a collaborative Spotify playlist with your best match.' },
            ].map(({ n, t, b }) => (
              <div key={n} className="card p-5">
                <p className="text-[#1DB954] font-mono text-xs font-bold mb-3">{n}</p>
                <p className="font-semibold text-sm mb-2">{t}</p>
                <p className="text-zinc-500 text-xs leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 py-8 text-center text-zinc-600 text-sm">
        SoundMatch · Built with the Spotify Web API · Not affiliated with Spotify
      </footer>
    </main>
  );
}
