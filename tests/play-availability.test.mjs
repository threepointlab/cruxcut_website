import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
const source = await readFile(new URL('../src/index.js', import.meta.url), 'utf8');
const {default:worker, inspectPlayListing, probePlayAvailability} = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const url = 'https://play.google.com/store/apps/details?id=com.threepointlab.cruxcut';
const identity = `<link rel="canonical" href="${url}"><script type="application/ld+json">{"@type":"SoftwareApplication","name":"CruxCut"}</script>`;
const live = identity + '<button><span>Install</span></button>';
const response = html => ({ok:true, url, text:async()=>html});

test('only correct app and explicit install evidence open automatic gate', () => {
  assert.equal(inspectPlayListing(live,url),true);
  for(const html of [identity, identity+'<button>Pre-register</button>',identity+'<button disabled>Install</button>',identity+'<button>Details</button><p>Install</p>',live.replace('CruxCut','WrongApp'),live.replace('com.threepointlab.cruxcut','wrong.package')])assert.equal(inspectPlayListing(html,url),false);
  assert.equal(inspectPlayListing(live,url.replace('com.threepointlab.cruxcut','wrong.package')),false);
  assert.equal(inspectPlayListing(live+'<button>Pre-register</button>',url),false);
});
test('real Play title "AI Climb Video Editor: CruxCut" is recognized', () => {
  const real = live.replace('"name":"CruxCut"', '"name":"AI Climb Video Editor: CruxCut"');
  assert.equal(inspectPlayListing(real,url),true);
  assert.equal(inspectPlayListing(real.replace('AI Climb Video Editor: CruxCut','Not CruxCutter App'),url),false);
});
test('prelaunch/live/ambiguous/failed probes fail closed', async()=>{
  assert.equal((await probePlayAvailability('en',{},async()=>({ok:false}))).available,false);
  assert.equal((await probePlayAvailability('en',{},async()=>response(live))).available,true);
  assert.equal((await probePlayAvailability('ko',{},async()=>response('<html>HTTP 200</html>'))).available,false);
  assert.equal((await probePlayAvailability('en',{},async()=>{throw Error('Network')})).reason,'probe_failed');
});
test('verified release switch cannot bypass identity or preregistration',()=>{
  assert.equal(inspectPlayListing(identity,url,true),true);
  assert.equal(inspectPlayListing('<html>200</html>',url,true),false);
  assert.equal(inspectPlayListing(identity+'<button>Pre-register</button>',url,true),false);
});
test('every homepage Play CTA has server fallback and localized soon label',async()=>{
 for(const file of ['../index.html','../ko/index.html']){
  const html=await readFile(new URL(file,import.meta.url),'utf8');
  assert.doesNotMatch(html,/href="https:\/\/play.google.com/);
  assert.equal((html.match(/data-play-cta/g)||[]).length,2);
  assert.equal((html.match(/data-play-label/g)||[]).length,2);
  assert.match(html,/<dialog[^>]*aria-labelledby="play-dialog-title" aria-describedby="play-dialog-description"/);
  assert.match(html,/class="button hero-discord" href="https:\/\/discord.gg\/phFRhaWCU5"/);
 }
 const config=await readFile(new URL('../wrangler.toml',import.meta.url),'utf8');
 assert.match(config,/run_worker_first = \["\/api\/play-availability", "\/download\/android"/);
});
test('server route refuses unsafe methods',async()=>{
 const res=await worker.fetch(new Request('https://www.cruxcut.com/download/android',{method:'POST'}),{});
 assert.equal(res.status,405);
});

test('API and no-JS route agree for prelaunch, live and failed probes',async()=>{
 const original=globalThis.fetch;
 try{
  for(const [html,available]of[[identity,false],[live,true],['<html>200</html>',false]]){
   globalThis.fetch=async()=>response(html);
   const api=await worker.fetch(new Request('https://www.cruxcut.com/api/play-availability?lang=ko'),{});
   assert.equal((await api.json()).available,available);
   const fallback=await worker.fetch(new Request('https://www.cruxcut.com/download/android?lang=ko'),{});
   if(available){assert.equal(fallback.status,302);assert.equal(fallback.headers.get('location'),url)}
   else{assert.equal(fallback.status,200);assert.match(await fallback.text(),/Android 버전은 곧 만나요/)}
  }
  globalThis.fetch=async()=>{throw Error('Network')};
  const fallback=await worker.fetch(new Request('https://www.cruxcut.com/download/android'),{});
  assert.match(await fallback.text(),/Android is coming soon/);
 }finally{globalThis.fetch=original}
});

test('internal status cache is short-lived and client responses are never cached',async()=>{
 const oldFetch=globalThis.fetch, oldCaches=globalThis.caches;let calls=0, stored=null;
 try{
  globalThis.fetch=async()=>{calls++;return response(live)};
  globalThis.caches={default:{match:async()=>stored?.clone(),put:async(key,value)=>{assert.match(key.url,/lang=ko/);assert.equal(value.headers.get('cache-control'),'public, max-age=120');stored=value}}};
  for(let i=0;i<2;i++){const res=await worker.fetch(new Request('https://www.cruxcut.com/api/play-availability?lang=ko'),{});assert.equal(res.headers.get('cache-control'),'no-store');assert.equal((await res.json()).available,true)}
  assert.equal(calls,1);
 }finally{globalThis.fetch=oldFetch;if(oldCaches===undefined)delete globalThis.caches;else globalThis.caches=oldCaches}
});
