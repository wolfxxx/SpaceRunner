// Lightweight Firebase leaderboard for GitHub Pages (client-only)
// Usage: define window.FIREBASE_CONFIG in index.html, then include this file as a module.
// Exposes window.Leaderboard with submitScore(name, score) and getTop10().

/* global window */

let app, db, auth;
let _lastSubmitAt = 0;

async function ensureInit(){
  if(db) return true;
  const cfg = window.FIREBASE_CONFIG;
  if(!cfg || !cfg.apiKey){
    console.warn('[Leaderboard] No FIREBASE_CONFIG found; leaderboard disabled.');
    try{ window.LeaderboardDisabledReason = 'no_config'; }catch(e){}
    return false;
  }
  try{
    // Use Firebase Web v12.x CDN modules to match console snippet
    const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js');
    const { getAuth, signInAnonymously } = await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js');
    app = (getApps().length ? getApp() : initializeApp(cfg));
    // App Check (optional but recommended): requires a reCAPTCHA v3 site key
    try{
      const siteKey = window.FIREBASE_APPCHECK_SITE_KEY;
      if(siteKey){
        const { initializeAppCheck, ReCaptchaV3Provider } = await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-app-check.js');
        initializeAppCheck(app, { provider: new ReCaptchaV3Provider(siteKey), isTokenAutoRefreshEnabled: true });
      }
    }catch(e){ console.warn('[Leaderboard] App Check init skipped:', e); }
    auth = getAuth(app);
    try{ await signInAnonymously(auth); }catch(e){ console.warn('[Leaderboard] Anonymous auth failed:', e); try{ window.LeaderboardDisabledReason = 'auth_failed'; }catch(_){} }
    db = getFirestore(app);
    return true;
  }catch(e){
    console.warn('[Leaderboard] Init failed:', e);
    try{ window.LeaderboardDisabledReason = 'init_failed'; }catch(_){}
    return false;
  }
}

function sanitizeName(raw){
  let n = String((raw||'').trim());
  // Basic cleanup: remove URLs, collapse spaces, allow alnum + space + _ - .
  n = n.replace(/https?:\/\/\S+/gi, '').replace(/\s+/g,' ');
  n = n.replace(/[^\w .\-]/g,'');
  if(n.length > 24) n = n.slice(0,24);
  if(!n) n = 'Player';
  return n;
}

async function submitScore(name, score){
  try{
    if(!(await ensureInit())) return false;
    // Simple client-side anti-spam: 1 submission per 5 seconds
    const now = Date.now();
    if(now - _lastSubmitAt < 5000) return false;
    _lastSubmitAt = now;
    const n = sanitizeName(name);
    // Clamp score to a safe integer range
    let s = Math.max(0, Math.min(1000000, Math.floor(Number(score)||0)));
    if(!n || s<=0) return false;
    const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js');
    const doc = { name: n, score: s, createdAt: serverTimestamp() };
    await addDoc(collection(db, 'scores'), doc);
    return true;
  }catch(e){ console.warn('[Leaderboard] submitScore error:', e); return false; }
}

async function getTop10(){
  try{
    if(!(await ensureInit())) return [];
    const { collection, query, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js');
    // Simpler query: order by score only to avoid composite index and missing createdAt latency
    const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(10));
    const snap = await getDocs(q);
    const out = [];
    snap.forEach(d=>{ const x=d.data(); out.push({ name: x.name||'???', score: x.score||0, createdAt: (x.createdAt && x.createdAt.toDate)? x.createdAt.toDate(): new Date() }); });
    return out;
  }catch(e){ console.warn('[Leaderboard] getTop10 error:', e); return []; }
}

window.Leaderboard = { submitScore, getTop10 };

// Optional: expose a minimal readiness flag
window.LeaderboardReady = ensureInit();
