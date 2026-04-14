# SoundMatch Frontend — Bug Report & Fix Guide
# =====================================================

## BUG 1 — .env.local has a placeholder value (login button goes nowhere)
File: .env.local

BROKEN:
  NEXT_PUBLIC_API_URL=abcd123

Every API call and every Spotify login link points to "abcd123" instead of your
backend. The login button generates href="abcd123/auth/login" which 404s instantly.

FIXED:
  NEXT_PUBLIC_API_URL=http://localhost:4000   ← or 5000 if you kept the old port
  API_URL=http://localhost:4000

Note: Your backend from the previous fix runs on PORT from config (default 4000).
If you kept port 5000 in your backend's index.ts, use 5000 here instead.


## BUG 2 — lib/api.ts hardcodes port 5000 and ignores the env variable
File: src/lib/api.ts

BROKEN:
  const API_URL = 'http://localhost:5000';   ← hardcoded, ignores NEXT_PUBLIC_API_URL

Even if .env.local is correct, all API calls still go to port 5000 because
the env variable is never read. If your backend moves to a different port or
URL, you'd have to find and change this hardcoded value.

FIXED:
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';


## BUG 3 — Dashboard calls useState AFTER an early return (crashes React)
File: src/app/dashboard/page.tsx

BROKEN:
  if (loading || !auth) {
    return (<Skeleton />);      // ← early return here
  }

  const { user, profile } = auth;
  const [profileData, setProfileData] = useState(profile);   // ← HOOK AFTER RETURN
  useEffect(() => { ... }, []);                               // ← HOOK AFTER RETURN

This violates the Rules of Hooks — you cannot call useState or useEffect after
a conditional return. React will throw "Rendered more hooks than during the
previous render" and crash the page.

FIXED: All hooks moved to the top of the component, before any conditional returns.


## BUG 4 — useAuth.fetchMe grabs token from URL on every page load
File: src/hooks/useAuth.tsx

BROKEN:
  const fetchMe = async () => {
    const url = new URL(window.location.href);
    const tokenFromUrl = url.searchParams.get('token');     // reads ?token= everywhere
    if (tokenFromUrl) {
      localStorage.setItem('sm_token', tokenFromUrl);
      window.history.replaceState({}, document.title, '/dashboard');  // breaks routing
    }
    ...
  }

This runs on EVERY page mount. Problems:
  a) On the landing page (?error=...), it tries to read 'token' and fails silently
  b) window.history.replaceState('/dashboard') changes the URL without navigating,
     so users see the wrong URL in their browser bar
  c) window.location is not available during server-side rendering (SSR crash risk)
  d) The /auth/callback page ALREADY handles token capture correctly — this
     duplicates that work and can create race conditions

FIXED: fetchMe only reads token from localStorage. The /auth/callback page
remains the single place responsible for capturing the token from the URL.


## BUG 5 — Dashboard audio_features_avg not parsed (empty audio bars)
File: src/app/dashboard/page.tsx

BROKEN:
  const af = profileData?.audio_features_avg;
  // Used directly as: af?.energy, af?.valence etc.

Supabase/PostgreSQL JSONB columns sometimes return as a JSON string rather than
a parsed object, depending on the driver and query method. The profile page already
handles this with:
  typeof profile.audio_features_avg === 'string'
    ? JSON.parse(profile.audio_features_avg)
    : profile.audio_features_avg

The dashboard didn't have this guard, so audio bars showed nothing when the
value came back as a string.

FIXED: Same safe parse pattern applied in dashboard.


## WHAT TO DO
Replace these files in your frontend/src/ folder:
  - .env.local           (at root of frontend folder)
  - src/lib/api.ts
  - src/hooks/useAuth.tsx
  - src/app/dashboard/page.tsx

All other files (pages, components, layout, etc.) are unchanged from your version
and are included in the zip for completeness.

After replacing, run:
  npm install
  npm run dev

The app will be at http://localhost:3000
