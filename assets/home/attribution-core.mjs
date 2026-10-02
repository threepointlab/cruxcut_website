export const SOURCES = ['instagram','reddit','google','bing','duckduckgo','chatgpt','perplexity','claude','gemini','copilot','other_referral','direct_or_unknown','other_campaign'];
export const CAMPAIGNS = ['bio','story','community','website','launch','qa','other','none'];
export const TTL = 30 * 60 * 1000;
const aliases = {ig:'instagram',instagram:'instagram',reddit:'reddit',google:'google',bing:'bing',duckduckgo:'duckduckgo',chatgpt:'chatgpt',openai:'chatgpt',perplexity:'perplexity',claude:'claude',gemini:'gemini',copilot:'copilot'};
export function safeURL(value) { try { const u = new URL(value); return /^https?:$/.test(u.protocol) && !u.username && !u.password ? u : null; } catch { return null; } }
export function referrerSource(value) {
 const u = safeURL(value); if (!u) return 'direct_or_unknown';
 const h = u.hostname.toLowerCase().replace(/\.$/, '');
 const domains = [['gemini',['gemini.google.com']],['copilot',['copilot.microsoft.com']],['chatgpt',['chatgpt.com','chat.openai.com']],['perplexity',['perplexity.ai']],['claude',['claude.ai']],['instagram',['instagram.com']],['reddit',['reddit.com','redd.it']],['google',['google.com','google.co.kr','google.co.uk','google.co.jp','google.de','google.fr','google.ca','google.com.au']],['bing',['bing.com']],['duckduckgo',['duckduckgo.com']]];
 for (const [source, list] of domains) if (list.some(d => h === d || h.endsWith('.'+d))) return source;
 return 'other_referral';
}
export function validContext(c, now) { return c && SOURCES.includes(c.source) && CAMPAIGNS.includes(c.campaign) && ['utm','referrer','none'].includes(c.method) && Number.isFinite(c.expires) && c.expires > now && c.expires <= now + TTL; }
export function classify(href, referrer, previous, now = Date.now()) {
 const u = new URL(href); const raw = u.searchParams.get('utm_source');
 if (raw !== null || u.searchParams.has('utm_campaign') || u.searchParams.has('utm_medium')) {
  const campaign = (u.searchParams.get('utm_campaign') || '').toLowerCase();
  return {source:aliases[(raw || '').toLowerCase()] || 'other_campaign',campaign:CAMPAIGNS.includes(campaign) && campaign !== 'none' ? campaign : 'other',method:'utm',expires:now+TTL};
 }
 if (u.pathname === '/download/android' && SOURCES.includes(u.searchParams.get('source')) && CAMPAIGNS.includes(u.searchParams.get('campaign'))) return {source:u.searchParams.get('source'),campaign:u.searchParams.get('campaign'),method:['utm','referrer','none'].includes(u.searchParams.get('attr_method')) ? u.searchParams.get('attr_method') : 'none',expires:now+TTL};
 const r = safeURL(referrer);
 if ((!r || r.origin === u.origin) && validContext(previous,now)) return previous;
 const source = r && r.origin !== u.origin ? referrerSource(referrer) : 'direct_or_unknown';
 return {source,campaign:'none',method:source === 'direct_or_unknown' ? 'none' : 'referrer',expires:now+TTL};
}
export function decorate(href, context, origin) {
 const u = new URL(href,origin);
 if(u.hostname === 'apps.apple.com') u.searchParams.set('ct',`website_${context.source}_${context.campaign}`);
 else if(u.origin === origin && u.pathname === '/download/android') {
  u.searchParams.set('source',context.source); u.searchParams.set('campaign',context.campaign); u.searchParams.set('attr_method',context.method);
 }
 return u.href;
}
export function playURL(context) {
 const u = new URL('https://play.google.com/store/apps/details?id=com.threepointlab.cruxcut');
 u.searchParams.set('referrer',new URLSearchParams({utm_source:context.source,utm_campaign:context.campaign,utm_medium:'website'}).toString());
 return u.href;
}
export function pageBucket(path) { return path.startsWith('/guides') ? 'guides' : path.startsWith('/download/android') ? 'android' : path === '/ko/' || path === '/ko' ? 'home_ko' : path === '/' ? 'home_en' : 'other'; }
