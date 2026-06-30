#!/usr/bin/env python3
"""data/backlog.json을 읽어 자기완결 index.html을 생성한다.
데이터(메모/스프레드시트/노션/지라)가 늘면 backlog.json만 갱신 후 `python3 build.py` 재실행.
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).parent
data = json.loads((ROOT / "data" / "backlog.json").read_text(encoding="utf-8"))
embedded = json.dumps(data, ensure_ascii=False)

HTML = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>tplab 백로그</title>
<style>
  :root { --bg:#0f1115; --card:#171a21; --card2:#1e222b; --line:#2a2f3a; --fg:#e8eaf0; --mut:#9aa3b2;
          --feature:#4ea1ff; --engineering:#b48cff; --bugfix:#ff9f43; --ret:#33d39e; --mon:#ffd34e;
          --lo:#ff6b6b; --mid:#ffc24e; --hi:#33d39e; --warn:#ff9f43; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
  header { padding:20px 24px 12px; border-bottom:1px solid var(--line); }
  h1 { margin:0 0 4px; font-size:20px; }
  .sub { color:var(--mut); font-size:12px; font-weight:400; }
  .nav { margin-top:7px; font-size:13px; }
  .nav a { color:var(--feature); text-decoration:none; }
  .nav a:hover { text-decoration:underline; }
  .nav .cur { font-weight:700; }
  .summary { display:flex; flex-wrap:wrap; gap:8px; padding:14px 24px; border-bottom:1px solid var(--line); }
  .stat { background:var(--card); border:1px solid var(--line); border-radius:8px; padding:6px 12px; font-size:12px; }
  .stat b { font-size:15px; }
  .controls { display:flex; flex-wrap:wrap; gap:10px; align-items:center; padding:14px 24px; border-bottom:1px solid var(--line); position:sticky; top:0; background:var(--bg); z-index:5; }
  .controls label { font-size:12px; color:var(--mut); display:flex; flex-direction:column; gap:3px; }
  select, input[type=search] { background:var(--card2); color:var(--fg); border:1px solid var(--line); border-radius:6px; padding:6px 8px; font-size:13px; }
  input[type=search] { min-width:200px; }
  .count { margin-left:auto; color:var(--mut); font-size:12px; }
  .hint { color:var(--mut); font-size:12px; padding:10px 24px 4px; }
  main { padding:8px 24px 60px; }

  /* category toggle */
  .cat { margin-bottom:4px; }
  .cathead { display:flex; align-items:center; gap:8px; padding:9px 6px; cursor:pointer; font-size:15px; font-weight:700; border-radius:8px; user-select:none; }
  .cathead:hover { background:var(--card2); }
  .arrow { display:inline-block; transition:transform .15s; color:var(--mut); font-size:12px; }
  .cat.open .arrow { transform:rotate(90deg); }
  .catcount { font-size:12px; font-weight:600; color:var(--mut); }
  .catbody { display:none; flex-direction:column; gap:8px; padding:4px 0 12px 10px; border-left:2px solid var(--line); margin-left:9px; }
  .cat.open .catbody { display:flex; }

  /* card */
  .card { background:var(--card); border:1px solid var(--line); border-radius:10px; overflow:hidden; }
  .card.warn { border-color:#5a4322; }
  .head { display:flex; align-items:center; gap:9px; padding:11px 14px; cursor:pointer; }
  .head:hover { background:var(--card2); }
  .tid { font-size:12px; color:var(--mut); font-family:ui-monospace,Menlo,monospace; flex-shrink:0; }
  .ttl { font-weight:600; flex:1; }
  .badge { font-size:10px; font-weight:700; padding:2px 7px; border-radius:6px; white-space:nowrap; text-transform:uppercase; letter-spacing:.3px; }
  .b-feature { background:rgba(78,161,255,.16); color:var(--feature); }
  .b-engineering { background:rgba(180,140,255,.16); color:var(--engineering); }
  .b-bugfix { background:rgba(255,159,67,.16); color:var(--bugfix); }
  .warnmark { color:var(--warn); font-size:14px; }
  .ice { background:#262b36; color:#fff; font-weight:700; border-radius:6px; padding:2px 9px; font-size:12px; }
  .tag { font-size:11px; color:var(--mut); background:var(--card2); border:1px solid var(--line); padding:2px 7px; border-radius:6px; white-space:nowrap; }
  .gf { font-size:11px; padding:2px 7px; border-radius:6px; white-space:nowrap; }
  .gf-retention { background:rgba(51,211,158,.15); color:var(--ret); }
  .gf-monetization { background:rgba(255,211,78,.15); color:var(--mon); }
  .gf-both { background:rgba(51,211,158,.12); color:#7be0c2; }
  .gf-foundational { background:#242a36; color:var(--mut); }
  .bang { color:#ff5e57; font-weight:700; letter-spacing:-1px; font-size:13px; }

  .body { padding:14px 16px 16px; border-top:1px solid var(--line); display:none; }
  .card.open .body { display:block; }
  .review { background:rgba(255,159,67,.12); border:1px solid #5a4322; color:#ffcf99; border-radius:8px; padding:9px 12px; margin-bottom:12px; font-size:13px; }
  .deferbox { background:rgba(120,140,170,.12); border:1px solid #3a4456; border-left:3px solid #8aa0c0; border-radius:8px; padding:10px 12px; margin-bottom:12px; font-size:13px; line-height:1.6; }
  .deferbox b { color:#b9c6dc; }
  .defertag { font-size:11px; font-weight:700; padding:2px 8px; border-radius:6px; background:rgba(138,160,192,.18); color:#aebcd4; white-space:nowrap; }
  .story { background:#12161d; border-left:3px solid var(--feature); border-radius:6px; padding:10px 12px; margin-bottom:12px; font-size:13.5px; line-height:1.7; }
  .children { display:flex; flex-direction:column; gap:10px; margin-bottom:12px; }
  .child { border:1px solid var(--line); border-radius:8px; padding:10px 12px; background:#12161d; }
  .child-ttl { font-weight:700; font-size:13.5px; margin-bottom:8px; color:var(--feature); display:flex; align-items:center; gap:8px; }
  .cease { margin-left:auto; font-size:11px; font-weight:700; padding:1px 8px; border-radius:6px; }
  .cease.lo { background:rgba(255,107,107,.18); color:var(--lo); }
  .cease.mid { background:rgba(255,194,78,.18); color:var(--mid); }
  .cease.hi { background:rgba(51,211,158,.18); color:var(--hi); }
  .child .story { background:#0f1218; margin-bottom:8px; }
  .child .grid2 { margin-bottom:8px; }
  .childnote { font-size:12px; color:var(--mut); background:#0f1218; border:1px dashed var(--line); border-radius:6px; padding:8px 10px; line-height:1.6; }
  .childnote b { color:#cdd3df; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; }
  @media (max-width:640px){ .grid2 { grid-template-columns:1fr; } }
  .cell { background:#12161d; border:1px solid var(--line); border-radius:6px; padding:9px 11px; }
  .lbl { font-size:11px; color:var(--mut); text-transform:uppercase; letter-spacing:.4px; margin-bottom:3px; }
  .val { font-size:13px; }

  .scores { display:flex; flex-direction:column; gap:6px; background:#12161d; border:1px solid var(--line); border-radius:8px; padding:11px 13px; margin-bottom:12px; }
  .srow { display:flex; align-items:center; gap:10px; }
  .slbl { font-size:12px; color:var(--mut); width:150px; flex-shrink:0; }
  .track { flex:1; height:7px; background:#262b36; border-radius:4px; overflow:hidden; }
  .fill { display:block; height:100%; border-radius:4px; }
  .fill.lo { background:var(--lo); } .fill.mid { background:var(--mid); } .fill.hi { background:var(--hi); }
  .sval { width:22px; text-align:right; font-size:12px; font-weight:600; }
  .iceBig { margin-top:4px; padding-top:8px; border-top:1px dashed var(--line); font-size:13px; color:var(--mut); }
  .iceBig b { font-size:18px; color:var(--fg); }

  .impl { background:#12161d; border:1px solid var(--line); border-radius:8px; padding:10px 13px; margin-bottom:10px; display:grid; gap:5px; font-size:13px; }
  .impl div span { color:var(--mut); display:inline-block; width:54px; }
  .evidence { background:#12161d; border:1px solid var(--line); border-left:3px solid var(--mon); border-radius:8px; padding:10px 13px; margin-bottom:12px; }
  .evtitle { font-size:11px; color:var(--mon); text-transform:uppercase; letter-spacing:.4px; margin-bottom:6px; }
  .evidence ul { margin:0; padding-left:18px; }
  .evidence li { margin-bottom:4px; font-size:13px; line-height:1.55; }
  .evidence .src { color:var(--mut); font-size:12px; }
  .evidence a.src { color:var(--feature); text-decoration:none; }
  .evidence a.src:hover { text-decoration:underline; }
  .metaline { display:flex; gap:14px; flex-wrap:wrap; font-size:11.5px; color:var(--mut); }
  .metaline b { color:var(--fg); font-weight:600; }

  /* status + edit */
  .status { font-size:11px; font-weight:700; padding:2px 8px; border-radius:6px; }
  .status.todo { background:#242a36; color:var(--mut); }
  .status.doing { background:rgba(78,161,255,.18); color:var(--feature); }
  .status.done { background:rgba(51,211,158,.18); color:var(--hi); }
  body.edit .status { cursor:pointer; }
  .card.done .ttl { text-decoration:line-through; opacity:.6; }
  .card.done { opacity:.7; }
  .editbtn { display:none; font-size:12px; color:var(--mut); background:var(--card2); border:1px solid var(--line); border-radius:6px; padding:3px 10px; cursor:pointer; margin-bottom:10px; }
  body.edit .editbtn { display:inline-block; }
  .editbtn:hover { color:var(--fg); }
  .editpanel { display:none; background:#0f1218; border:1px solid var(--feature); border-radius:8px; padding:12px; margin-bottom:12px; }
  .editpanel.on { display:block; }
  .editrow { display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:8px; }
  .editrow label { font-size:11px; color:var(--mut); display:flex; flex-direction:column; gap:2px; }
  .editpanel input, .editpanel select, .editpanel textarea { background:var(--card2); color:var(--fg); border:1px solid var(--line); border-radius:6px; padding:5px 7px; font-size:13px; font-family:inherit; }
  .editpanel input.t { width:100%; }
  .editpanel input.n { width:54px; }
  .editpanel textarea { width:100%; min-height:48px; }
  .editpanel textarea.json { min-height:160px; font-family:ui-monospace,Menlo,monospace; font-size:12px; }
  .editactions { display:flex; gap:8px; align-items:center; margin-top:6px; }
  .btn { border:none; border-radius:6px; padding:6px 14px; font-size:13px; font-weight:600; cursor:pointer; }
  .btn.save { background:var(--feature); color:#06121f; }
  .btn.cancel { background:var(--card2); color:var(--fg); border:1px solid var(--line); }
  .btn.adv { background:none; color:var(--mut); border:1px dashed var(--line); margin-left:auto; }
  .btn.del { background:rgba(255,107,107,.16); color:var(--lo); }
  .savemsg { font-size:12px; color:var(--hi); }
  .savemsg.err { color:var(--lo); }
</style>
</head>
<body>
<header>
  <h1>tplab 백로그 <span class="sub" id="meta"></span></h1>
  <div class="sub" id="metanote"></div>
  <div class="nav"><span class="cur">📋 기능</span> · <a href="./stories.html">🎯 유저스토리 →</a></div>
</header>
<div class="summary" id="summary"></div>
<div class="controls">
  <label>유형<select id="f-type"><option value="">전체</option><option value="feature">feature</option><option value="engineering">engineering</option><option value="bugfix">bugfix</option></select></label>
  <label>테마<select id="f-theme"></select></label>
  <label>전략(goalFit)<select id="f-goal"><option value="">전체</option><option value="retention">retention</option><option value="monetization">monetization</option><option value="both">both</option><option value="foundational">foundational</option></select></label>
  <label>최소 Ease<select id="f-ease"><option value="0">0</option><option value="4">4+</option><option value="6">6+</option><option value="8">8+</option></select></label>
  <label>확인필요<select id="f-review"><option value="">전체</option><option value="1">확인 필요만</option></select></label>
  <label>정렬<select id="sort">
    <option value="ice">종합 ICE</option>
    <option value="P1">Impact: P1 공유러</option>
    <option value="P2">Impact: P2 성장러</option>
    <option value="ease">Ease</option>
    <option value="bang">우선순위(!)</option>
  </select></label>
  <label>검색<input type="search" id="q" placeholder="제목·문제·메모..."></label>
  <span class="count" id="count"></span>
</div>
<div class="hint" id="hint"></div>
<main id="list"></main>

<script type="application/json" id="backlog-data">__DATA__</script>
<script>
const DATA = JSON.parse(document.getElementById('backlog-data').textContent);
const personas = DATA.personas;
const ideas = DATA.ideas;
const pName = Object.fromEntries(personas.map(p => [p.id, p.name]));
const EDIT = ['localhost','127.0.0.1'].includes(location.hostname);  // 편집은 로컬 serve.py에서만; 배포본(CF Pages)은 읽기 전용
const STLABEL = {todo:'할 일', doing:'진행', done:'완료'};

function esc(s){ return (s==null?'':String(s)).replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function escA(s){ return esc(s).replace(/"/g,'&quot;'); }

async function saveUpdate(id, body){
  const res = await fetch('/api/update', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id, ...body})});
  if(!res.ok) throw new Error(await res.text());
  const j = await res.json();
  const k = ideas.findIndex(x=>x.id===id);
  if(k>=0) ideas[k] = j.idea;
  return j.idea;
}
function bang(n){ return n>0 ? '!'.repeat(n) : ''; }

// summary
const types = {feature:0, engineering:0, bugfix:0};
ideas.forEach(i=>types[i.type]++);
const nReview = ideas.filter(i=>i.review).length;
document.getElementById('meta').textContent = `· ${DATA.meta.product} · ${DATA.meta.generated}`;
document.getElementById('metanote').textContent = DATA.meta.note || '';
document.getElementById('summary').innerHTML =
  `<div class="stat"><b>${ideas.length}</b> 총 아이디어</div>` +
  `<div class="stat" style="color:var(--feature)"><b>${types.feature}</b> feature</div>` +
  `<div class="stat" style="color:var(--engineering)"><b>${types.engineering}</b> engineering</div>` +
  `<div class="stat" style="color:var(--bugfix)"><b>${types.bugfix}</b> bugfix</div>` +
  (nReview?`<div class="stat" style="color:var(--warn)"><b>${nReview}</b> ⚠️ 확인 필요</div>`:'') +
  personas.map(p=>`<div class="stat">${p.id} ${p.name}</div>`).join('');

const themes = [...new Set(ideas.map(i=>i.theme))].sort();
document.getElementById('f-theme').innerHTML = '<option value="">전체</option>' + themes.map(t=>`<option>${t}</option>`).join('');

['f-type','f-theme','f-goal','f-ease','f-review','sort'].forEach(id=>document.getElementById(id).addEventListener('change', render));
document.getElementById('q').addEventListener('input', render);

function render(){
  const ft = document.getElementById('f-type').value;
  const fth = document.getElementById('f-theme').value;
  const fg = document.getElementById('f-goal').value;
  const fe = +document.getElementById('f-ease').value;
  const fr = document.getElementById('f-review').value;
  const sort = document.getElementById('sort').value;
  const q = document.getElementById('q').value.trim().toLowerCase();

  let rows = ideas.filter(i=>
    (!ft||i.type===ft) && (!fth||i.theme===fth) &&
    (!fg||i.goalFit===fg) && ((i.ease||0)>=fe) && (!fr||i.review) &&
    (!q || JSON.stringify(i).toLowerCase().includes(q))
  );
  rows.sort((a,b)=>{
    if(sort==='ice') return (b.iceScore||0)-(a.iceScore||0);
    if(sort==='ease') return (b.ease||0)-(a.ease||0);
    if(sort==='bang') return (b.userPriority||0)-(a.userPriority||0) || (b.iceScore||0)-(a.iceScore||0);
    if(sort==='P1'||sort==='P2') return ((b.personaImpact?.[sort])||0)-((a.personaImpact?.[sort])||0);
    return 0;
  });
  document.getElementById('count').textContent = `${rows.length} / ${ideas.length}`;

  const CATS = DATA.meta.categories || {};
  const groups = Object.keys(CATS).map(cid => ({ cid, label: CATS[cid], items: rows.filter(r=>r.category===cid) })).filter(g=>g.items.length);
  document.getElementById('list').innerHTML = groups.map(g=>{
    const warn = g.items.filter(x=>x.review).length;
    return `<section class="cat open"><div class="cathead"><span class="arrow">▸</span> ${g.label} <span class="catcount">${g.items.length}${warn?` · ⚠️${warn}`:''}</span></div>
      <div class="catbody">${g.items.map(card).join('')}</div></section>`;
  }).join('');

  document.querySelectorAll('.cathead').forEach(h=>h.addEventListener('click',()=>h.parentElement.classList.toggle('open')));
  document.querySelectorAll('.head').forEach(h=>h.addEventListener('click',()=>h.parentElement.classList.toggle('open')));

  // status toggle
  document.querySelectorAll('.status').forEach(s=>s.addEventListener('click', async e=>{
    if(!EDIT) return;            // read-only: let click bubble (toggles card)
    e.stopPropagation();
    const id=s.dataset.id, cur=(ideas.find(x=>x.id===id).status)||'todo';
    const nxt={todo:'doing',doing:'done',done:'todo'}[cur];
    try{ await saveUpdate(id,{patch:{status:nxt}}); render(); }
    catch(err){ alert('저장 실패: '+err.message); }
  }));
  // edit open
  document.querySelectorAll('.editbtn').forEach(b=>b.addEventListener('click',()=>
    b.parentElement.querySelector('.editpanel').classList.toggle('on')));
  // edit panels
  document.querySelectorAll('.editpanel').forEach(panel=>{
    const id=panel.dataset.id, base=ideas.find(x=>x.id===id);
    panel.querySelector('.cancel').addEventListener('click',()=>panel.classList.remove('on'));
    panel.querySelector('.del').addEventListener('click', async ()=>{
      if(!confirm(`이 카드를 삭제할까요?\n\n${base.id} · ${base.title}`)) return;
      try{
        const res=await fetch('/api/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
        if(!res.ok) throw new Error(await res.text());
        const k=ideas.findIndex(x=>x.id===id); if(k>=0) ideas.splice(k,1);
        render();
      }catch(err){ alert('삭제 실패: '+err.message); }
    });
    const jsonTa=panel.querySelector('textarea.json');
    panel.querySelector('.adv').addEventListener('click',()=>{ jsonTa.style.display = jsonTa.style.display==='none'?'block':'none'; });
    panel.querySelector('.save').addEventListener('click', async ()=>{
      const msg=panel.querySelector('.savemsg'); msg.className='savemsg'; msg.textContent='저장 중...';
      try{
        let body;
        if(jsonTa.style.display!=='none'){ body={full: JSON.parse(jsonTa.value)}; }
        else {
          const patch={};
          panel.querySelectorAll('[data-f]').forEach(el=>{
            const f=el.dataset.f; if(f==='__json__'||f==='__evidence__') return;
            let v=el.value;
            if(['P1','P2','confidence','ease','userPriority'].includes(f)) v = (v===''?null:Number(v));
            if(f==='P1'||f==='P2'){ patch.personaImpact = patch.personaImpact||{...(base.personaImpact||{})}; patch.personaImpact[f]=v; }
            else patch[f]=v;
          });
          const evEl=panel.querySelector('[data-f="__evidence__"]');
          if(evEl){
            const ev=evEl.value.split('\\n').map(s=>s.trim()).filter(Boolean).map(l=>{
              const x=l.lastIndexOf('|');
              return x>=0?{point:l.slice(0,x).trim(), source:l.slice(x+1).trim()}:{point:l, source:''};
            });
            if(ev.length || (base.evidence&&base.evidence.length)) patch.evidence=ev;
          }
          body={patch};
        }
        await saveUpdate(id, body); render();
      }catch(err){ msg.className='savemsg err'; msg.textContent='실패: '+err.message; }
    });
  });
}

function card(i){
  const right = i.type==='feature' ? `<span class="ice">ICE ${i.iceScore||0}</span>` : `<span class="ice">Ease ${i.ease||0}</span>`;
  const gf = i.goalFit ? `<span class="gf gf-${i.goalFit}">${i.goalFit}</span>` : '';
  const bb = i.userPriority>0 ? `<span class="bang" title="우선순위">${bang(i.userPriority)}</span>` : '';
  const wm = i.review ? `<span class="warnmark" title="확인 필요">⚠️</span>` : '';
  const df = i.deferred ? `<span class="defertag" title="보류">⏸ 보류</span>` : '';
  const ch = (i.children&&i.children.length) ? `<span class="tag">🌿 ${i.children.length} use case</span>` : '';
  const st = i.status||'todo';
  const status = `<span class="status ${st}" data-id="${i.id}" title="${EDIT?'클릭해 상태 변경':''}">${STLABEL[st]}</span>`;
  return `<div class="card${i.review?' warn':''}${st==='done'?' done':''}" data-id="${i.id}"><div class="head">
    <span class="badge b-${i.type}">${i.type}</span>
    <span class="tid">${esc(i.id)}</span>
    <span class="ttl">${esc(i.title)}</span>
    ${wm}${df}${bb}${ch}${status}<span class="tag">${esc(i.theme)}</span>${gf}${right}
  </div><div class="body"><button class="editbtn" data-id="${i.id}">✏️ 편집</button>${editPanel(i)}${i.type==='feature'?featBody(i):engBody(i)}</div></div>`;
}

function editPanel(i){
  const isFeat=i.type==='feature'; const pi=i.personaImpact||{};
  const num=(f,v)=>`<label>${f}<input class="n" data-f="${f}" type="number" min="0" max="10" value="${v??''}"></label>`;
  const scores = isFeat
    ? num('P1',pi.P1)+num('P2',pi.P2)+num('confidence',i.confidence)+num('ease',i.ease)
    : num('ease',i.ease);
  const sel=(f,opts,cur)=>`<label>${f}<select data-f="${f}">${opts.map(o=>`<option value="${o[0]}" ${cur==o[0]?'selected':''}>${o[1]}</option>`).join('')}</select></label>`;
  return `<div class="editpanel" data-id="${i.id}">
    <div class="editrow"><label style="flex:1">제목<input class="t" data-f="title" value="${escA(i.title)}"></label></div>
    <div class="editrow">
      ${sel('status',[['todo','할 일'],['doing','진행'],['done','완료']], i.status||'todo')}
      <label>theme<input data-f="theme" value="${escA(i.theme||'')}"></label>
      ${isFeat?sel('goalFit',[['retention','retention'],['monetization','monetization'],['both','both'],['foundational','foundational']], i.goalFit||''):''}
      ${sel('userPriority',[[0,0],[1,1],[2,2],[3,3],[4,4]], i.userPriority||0)}
      ${scores}
    </div>
    <div class="editrow"><label style="flex:1">⏸ 보류 사유 (입력 시 '보류'로 표시, 비우면 해제)<textarea data-f="deferred">${esc(i.deferred||'')}</textarea></label></div>
    <div class="editrow"><label style="flex:1">비고<textarea data-f="notes">${esc(i.notes||'')}</textarea></label></div>
    <div class="editrow"><label style="flex:1">🔍 Confidence 근거·출처 (한 줄당: 설명 | 출처)<textarea data-f="__evidence__">${esc((i.evidence||[]).map(e=>e.point+(e.source?(' | '+e.source):'')).join('\\n'))}</textarea></label></div>
    <textarea class="json" style="display:none" data-f="__json__">${esc(JSON.stringify(i,null,2))}</textarea>
    <div class="editactions">
      <button class="btn save" data-id="${i.id}">저장</button>
      <button class="btn cancel">취소</button>
      <button class="btn del">🗑 삭제</button>
      <button class="btn adv">{ } 전체 JSON</button>
      <span class="savemsg"></span>
    </div>
  </div>`;
}

function bar(label,val){
  val=val||0; const cls=val>=7?'hi':val>=4?'mid':'lo';
  return `<div class="srow"><span class="slbl">${label}</span><span class="track"><span class="fill ${cls}" style="width:${val*10}%"></span></span><span class="sval">${val}</span></div>`;
}
function cell(label,val){ return val? `<div class="cell"><div class="lbl">${label}</div><div class="val">${val}</div></div>`:''; }
function reviewBox(i){ return i.review? `<div class="review"><b>⚠️ 확인 필요</b> — ${esc(i.review)}</div>`:''; }
function deferBox(i){ return i.deferred? `<div class="deferbox"><b>⏸ 보류 사유</b> — ${esc(i.deferred)}</div>`:''; }
function implBlock(i){
  if(!i.implementation) return ''; const m=i.implementation;
  return `<div class="impl"><div><span>재사용</span>${esc(m.reuse)}</div><div><span>신규</span>${esc(m.new)}</div><div><span>시너지</span>${esc(m.synergy)}</div></div>`;
}
function evidenceBlock(i){
  if(!i.evidence||!i.evidence.length) return '';
  const items=i.evidence.map(e=>{
    let src='';
    if(e.source) src = e.source.startsWith('http') ? `<a href="${escA(e.source)}" target="_blank" class="src">${esc(e.source)}</a>` : `<span class="src">${esc(e.source)}</span>`;
    return `<li>${esc(e.point)}${src?' — '+src:''}</li>`;
  }).join('');
  return `<div class="evidence"><div class="evtitle">🔍 Confidence 근거·출처</div><ul>${items}</ul></div>`;
}
function metaLine(i){
  const parts=[];
  if(i.source) parts.push(`출처: <b>${esc((i.source||[]).join(', '))}</b>`);
  if(i.notes) parts.push(`비고: ${esc(i.notes)}`);
  return parts.length? `<div class="metaline">${parts.join('')}</div>`:'';
}
function storyHtml(us){ return `As a <b>${esc(us.as)}</b>,<br>I want ${esc(us.want)},<br>so that <b>${esc(us.soThat)}</b>`; }
function storyBox(us){ return us?`<div class="story">💡 ${storyHtml(us)}</div>`:''; }
function probAlt(o){
  const c = cell('문제 상황', esc(o.problem)) + cell('현재 대안', esc(o.alternatives));
  return c?`<div class="grid2">${c}</div>`:'';
}
function featBody(i){
  const imp = i.personaImpact ? Object.entries(i.personaImpact).map(([k,v])=>bar(`Impact · ${k} ${pName[k]||''}`, v)).join('') : '';
  let top;
  if(i.children && i.children.length){
    top = `<div class="children">` + i.children.map(c=>{
      const ec = c.ease!=null ? `<span class="cease ${c.ease>=7?'hi':c.ease>=4?'mid':'lo'}">Ease ${c.ease}</span>` : '';
      return `<div class="child"><div class="child-ttl">${esc(c.title)}${ec}</div>${storyBox(c.userStory)}${probAlt(c)}${c.note?`<div class="childnote"><b>배경·구현</b><br>${esc(c.note)}</div>`:''}</div>`;
    }).join('') + `</div>`;
  } else {
    top = storyBox(i.userStory) + probAlt(i);
  }
  return reviewBox(i) + deferBox(i) + top
    + `<div class="scores">${imp}${bar('Confidence', i.confidence)}${bar('Ease', i.ease)}<div class="iceBig">종합 ICE = max(Impact)×C×E = <b>${i.iceScore}</b></div></div>`
    + evidenceBlock(i) + implBlock(i) + metaLine(i);
}
function engBody(i){
  return reviewBox(i) + deferBox(i)
    + `<div class="grid2">${cell('왜 필요한가 (rationale)', esc(i.rationale))}${cell('받쳐주는 가치 (enables)', esc(i.enables))}</div>`
    + `<div class="scores">${bar('Ease', i.ease)}</div>`
    + evidenceBlock(i) + implBlock(i) + metaLine(i);
}

document.getElementById('hint').innerHTML = `ICE = max(페르소나 Impact) × Confidence × Ease (각 1~10). feature만 ICE, engineering·bugfix는 Ease 기준. ! = 메모 원본 우선순위. <b style="color:var(--warn)">⚠️ = 해석 확인 필요</b>.`
  + (EDIT ? ` <b style="color:var(--hi)">✎ 편집 모드</b> — 상태칩 클릭으로 완료 토글, ✏️ 편집으로 수정.` : ` (읽기 전용 — 편집하려면 <b>python serve.py</b>로 여세요)`);
document.body.classList.toggle('edit', EDIT);
render();
</script>
</body>
</html>
"""

out = HTML.replace("__DATA__", embedded)
(ROOT / "index.html").write_text(out, encoding="utf-8")
print(f"index.html 생성: {len(data['ideas'])} ideas, review-flagged: {sum(1 for i in data['ideas'] if i.get('review'))}")

# ===================== 유저스토리 페이지 =====================
STORIES_HTML = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>tplab 유저스토리</title>
<style>
  :root { --bg:#0f1115; --card:#171a21; --card2:#1e222b; --line:#2a2f3a; --fg:#e8eaf0; --mut:#9aa3b2;
          --feature:#4ea1ff; --engineering:#b48cff; --bugfix:#ff9f43; --ret:#33d39e; --mon:#ffd34e;
          --lo:#ff6b6b; --mid:#ffc24e; --hi:#33d39e; --p1:#4ea1ff; --p2:#33d39e; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
  header { padding:20px 24px 12px; border-bottom:1px solid var(--line); }
  h1 { margin:0 0 4px; font-size:20px; }
  .sub { color:var(--mut); font-size:12px; }
  .nav { margin-top:7px; font-size:13px; }
  .nav a { color:var(--feature); text-decoration:none; } .nav a:hover { text-decoration:underline; }
  .nav .cur { font-weight:700; }
  .summary { display:flex; flex-wrap:wrap; gap:8px; padding:14px 24px; border-bottom:1px solid var(--line); }
  .stat { background:var(--card); border:1px solid var(--line); border-radius:8px; padding:6px 12px; font-size:12px; }
  .stat b { font-size:15px; }
  .controls { display:flex; flex-wrap:wrap; gap:10px; align-items:center; padding:14px 24px; border-bottom:1px solid var(--line); position:sticky; top:0; background:var(--bg); z-index:5; }
  .controls label { font-size:12px; color:var(--mut); display:flex; flex-direction:column; gap:3px; }
  select, input[type=search] { background:var(--card2); color:var(--fg); border:1px solid var(--line); border-radius:6px; padding:6px 8px; font-size:13px; }
  input[type=search] { min-width:200px; }
  .count { margin-left:auto; color:var(--mut); font-size:12px; }
  main { padding:14px 24px 60px; display:flex; flex-direction:column; gap:9px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:10px; overflow:hidden; }
  .head { display:flex; align-items:center; gap:9px; padding:12px 14px; cursor:pointer; }
  .head:hover { background:var(--card2); }
  .uid { font-family:ui-monospace,Menlo,monospace; font-size:12px; color:var(--mut); flex-shrink:0; }
  .ttl { font-weight:600; flex:1; }
  .pchip { font-size:11px; font-weight:700; padding:2px 8px; border-radius:6px; white-space:nowrap; }
  .p-P1 { background:rgba(78,161,255,.16); color:var(--p1); }
  .p-P2 { background:rgba(51,211,158,.16); color:var(--p2); }
  .tag { font-size:11px; color:var(--mut); background:var(--card2); border:1px solid var(--line); padding:2px 7px; border-radius:6px; white-space:nowrap; }
  .val { background:#262b36; color:#fff; font-weight:700; border-radius:6px; padding:2px 9px; font-size:12px; white-space:nowrap; }
  .body { padding:14px 16px 16px; border-top:1px solid var(--line); display:none; }
  .card.open .body { display:block; }
  .story { background:#12161d; border-left:3px solid var(--feature); border-radius:6px; padding:11px 13px; margin-bottom:12px; font-size:13.5px; line-height:1.7; }
  .scores { display:flex; flex-direction:column; gap:6px; background:#12161d; border:1px solid var(--line); border-radius:8px; padding:11px 13px; margin-bottom:12px; }
  .srow { display:flex; align-items:center; gap:10px; }
  .slbl { font-size:12px; color:var(--mut); width:150px; flex-shrink:0; }
  .track { flex:1; height:7px; background:#262b36; border-radius:4px; overflow:hidden; }
  .fill { display:block; height:100%; border-radius:4px; }
  .fill.lo{background:var(--lo)} .fill.mid{background:var(--mid)} .fill.hi{background:var(--hi)}
  .sval { width:22px; text-align:right; font-size:12px; font-weight:600; }
  .valBig { margin-top:4px; padding-top:8px; border-top:1px dashed var(--line); font-size:13px; color:var(--mut); }
  .valBig b { font-size:18px; color:var(--fg); }
  .flbl { font-size:11px; color:var(--mut); text-transform:uppercase; letter-spacing:.4px; margin:2px 0 7px; }
  .frow { display:flex; align-items:center; gap:8px; padding:7px 10px; background:#12161d; border:1px solid var(--line); border-radius:7px; margin-bottom:6px; }
  .badge { font-size:10px; font-weight:700; padding:2px 6px; border-radius:5px; white-space:nowrap; text-transform:uppercase; }
  .b-feature{background:rgba(78,161,255,.16);color:var(--feature)} .b-engineering{background:rgba(180,140,255,.16);color:var(--engineering)} .b-bugfix{background:rgba(255,159,67,.16);color:var(--bugfix)}
  .fid { font-family:ui-monospace,Menlo,monospace; font-size:11px; color:var(--mut); flex-shrink:0; }
  .ftt { flex:1; font-size:13px; }
  .ez { font-size:11px; font-weight:700; padding:1px 7px; border-radius:5px; white-space:nowrap; }
  .ez.lo{background:rgba(255,107,107,.18);color:var(--lo)} .ez.mid{background:rgba(255,194,78,.18);color:var(--mid)} .ez.hi{background:rgba(51,211,158,.18);color:var(--hi)}
  .stt { font-size:11px; font-weight:700; padding:1px 7px; border-radius:5px; white-space:nowrap; }
  .s-todo{background:#242a36;color:var(--mut)} .s-doing{background:rgba(78,161,255,.18);color:var(--feature)} .s-done{background:rgba(51,211,158,.18);color:var(--hi)}
  .card.done-all { opacity:.7; }
  .hint { color:var(--mut); font-size:12px; padding:10px 24px 0; }
  .editbtn { display:none; font-size:12px; color:var(--mut); background:var(--card2); border:1px solid var(--line); border-radius:6px; padding:3px 10px; cursor:pointer; margin-bottom:10px; }
  body.edit .editbtn { display:inline-block; }
  .editpanel { display:none; background:#0f1218; border:1px solid var(--feature); border-radius:8px; padding:12px; margin-bottom:12px; }
  .editpanel.on { display:block; }
  .erow { display:flex; gap:8px; flex-wrap:wrap; align-items:flex-start; margin-bottom:8px; }
  .erow label { font-size:11px; color:var(--mut); display:flex; flex-direction:column; gap:2px; }
  .editpanel input, .editpanel select, .editpanel textarea { background:var(--card2); color:var(--fg); border:1px solid var(--line); border-radius:6px; padding:5px 7px; font-size:13px; font-family:inherit; }
  .editpanel textarea { width:100%; min-height:54px; }
  .editpanel input.n { width:54px; }
  .eact { display:flex; gap:8px; align-items:center; margin-top:4px; }
  .btn { border:none; border-radius:6px; padding:6px 14px; font-size:13px; font-weight:600; cursor:pointer; }
  .btn.save { background:var(--feature); color:#06121f; }
  .btn.cancel { background:var(--card2); color:var(--fg); border:1px solid var(--line); }
  .savemsg { font-size:12px; color:var(--hi); } .savemsg.err { color:var(--lo); }
</style>
</head>
<body>
<header>
  <h1>tplab 유저스토리 <span class="sub" id="meta"></span></h1>
  <div class="nav"><a href="./index.html">📋 기능</a> · <span class="cur">🎯 유저스토리</span></div>
</header>
<div class="summary" id="summary"></div>
<div class="controls">
  <label>페르소나<select id="f-persona"><option value="">전체</option><option value="P1">P1 공유러</option><option value="P2">P2 성장러</option></select></label>
  <label>테마<select id="f-theme"></select></label>
  <label>정렬<select id="sort">
    <option value="value">가치 (max Impact × Confidence)</option>
    <option value="P1">Impact: P1</option>
    <option value="P2">Impact: P2</option>
    <option value="conf">Confidence</option>
  </select></label>
  <label>검색<input type="search" id="q" placeholder="스토리·기능..."></label>
  <span class="count" id="count"></span>
</div>
<div class="hint">스토리 = 가치(Impact 페르소나별 × Confidence). 각 스토리 아래 그걸 달성하는 기능들(Ease·상태). 기능 상세/편집은 📋 기능 페이지.</div>
<main id="list"></main>

<script type="application/json" id="backlog-data">__DATA__</script>
<script>
const DATA = JSON.parse(document.getElementById('backlog-data').textContent);
const personas = DATA.personas, ideas = DATA.ideas, stories = DATA.stories || [];
const pName = Object.fromEntries(personas.map(p=>[p.id,p.name]));
const ideaById = Object.fromEntries(ideas.map(i=>[i.id,i]));
const STL = {todo:'할 일', doing:'진행', done:'완료'};
function esc(s){ return (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function escA(s){ return esc(s).replace(/"/g,'&quot;'); }
const EDIT = ['localhost','127.0.0.1'].includes(location.hostname);  // 편집은 로컬 serve.py에서만
async function saveStory(id, body){
  const res = await fetch('/api/story', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id, ...body})});
  if(!res.ok) throw new Error(await res.text());
  const j = await res.json();
  const k = stories.findIndex(x=>x.id===id); if(k>=0) stories[k]=j.story;
  return j.story;
}
function editPanel(s){
  const pi=s.impact||{};
  const psel=['P1','P2'].map(p=>`<option value="${p}" ${s.persona===p?'selected':''}>${p} ${pName[p]||''}</option>`).join('');
  return `<div class="editpanel" data-id="${s.id}">
    <div class="erow"><label style="flex:1">유저스토리 문장<textarea data-f="sentence">${esc(s.sentence||'')}</textarea></label></div>
    <div class="erow">
      <label>페르소나<select data-f="persona">${psel}</select></label>
      <label>테마<input data-f="theme" value="${escA(s.theme||'')}"></label>
      <label>P1<input class="n" data-f="P1" type="number" min="0" max="10" value="${pi.P1??''}"></label>
      <label>P2<input class="n" data-f="P2" type="number" min="0" max="10" value="${pi.P2??''}"></label>
      <label>Conf<input class="n" data-f="confidence" type="number" min="0" max="10" value="${s.confidence??''}"></label>
    </div>
    <div class="erow"><label style="flex:1">비고<textarea data-f="notes">${esc(s.notes||'')}</textarea></label></div>
    <div class="eact"><button class="btn save" data-id="${s.id}">저장</button><button class="btn cancel">취소</button><span class="savemsg"></span></div>
  </div>`;
}
function maxImpact(st){ return st.impact ? Math.max(...Object.values(st.impact)) : 0; }
function value(st){ return maxImpact(st) * (st.confidence||0); }
function bar(label,val){ val=val||0; const c=val>=7?'hi':val>=4?'mid':'lo';
  return `<div class="srow"><span class="slbl">${label}</span><span class="track"><span class="fill ${c}" style="width:${val*10}%"></span></span><span class="sval">${val}</span></div>`; }

document.getElementById('meta').textContent = `· ${stories.length} stories · ${ideas.length} features`;
const byp = {P1:0,P2:0}; stories.forEach(s=>byp[s.persona]=(byp[s.persona]||0)+1);
document.getElementById('summary').innerHTML =
  `<div class="stat"><b>${stories.length}</b> 유저스토리</div>` +
  `<div class="stat" style="color:var(--p1)"><b>${byp.P1||0}</b> P1 공유러</div>` +
  `<div class="stat" style="color:var(--p2)"><b>${byp.P2||0}</b> P2 성장러</div>` +
  `<div class="stat"><b>${ideas.length}</b> 매핑 기능</div>`;
const themes = [...new Set(stories.map(s=>s.theme).filter(Boolean))].sort();
document.getElementById('f-theme').innerHTML = '<option value="">전체</option>' + themes.map(t=>`<option>${t}</option>`).join('');
['f-persona','f-theme','sort'].forEach(id=>document.getElementById(id).addEventListener('change',render));
document.getElementById('q').addEventListener('input',render);

function render(){
  const fp=document.getElementById('f-persona').value, ft=document.getElementById('f-theme').value;
  const sort=document.getElementById('sort').value, q=document.getElementById('q').value.trim().toLowerCase();
  let rows = stories.filter(s=>(!fp||s.persona===fp)&&(!ft||s.theme===ft)&&(!q||JSON.stringify(s).toLowerCase().includes(q)
    || (s.featureIds||[]).some(fid=>ideaById[fid]&&JSON.stringify(ideaById[fid]).toLowerCase().includes(q))));
  rows.sort((a,b)=>{
    if(sort==='value') return value(b)-value(a);
    if(sort==='conf') return (b.confidence||0)-(a.confidence||0);
    return ((b.impact&&b.impact[sort])||0)-((a.impact&&a.impact[sort])||0);
  });
  document.getElementById('count').textContent = `${rows.length} / ${stories.length}`;
  document.getElementById('list').innerHTML = rows.map(card).join('');
  document.querySelectorAll('.head').forEach(h=>h.addEventListener('click',()=>h.parentElement.classList.toggle('open')));
  document.querySelectorAll('.editbtn').forEach(b=>b.addEventListener('click',()=>b.parentElement.querySelector('.editpanel').classList.toggle('on')));
  document.querySelectorAll('.editpanel').forEach(panel=>{
    const id=panel.dataset.id, base=stories.find(x=>x.id===id);
    panel.querySelector('.cancel').addEventListener('click',()=>panel.classList.remove('on'));
    panel.querySelector('.save').addEventListener('click', async ()=>{
      const msg=panel.querySelector('.savemsg'); msg.className='savemsg'; msg.textContent='저장 중...';
      try{
        const patch={};
        panel.querySelectorAll('[data-f]').forEach(el=>{
          const f=el.dataset.f; let v=el.value;
          if(['P1','P2','confidence'].includes(f)) v = (v===''?null:Number(v));
          if(f==='P1'||f==='P2'){ patch.impact = patch.impact||{...(base.impact||{})}; patch.impact[f]=v; }
          else patch[f]=v;
        });
        await saveStory(id,{patch}); render();
      }catch(err){ msg.className='savemsg err'; msg.textContent='실패: '+err.message; }
    });
  });
}
function frow(fid){
  const i=ideaById[fid]; if(!i) return `<div class="frow"><span class="fid">${esc(fid)}</span><span class="ftt" style="color:var(--lo)">(없는 기능)</span></div>`;
  const ez = i.ease!=null ? `<span class="ez ${i.ease>=7?'hi':i.ease>=4?'mid':'lo'}">Ease ${i.ease}</span>` : '';
  const st = i.status||'todo';
  const ice = i.type==='feature' ? `<span class="tag">ICE ${i.iceScore||0}</span>` : '';
  return `<div class="frow"><span class="badge b-${i.type}">${i.type}</span><span class="fid">${esc(i.id)}</span><span class="ftt">${esc(i.title)}</span>${ice}${ez}<span class="stt s-${st}">${STL[st]}</span></div>`;
}
function card(s){
  const imp = s.impact ? Object.entries(s.impact).map(([k,v])=>bar(`Impact · ${k} ${pName[k]||''}`,v)).join('') : '';
  const fids = s.featureIds || [];
  const doneAll = fids.length && fids.every(f=>ideaById[f] && (ideaById[f].status==='done'));
  const story = esc(s.sentence || s.want || '');
  return `<div class="card${doneAll?' done-all':''}"><div class="head">
    <span class="uid">${esc(s.id)}</span>
    <span class="ttl">${esc(s.sentence || s.want)}</span>
    <span class="pchip p-${s.persona}">${s.persona} ${pName[s.persona]||''}</span>
    ${s.theme?`<span class="tag">${esc(s.theme)}</span>`:''}
    <span class="tag">${fids.length} 기능</span>
    <span class="val">가치 ${value(s)}</span>
  </div><div class="body">
    <button class="editbtn" data-id="${s.id}">✏️ 편집</button>${editPanel(s)}
    <div class="story">🎯 ${story}</div>
    <div class="scores">${imp}${bar('Confidence', s.confidence)}<div class="valBig">가치 = max(Impact) × Confidence = <b>${value(s)}</b></div></div>
    ${s.notes?`<div class="flbl">비고</div><div style="font-size:12.5px;color:var(--mut);margin-bottom:12px">${esc(s.notes)}</div>`:''}
    <div class="flbl">달성 기능 (${fids.length})</div>
    ${fids.map(frow).join('')}
  </div></div>`;
}
document.body.classList.toggle('edit', EDIT);
render();
</script>
</body>
</html>
"""
(ROOT / "stories.html").write_text(STORIES_HTML.replace("__DATA__", embedded), encoding="utf-8")
print(f"stories.html 생성: {len(data.get('stories', []))} stories")
