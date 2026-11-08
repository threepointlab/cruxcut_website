/* First-party, bounded event counts. Never creates a visitor identifier. */
(() => {
 if (window.__cruxcutAttributionStarted) return;
 window.__cruxcutAttributionStarted = true;
 if (navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
 import('/assets/home/attribution-core.mjs').then(core => {
  const key = 'cruxcut_attribution_v1'; let previous;
  try { previous = JSON.parse(sessionStorage.getItem(key)); } catch { /* Storage is optional. */ }
  const context = core.classify(location.href, document.referrer, previous);
  try { sessionStorage.setItem(key,JSON.stringify(context)); } catch { /* No cookie/localStorage fallback. */ }
  // Experiment arm and coarse platform are set by the inline head script on the homepage only.
  const root = typeof document.documentElement === 'object' && document.documentElement ? document.documentElement : {dataset:{}};
  const arm = ['a','b'].includes(root.dataset?.exp) ? root.dataset.exp : 'none';
  const exp = arm === 'none' ? 'none' : 'home_v2';
  const platform = ['ios','android','desktop'].includes(root.dataset?.platform) ? root.dataset.platform : 'other';
  const send = (event, target = 'none', placement = 'none') => {
   const body = JSON.stringify({v:2,event,source:context.source,campaign:context.campaign,method:context.method,page:core.pageBucket(location.pathname),target,placement,exp,arm,platform});
   try { fetch('/api/attribution-event',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true,credentials:'same-origin'}).catch(() => {}); } catch { /* Never block navigation. */ }
   // Mirror the same bounded event to an optional behaviour-analytics adapter (analytics.js), if loaded.
   try { if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') window.dispatchEvent(new CustomEvent('cruxcut:track',{detail:JSON.parse(body)})); } catch { /* Optional. */ }
  };
  window.cruxcutAttribution = {playURL:() => core.playURL(context)};
  const decorate = () => document.querySelectorAll('a[href]').forEach(a => {
   try { a.href = core.decorate(a.href,context,location.origin); } catch { /* Ignore non-HTTP links. */ }
  });
  decorate();
  send('pageview');
  const PLACEMENTS = ['hero','nav','final','community','footer','dialog','sticky','zoom'];
  document.addEventListener('click',event => {
   const a = event.target.closest?.('a[href]'); if (!a) return;
   let u; try { u = new URL(a.href,location.origin); } catch { return; }
   const target = u.hostname === 'apps.apple.com' ? 'appstore' : (u.origin === location.origin && u.pathname === '/download/android') || u.hostname === 'play.google.com' ? 'googleplay' : u.hostname === 'discord.gg' ? 'discord' : null;
   if (!target) return;
   const explicit = a.closest('[data-cta-placement]')?.dataset?.ctaPlacement;
   const placement = PLACEMENTS.includes(explicit) ? explicit : a.closest('dialog') ? 'dialog' : a.closest('footer') ? 'footer' : a.closest('nav') ? 'nav' : a.closest('.hero') ? 'hero' : a.closest('.final-cta') ? 'final' : 'community';
   a.href = core.decorate(a.href,context,location.origin);
   send('click',target,placement);
  },true);
  // Exposure: each install-CTA group counts once per page load when at least half of it is visible.
  if (typeof IntersectionObserver === 'function') {
   const seen = new Set();
   const io = new IntersectionObserver(entries => entries.forEach(entry => {
    const group = entry.target.dataset.ctaGroup;
    if (!entry.isIntersecting || seen.has(group) || !['hero','zoom','final'].includes(group)) return;
    seen.add(group); io.unobserve(entry.target); send('cta_view','none',group);
   }),{threshold:0.5});
   document.querySelectorAll('[data-cta-group]').forEach(el => io.observe(el));
  }
  // Scroll depth: 25/50/75/100% milestones, each at most once per page load.
  if (typeof window.addEventListener === 'function' && core.pageBucket(location.pathname).startsWith('home')) {
   const marks = [25,50,75,100]; const sent = new Set();
   const check = () => {
    const doc = document.documentElement; const max = doc.scrollHeight - window.innerHeight;
    const pct = max <= 0 ? 100 : (window.scrollY / max) * 100;
    for (const m of marks) if (pct >= m - 0.5 && !sent.has(m)) { sent.add(m); send('scroll','none','d'+m); }
    if (sent.size === marks.length) window.removeEventListener('scroll',onScroll);
   };
   let ticking = false; const onScroll = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; check(); }); };
   window.addEventListener('scroll',onScroll,{passive:true});
  }
 }).catch(() => { /* Analytics must never affect the page. */ });
})();
