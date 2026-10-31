import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import worker from '../src/index.js';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const slug='/guides/climbing-video-tracking-problems';
const url='https://www.cruxcut.com'+slug;
const blocks=h=>[...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>{const b=JSON.parse(m[1]);return b['@graph']??[b];});
test('tracking guide has canonical metadata and approved publication date',async()=>{
 const h=await read('../guides/climbing-video-tracking-problems.html');
 assert.match(h,/<html lang="en">/);assert.match(h,/<h1>Why Climbing Video Auto-Tracking Loses the Climber \(and How to Fix It\)<\/h1>/);
 for(const s of [`<link rel="canonical" href="${url}">`,`<meta property="og:url" content="${url}">`])assert.ok(h.includes(s));
 assert.match(h,/<meta name="description" content="[^\"]+">/);assert.match(h,/<meta name="twitter:title"/);
 const a=blocks(h).find(x=>x['@type']==='Article');assert.equal(a.mainEntityOfPage,url);assert.equal(a.dateModified,'2026-10-24');assert.equal(a.datePublished,'2026-10-24');
 assert.deepEqual(a.author,{'@id':'https://www.cruxcut.com/#organization'});assert.deepEqual(a.about,{'@id':'https://www.cruxcut.com/#app'});
 const b=blocks(h).find(x=>x['@type']==='BreadcrumbList');assert.deepEqual(b.itemListElement.map(x=>x.position),[1,2,3]);assert.equal(b.itemListElement[2].item,url);
 assert.doesNotMatch(h,/\b(perfect tracking|guaranteed ranking|always recovers)\b/i);
});
test('all four FAQ structured answers exactly match visible answers',async()=>{
 const h=await read('../guides/climbing-video-tracking-problems.html');
 const visible=[...h.matchAll(/<details class="faq-item" data-faq-question="([^\"]+)"><summary>([^<]+)<\/summary><p>([^<]+)<\/p><\/details>/g)].map(m=>[m[2],m[3]]);
 const faq=blocks(h).find(x=>x['@type']==='FAQPage');assert.equal(visible.length,4);assert.deepEqual(faq.mainEntity.map(q=>[q.name,q.acceptedAnswer.text]),visible);
});
test('tracking recovery claim is grounded in existing public product wording',async()=>{
 const [h,home]=await Promise.all([read('../guides/climbing-video-tracking-problems.html'),read('../index.html')]);
 assert.match(home,/Draw the climbing route and CruxCut will identify the climber again and refine the tracking path/);
 assert.match(h,/draw the climbing route to help the app identify the climber again and refine the tracking path/);
 assert.match(h,/cannot reconstruct hidden hands or feet/);assert.match(h,/not a promise that every frame will be recovered/);
 assert.match(h,/Do not ask a belayer to change a safe position/);
});
test('discovery links and sitemap include the new page with honest modified dates',async()=>{
 for(const p of ['../guides/index.html','../guides/how-to-film-and-edit-climbing-videos.html','../sitemap.xml','../llms.txt'])assert.ok((await read(p)).includes(slug),p);
 const index=await read('../guides/index.html');const list=blocks(index).find(x=>x['@type']==='CollectionPage').mainEntity.itemListElement;assert.ok(list.some(x=>x.url===url));assert.deepEqual(list.map(x=>x.position),[1,2,3,4,5,6]);
 const map=await read('../sitemap.xml');assert.ok(map.includes(`<loc>${url}</loc>\n    <lastmod>2026-10-24</lastmod>`));
 assert.match(map,/<loc>https:\/\/www\.cruxcut\.com\/<\/loc>\s*<lastmod>2026-10-04<\/lastmod>/);
});
test('canonical article redirect preserves campaigns and article is indexable',async()=>{
 const env={ASSETS:{fetch:async r=>new Response(new URL(r.url).pathname,{headers:{'Content-Type':'text/html'}})}};
 const response=await worker.fetch(new Request(url+'.html?utm_source=instagram&campaign=test'),env);
 assert.equal(response.status,301);assert.equal(response.headers.get('Location'),url+'?utm_source=instagram&campaign=test');
 const publicPage=await worker.fetch(new Request(url),env);assert.equal(publicPage.status,200);assert.equal(publicPage.headers.get('X-Robots-Tag'),null);assert.equal(await publicPage.text(),slug);
});
test('machine-readable facts avoid stale Android and unqualified processing-speed claims',async()=>{
 const llms=await read('../llms.txt');
 assert.doesNotMatch(llms,/Android version is coming soon|not yet available on Google Play|22 seconds/);
 assert.match(llms,/For current Android availability, use the Google Play link on the official website/);
 assert.match(llms,/Processing time varies with video length, device and tracking conditions/);
 assert.match(llms,/does not need to be uploaded to a processing server/);
});
