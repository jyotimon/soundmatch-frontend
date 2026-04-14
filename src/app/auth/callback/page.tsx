'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui';

function Callback() {
  const params = useSearchParams();
  const router = useRouter();
  const { setToken } = useAuth();

  useEffect(() => {
    // const token = params.get('token');
    // const error = params.get('error');
    const token = new URLSearchParams(window.location.search).get('token');
    const error = new URLSearchParams(window.location.search).get('error');


    if (error) { router.push(`/?error=${error}`); return; }
    if (token) {
       localStorage.setItem("sm_token", token);
       setToken(token);
       router.push('/dashboard'); 
      }
    else         router.push('/');
  }, [params, router, setToken]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 animate-fade-in">
      <Spinner size="lg" />
      <p className="text-zinc-400 text-sm">Connecting your Spotify account…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>}>
      <Callback />
    </Suspense>
  );
}
