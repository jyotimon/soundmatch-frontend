'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function Navbar() {
  const { auth, signOut } = useAuth();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        <Link href={auth ? '/dashboard' : '/'} className="font-bold text-lg tracking-tight">
          <span className="text-[#1DB954]">Sound</span>Match
        </Link>

        {auth ? (
          <div className="flex items-center gap-5">
            <Link href="/dashboard"  className="nav-link">Dashboard</Link>
            <Link href="/matches"    className="nav-link">Matches</Link>
            <Link href="/community"  className="nav-link">Community</Link>
            <button onClick={signOut} className="nav-link">Sign out</button>
            {auth.user.avatar_url
              ? <img src={auth.user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
              : <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
                  {auth.user.display_name[0]?.toUpperCase()}
                </div>
            }
          </div>
        ) : (
          <a href={`${API_URL}/auth/login`} className="btn-spotify text-sm py-2 px-4">
            <SpotifyIcon />
            Login with Spotify
          </a>
        )}
      </div>
    </nav>
  );
}

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}
