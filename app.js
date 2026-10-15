'use strict';
const KEY = 'tfcc-circuit-tracker-v2';
const OLD_KEY = 'tfcc-tracker-v1';
const $ = id => document.getElementById(id);
let config;
let store;
let steps = [];
let stepIndex = 0;

const fresh = () => ({version:2, values:{}, active:null});
function loadStore() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    if (value && value.version === 2 && value.values && typeof value.values === 'object') return value;
  } catch (_) {}
  // One-time migration: keep the latest recorded values, not the old session history.
  const migrated = fresh();
  try {
    const old = JSON.parse(localStorage.getItem(OLD_KEY));
    const sessions = [...(Array.isArray(old?.sessions) ? old.sessions : []), ...Object.values(old?.drafts || {})]
      .filter(s => s && typeof s.date === 'string')
      .sort((a,b) => a.date.localeCompare(b.date));
    for (const s of sessions) for (const [id, entry] of Object.entries(s.exercises || {})) {
      if (!entry || typeof entry !== 'object') continue;
      migrated.values[id] = {weight:String(entry.weight ?? ''), comment:String(entry.comment ?? '')};
    }
  } catch (_) {}
  return migrated;
}
function save() {
  try {localStorage.setItem(KEY, JSON.stringify(store)); if ($('save-status')) $('save-status').textContent = '已保存到本设备';}
  catch (_) {if ($('save-status')) $('save-status').textContent = '保存失败，请检查浏览器存储设置';}
}
function show(id) {
  for (const el of document.querySelectorAll('.screen')) el.hidden = el.id !== id;
  window.scrollTo(0,0);
}
function selectedRounds() {return Number(document.querySelector('input[name="rounds"]:checked').value);}
function generateSteps(rounds) {
  const result = [];
  for (let ci=0; ci<config.circuits.length; ci++) {
    const circuit=config.circuits[ci];
    for (let round=1; round<=rounds; round++) {
      for (const exercise of circuit.exercises) result.push({ci,round,exercise});
    }
  }
  return result;
}
function renderOverview() {
  const root=$('overview');root.replaceChildren();
  for (const c of config.circuits) {
    const section=document.createElement('div');section.className='overview-circuit';
    const title=document.createElement('strong');title.textContent=c.name;
    const desc=document.createElement('span');desc.textContent=c.exercises.map(e=>e.name).join(' · ');
    section.append(title,desc);root.append(section);
  }
}
function renderStep() {
  if (!store.active) return show('home');
  steps=generateSteps(store.active.rounds);
  stepIndex=Math.max(0,Math.min(store.active.index,steps.length-1));
  const current=steps[stepIndex],circuit=config.circuits[current.ci],ex=current.exercise;
  $('progress-label').textContent=`第 ${stepIndex+1} / ${steps.length} 个动作`;
  $('progress-track').setAttribute('aria-valuenow',String(Math.round((stepIndex+1)/steps.length*100)));
  $('progress-fill').style.width=`${(stepIndex+1)/steps.length*100}%`;
  $('circuit-tag').textContent=circuit.name;
  $('round-tag').textContent=`第 ${current.round} / ${store.active.rounds} 轮`;
  $('exercise-name').textContent=ex.name;
  $('exercise-hint').textContent=ex.hint || '';
  $('exercise-hint').hidden=!ex.hint;
  $('exercise-reps').textContent=ex.id==='pinch-block-lift'?'5–8 次 · 顶峰停留 1 秒':'8–10 次';
  const saved=store.values[ex.id]||{weight:'',comment:''};
  $('weight').value=saved.weight;
  $('comment').value=saved.comment;
  $('previous').hidden=stepIndex===0;
  $('next').textContent=stepIndex===steps.length-1?'完成训练 ✓':'下一个动作 →';
  show('workout');
}
function syncFields() {
  if (!store.active) return;
  const ex=steps[stepIndex]?.exercise;
  if (!ex) return;
  store.values[ex.id]={weight:$('weight').value,comment:$('comment').value};
  save();
}
function jump(index) {syncFields();store.active.index=index;save();renderStep();}
function home() {show('home');$('resume').hidden=!store.active;}
function start() {
  const rounds=selectedRounds();
  if (store.active && !confirm('确定开始新训练吗？已保存的重量和备注不会清除，但当前训练进度将重置。')) return;
  store.active={rounds,index:0};save();renderStep();
}
function finish() {
  syncFields();
  const rounds=store.active.rounds;
  store.active=null;
  save();
  $('finish-summary').textContent=`已完成 3 个循环，每个循环 ${rounds} 轮，共 ${steps.length} 个动作步骤。`;
  show('complete');
}
async function init() {
  try {const response=await fetch('exercises.json');if(!response.ok)throw Error();config=await response.json()}
  catch (_) {$('home').innerHTML='<div class="card">无法加载 exercises.json。请使用 GitHub Pages 或本地服务器打开网站，不要直接通过 file:// 打开。</div>';return;}
  store=loadStore();save();renderOverview();
  if (store.active && Number.isInteger(store.active.rounds) && store.active.rounds>=1 && store.active.rounds<=3 && Number.isInteger(store.active.index)) {
    document.querySelector(`input[name="rounds"][value="${store.active.rounds}"]`).checked=true;
  } else store.active=null;
  $('start').addEventListener('click',start);
  $('resume').addEventListener('click',renderStep);
  $('back-home').addEventListener('click',()=>{syncFields();home()});
  $('weight').addEventListener('input',syncFields);
  $('comment').addEventListener('input',syncFields);
  $('previous').addEventListener('click',()=>{if(stepIndex>0)jump(stepIndex-1)});
  $('next').addEventListener('click',()=>{if(stepIndex===steps.length-1)finish();else jump(stepIndex+1)});
  $('done-home').addEventListener('click',home);
  home();
}
init();
