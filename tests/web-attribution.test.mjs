import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {classify,referrerSource,decorate,playURL,TTL} from '../assets/home/attribution-core.mjs';
const source=await readFile(new URL('../src/index.js',import.meta.url),'utf8');
const {default:worker,attributedPlayURL}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const base='https://www.cruxcut.com';
const data={v:1,event:'pageview',source:'reddit',campaign:'bio',method:'utm',page:'home_en',target:'none',placement:'none'};
const request=(body=data,headers={})=>new Request(base+'/api/attribution-event',{method:'POST',headers:{Origin:base,'Content-Type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
test('known AI, search, hostile hostnames and absent referrer',()=>{
 for(const [h,s] of [['chatgpt.com','chatgpt'],['chat.openai.com','chatgpt'],['perplexity.ai','perplexity'],['claude.ai','claude'],['gemini.google.com','gemini'],['copilot.microsoft.com','copilot'],['www.google.com','google'],['www.google.co.kr','google'],['bing.com','bing'],['duckduckgo.com','duckduckgo'],['l.instagram.com','instagram'],['old.reddit.com','reddit']]) assert.equal(referrerSource('https://'+h+'/private?q=secret'),s);
 for(const h of ['google.com.evil.test','evilgoogle.com','gemini.google.com.evil.test'])assert.equal(referrerSource('https://'+h),'other_referral');
 for(const r of ['','junk','javascript:alert(1)','https://google.com@evil.test'])assert.equal(referrerSource(r),r.includes('@')?'direct_or_unknown':'direct_or_unknown');
 assert.equal(classify(base,'',null,1).source,'direct_or_unknown');
});
test('UTM wins, persists internally, expires, never retains arbitrary campaign',()=>{
 const c=classify(base+'/?utm_source=instagram&utm_campaign=bio','https://google.com',null,1);
 assert.equal(c.method,'utm');assert.equal(c.source,'instagram');
 assert.deepEqual(classify(base+'/ko/','https://www.cruxcut.com/',c,100),c);
 assert.deepEqual(classify(base+'/guides','',c,100),c);
 assert.equal(classify(base+'/','',c,TTL+2).source,'direct_or_unknown');
 assert.equal(classify(base+'/?utm_source=private@example.com&utm_campaign=user123','',null,1).campaign,'other');
 assert.equal(classify(base,'https://www.reddit.com',null,1).method,'referrer');
});
test('bounded store campaigns preserve pt/mt, Discord untouched, official encoded Play referrer',()=>{
 const c=classify(base+'/?utm_source=reddit&utm_campaign=bio','',null,1);
 const u=new URL(decorate('https://apps.apple.com/app/id1?pt=123&mt=8',c,base));
 assert.equal(u.searchParams.get('pt'),'123');assert.equal(u.searchParams.get('mt'),'8');assert.equal(u.searchParams.get('ct'),'website_reddit_bio');
 assert.equal(decorate('https://discord.gg/code',c,base),'https://discord.gg/code');
 assert.equal(new URL(playURL(c)).searchParams.get('referrer'),'utm_source=reddit&utm_campaign=bio&utm_medium=website');
 assert.equal(attributedPlayURL(new URL(base+'/download/android?source=reddit&campaign=bio')),playURL(c));
});
test('aggregate write schema excludes PII; missing binding is failure',async()=>{
 let points=[];const env={WEB_ANALYTICS:{writeDataPoint:p=>points.push(p)}};
 assert.equal((await worker.fetch(request(),env)).status,204);
 assert.deepEqual(points,[{indexes:['web_v1'],blobs:['v1','pageview','reddit','utm','bio','home_en','none','none'],doubles:[1]}]);
 assert.equal((await worker.fetch(request(),{})).status,503);
 assert.equal((await worker.fetch(request(),{WEB_ANALYTICS:{writeDataPoint(){throw Error('down')}}})).status,503);
 for(const patch of [{url:'https://secret.test'},{email:'private@test'},{source:'user123'},{campaign:'private'}])assert.equal((await worker.fetch(request({...data,...patch}),env)).status,400);
 assert.equal(points.length,1);
});
test('bad origin, oversized bodies, methods, content type, bots and optout',async()=>{
 const env={WEB_ANALYTICS:{writeDataPoint(){throw Error('must not write')}}};
 assert.equal((await worker.fetch(request(data,{Origin:'https://evil.test'}),env)).status,403);
 assert.equal((await worker.fetch(request(data,{Referer:'https://evil.test'}),env)).status,403);
 assert.equal((await worker.fetch(request('x'.repeat(2049)),env)).status,413);
 assert.equal((await worker.fetch(request(data,{'Content-Type':'text/plain'}),env)).status,415);
 assert.equal((await worker.fetch(new Request(base+'/api/attribution-event'),env)).status,405);
 for(const headers of [{'Sec-GPC':'1'},{DNT:'1'},{'User-Agent':'Googlebot'}])assert.equal((await worker.fetch(request(data,headers),env)).status,204);
});
test('click target and placement fixtures all supported',async()=>{
 for(const target of ['appstore','googleplay','discord'])for(const placement of ['hero','nav','final','community','footer','dialog'])assert.equal((await worker.fetch(request({...data,event:'click',target,placement}),{WEB_ANALYTICS:{writeDataPoint(){}}})).status,204);
});

test('browser controller network failures and blocked storage do not break clicks or duplicate pageviews',async()=>{
 const {runInNewContext}=await import('node:vm');const core=await import('../assets/home/attribution-core.mjs');
 const script=(await readFile(new URL('../assets/home/attribution.js',import.meta.url),'utf8')).replace("import('/assets/home/attribution-core.mjs')","Promise.resolve(core)");
 for(const blocked of [true,false]){
  const requests=[];let listener;const anchor={href:'https://apps.apple.com/app/id1?pt=1&mt=8',closest:sel=>sel==='.hero'?{}:null};
  const sandbox={core,URL,Promise,JSON,Date,navigator:{},window:{},location:{href:base+'/?utm_source=instagram&utm_campaign=bio',origin:base,pathname:'/'},document:{referrer:'https://google.com',querySelectorAll:()=>[anchor],addEventListener:(type,fn)=>{listener=fn}},sessionStorage:{getItem(){if(blocked)throw Error('blocked');return null},setItem(){if(blocked)throw Error('blocked')}},fetch:(url,init)=>{requests.push(JSON.parse(init.body));return Promise.reject(Error('offline'))}};
  runInNewContext(script,sandbox);await new Promise(r=>setImmediate(r));runInNewContext(script,sandbox);await new Promise(r=>setImmediate(r));
  listener({target:{closest:()=>anchor}});assert.equal(requests.length,2);assert.equal(requests[0].event,'pageview');assert.equal(requests[1].target,'appstore');assert.equal(requests[1].placement,'hero');assert.match(anchor.href,/ct=website_instagram_bio/);
 }
});
test('GPC and DNT suppress client storage and network entirely',async()=>{
 const {runInNewContext}=await import('node:vm');const script=await readFile(new URL('../assets/home/attribution.js',import.meta.url),'utf8');
 for(const navigator of [{globalPrivacyControl:true},{doNotTrack:'1'}])runInNewContext(script,{window:{},navigator});
});

test('every local canonical redirect preserves attribution query exactly',async()=>{
 const query='?utm_source=reddit&utm_campaign=qa&extra=a%2Bb&extra=two';
 for(const [path,destination,status] of [
  ['/en','/en/privacy',302],
  ['/guides/how-to-film-and-edit-climbing-videos.html','/guides/how-to-film-and-edit-climbing-videos',301],
  ['/guides/automatic-climbing-highlights.html','/guides/automatic-climbing-highlights',301],
  ['/guides/climbing-video-editor-comparison.html','/guides/climbing-video-editor-comparison',301]
 ]) {
  const response=await worker.fetch(new Request(base+path+query),{});
  assert.equal(response.status,status);
  assert.equal(response.headers.get('Location'),base+destination+query);
 }
});
test('all home and guide landings include attribution script once',async()=>{
 for(const file of ['index.html','ko/index.html','guides/index.html','guides/how-to-film-and-edit-climbing-videos.html','guides/automatic-climbing-highlights.html','guides/climbing-video-editor-comparison.html']) {
  const html=await readFile(new URL('../'+file,import.meta.url),'utf8');
  const scripts=[...html.matchAll(/<script\b[^>]*src=["'](\/assets\/home\/attribution\.js(?:\?[^"']*)?)["'][^>]*>/g)];
  assert.equal(scripts.length,1,file);
  assert.match(scripts[0][0],/\bdefer\b/,file);
 }
});
