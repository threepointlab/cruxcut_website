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
  const send = (event, target = 'none', placement = 'none') => {
   const body = JSON.stringify({v:1,event,source:context.source,campaign:context.campaign,method:context.method,page:core.pageBucket(location.pathname),target,placement});
   try { fetch('/api/attribution-event',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true,credentials:'same-origin'}).catch(() => {}); } catch { /* Never block navigation. */ }
  };
  window.cruxcutAttribution = {playURL:() => core.playURL(context)};
  const decorate = () => document.querySelectorAll('a[href]').forEach(a => {
   try { a.href = core.decorate(a.href,context,location.origin); } catch { /* Ignore non-HTTP links. */ }
  });
  decorate();
  send('pageview');
  document.addEventListener('click',event => {
   const a = event.target.closest?.('a[href]'); if (!a) return;
   let u; try { u = new URL(a.href,location.origin); } catch { return; }
   const target = u.hostname === 'apps.apple.com' ? 'appstore' : (u.origin === location.origin && u.pathname === '/download/android') || u.hostname === 'play.google.com' ? 'googleplay' : u.hostname === 'discord.gg' ? 'discord' : null;
   if (!target) return;
   const placement = a.closest('dialog') ? 'dialog' : a.closest('footer') ? 'footer' : a.closest('nav') ? 'nav' : a.closest('.hero') ? 'hero' : a.closest('.final-cta') ? 'final' : 'community';
   a.href = core.decorate(a.href,context,location.origin);
   send('click',target,placement);
  },true);
 }).catch(() => { /* Analytics must never affect the page. */ });
})();
