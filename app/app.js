'use strict';
/* =========================================================
   Luna AI — eng kuchli AI'lar bitta ilovada
   Kalit faqat shu qurilmada (localStorage) saqlanadi.
   ========================================================= */
const VERSION = '1.0';
const API = 'https://openrouter.ai/api/v1';
const MAMMOTH_URL = 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js';
const XLSX_URL = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';

const DEFAULT_MODELS = [
  { name: 'Claude Opus 5.5', id: 'anthropic/claude-opus-5.5', on: true },
  { name: 'GPT-6.1 Sol', id: 'openai/gpt-6.1-sol', on: true },
  { name: 'Gemini 4 Argon', id: 'google/gemini-4-argon', on: true },
  { name: 'Qwen3.8 Max', id: 'qwen/qwen3.8-max-0902', on: true },
  { name: 'Kimi K3.1 Pro', id: 'moonshotai/kimi-k3.1-pro', on: true },
];
const EXTRA_MODELS = [
  { name: 'Claude Sonnet 5.5', id: 'anthropic/claude-sonnet-5.5' },
  { name: 'GPT-6 Astra', id: 'openai/gpt-6-astra' },
  { name: 'Grok 4.7', id: 'x-ai/grok-4.7' },
  { name: 'GPT-6 Luna', id: 'openai/gpt-6-luna' },
  { name: 'DeepSeek V4.1 Flash', id: 'deepseek/deepseek-v4.1-flash-1017' },
];
const ACCENTS = [
  { id: 'lavender', name: 'Lavanda', c1: '#c3b5ff', c2: '#7d67f5' },
  { id: 'ocean', name: 'Okean', c1: '#9ad2ff', c2: '#2f86ef' },
  { id: 'aurora', name: 'Shafaq', c1: '#8eecd0', c2: '#10a77a' },
  { id: 'sunset', name: 'Quyosh botishi', c1: '#ffc79e', c2: '#ef7438' },
  { id: 'rose', name: 'Atirgul', c1: '#ffb0d5', c2: '#e64c94' },
];
const DEFAULTS = {
  key: '', name: '', about: '',
  mode: 'fast', fastModel: 'anthropic/claude-sonnet-5.5',
  models: DEFAULT_MODELS, chair: 'anthropic/claude-opus-5.5', review: true, web: false,
  titleModel: 'openai/gpt-6-luna', imageModel: 'openai/gpt-image-2', imageRatio: '1:1',
  theme: 'dark', accent: 'lavender', liquid: true, motion: true, fontSize: 16,
  voiceLang: 'uz-UZ', spent: 0, sideOff: false,
};
const SUGG = [
  { ic: 'globe', t: 'Kafe uchun zamonaviy sayt yasab ber', mode: 'fast' },
  { ic: 'play', t: "Telefonda o'ynasa bo'ladigan kosmik o'yin yarat", mode: 'fast' },
  { ic: 'council', t: 'IELTS Writing Task 2 inshomni baholab ber', mode: 'council' },
  { ic: 'sparkle', t: 'Oy nurida yoritilgan kelajakdagi Samarqandni chiz', mode: 'image' },
];

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const isTouch = matchMedia('(pointer: coarse)').matches;
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches || !S.motion;
const isMobile = () => innerWidth < 900;
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
const fileSlug = s => (String(s || 'luna').toLowerCase().replace(/[^a-z0-9Ѐ-ӿ]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40) || 'luna');
const fmtSize = b => b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';

const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  clip: '<path d="M21 11.5 12.5 20a5.5 5.5 0 0 1-7.8-7.8l8.5-8.5a3.7 3.7 0 0 1 5.2 5.2l-8.4 8.4a1.8 1.8 0 0 1-2.6-2.6l7.8-7.8"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  up: '<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/>',
  stop: '<rect x="7" y="7" width="10" height="10" rx="2.5" fill="currentColor" stroke="none"/>',
  sliders: '<path d="M4 6h9M18 6h2M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15.5" cy="6" r="2.2"/><circle cx="9" cy="12" r="2.2"/><circle cx="17" cy="18" r="2.2"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  volume: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="m14 6 4 4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  pin: '<path d="M9 4h6l-1 6 4 4H6l4-4-1-6zM12 14v6"/>',
  dots: '<circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  file: '<path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="m16 10 5-3v10l-5-3"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  flip: '<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.7L4 15.5M4 20v-4.5h4.5"/>',
  bolt: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',
  council: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 1.8 6 5"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  sidebar: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/>',
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
function injectIcons(root = document) { $$('i[data-ic]', root).forEach(i => { i.outerHTML = ic(i.dataset.ic); }); }

/* ---------- settings ---------- */
let S = loadSettings();
function loadSettings() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem('luna.settings') || '{}') || {}; } catch {}
  return { ...JSON.parse(JSON.stringify(DEFAULTS)), ...s };
}
function saveSettings() { try { localStorage.setItem('luna.settings', JSON.stringify(S)); } catch {} }
function modelName(id) {
  const m = [...S.models, ...EXTRA_MODELS].find(x => x.id === id);
  return m ? m.name : String(id || '').split('/').pop();
}
function applyLook() {
  const r = document.documentElement;
  const t = S.theme === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : S.theme;
  r.dataset.theme = t;
  r.dataset.accent = S.accent;
  r.style.setProperty('--fs', S.fontSize + 'px');
  r.classList.toggle('no-liquid', !S.liquid);
  r.classList.toggle('no-motion', !S.motion);
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = t === 'light' ? '#e7eaf6' : '#0b1030';
}

/* ---------- storage (IndexedDB) ---------- */
const DB = {
  db: null,
  open() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('luna-ai', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('chats', { keyPath: 'id' });
      r.onsuccess = () => { this.db = r.result; res(); };
      r.onerror = () => rej(r.error);
    });
  },
  req(mode, fn) {
    return new Promise((res, rej) => {
      if (!this.db) return res(mode === 'readonly' ? [] : undefined);
      const r = fn(this.db.transaction('chats', mode).objectStore('chats'));
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  },
  all() { return this.req('readonly', s => s.getAll()); },
  put(c) { return this.req('readwrite', s => s.put(c)); },
  del(id) { return this.req('readwrite', s => s.delete(id)); },
  clear() { return this.req('readwrite', s => s.clear()); },
};
const plain = obj => JSON.parse(JSON.stringify(obj, (k, v) => (k.startsWith('_') ? undefined : v)));
async function persist(chat) {
  if (!chat || !chat.messages.length) return;
  try { await DB.put(plain(chat)); } catch (e) { console.warn('Saqlanmadi', e); }
}

/* ---------- model capabilities ---------- */
let MI = {};
function loadModelInfo() {
  try {
    const c = JSON.parse(localStorage.getItem('luna.mi') || 'null');
    if (c && Date.now() - c.t < 864e5 && c.m) { MI = c.m; return; }
  } catch {}
  fetch(API + '/models').then(r => r.json()).then(d => {
    const m = {};
    for (const x of d.data || []) m[x.id] = (x.architecture && x.architecture.input_modalities) || ['text'];
    MI = m;
    try { localStorage.setItem('luna.mi', JSON.stringify({ t: Date.now(), m })); } catch {}
  }).catch(() => {});
}
const can = (id, kind) => !MI[id] || MI[id].includes(kind);

/* ---------- markdown ---------- */
function mdLite(text) {
  const p = String(text).split(/```([\w+-]*)[^\n]*\n([\s\S]*?)(?:```|$)/g);
  let h = '';
  for (let i = 0; i < p.length; i += 3) {
    if (p[i] && p[i].trim()) h += `<p style="white-space:pre-wrap">${esc(p[i].trim())}</p>`;
    if (i + 2 < p.length) h += `<pre><code class="language-${esc(p[i + 1] || '')}">${esc(p[i + 2])}</code></pre>`;
  }
  return h;
}
function md(text) {
  if (window.marked && window.DOMPurify) {
    try { return DOMPurify.sanitize(marked.parse(String(text), { gfm: true })); } catch {}
  }
  return mdLite(text);
}
const isHtmlCode = (lang, src) => (/^(html|htm|xhtml|svg)$/.test(lang) && /<[a-z!]/i.test(src)) || /^\s*(<!doctype html|<html[\s>])/i.test(src);
const htmlTitle = src => ((src.match(/<title[^>]*>([^<]{1,80})<\/title>/i) || [])[1] || '').trim();
const LANG_NAMES = { js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript', py: 'Python', python: 'Python', html: 'HTML', css: 'CSS', json: 'JSON', sh: 'Terminal', bash: 'Terminal', jsx: 'React', tsx: 'React', java: 'Java', kotlin: 'Kotlin', dart: 'Dart', sql: 'SQL', cpp: 'C++', c: 'C', go: 'Go', php: 'PHP', swift: 'Swift' };
function enhance(root, final) {
  $$('pre > code', root).forEach(code => {
    const pre = code.parentElement;
    if (pre.parentElement && pre.parentElement.classList.contains('codebox')) return;
    const lang = ((code.className.match(/language-([\w+-]+)/) || [])[1] || '').toLowerCase();
    const src = code.textContent;
    const html = isHtmlCode(lang, src);
    const box = el('div', 'codebox');
    box._src = src;
    box._title = html ? htmlTitle(src) : '';
    pre.replaceWith(box);
    const bar = el('div', 'code-bar', `<span>${esc(LANG_NAMES[lang] || lang || 'Kod')}</span><div>${html ? `<button type="button" class="run" data-act="run">${ic('play')}Ishga tushirish</button>` : ''}<button type="button" data-act="copy">${ic('copy')}<span>Nusxa</span></button></div>`);
    box.append(bar, pre);
    if (!final) return;
    if (window.hljs && lang && hljs.getLanguage(lang)) { try { hljs.highlightElement(code); } catch {} }
    if (src.split('\n').length > 28) {
      box.classList.add('folded');
      box.insertAdjacentHTML('beforeend', `<div class="unfold"><button type="button" data-act="unfold">Kodni to'liq ko'rsatish</button></div>`);
    }
    if (html) box.before(projectCard(src));
  });
}
function projectCard(src) {
  const t = htmlTitle(src) || 'Tayyor loyiha';
  const c = el('div', 'project glass liquid', `<div class="pj-ic">${ic('play')}</div><div class="pj-tx"><b>${esc(t)}</b><small>Shu yerning o'zida ishga tushadi</small></div><div class="btns"><button type="button" class="btn pri press" data-act="run">${ic('play')}Ochish</button><button type="button" class="btn press" data-act="dl">${ic('download')}Yuklab olish</button></div>`);
  c._src = src;
  c._title = t;
  return c;
}

/* ---------- moon ---------- */
let moonN = 0;
function moonSVG(phase = 1, cls = '') {
  const n = ++moonN;
  const cx = 50 - 100 * Math.max(0, Math.min(1, phase));
  return `<svg class="moon ${cls}" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="mg${n}" cx="38%" cy="32%" r="78%"><stop offset="0" stop-color="#fffdf5"/><stop offset=".55" stop-color="#ece7ff"/><stop offset="1" stop-color="#b3a9e6"/></radialGradient><mask id="mm${n}"><rect width="100" height="100" fill="#fff"/><circle class="msh" cx="${cx}" cy="50" r="45" fill="#000"/></mask></defs><circle cx="50" cy="50" r="44" class="moon-ghost"/><g mask="url(#mm${n})"><circle cx="50" cy="50" r="44" fill="url(#mg${n})"/><circle cx="35" cy="37" r="7" class="crater"/><circle cx="60" cy="59" r="10" class="crater"/><circle cx="63" cy="30" r="4" class="crater"/><circle cx="39" cy="66" r="4.5" class="crater"/></g></svg>`;
}
function setPhase(svg, p) {
  const c = svg && svg.querySelector('.msh');
  if (c) c.style.cx = (50 - 100 * Math.max(0, Math.min(1, p))) + 'px';
}

/* ---------- state ---------- */
let chats = [];
let cur = null;
let busy = false;
let ctl = null;
let pending = [];
let editIdx = null;
let stick = true;
let deferredInstall = null;
const chatBox = $('#chat');
const input = $('#input');

/* ---------- sidebar ---------- */
function dayGroup(t) {
  const d = new Date(t), now = new Date();
  const day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 864e5);
  if (diff < 1) return 'Bugun';
  if (diff < 2) return 'Kecha';
  if (diff < 7) return 'Oxirgi 7 kun';
  if (diff < 30) return 'Oxirgi 30 kun';
  try { return d.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' }); } catch { return d.getFullYear() + '-' + (d.getMonth() + 1); }
}
function renderSidebar() {
  const q = $('#search').value.trim().toLowerCase();
  const list = chats
    .filter(c => c.messages.length && (!q || (c.title || '').toLowerCase().includes(q) || c.messages.some(m => (m.text || '').toLowerCase().includes(q))))
    .sort((a, b) => (b.pinned - a.pinned) || (b.updated - a.updated));
  const h = $('#history');
  h.innerHTML = '';
  if (!list.length) {
    h.innerHTML = `<p class="empty">${q ? 'Hech narsa topilmadi.' : "Chatlaringiz shu yerda saqlanadi va o'zi nom oladi."}</p>`;
    return;
  }
  let last = '';
  for (const c of list) {
    const g = c.pinned ? 'Qadalgan' : dayGroup(c.updated);
    if (g !== last) { h.insertAdjacentHTML('beforeend', `<div class="group">${esc(g)}</div>`); last = g; }
    const it = el('div', 'hitem' + (cur && c.id === cur.id ? ' on' : ''));
    it.dataset.id = c.id;
    it.setAttribute('role', 'button');
    it.tabIndex = 0;
    it.innerHTML = `${c.pinned ? ic('pin', 'pin') : ''}<span class="ht">${esc(c.title || 'Yangi chat')}</span><button type="button" class="hmore" aria-label="Amallar">${ic('dots')}</button>`;
    h.appendChild(it);
  }
}
function typeTitle(id, title) {
  const it = $(`.hitem[data-id="${id}"] .ht`);
  if (!it || reducedMotion()) return;
  let i = 0;
  it.textContent = '';
  const tick = () => { it.textContent = title.slice(0, ++i); if (i < title.length) setTimeout(tick, 26); };
  tick();
}
function openSide() { if (isMobile()) $('#app').classList.add('side-open'); else { S.sideOff = false; saveSettings(); $('#app').classList.remove('side-off'); } }
function closeSide() { if (isMobile()) $('#app').classList.remove('side-open'); else { S.sideOff = true; saveSettings(); $('#app').classList.add('side-off'); } }
function closeSideMobile() { $('#app').classList.remove('side-open'); }
function toggleSide() {
  if (isMobile()) $('#app').classList.toggle('side-open');
  else if ($('#app').classList.contains('side-off')) openSide(); else closeSide();
}
function newChat() {
  cur = { id: uid(), title: '', created: Date.now(), updated: Date.now(), pinned: false, messages: [] };
  editIdx = null;
  renderChat();
  renderSidebar();
  closeSideMobile();
  if (!isTouch) input.focus();
}
function openChat(id) {
  const c = chats.find(x => x.id === id);
  if (!c) return;
  cur = c;
  editIdx = null;
  renderChat();
  renderSidebar();
  closeSideMobile();
}
function chatMenu(btn, c) {
  pop(btn, [
    { ic: 'pin', label: c.pinned ? 'Qadashni bekor qilish' : 'Tepaga qadash', fn: async () => { c.pinned = !c.pinned; await persist(c); renderSidebar(); } },
    { ic: 'edit', label: "Nomini o'zgartirish", fn: () => renameChat(c) },
    { ic: 'download', label: 'Yuklab olish', fn: () => download(new Blob([chatToMarkdown(c)], { type: 'text/markdown' }), fileSlug(c.title) + '.md') },
    { ic: 'trash', label: "O'chirish", danger: true, fn: () => deleteChat(c) },
  ]);
}
function renameChat(c) {
  const it = $(`.hitem[data-id="${c.id}"]`);
  if (!it) return;
  const span = it.querySelector('.ht');
  const inp = el('input');
  inp.value = c.title || '';
  inp.setAttribute('aria-label', 'Yangi nom');
  span.replaceWith(inp);
  inp.focus();
  inp.select();
  let done = false;
  const save = async ok => {
    if (done) return;
    done = true;
    if (ok && inp.value.trim()) { c.title = inp.value.trim().slice(0, 80); await persist(c); if (c === cur) setTopTitle(); }
    renderSidebar();
  };
  inp.onkeydown = e => { if (e.key === 'Enter') save(true); if (e.key === 'Escape') save(false); };
  inp.onblur = () => save(true);
  inp.onclick = e => e.stopPropagation();
}
async function deleteChat(c) {
  if (!(await confirmBox(`"${c.title || 'Yangi chat'}" chatini o'chirasizmi?`))) return;
  chats = chats.filter(x => x !== c);
  try { await DB.del(c.id); } catch {}
  if (cur === c) newChat(); else renderSidebar();
  toast("Chat o'chirildi");
}
function chatToMarkdown(c) {
  return `# ${c.title || 'Luna AI chat'}\n\n` + c.messages.map(m => `**${m.role === 'user' ? 'Siz' : 'Luna'}:**\n\n${m.role === 'user' ? userText(m) : (m.text || (m.images ? '[rasm]' : ''))}`).join('\n\n---\n\n');
}

/* ---------- chat view ---------- */
function setTopTitle() {
  $('#topTitle').textContent = cur.title || 'Luna AI';
  document.title = cur.title ? `${cur.title} — Luna AI` : 'Luna AI';
}
function renderChat() {
  chatBox.innerHTML = '';
  setTopTitle();
  if (!cur.messages.length) { chatBox.appendChild(welcomeEl()); return; }
  const col = el('div', 'col');
  cur.messages.forEach(m => col.appendChild(msgEl(m)));
  chatBox.appendChild(col);
  stick = true;
  requestAnimationFrame(() => { chatBox.scrollTop = chatBox.scrollHeight; });
}
function welcomeEl() {
  const w = el('div', 'welcome');
  const name = S.name.trim();
  w.innerHTML = `${moonSVG(0.12, 'hero-moon')}<h1>${name ? `Salom, ${esc(name)}!` : 'Salom!'}<br>Bugun nima yaratamiz?</h1><p class="sub">Savol bering, rasm yoki fayl yuboring. Sayt, o'yin yoki ilova so'rasangiz, Luna uni tayyor holda yasab beradi.</p>`;
  if (!S.key.trim()) {
    w.appendChild(el('div', 'key-card glass liquid', `<span class="kc-ic">${ic('key')}</span><div><b>Kalitni ulang</b>Luna ishlashi uchun Sozlamalarga OpenRouter kalitini bir marta qo'yasiz.</div><button type="button" class="btn pri press" data-act="open-key">Ulash</button>`));
  }
  const sg = el('div', 'sugg');
  SUGG.forEach(s => {
    const b = el('button', 'glass liquid press', `${ic(s.ic)}<span>${esc(s.t)}</span>`);
    b.type = 'button';
    b.onclick = () => { setMode(s.mode); input.value = s.t; autosize(); input.focus(); };
    sg.appendChild(b);
  });
  w.appendChild(sg);
  const hm = w.querySelector('.hero-moon');
  if (reducedMotion()) setPhase(hm, 1);
  else requestAnimationFrame(() => requestAnimationFrame(() => setPhase(hm, 1)));
  return w;
}
function msgEl(m) {
  if (m.role === 'user') return userEl(m);
  const n = el('div', 'msg ai');
  n.dataset.id = m.id;
  n.innerHTML = `<div class="av">${moonSVG(m.pending ? (m.phase || 0.08) : 1)}</div><div class="body"></div>`;
  fillAi(n, m);
  return n;
}
function userEl(m) {
  const n = el('div', 'msg user');
  n.dataset.id = m.id;
  if (m.atts && m.atts.length) {
    const g = el('div', 'ugal');
    m.atts.forEach(a => g.appendChild(attView(a)));
    n.appendChild(g);
  }
  const b = el('div', 'bubble');
  b.textContent = m.text || '';
  n.appendChild(b);
  n.appendChild(el('div', 'mfoot', `<button type="button" class="act press" data-act="m-copy" aria-label="Nusxa olish">${ic('copy')}</button><button type="button" class="act press" data-act="m-edit" aria-label="Tahrirlash">${ic('edit')}</button>`));
  return n;
}
const kindIcon = k => ({ image: 'image', video: 'video', audio: 'music', pdf: 'file', text: 'file', link: 'link' }[k] || 'file');
function attView(a) {
  if (a.kind === 'image') { const i = el('img'); i.src = a.data; i.alt = a.name || 'rasm'; i.dataset.act = 'view'; i.loading = 'lazy'; return i; }
  if (a.kind === 'video') { const v = el('video'); v.src = a.data; v.controls = true; v.playsInline = true; v.preload = 'metadata'; return v; }
  return el('span', 'fchip glass', `${ic(kindIcon(a.kind))}<span>${esc(a.kind === 'link' ? a.data : a.name)}</span>`);
}
function fillAi(n, m) {
  const b = n.querySelector('.body');
  b.innerHTML = '';
  if (m.pending && !m.text) b.appendChild(el('div', 'thinking', `${moonSVG(m.phase || 0.08)}<span class="lbl">${esc(m.stage || "Luna o'ylayapti")}</span>`));
  if (m.council && !(m.pending && m.text)) b.appendChild(councilEl(m));
  if (m.note) b.appendChild(el('div', 'note', esc(m.note)));
  if (m.text) {
    const c = el('div', 'md content');
    c.innerHTML = md(m.text) + (m.pending ? '<span class="caret"></span>' : '');
    enhance(c, !m.pending);
    b.appendChild(c);
  }
  if (m.images && m.images.length) {
    const g = el('div', 'gen-img');
    m.images.forEach(src => {
      const f = el('figure');
      const img = el('img');
      img.src = src;
      img.alt = 'Luna chizgan rasm';
      img.dataset.act = 'view';
      f.appendChild(img);
      f.appendChild(el('figcaption', '', `<button type="button" class="act press" data-act="img-dl" aria-label="Yuklab olish">${ic('download')}</button>`));
      g.appendChild(f);
    });
    b.appendChild(g);
  }
  if (m.error) {
    const e = el('div', 'errbox', esc(m.error));
    if (/kalit|Sozlama/i.test(m.error)) e.insertAdjacentHTML('beforeend', `<button type="button" data-act="open-key">Sozlamalarni ochish</button>`);
    b.appendChild(e);
  }
  if (m.stopped && !m.text && !m.images) b.appendChild(el('div', 'note', "To'xtatildi."));
  if (!m.pending) b.appendChild(footEl(m));
}
function footEl(m) {
  const f = el('div', 'mfoot');
  const isLast = cur && cur.messages[cur.messages.length - 1] === m;
  let h = '';
  if (m.text) h += `<button type="button" class="act press" data-act="m-copy" aria-label="Nusxa olish">${ic('copy')}</button><button type="button" class="act press" data-act="m-speak" aria-label="Ovoz chiqarib o'qish">${ic('volume')}</button>`;
  if (isLast) h += `<button type="button" class="act press" data-act="m-regen" aria-label="Qayta yozish">${ic('refresh')}</button>`;
  const meta = [m.model, m.time != null ? m.time + ' s' : '', m.cost ? '$' + m.cost.toFixed(m.cost < 0.01 ? 4 : 3) : ''].filter(Boolean);
  h += `<span class="meta">${meta.map(x => `<span>${esc(x)}</span>`).join('')}</span>`;
  f.innerHTML = h;
  return f;
}
function councilEl(m) {
  const C = m.council;
  if (m.pending) {
    const list = C.stage === 2 ? C.reviews : C.answers;
    const w = el('div', 'chips');
    list.forEach(a => {
      const icon = a.status === 'wait' ? '<i class="dot"></i>' : a.status === 'ok' ? ic('check') : ic('x');
      const ch = el('span', `chip ${a.status === 'ok' ? 'ok' : a.status === 'err' ? 'err' : ''}`, `${icon}${esc(a.model)}${a.time != null ? ` <span>${a.time}s</span>` : ''}`);
      if (a.error) ch.title = a.error;
      w.appendChild(ch);
    });
    return w;
  }
  const d = el('details', 'council');
  if (m._open) d.open = true;
  d.addEventListener('toggle', () => { m._open = d.open; });
  const okN = C.answers.filter(a => a.status === 'ok').length;
  const medals = (C.rank || []).slice(0, 3).map((r, i) => `<span>${['🥇', '🥈', '🥉'][i]} ${esc(r.model)}</span>`).join('');
  d.innerHTML = `<summary>${moonSVG(1)}<span class="grow">Kengash: ${okN} ta AI javob berdi</span><span class="medals">${medals}</span>${ic('chev', 'chev')}</summary><div class="c-body"><div class="tabs" role="tablist"></div><div class="c-legend"></div><div class="c-pane md"></div></div>`;
  const tabs = d.querySelector('.tabs'), pane = d.querySelector('.c-pane');
  const items = [
    ...C.answers.map(a => ({ label: a.model, text: a.text, err: a.error })),
    ...(C.reviews || []).map(r => ({ label: `${r.model} bahosi`, text: r.text, err: r.error })),
  ];
  const harf = Object.entries(C.harf || {});
  if (harf.length && C.reviews && C.reviews.length) d.querySelector('.c-legend').textContent = 'Baholarda: ' + harf.map(([h, n]) => `Javob ${h} = ${n}`).join(', ');
  const show = i => {
    $$('button', tabs).forEach((b, j) => { b.classList.toggle('on', i === j); b.setAttribute('aria-selected', i === j); });
    const it = items[i];
    pane.innerHTML = it.text ? md(it.text) : `<p class="note">${esc(it.err || "Javob yo'q")}</p>`;
    enhance(pane, true);
  };
  items.forEach((it, i) => {
    const b = el('button', it.err ? 'err' : '', esc(it.label));
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.onclick = () => show(i);
    tabs.appendChild(b);
  });
  let shown = false;
  d.addEventListener('toggle', () => { if (d.open && !shown && items.length) { shown = true; show(0); } });
  if (d.open && items.length) { shown = true; show(0); }
  return d;
}
const msgNode = m => chatBox.querySelector(`.msg[data-id="${m.id}"]`);
let rafId = 0;
function rerenderMsg(m) {
  if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
  if (m._chat && m._chat !== cur) return;
  const n = msgNode(m);
  if (!n) return;
  fillAi(n, m);
  setPhase(n.querySelector('.av .moon'), m.pending ? (m.phase || 0.1) : 1);
  stickScroll();
}
function streamUpdate(m) {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    if (!m.pending || (m._chat && m._chat !== cur)) return;
    const n = msgNode(m);
    if (!n) return;
    const c = n.querySelector('.body .content');
    if (!c) fillAi(n, m);
    else { c.innerHTML = md(m.text) + '<span class="caret"></span>'; enhance(c, false); }
    setPhase(n.querySelector('.av .moon'), m.phase || 0.5);
    stickScroll();
  });
}
function stickScroll(force) { if (force || stick) chatBox.scrollTop = chatBox.scrollHeight; }

/* ---------- composer ---------- */
function autosize() {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 220) + 'px';
  updateSend();
}
function updateSend() {
  const s = $('#sendBtn');
  s.disabled = busy ? false : (!input.value.trim() && !pending.length);
}
function setBusy(b) {
  busy = b;
  const s = $('#sendBtn');
  s.classList.toggle('stop', b);
  s.innerHTML = b ? ic('stop') : ic('up');
  s.setAttribute('aria-label', b ? "To'xtatish" : 'Yuborish');
  updateSend();
}
function setMode(mode, save = true) {
  S.mode = mode;
  if (save) saveSettings();
  $$('#modeSeg button').forEach(b => {
    const on = b.dataset.mode === mode;
    b.classList.toggle('on', on);
    b.setAttribute('aria-checked', on);
  });
  requestAnimationFrame(movePill);
  input.placeholder = mode === 'image' ? 'Qanday rasm kerak? Batafsil yozing...' : mode === 'council' ? "Bir nechta AI birga o'ylaydi. Savolingizni yozing..." : "Luna'ga yozing...";
}
function movePill() {
  const on = $('#modeSeg button.on'), p = $('#modeSeg .pill');
  if (!on || !p) return;
  p.style.left = on.offsetLeft + 'px';
  p.style.width = on.offsetWidth + 'px';
}
function setWeb(v) {
  S.web = v;
  saveSettings();
  const b = $('#webBtn');
  b.classList.toggle('on', v);
  b.setAttribute('aria-pressed', v);
}

/* attachments */
const TEXT_EXT = /\.(txt|md|markdown|csv|tsv|json|js|mjs|cjs|ts|jsx|tsx|py|java|kt|c|h|cpp|hpp|cs|go|rs|rb|php|swift|dart|vue|svelte|html|htm|css|scss|less|xml|yml|yaml|toml|ini|env|sql|sh|bat|ps1|log|srt|vtt|tex)$/i;
const clip = s => (s.length > 400000 ? s.slice(0, 400000) + '\n…[fayl qisqartirildi]' : s);
const dataURL = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(new Error(`"${f.name}" o'qilmadi`)); r.readAsDataURL(f); });
const scriptCache = {};
function loadScript(src) {
  if (!scriptCache[src]) {
    scriptCache[src] = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = () => { delete scriptCache[src]; rej(new Error("Kutubxona yuklanmadi. Internetni tekshiring.")); };
      document.head.appendChild(s);
    });
  }
  return scriptCache[src];
}
function shrinkImage(f, max = 2048) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * s));
      c.height = Math.max(1, Math.round(img.height * s));
      const x = c.getContext('2d');
      x.fillStyle = '#fff';
      x.fillRect(0, 0, c.width, c.height);
      x.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => { URL.revokeObjectURL(url); dataURL(f).then(res, rej); };
    img.src = url;
  });
}
function audioFormat(mime, name) {
  const m = (mime + ' ' + name).toLowerCase();
  if (/wav/.test(m)) return 'wav';
  if (/ogg|opus/.test(m)) return 'ogg';
  if (/m4a|mp4|aac/.test(m)) return /aac/.test(m) ? 'aac' : 'm4a';
  if (/flac/.test(m)) return 'flac';
  if (/webm/.test(m)) return 'webm';
  return 'mp3';
}
async function readFile(f) {
  const t = f.type || '', n = f.name || 'fayl', MB = 1048576;
  if (t.startsWith('image/')) return { kind: 'image', data: await shrinkImage(f) };
  if (t.startsWith('video/')) {
    if (f.size > 40 * MB) throw new Error(`"${n}" juda katta. 40 MB gacha video yuborsa bo'ladi.`);
    return { kind: 'video', data: (await dataURL(f)).replace(/^data:video\/quicktime/, 'data:video/mov') };
  }
  if (t.startsWith('audio/')) {
    if (f.size > 25 * MB) throw new Error(`"${n}" juda katta. 25 MB gacha audio yuborsa bo'ladi.`);
    return { kind: 'audio', data: await dataURL(f), format: audioFormat(t, n) };
  }
  if (t === 'application/pdf' || /\.pdf$/i.test(n)) {
    if (f.size > 30 * MB) throw new Error(`"${n}" juda katta. 30 MB gacha PDF yuborsa bo'ladi.`);
    return { kind: 'pdf', data: (await dataURL(f)).replace(/^data:[^;]*;/, 'data:application/pdf;') };
  }
  if (/\.docx$/i.test(n)) {
    await loadScript(MAMMOTH_URL);
    const r = await window.mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() });
    return { kind: 'text', data: clip(r.value || '') };
  }
  if (/\.(xlsx|xls|ods)$/i.test(n)) {
    await loadScript(XLSX_URL);
    const wb = window.XLSX.read(await f.arrayBuffer());
    return { kind: 'text', data: clip(wb.SheetNames.map(s => `# ${s}\n` + window.XLSX.utils.sheet_to_csv(wb.Sheets[s])).join('\n\n')) };
  }
  if (t.startsWith('text/') || TEXT_EXT.test(n) || /json|xml|javascript/.test(t)) return { kind: 'text', data: clip(await f.text()) };
  throw new Error(`"${n}" turini o'qib bo'lmaydi. Rasm, video, audio, PDF, Word, Excel yoki matn fayl yuboring.`);
}
async function addFiles(files) {
  for (const f of files) {
    const a = { id: uid(), name: f.name || 'fayl', size: f.size, loading: true, kind: f.type.startsWith('image/') ? 'image' : 'file' };
    pending.push(a);
    renderAtts();
    try { Object.assign(a, await readFile(f)); a.loading = false; }
    catch (e) { pending = pending.filter(x => x !== a); toast(e.message, 'err'); }
    renderAtts();
  }
}
function renderAtts() {
  const box = $('#atts');
  box.innerHTML = '';
  pending.forEach(a => {
    const media = (a.kind === 'image' || a.kind === 'video') && a.data;
    const d = el('div', 'att' + (media ? ' media' : '') + (a.loading ? ' loading' : ''));
    if (media) {
      const m = el(a.kind === 'image' ? 'img' : 'video');
      m.src = a.data;
      if (a.kind === 'video') m.muted = true;
      d.appendChild(m);
    } else {
      const sub = a.loading ? 'Yuklanmoqda...' : a.kind === 'link' ? 'Havola' : a.kind === 'pdf' ? 'PDF' : a.kind === 'audio' ? 'Audio' : a.kind === 'text' ? 'Matn' : '';
      d.innerHTML = `${ic(kindIcon(a.kind))}<div class="an"><span>${esc(a.kind === 'link' ? a.data : a.name)}</span><small>${esc(sub)}${a.size ? ' ' + fmtSize(a.size) : ''}</small></div>`;
    }
    const rm = el('button', 'rm', ic('x'));
    rm.type = 'button';
    rm.setAttribute('aria-label', 'Olib tashlash');
    rm.onclick = () => { pending = pending.filter(x => x !== a); renderAtts(); };
    d.appendChild(rm);
    box.appendChild(d);
  });
  updateSend();
}
function attachMenu(btn) {
  pop(btn, [
    { ic: 'image', label: 'Rasm yoki video', fn: () => $('#fileMedia').click() },
    { ic: 'file', label: 'Fayl: PDF, Word, Excel, kod', fn: () => $('#fileAny').click() },
    { ic: 'camera', label: 'Kamerada rasmga olish', fn: openCamera },
    { ic: 'link', label: 'Havola qo\'shish', fn: askLink },
  ], true);
}
function askLink() {
  const m = el('div', 'modal');
  m.innerHTML = `<div class="sheet small glass" role="dialog" aria-modal="true" aria-label="Havola"><div class="sheet-body"><h3 style="font-weight:600;margin-bottom:6px">Havola qo'shish</h3><p style="color:var(--dim);font-size:14px;margin-bottom:14px">Luna sahifani internetdan topib o'qiydi.</p><input class="field" type="url" placeholder="https://..." aria-label="Havola"><div class="btnrow" style="justify-content:flex-end;margin-top:10px"><button type="button" class="btn press" data-r="0">Bekor qilish</button><button type="button" class="btn pri press" data-r="1">Qo'shish</button></div></div></div>`;
  document.body.appendChild(m);
  const inp = m.querySelector('input');
  inp.focus();
  const done = ok => {
    if (ok) {
      let v = inp.value.trim();
      if (v && !/^https?:\/\//i.test(v)) v = 'https://' + v;
      try { const u = new URL(v); pending.push({ id: uid(), kind: 'link', name: u.hostname, data: u.href }); renderAtts(); }
      catch { toast("Havola noto'g'ri", 'err'); return; }
    }
    m.remove();
  };
  m.onclick = e => { const r = e.target.closest('[data-r]'); if (r) done(r.dataset.r === '1'); else if (e.target === m) done(false); };
  inp.onkeydown = e => { if (e.key === 'Enter') done(true); if (e.key === 'Escape') done(false); };
}

/* camera */
async function openCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { $('#fileCapture').click(); return; }
  let facing = 'environment', stream = null;
  const m = el('div', 'modal');
  m.innerHTML = `<div class="cam"><video autoplay playsinline muted></video><div class="cam-bar"><button type="button" class="icon-btn press" data-c="close" aria-label="Yopish">${ic('x')}</button><button type="button" class="shutter press" data-c="shot" aria-label="Rasmga olish"></button><button type="button" class="icon-btn press" data-c="flip" aria-label="Kamerani almashtirish">${ic('flip')}</button></div></div>`;
  document.body.appendChild(m);
  const v = m.querySelector('video');
  const stop = () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  const close = () => { stop(); m.remove(); };
  const start = async () => {
    stop();
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      v.srcObject = stream;
    } catch {
      close();
      toast('Kameraga ruxsat berilmadi. Brauzer sozlamalarida kameraga ruxsat bering.', 'err');
    }
  };
  m.onclick = e => {
    const c = (e.target.closest('[data-c]') || {}).dataset?.c;
    if (c === 'close' || e.target === m) close();
    else if (c === 'flip') { facing = facing === 'user' ? 'environment' : 'user'; start(); }
    else if (c === 'shot') {
      if (!v.videoWidth) return;
      const s = Math.min(1, 2048 / Math.max(v.videoWidth, v.videoHeight));
      const cv = document.createElement('canvas');
      cv.width = Math.round(v.videoWidth * s);
      cv.height = Math.round(v.videoHeight * s);
      cv.getContext('2d').drawImage(v, 0, 0, cv.width, cv.height);
      pending.push({ id: uid(), kind: 'image', name: 'kamera.jpg', data: cv.toDataURL('image/jpeg', 0.9) });
      renderAtts();
      close();
      toast("Rasm qo'shildi", 'ok');
    }
  };
  start();
}

/* voice */
let rec = null;
function toggleMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return toast("Bu brauzerda ovozli yozish ishlamaydi. Chrome'dan foydalaning.", 'err');
  if (rec) { rec.stop(); return; }
  rec = new SR();
  rec.lang = S.voiceLang;
  rec.interimResults = true;
  rec.continuous = true;
  const base = input.value.trim();
  rec.onresult = e => {
    let t = '';
    for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
    input.value = (base ? base + ' ' : '') + t.trim();
    autosize();
  };
  rec.onerror = e => {
    if (e.error === 'not-allowed') toast('Mikrofonga ruxsat berilmadi', 'err');
    else if (e.error === 'language-not-supported') toast("Bu til qo'llanmaydi. Sozlamalarda boshqa tilni tanlang.", 'err');
  };
  rec.onend = () => { rec = null; $('#micBtn').classList.remove('rec'); };
  try { rec.start(); $('#micBtn').classList.add('rec'); } catch { rec = null; }
}
function speak(text, btn) {
  if (!('speechSynthesis' in window)) return toast("Ovozli o'qish bu brauzerda ishlamaydi", 'err');
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    $$('.act.on[data-act="m-speak"]').forEach(b => b.classList.remove('on'));
    return;
  }
  const clean = text.replace(/```[\s\S]*?```/g, ' Kod. ').replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/[#*_`>|~]+/g, ' ');
  const u = new SpeechSynthesisUtterance(clean.slice(0, 8000));
  const lang = /[а-яё]/i.test(clean) ? 'ru' : /\b(the|and|is|you|with)\b/i.test(clean) ? 'en' : 'uz';
  const voices = speechSynthesis.getVoices();
  const v = voices.find(x => x.lang.toLowerCase().startsWith(lang)) || (lang === 'uz' ? voices.find(x => x.lang.toLowerCase().startsWith('tr')) : null);
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang === 'uz' ? 'uz-UZ' : lang;
  u.onend = u.onerror = () => btn && btn.classList.remove('on');
  if (btn) btn.classList.add('on');
  speechSynthesis.speak(u);
}

/* ---------- API ---------- */
const hdr = () => ({ Authorization: 'Bearer ' + S.key.trim(), 'Content-Type': 'application/json' });
async function safeFetch(url, opts) {
  try { return await fetch(url, opts); }
  catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new Error("Internetga ulanib bo'lmadi. Aloqani tekshirib, qayta urinib ko'ring.");
  }
}
async function errText(r) {
  let msg = '';
  try { const j = await r.json(); msg = (j && j.error && j.error.message) || (j && j.message) || ''; } catch {}
  const map = {
    401: "API kalit noto'g'ri yoki o'chirilgan. Sozlamalarda kalitni tekshiring.",
    402: "Balans tugagan. openrouter.ai saytida balansni to'ldiring.",
    403: "So'rov rad etildi.",
    404: 'Model topilmadi yoki bu turdagi faylni qabul qilmaydi.',
    408: "Vaqt tugadi. Qayta urinib ko'ring.",
    413: 'Fayl juda katta.',
    429: "So'rovlar juda ko'p. Birozdan keyin qayta urinib ko'ring.",
    502: 'Model vaqtincha ishlamayapti.',
    503: 'Model vaqtincha band.',
  };
  return (map[r.status] || `Xato ${r.status}.`) + (msg ? ` (${String(msg).slice(0, 180)})` : '');
}
async function callModel(model, messages, o = {}) {
  const body = { model, messages };
  const plugins = [];
  if (o.web) plugins.push({ id: 'web' });
  if (o.pdf) plugins.push({ id: 'file-parser', pdf: { engine: 'cloudflare-ai' } });
  if (plugins.length) body.plugins = plugins;
  if (o.stream) body.stream = true;
  const r = await safeFetch(API + '/chat/completions', { method: 'POST', headers: hdr(), body: JSON.stringify(body), signal: ctl && ctl.signal });
  if (!r.ok) throw new Error(await errText(r));
  if (!o.stream) {
    const d = await r.json();
    if (d.error) throw new Error(d.error.message || 'Xato');
    let t = d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
    if (Array.isArray(t)) t = t.map(p => p.text || '').join('');
    if (!t || !String(t).trim()) throw new Error("Bo'sh javob keldi");
    return { text: String(t).trim(), cost: Number((d.usage && d.usage.cost) || 0) };
  }
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = '', text = '', cost = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue;
      const p = line.slice(5).trim();
      if (p === '[DONE]') continue;
      let j;
      try { j = JSON.parse(p); } catch { continue; }
      if (j.error) throw new Error(j.error.message || 'Xato');
      const dl = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
      if (dl) { text += dl; if (o.onDelta) o.onDelta(text); }
      if (j.usage && j.usage.cost != null) cost = Number(j.usage.cost);
    }
  }
  if (!text.trim()) throw new Error("Bo'sh javob keldi");
  return { text, cost };
}

/* message → API */
function userText(m) {
  let t = m.text || '';
  for (const a of m.atts || []) {
    if (a.kind === 'text') t += `\n\n📎 ${a.name}:\n\`\`\`\n${a.data}\n\`\`\``;
    else if (a.kind === 'link') t += `\n\n🔗 Havola: ${a.data}`;
  }
  return t.trim();
}
const KIND_WORD = { image: 'rasm', video: 'video', audio: 'audio', pdf: 'PDF' };
function userContent(m, full, modelId) {
  const text = userText(m) || '(Foydalanuvchi fayl yubordi)';
  const parts = [], notes = [];
  for (const a of m.atts || []) {
    if (a.kind === 'text' || a.kind === 'link') continue;
    if (!full) { notes.push(`[Avvalroq yuborilgan ${KIND_WORD[a.kind] || 'fayl'}: ${a.name}]`); continue; }
    if (a.kind === 'image') {
      if (can(modelId, 'image')) parts.push({ type: 'image_url', image_url: { url: a.data } });
      else notes.push(`[Rasm: ${a.name}. Bu model rasm ko'ra olmaydi]`);
    } else if (a.kind === 'pdf') {
      parts.push({ type: 'file', file: { filename: a.name, file_data: a.data } });
    } else if (a.kind === 'video') {
      if (can(modelId, 'video')) parts.push({ type: 'video_url', video_url: { url: a.data } });
      else notes.push(`[Video: ${a.name}. Bu model video ko'ra olmaydi]`);
    } else if (a.kind === 'audio') {
      if (can(modelId, 'audio')) parts.push({ type: 'input_audio', input_audio: { data: a.data.split(',')[1], format: a.format || 'mp3' } });
      else notes.push(`[Audio: ${a.name}. Bu model audio eshita olmaydi]`);
    }
  }
  const t = notes.length ? `${text}\n\n${notes.join('\n')}` : text;
  return parts.length ? [{ type: 'text', text: t }, ...parts] : t;
}
function contextItems(chat, upto) {
  const msgs = chat.messages.slice(0, upto).filter(m => !m.pending && (m.role === 'user' || m.text || (m.images && m.images.length)));
  const recent = msgs.slice(-16);
  const uIdx = [];
  recent.forEach((m, i) => { if (m.role === 'user') uIdx.push(i); });
  const full = new Set(uIdx.slice(-2));
  return recent.map((m, i) => ({ m, full: full.has(i) }));
}
const toApi = (items, modelId) => items.map(({ m, full }) => (m.role === 'user' ? { role: 'user', content: userContent(m, full, modelId) } : { role: 'assistant', content: m.text || '[Rasm yaratildi]' }));
const textHistory = items => items.map(({ m }) => ({ role: m.role, content: m.role === 'user' ? (userText(m) || '(fayl)') : (m.text || '[Rasm yaratildi]') }));
const needs = m => [...new Set(((m && m.atts) || []).filter(a => ['image', 'video', 'audio'].includes(a.kind)).map(a => a.kind))];
const wantWeb = m => S.web || /https?:\/\/\S+/.test((m && m.text) || '') || ((m && m.atts) || []).some(a => a.kind === 'link');
const hasPdf = items => items.some(({ m, full }) => full && (m.atts || []).some(a => a.kind === 'pdf'));
function visualParts(m, modelId) {
  const c = userContent(m, true, modelId);
  return typeof c === 'string' ? [] : c.filter(p => p.type === 'image_url' || p.type === 'file');
}
function withParts(text, parts) { return parts.length ? [{ type: 'text', text }, ...parts] : text; }

/* prompts */
function sysPrompt(extra) {
  return [
    "Sen Luna AI'san — dunyodagi eng kuchli sun'iy intellekt modellari asosida ishlaydigan premium yordamchi.",
    "Foydalanuvchi qaysi tilda yozsa, o'sha tilda javob ber. Til aniq bo'lmasa, o'zbek tilida (lotin yozuvida) yoz.",
    "Har doim foydalanuvchi kutganidan ham yaxshiroq natija ber: aniq, to'liq, chuqur o'ylangan va amaliy.",
    "Sayt, o'yin, ilova, dashboard, landing yoki boshqa interaktiv narsa so'ralsa: bitta to'liq ishlaydigan HTML fayl yoz (CSS va JavaScript shu faylning ichida) va uni ```html blokiga joyla. Dizayn zamonaviy va premium bo'lsin: o'ylangan ranglar va shriftlar, silliq animatsiyalar, telefon va kompyuterga moslashuvchan. O'yinlarda sensor ekran va klaviatura boshqaruvi, ball va qayta boshlash bo'lsin. Kodni hech qachon qisqartirma, \"...\" yoki \"bu yerga kod\" deb tashlab ketma, oxirigacha to'liq yoz. Tashqi kutubxona kerak bo'lsa, faqat CDN orqali ula. Kod blokidan keyin nima qilganingni va qanday ishlatishni qisqa yoz.",
    "Faktlar, hisob-kitob va mantiqiy masalalarni qadamma-qadam tekshir. Bilmasang yoki ishonching komil bo'lmasa, ochiq ayt, to'qib chiqarma.",
    "Javobni markdown bilan chiroyli formatla: kerak bo'lsa sarlavhalar, ro'yxatlar, jadvallar, kod bloklari. Oddiy savolga qisqa, murakkabiga batafsil javob ber.",
    S.name.trim() ? `Foydalanuvchining ismi: ${S.name.trim()}.` : '',
    S.about.trim() ? `Foydalanuvchi o'zi haqida: ${S.about.trim()}` : '',
    extra || '',
  ].filter(Boolean).join('\n');
}
const CHAIR_EXTRA = "Hozir sen kengash raisisan. Bir nechta kuchli AI foydalanuvchi so'roviga javob berdi va bir-birining javobini tekshirdi. Hammasini hisobga olib, eng to'g'ri va eng yaxshi YAKUNIY javobni yoz: xatolarni tuzat, eng yaxshi g'oyalarni birlashtir, javoblar bir-biriga zid bo'lsa, qaysi biri to'g'ri ekanini o'zing tekshirib hal qil. Kod so'ralgan bo'lsa, eng yaxshi versiyani asos qilib, boshqalarning yaxshi tomonlarini qo'shib, bitta to'liq ishlaydigan yakuniy kod yoz. Kengash, javoblar yoki tekshiruvlar haqida gapirma — to'g'ridan-to'g'ri foydalanuvchiga javob ber.";
const blocks = anon => Object.entries(anon).map(([h, t]) => `### Javob ${h}\n${t}`).join('\n\n');
const reviewPrompt = (q, anon) => `Foydalanuvchi so'rovi:\n${q}\n\nBu so'rovga bir nechta AI javob berdi (kim yozgani yashirin):\n\n${blocks(anon)}\n\nVazifang:\n1. Har bir javobni qisqa baholab chiq: nimasi to'g'ri, qayerda xato yoki kamchilik bor.\n2. Hamma javoblar o'tkazib yuborgan muhim narsa bo'lsa, uni ayt.\n3. Eng oxirgi qatorga hamma javoblarni eng yaxshisidan boshlab, aynan shu formatda yoz:\nREYTING: <eng yaxshi javob harfi>, <keyingisi>, ...`;
const chairMaterial = (q, anon, reviews) => `Foydalanuvchi so'rovi:\n${q}\n\nKengash a'zolarining javoblari:\n\n${blocks(anon)}` + (reviews.length ? `\n\nA'zolarning bir-biri haqidagi tekshiruvlari:\n\n${reviews.map((t, i) => `### Tekshiruv ${i + 1}\n${t}`).join('\n\n')}` : '') + '\n\nEndi foydalanuvchiga yakuniy javobni yoz.';
function parseRank(t, harf) {
  const ms = [...String(t).matchAll(/REYTING[\s*_:\-]*(.+)/g)];
  if (!ms.length) return [];
  const out = [];
  for (const x of ms[ms.length - 1][1].matchAll(/\b([A-Z])\b/g)) if (harf[x[1]] && !out.includes(x[1])) out.push(x[1]);
  return out;
}

/* ---------- runs ---------- */
async function send() {
  if (busy) return;
  const text = input.value.trim();
  if (!text && !pending.length) return;
  if (pending.some(a => a.loading)) return toast('Fayl hali yuklanmoqda...');
  if (!S.key.trim()) { toast('Avval OpenRouter kalitini ulang', 'err'); openSettings(true); return; }
  if (S.mode === 'image' && !text) return toast('Qanday rasm kerakligini yozing');
  if (editIdx != null) { cur.messages.splice(editIdx); editIdx = null; }
  const um = { id: uid(), role: 'user', text, atts: pending.map(({ loading, id, ...a }) => a), t: Date.now() };
  pending = [];
  renderAtts();
  input.value = '';
  autosize();
  if (rec) rec.stop();
  cur.messages.push(um);
  closeSideMobile();
  await run(cur, S.mode);
}
async function run(chat, mode) {
  const am = { id: uid(), role: 'assistant', text: '', mode, pending: true, t: Date.now(), cost: 0, phase: 0.06 };
  am._chat = chat;
  chat.messages.push(am);
  chat.updated = Date.now();
  if (!chats.includes(chat)) chats.push(chat);
  if (chat === cur) { renderChat(); stickScroll(true); }
  renderSidebar();
  persist(chat);
  setBusy(true);
  ctl = new AbortController();
  const t0 = performance.now();
  try {
    if (mode === 'council') await runCouncil(am, chat);
    else if (mode === 'image') await runImage(am, chat);
    else await runFast(am, chat);
  } catch (e) {
    if (e.name === 'AbortError') am.stopped = true;
    else am.error = e.message || String(e);
  }
  am.pending = false;
  delete am.stage;
  am.time = Math.round((performance.now() - t0) / 1000);
  S.spent = (S.spent || 0) + (am.cost || 0);
  saveSettings();
  ctl = null;
  setBusy(false);
  rerenderMsg(am);
  chat.updated = Date.now();
  await persist(chat);
  renderSidebar();
  if (!chat.title && (am.text || am.images)) autoTitle(chat);
  if (am.cost) refreshBalance();
}
async function runFast(am, chat) {
  const items = contextItems(chat, chat.messages.indexOf(am));
  const last = items.length ? items[items.length - 1].m : null;
  let model = S.fastModel;
  const need = needs(last);
  if (need.length && !need.every(k => can(model, k))) {
    const alt = [...S.models.map(m => m.id), 'google/gemini-4-argon'].find(id => need.every(k => can(id, k)));
    if (alt) { am.note = `${modelName(alt)} ishlatildi: ${modelName(model)} bu turdagi faylni ko'ra olmaydi.`; model = alt; }
  }
  am.model = modelName(model);
  am.stage = "Luna o'ylayapti";
  rerenderMsg(am);
  const r = await callModel(model, [{ role: 'system', content: sysPrompt() }, ...toApi(items, model)], {
    stream: true, web: wantWeb(last), pdf: hasPdf(items),
    onDelta: t => { am.text = t; am.phase = Math.min(0.96, 0.25 + t.length / 5000); streamUpdate(am); },
  });
  am.text = r.text;
  am.cost += r.cost;
}
async function runCouncil(am, chat) {
  const members = S.models.filter(m => m.on && m.id.trim());
  if (!members.length) throw new Error('Sozlamalarda kengash uchun kamida bitta modelni yoqing.');
  const items = contextItems(chat, chat.messages.indexOf(am));
  const last = items[items.length - 1].m;
  const web = wantWeb(last), pdf = hasPdf(items);
  const C = am.council = { stage: 1, answers: members.map(m => ({ model: m.name, id: m.id, status: 'wait' })), reviews: [], rank: [], harf: {} };
  am.model = 'Kengash';
  am.stage = `${members.length} ta AI o'ylayapti`;
  rerenderMsg(am);

  // 1. Hamma model bir vaqtda javob beradi
  let done = 0;
  await Promise.all(members.map(async (m, i) => {
    const a = C.answers[i], t = performance.now();
    try {
      const r = await callModel(m.id, [{ role: 'system', content: sysPrompt() }, ...toApi(items, m.id)], { web, pdf });
      a.text = r.text;
      a.status = 'ok';
      am.cost += r.cost;
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      a.status = 'err';
      a.error = e.message;
    }
    a.time = Math.round((performance.now() - t) / 1000);
    am.phase = 0.06 + 0.44 * (++done / members.length);
    rerenderMsg(am);
  }));
  const ok = C.answers.filter(a => a.status === 'ok');
  if (!ok.length) throw new Error(C.answers[0].error || 'Hech bir model javob bermadi.');
  if (ok.length === 1) { am.text = ok[0].text; am.model = ok[0].model; am.note = 'Faqat bitta model javob berdi.'; return; }

  // Javoblar yashirin harflar bilan belgilanadi
  const shuffled = [...ok].sort(() => Math.random() - 0.5);
  const anon = {};
  shuffled.forEach((a, i) => { const h = String.fromCharCode(65 + i); C.harf[h] = a.model; anon[h] = a.text; });
  const q = userText(last) || '(fayl yuborildi)';
  const reviewTexts = [];

  // 2. Bir-birini tekshirish
  if (S.review) {
    C.stage = 2;
    am.stage = 'Javoblarni bir-biri tekshiryapti';
    am.phase = 0.52;
    const reviewers = members.filter(m => ok.some(a => a.id === m.id));
    C.reviews = reviewers.map(m => ({ model: m.name, id: m.id, status: 'wait' }));
    rerenderMsg(am);
    const pos = {};
    ok.forEach(a => { pos[a.model] = []; });
    let n = 0;
    const hist = textHistory(items.slice(0, -1));
    await Promise.all(reviewers.map(async (m, i) => {
      const rv = C.reviews[i], t = performance.now();
      try {
        const r = await callModel(m.id, [...hist, { role: 'user', content: withParts(reviewPrompt(q, anon), visualParts(last, m.id)) }], { pdf });
        am.cost += r.cost;
        rv.text = r.text;
        rv.status = 'ok';
        rv.order = parseRank(r.text, C.harf).map(h => C.harf[h]);
        rv.order.forEach((name, k) => pos[name].push(k + 1));
        reviewTexts.push(r.text);
      } catch (e) {
        if (e.name === 'AbortError') throw e;
        rv.status = 'err';
        rv.error = e.message;
      }
      rv.time = Math.round((performance.now() - t) / 1000);
      am.phase = 0.52 + 0.3 * (++n / reviewers.length);
      rerenderMsg(am);
    }));
    C.rank = Object.entries(pos).filter(([, p]) => p.length).map(([model, p]) => ({ model, pos: p.reduce((x, y) => x + y, 0) / p.length })).sort((x, y) => x.pos - y.pos);
  }

  // 3. Rais yakuniy javobni yozadi
  C.stage = 3;
  am.stage = 'Rais yakuniy javobni yozyapti';
  am.phase = 0.84;
  rerenderMsg(am);
  const chairId = S.chair;
  try {
    const r = await callModel(chairId, [
      { role: 'system', content: sysPrompt(CHAIR_EXTRA) },
      ...textHistory(items.slice(0, -1)),
      { role: 'user', content: withParts(chairMaterial(q, anon, reviewTexts), visualParts(last, chairId)) },
    ], { stream: true, pdf, onDelta: t => { am.text = t; am.phase = Math.min(0.98, 0.86 + t.length / 30000); streamUpdate(am); } });
    am.text = r.text;
    am.cost += r.cost;
    am.model = `Kengash, rais: ${modelName(chairId)}`;
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    const best = (C.rank[0] && C.rank[0].model) || ok[0].model;
    am.text = ok.find(a => a.model === best).text;
    am.model = `Kengash, eng yaxshisi: ${best}`;
    am.note = `Rais javob bera olmadi (${e.message}). Eng yaxshi baholangan javob ko'rsatildi.`;
  }
}
async function runImage(am, chat) {
  const last = chat.messages[chat.messages.indexOf(am) - 1];
  am.model = modelName(S.imageModel);
  am.stage = "So'rov tayyorlanmoqda";
  am.phase = 0.15;
  rerenderMsg(am);
  let prompt = last.text;
  try {
    const r = await callModel(S.titleModel, [{ role: 'user', content: `Rewrite this image request as one rich, detailed English prompt for an image generation model: subject, composition, style, lighting, colors, quality. Keep the user's intent and keep any text that must appear in the image exactly as written. Reply with the prompt only.\n\nRequest: ${last.text}` }]);
    if (r.text.length > 10) prompt = r.text.replace(/^["']|["']$/g, '').trim();
    am.cost += r.cost;
  } catch (e) { if (e.name === 'AbortError') throw e; }
  am.stage = 'Rasm chizilmoqda';
  am.phase = 0.45;
  rerenderMsg(am);
  const r = await safeFetch(API + '/images', { method: 'POST', headers: hdr(), signal: ctl && ctl.signal, body: JSON.stringify({ model: S.imageModel, prompt, n: 1, aspect_ratio: S.imageRatio }) });
  if (!r.ok) throw new Error(await errText(r));
  const d = await r.json();
  const imgs = (d.data || []).map(x => (x.b64_json ? `data:${x.media_type || 'image/png'};base64,${x.b64_json}` : x.url)).filter(Boolean);
  if (!imgs.length) throw new Error("Rasm kelmadi. So'rovni o'zgartirib qayta urinib ko'ring.");
  am.images = imgs;
  am.cost += Number((d.usage && d.usage.cost) || 0);
}
async function autoTitle(chat) {
  const u = chat.messages.find(m => m.role === 'user');
  const a = chat.messages.find(m => m.role === 'assistant' && (m.text || m.images));
  let title = '';
  try {
    const r = await callModel(S.titleModel, [{ role: 'user', content: `Quyidagi suhbat uchun 2-5 so'zli qisqa sarlavha yoz. Suhbat qaysi tilda bo'lsa, o'sha tilda yoz. Faqat sarlavhaning o'zini qaytar: tirnoq, nuqta va emoji qo'yma.\n\nFoydalanuvchi: ${((u && userText(u)) || '[fayl]').slice(0, 600)}\nAI: ${((a && a.text) || '[rasm chizildi]').slice(0, 600)}` }]);
    title = r.text.split('\n')[0].replace(/^[\s"'«»*#]+|[\s"'«».*]+$/g, '').slice(0, 60);
    S.spent = (S.spent || 0) + r.cost;
    saveSettings();
  } catch {}
  if (!title) title = (((u && u.text) || (u && u.atts && u.atts[0] && u.atts[0].name) || 'Yangi chat').split(/\s+/).slice(0, 6).join(' ')).slice(0, 48);
  chat.title = title;
  await persist(chat);
  renderSidebar();
  typeTitle(chat.id, title);
  if (chat === cur) setTopTitle();
}
function regenerate(m) {
  if (busy) return;
  const i = cur.messages.indexOf(m);
  if (i < 0) return;
  cur.messages.splice(i, 1);
  run(cur, m.mode || S.mode);
}
function editMsg(m) {
  if (busy) return;
  editIdx = cur.messages.indexOf(m);
  input.value = m.text || '';
  pending = (m.atts || []).map(a => ({ ...a, id: uid() }));
  renderAtts();
  autosize();
  input.focus();
  toast("Matnni o'zgartirib yuboring. Undan keyingi xabarlar almashtiriladi.");
}

/* ---------- preview ---------- */
let pvSrc = '', pvName = '';
const STORAGE_SHIM = "<script>(function(){try{window.localStorage.getItem('_')}catch(e){function m(){var d={};return{getItem:function(k){return k in d?d[k]:null},setItem:function(k,v){d[k]=String(v)},removeItem:function(k){delete d[k]},clear:function(){d={}},key:function(i){return Object.keys(d)[i]||null},get length(){return Object.keys(d).length}}}try{Object.defineProperty(window,'localStorage',{value:m(),configurable:true});Object.defineProperty(window,'sessionStorage',{value:m(),configurable:true})}catch(_){}}})();<\/script>";
function previewDoc(src) {
  if (!/<html|<body|<!doctype/i.test(src)) return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${STORAGE_SHIM}</head><body>${src}</body></html>`;
  return /<head[^>]*>/i.test(src) ? src.replace(/<head[^>]*>/i, h => h + STORAGE_SHIM) : STORAGE_SHIM + src;
}
function openPreview(src, title) {
  pvSrc = src;
  pvName = title || htmlTitle(src) || "Ko'rish";
  $('#pvTitle').textContent = pvName;
  $('#pvFrame').srcdoc = previewDoc(src);
  $('#app').classList.add('pv');
}
function closePreview() {
  $('#app').classList.remove('pv');
  setTimeout(() => { if (!$('#app').classList.contains('pv')) $('#pvFrame').srcdoc = ''; }, 500);
}

/* ---------- small UI ---------- */
function toast(msg, type = '') {
  const t = el('div', `toast glass ${type}`);
  t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 320); }, 3400);
}
let popEl = null;
function closePop() { if (popEl) { popEl.remove(); popEl = null; } }
function pop(anchor, items, above) {
  closePop();
  const p = el('div', 'pop glass');
  p.setAttribute('role', 'menu');
  items.forEach(it => {
    const b = el('button', it.danger ? 'danger' : '', `${ic(it.ic)}<span>${esc(it.label)}</span>`);
    b.type = 'button';
    b.setAttribute('role', 'menuitem');
    b.onclick = e => { e.stopPropagation(); closePop(); it.fn(); };
    p.appendChild(b);
  });
  document.body.appendChild(p);
  const r = anchor.getBoundingClientRect();
  const pw = p.offsetWidth, ph = p.offsetHeight;
  const x = Math.min(Math.max(8, r.left), innerWidth - pw - 8);
  let y = above ? r.top - ph - 8 : r.bottom + 6;
  if (y < 8) y = r.bottom + 6;
  if (y + ph > innerHeight - 8) y = r.top - ph - 8;
  p.style.left = x + 'px';
  p.style.top = Math.max(8, y) + 'px';
  popEl = p;
  const first = p.querySelector('button');
  if (first && !isTouch) first.focus();
}
function confirmBox(text, ok = "O'chirish") {
  return new Promise(res => {
    const m = el('div', 'modal');
    m.innerHTML = `<div class="sheet small glass" role="alertdialog" aria-modal="true"><div class="sheet-body"><p style="margin-bottom:18px">${esc(text)}</p><div class="btnrow" style="justify-content:flex-end"><button type="button" class="btn press" data-r="0">Bekor qilish</button><button type="button" class="btn pri press" data-r="1">${esc(ok)}</button></div></div></div>`;
    document.body.appendChild(m);
    const fin = v => { m.remove(); res(v); };
    m.onclick = e => { const r = e.target.closest('[data-r]'); if (r) fin(r.dataset.r === '1'); else if (e.target === m) fin(false); };
    m.onkeydown = e => { if (e.key === 'Escape') fin(false); };
    m.querySelector('[data-r="1"]').focus();
  });
}
function openLightbox(src) {
  const m = el('div', 'lightbox');
  m.innerHTML = `<div class="lb-bar"><button type="button" class="icon-btn press" data-l="dl" aria-label="Yuklab olish">${ic('download')}</button><button type="button" class="icon-btn press" data-l="x" aria-label="Yopish">${ic('x')}</button></div>`;
  const img = el('img');
  img.src = src;
  img.alt = 'Rasm';
  m.appendChild(img);
  document.body.appendChild(m);
  m.onclick = e => {
    const l = (e.target.closest('[data-l]') || {}).dataset?.l;
    if (l === 'dl') download(src, 'luna-rasm.' + (src.startsWith('data:image/png') ? 'png' : 'jpg'));
    else if (e.target !== img) m.remove();
  };
}
function download(blobOrUrl, name) {
  const a = document.createElement('a');
  const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (typeof blobOrUrl !== 'string') setTimeout(() => URL.revokeObjectURL(url), 4000);
}
async function copyText(text, btn) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const t = el('textarea');
    t.value = text;
    document.body.appendChild(t);
    t.select();
    try { document.execCommand('copy'); } catch {}
    t.remove();
  }
  if (btn) {
    const old = btn.innerHTML;
    btn.innerHTML = ic('check') + (btn.querySelector('span') ? '<span>Nusxalandi</span>' : '');
    setTimeout(() => { btn.innerHTML = old; }, 1400);
  }
}

/* ---------- balance ---------- */
async function getBalance() {
  if (!S.key.trim()) return '';
  try {
    let r = await fetch(API + '/credits', { headers: hdr() });
    if (r.ok) {
      const d = (await r.json()).data;
      if (d && d.total_credits != null) return '$' + Math.max(0, d.total_credits - (d.total_usage || 0)).toFixed(2);
    }
    r = await fetch(API + '/key', { headers: hdr() });
    if (r.ok) {
      const d = (await r.json()).data || {};
      if (d.limit_remaining != null) return '$' + Number(d.limit_remaining).toFixed(2);
    }
  } catch {}
  return '';
}
async function refreshBalance() { $('#balance').textContent = await getBalance(); }

/* ---------- settings ---------- */
function settingsHTML() {
  const opt = (v, sel, label) => `<option value="${esc(v)}"${v === sel ? ' selected' : ''}>${esc(label)}</option>`;
  const sw = (id, on) => `<span class="sw"><input type="checkbox" id="${id}"${on ? ' checked' : ''}><span></span></span>`;
  const opts = (id, list, val) => `<div class="opts" id="${id}">${list.map(([v, l]) => `<button type="button" data-v="${esc(v)}" class="${val === v ? 'on' : ''}">${esc(l)}</button>`).join('')}</div>`;
  return `
  <section class="sec"><h3>OpenRouter kaliti</h3>
    <p>Bitta kalit bilan Claude, GPT, Gemini va boshqa modellar ishlaydi. Kalit faqat shu qurilmada saqlanadi va faqat OpenRouter'ga yuboriladi. Kalitni <a href="https://openrouter.ai/keys" target="_blank" rel="noopener">openrouter.ai/keys</a> sahifasidan oling.</p>
    <div class="keyrow"><input class="field" id="stKey" type="password" placeholder="sk-or-v1-..." value="${esc(S.key)}" autocomplete="off" spellcheck="false" aria-label="OpenRouter kaliti"><button class="icon-btn press" id="stEye" type="button" aria-label="Kalitni ko'rsatish">${ic('eye')}</button><button class="btn pri press" id="stKeySave" type="button">Saqlash</button></div>
    <div class="status" id="stKeyStatus"></div>
  </section>
  <section class="sec"><h3>Siz haqingizda</h3><p>Luna javoblarni shunga moslaydi.</p>
    <div class="row"><label for="stName">Ismingiz</label><input class="field" id="stName" style="max-width:240px" value="${esc(S.name)}" placeholder="Masalan, Aziz"></div>
    <textarea class="field" id="stAbout" aria-label="O'zingiz haqingizda" placeholder="Masalan: dasturchiman, ingliz tilini o'rganyapman, javoblar qisqa va aniq bo'lsin">${esc(S.about)}</textarea>
  </section>
  <section class="sec"><h3>Javob berish</h3>
    <div class="row"><div class="lab">Asosiy rejim<small>Yangi xabarlar shu rejimda yuboriladi</small></div>${opts('stMode', [['fast', 'Tez'], ['council', 'Kengash'], ['image', 'Rasm']], S.mode)}</div>
    <div class="row"><label for="stFast">Tez rejim modeli<small>Bitta model javob beradi, matn darhol yoziladi</small></label><select class="field" id="stFast" style="max-width:230px"></select></div>
    <div class="row"><label for="stWeb">Har doim internetdan qidirish<small>Havola yuborilganda o'zi yoqiladi. Har so'rovga taxminan $0.007 qo'shiladi</small></label>${sw('stWeb', S.web)}</div>
  </section>
  <section class="sec"><h3>Kengash</h3>
    <p>Kengash rejimida bu modellar birga o'ylaydi, bir-birining javobini tekshiradi, keyin rais yakuniy javobni yozadi. Yangi model chiqsa, uning nomini <a href="https://openrouter.ai/models" target="_blank" rel="noopener">openrouter.ai/models</a> dan olib shu yerga yozing.</p>
    <div class="models" id="stModels"></div>
    <div class="btnrow"><button class="btn press" id="stAddModel" type="button">${ic('plus')}Model qo'shish</button><button class="btn press" id="stResetModels" type="button">${ic('refresh')}Asl ro'yxatni qaytarish</button></div>
    <div class="row"><label for="stChair">Rais<small>Yakuniy javobni yozadigan model</small></label><select class="field" id="stChair" style="max-width:230px"></select></div>
    <div class="row"><label for="stReview">Bir-birini tekshirish<small>Aniqroq, lekin taxminan 2 baravar qimmat va sekinroq</small></label>${sw('stReview', S.review)}</div>
  </section>
  <section class="sec"><h3>Rasm chizish</h3>
    <div class="row"><label for="stImg">Model</label><input class="field" id="stImg" style="max-width:250px;font-family:var(--mono);font-size:13px" value="${esc(S.imageModel)}" spellcheck="false"></div>
    <div class="row"><div class="lab">O'lcham</div>${opts('stRatio', [['1:1', '1:1'], ['16:9', '16:9'], ['9:16', '9:16'], ['4:3', '4:3'], ['3:4', '3:4']], S.imageRatio)}</div>
  </section>
  <section class="sec"><h3>Ko'rinish</h3>
    <div class="row"><div class="lab">Mavzu</div>${opts('stTheme', [['dark', 'Tun'], ['light', 'Kun'], ['auto', 'Avto']], S.theme)}</div>
    <div class="row"><div class="lab">Rang</div><div class="swatches" id="stAccent">${ACCENTS.map(a => `<button type="button" data-v="${a.id}" class="${S.accent === a.id ? 'on' : ''}" style="background:linear-gradient(140deg,${a.c1},${a.c2})" aria-label="${esc(a.name)}" title="${esc(a.name)}"></button>`).join('')}</div></div>
    <div class="row"><label for="stLiquid">Liquid glass yaltirashi<small>Barmoq yoki sichqoncha ortidan yuradigan yorug'lik</small></label>${sw('stLiquid', S.liquid)}</div>
    <div class="row"><label for="stMotion">Animatsiyalar</label>${sw('stMotion', S.motion)}</div>
    <div class="row"><label for="stFs">Matn o'lchami</label><input type="range" class="range" id="stFs" min="14" max="20" step="1" value="${S.fontSize}"></div>
  </section>
  <section class="sec"><h3>Ovoz</h3>
    <div class="row"><label for="stVoice">Ovoz bilan yozish tili</label><select class="field" id="stVoice" style="max-width:200px">${[['uz-UZ', "O'zbekcha"], ['ru-RU', 'Ruscha'], ['en-US', 'Inglizcha'], ['tr-TR', 'Turkcha']].map(([v, l]) => opt(v, S.voiceLang, l)).join('')}</select></div>
  </section>
  <section class="sec"><h3>Ma'lumotlar</h3><p>Chatlar faqat shu qurilmada saqlanadi. Jami sarflangan: <b id="stSpent">$${(S.spent || 0).toFixed(3)}</b></p>
    <div class="btnrow"><button class="btn press" id="stExport" type="button">${ic('download')}Tarixni yuklab olish</button><button class="btn press" id="stImport" type="button">${ic('up')}Tarixni tiklash</button><button class="btn danger press" id="stClear" type="button">${ic('trash')}Hamma chatlarni o'chirish</button></div>
  </section>
  <section class="sec"><h3>Ilova</h3>
    <div class="btnrow">${deferredInstall ? `<button class="btn pri press" id="stInstall" type="button">${ic('download')}Ilovani o'rnatish</button>` : `<p style="color:var(--dim);font-size:13.5px">Telefonga o'rnatish uchun Chrome menyusidan "Ilovani o'rnatish" yoki "Bosh ekranga qo'shish" ni tanlang.</p>`}</div>
    <p class="ver">Luna AI ${VERSION}</p>
  </section>`;
}
function fillModelSelects(root) {
  const all = [...S.models.filter(m => m.id.trim()), ...EXTRA_MODELS].filter((m, i, a) => a.findIndex(x => x.id === m.id) === i);
  const fill = (sel, val) => {
    const list = all.some(m => m.id === val) ? all : [{ name: modelName(val), id: val }, ...all];
    sel.innerHTML = list.map(m => `<option value="${esc(m.id)}"${m.id === val ? ' selected' : ''}>${esc(m.name || m.id)}</option>`).join('');
  };
  fill($('#stFast', root), S.fastModel);
  fill($('#stChair', root), S.chair);
}
function renderModelRows(root) {
  const box = $('#stModels', root);
  box.innerHTML = '';
  S.models.forEach((mo, i) => {
    const unknown = Object.keys(MI).length > 0 && mo.id && !MI[mo.id];
    const r = el('div', 'mrow');
    r.innerHTML = `<span class="sw"><input type="checkbox"${mo.on ? ' checked' : ''} aria-label="Yoqish"><span></span></span><input class="field" value="${esc(mo.name)}" placeholder="Nomi" aria-label="Model nomi"><input class="field mid${unknown ? ' warn' : ''}" value="${esc(mo.id)}" placeholder="provider/model" aria-label="Model ID" spellcheck="false"${unknown ? ` title="OpenRouter'da bunday model topilmadi"` : ''}><button class="icon-btn press" type="button" aria-label="Olib tashlash">${ic('trash')}</button>`;
    const [cb, nm, id] = r.querySelectorAll('input');
    cb.onchange = () => { mo.on = cb.checked; saveSettings(); };
    nm.oninput = () => { mo.name = nm.value; saveSettings(); fillModelSelects(root); };
    id.onchange = () => { mo.id = id.value.trim(); saveSettings(); renderModelRows(root); fillModelSelects(root); };
    r.querySelector('button').onclick = () => { S.models.splice(i, 1); saveSettings(); renderModelRows(root); fillModelSelects(root); };
    box.appendChild(r);
  });
}
function openSettings(focusKey) {
  closeSideMobile();
  closePop();
  const m = el('div', 'modal bottom');
  m.innerHTML = `<div class="sheet glass" role="dialog" aria-modal="true" aria-labelledby="stTitle"><div class="sheet-top"><h2 id="stTitle">Sozlamalar</h2><button type="button" class="icon-btn press" data-x aria-label="Yopish">${ic('x')}</button></div><div class="sheet-body">${settingsHTML()}</div></div>`;
  document.body.appendChild(m);
  const q = s => $(s, m);
  renderModelRows(m);
  fillModelSelects(m);
  const close = () => {
    m.remove();
    document.removeEventListener('keydown', onKey);
    setMode(S.mode, false);
    setWeb(S.web);
    if (!cur.messages.length) renderChat();
  };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-x]')) close(); });

  const keyInp = q('#stKey'), st = q('#stKeyStatus');
  q('#stEye').onclick = () => { keyInp.type = keyInp.type === 'password' ? 'text' : 'password'; };
  const saveKey = async () => {
    const v = keyInp.value.trim();
    S.key = v;
    saveSettings();
    if (!v) { st.className = 'status'; st.textContent = 'Kalit olib tashlandi.'; refreshBalance(); return; }
    if (!/^sk-or-/.test(v)) { st.className = 'status err'; st.textContent = 'OpenRouter kaliti odatda "sk-or-" bilan boshlanadi. Tekshirib ko\'ring.'; }
    else { st.className = 'status'; st.textContent = 'Tekshirilmoqda...'; }
    try {
      const r = await safeFetch(API + '/key', { headers: hdr() });
      if (!r.ok) throw new Error(await errText(r));
      const bal = await getBalance();
      st.className = 'status ok';
      st.textContent = 'Kalit ishlayapti.' + (bal ? ` Balans: ${bal}` : '');
      $('#balance').textContent = bal;
    } catch (e) { st.className = 'status err'; st.textContent = e.message; }
  };
  q('#stKeySave').onclick = saveKey;
  keyInp.onkeydown = e => { if (e.key === 'Enter') saveKey(); };
  if (S.key) getBalance().then(b => { if (b && !st.textContent) { st.className = 'status'; st.textContent = `Balans: ${b}`; } });

  q('#stName').oninput = e => { S.name = e.target.value; saveSettings(); };
  q('#stAbout').oninput = e => { S.about = e.target.value; saveSettings(); };
  const bindOpts = (id, fn) => q(id).addEventListener('click', e => {
    const b = e.target.closest('button[data-v]');
    if (!b) return;
    $$('button', q(id)).forEach(x => x.classList.toggle('on', x === b));
    fn(b.dataset.v);
    saveSettings();
  });
  bindOpts('#stMode', v => { S.mode = v; });
  bindOpts('#stRatio', v => { S.imageRatio = v; });
  bindOpts('#stTheme', v => { S.theme = v; applyLook(); });
  bindOpts('#stAccent', v => { S.accent = v; applyLook(); });
  q('#stFast').onchange = e => { S.fastModel = e.target.value; saveSettings(); };
  q('#stChair').onchange = e => { S.chair = e.target.value; saveSettings(); };
  q('#stWeb').onchange = e => { S.web = e.target.checked; saveSettings(); };
  q('#stReview').onchange = e => { S.review = e.target.checked; saveSettings(); };
  q('#stLiquid').onchange = e => { S.liquid = e.target.checked; saveSettings(); applyLook(); };
  q('#stMotion').onchange = e => { S.motion = e.target.checked; saveSettings(); applyLook(); };
  q('#stFs').oninput = e => { S.fontSize = +e.target.value; saveSettings(); applyLook(); };
  q('#stVoice').onchange = e => { S.voiceLang = e.target.value; saveSettings(); };
  q('#stImg').onchange = e => { S.imageModel = e.target.value.trim() || DEFAULTS.imageModel; e.target.value = S.imageModel; saveSettings(); };
  q('#stAddModel').onclick = () => { S.models.push({ name: 'Yangi model', id: '', on: true }); saveSettings(); renderModelRows(m); const ids = $$('.mrow .mid', m); if (ids.length) ids[ids.length - 1].focus(); };
  q('#stResetModels').onclick = () => { S.models = JSON.parse(JSON.stringify(DEFAULT_MODELS)); S.chair = DEFAULTS.chair; saveSettings(); renderModelRows(m); fillModelSelects(m); toast("Asl ro'yxat qaytarildi"); };
  q('#stExport').onclick = () => {
    const data = { app: 'luna-ai', v: 1, chats: chats.filter(c => c.messages.length).map(plain) };
    download(new Blob([JSON.stringify(data)], { type: 'application/json' }), `luna-tarix-${new Date().toISOString().slice(0, 10)}.json`);
  };
  q('#stImport').onclick = () => $('#fileImport').click();
  q('#stClear').onclick = async () => {
    if (!(await confirmBox("Hamma chatlar butunlay o'chiriladi. Davom etasizmi?", "Hammasini o'chirish"))) return;
    try { await DB.clear(); } catch {}
    chats = [];
    newChat();
    toast("Hamma chatlar o'chirildi");
  };
  const inst = q('#stInstall');
  if (inst) inst.onclick = doInstall;
  if (focusKey) setTimeout(() => keyInp.focus(), 80);
}
async function importChats(file) {
  try {
    const d = JSON.parse(await file.text());
    const list = Array.isArray(d) ? d : d.chats;
    if (!Array.isArray(list)) throw new Error();
    let n = 0;
    for (const c of list) {
      if (!c || !c.id || !Array.isArray(c.messages)) continue;
      c.messages.forEach(m => { if (m.pending) { m.pending = false; m.stopped = true; } });
      const i = chats.findIndex(x => x.id === c.id);
      if (i >= 0) chats[i] = c; else chats.push(c);
      await persist(c);
      n++;
    }
    renderSidebar();
    toast(`${n} ta chat tiklandi`, 'ok');
  } catch { toast("Bu fayl Luna tarixi emas", 'err'); }
}

/* ---------- PWA ---------- */
async function doInstall() {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  try { await deferredInstall.userChoice; } catch {}
  deferredInstall = null;
  $('#installBtn').classList.add('hidden');
}
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; $('#installBtn').classList.remove('hidden'); });
addEventListener('appinstalled', () => { deferredInstall = null; $('#installBtn').classList.add('hidden'); toast("Luna o'rnatildi", 'ok'); });

/* ---------- events ---------- */
function bindUI() {
  $('#composer').addEventListener('submit', e => { e.preventDefault(); if (busy) { if (ctl) ctl.abort(); } else send(); });
  input.addEventListener('input', autosize);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && !isTouch) { e.preventDefault(); $('#composer').requestSubmit(); }
  });
  input.addEventListener('paste', e => {
    const fs = [...((e.clipboardData && e.clipboardData.files) || [])];
    if (fs.length) { e.preventDefault(); addFiles(fs); }
  });
  $('#attachBtn').onclick = e => attachMenu(e.currentTarget);
  $('#camBtn').onclick = openCamera;
  $('#micBtn').onclick = toggleMic;
  $('#webBtn').onclick = () => { setWeb(!S.web); toast(S.web ? 'Internetdan qidirish yoqildi' : "Internetdan qidirish o'chirildi"); };
  $('#modeSeg').addEventListener('click', e => { const b = e.target.closest('button[data-mode]'); if (b) setMode(b.dataset.mode); });
  ['fileMedia', 'fileAny', 'fileCapture'].forEach(id => $('#' + id).addEventListener('change', e => { addFiles([...e.target.files]); e.target.value = ''; }));
  $('#fileImport').addEventListener('change', e => { if (e.target.files[0]) importChats(e.target.files[0]); e.target.value = ''; });

  $('#newChat').onclick = newChat;
  $('#topNew').onclick = newChat;
  $('#menuBtn').onclick = toggleSide;
  $('#sideHide').onclick = closeSide;
  $('#scrim').onclick = closeSideMobile;
  $('#openSettings').onclick = () => openSettings(false);
  $('#installBtn').onclick = doInstall;
  $('#search').addEventListener('input', renderSidebar);
  $('#history').addEventListener('click', e => {
    const it = e.target.closest('.hitem');
    if (!it) return;
    const c = chats.find(x => x.id === it.dataset.id);
    if (!c) return;
    if (e.target.closest('.hmore')) { e.stopPropagation(); chatMenu(e.target.closest('.hmore'), c); return; }
    if (e.target.tagName !== 'INPUT') openChat(c.id);
  });
  $('#history').addEventListener('keydown', e => { const it = e.target.closest('.hitem'); if (it && e.key === 'Enter' && e.target === it) openChat(it.dataset.id); });

  chatBox.addEventListener('scroll', () => { stick = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 140; }, { passive: true });
  chatBox.addEventListener('click', e => {
    const t = e.target.closest('[data-act]');
    if (!t) return;
    const holder = t.closest('.codebox, .project');
    const node = t.closest('.msg');
    const m = node && cur.messages.find(x => x.id === node.dataset.id);
    switch (t.dataset.act) {
      case 'copy': copyText(holder._src, t); break;
      case 'run': openPreview(holder._src, holder._title); break;
      case 'dl': download(new Blob([holder._src], { type: 'text/html' }), fileSlug(holder._title) + '.html'); break;
      case 'unfold': holder.classList.remove('folded'); break;
      case 'view': openLightbox(t.src); break;
      case 'img-dl': { const img = t.closest('figure').querySelector('img'); download(img.src, 'luna-rasm.' + (img.src.startsWith('data:image/png') ? 'png' : 'jpg')); break; }
      case 'open-key': openSettings(true); break;
      case 'm-copy': if (m) copyText(m.role === 'user' ? userText(m) : m.text, t); break;
      case 'm-speak': if (m) speak(m.text, t); break;
      case 'm-regen': if (m) regenerate(m); break;
      case 'm-edit': if (m) editMsg(m); break;
    }
  });

  $('#pvClose').onclick = closePreview;
  $('#pvReload').onclick = () => { $('#pvFrame').srcdoc = previewDoc(pvSrc + ' '); };
  $('#pvFull').onclick = () => { const p = $('#preview'); if (document.fullscreenElement) document.exitFullscreen(); else if (p.requestFullscreen) p.requestFullscreen().catch(() => {}); };
  $('#pvDl').onclick = () => download(new Blob([pvSrc], { type: 'text/html' }), fileSlug(pvName) + '.html');

  const main = $('#main');
  let dragN = 0;
  const hasFiles = e => e.dataTransfer && [...e.dataTransfer.types].includes('Files');
  main.addEventListener('dragenter', e => { if (hasFiles(e)) { e.preventDefault(); dragN++; $('#drop').classList.add('on'); } });
  main.addEventListener('dragover', e => { if (hasFiles(e)) e.preventDefault(); });
  main.addEventListener('dragleave', () => { if (--dragN <= 0) { dragN = 0; $('#drop').classList.remove('on'); } });
  main.addEventListener('drop', e => { e.preventDefault(); dragN = 0; $('#drop').classList.remove('on'); if (e.dataTransfer.files.length) addFiles([...e.dataTransfer.files]); });

  document.addEventListener('pointerdown', e => { if (popEl && !popEl.contains(e.target)) closePop(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (popEl) closePop();
      else if ($('.lightbox')) $('.lightbox').remove();
      else if ($('#app').classList.contains('pv') && !$('.modal')) closePreview();
      else closeSideMobile();
    }
  });
  document.addEventListener('pointermove', e => {
    if (!S.liquid || e.pointerType === 'touch') return;
    const t = e.target.closest && e.target.closest('.liquid');
    if (!t) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    t.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
  document.addEventListener('pointerdown', e => {
    if (!S.liquid) return;
    const t = e.target.closest && e.target.closest('.liquid');
    if (!t) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    t.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
  addEventListener('resize', movePill);
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (S.theme === 'auto') applyLook(); });
}

/* ---------- start ---------- */
async function init() {
  injectIcons();
  applyLook();
  $('#brandMoon').innerHTML = moonSVG(1);
  if (S.sideOff && !isMobile()) $('#app').classList.add('side-off');
  bindUI();
  setMode(S.mode, false);
  setWeb(S.web);
  try {
    await DB.open();
    chats = (await DB.all()) || [];
    chats.forEach(c => c.messages.forEach(m => { if (m.pending) { m.pending = false; m.stopped = true; } }));
  } catch {
    toast("Brauzer xotirasi yopiq, chatlar saqlanmaydi", 'err');
  }
  newChat();
  loadModelInfo();
  refreshBalance();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePill);
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
}
init();
