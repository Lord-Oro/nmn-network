// Global Google Analytics Handshake
(function() {
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-P5WL9XNDY8';
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-P5WL9XNDY8');
})();

/* ════════════════════════════════════════════
   nmn-nav.js — Shared pixel nav + lantern cursor
   Include at TOP of <body> on every page:
   <script src="nmn-nav.js"></script>
   ════════════════════════════════════════════ */
(function(){

// ── INJECT CURSOR HTML ──
document.body.insertAdjacentHTML('afterbegin',`
<div id="nmn-pool"></div>
<div id="nmn-halo"></div>
<div id="nmn-cursor">
  <svg viewBox="0 0 48 64" width="48" height="64" xmlns="http://www.w3.org/2000/svg">
    <g class="l-body">
      <rect x="22" y="0" width="4" height="3" fill="#6a5a30" rx="1"/>
      <rect x="23" y="3" width="2" height="5" fill="#8B6914"/>
      <rect x="14" y="8" width="20" height="3" fill="#8B6914" rx="1"/>
      <rect x="17" y="11" width="14" height="2" fill="#B8860B"/>
      <rect x="14" y="13" width="3" height="26" fill="#8B6914"/>
      <rect x="31" y="13" width="3" height="26" fill="#8B6914"/>
      <rect x="17" y="13" width="14" height="6" fill="#1a1000" opacity="0.6"/>
      <rect x="17" y="20" width="14" height="6" fill="#1a1000" opacity="0.6"/>
      <rect x="17" y="27" width="14" height="6" fill="#1a1000" opacity="0.6"/>
      <rect x="17" y="34" width="14" height="5" fill="#1a1000" opacity="0.6"/>
      <rect x="14" y="19" width="20" height="2" fill="#8B6914"/>
      <rect x="14" y="26" width="20" height="2" fill="#8B6914"/>
      <rect x="14" y="33" width="20" height="2" fill="#8B6914"/>
      <rect class="l-glow" x="17" y="13" width="14" height="26" fill="#FFD700" opacity="0.45" rx="1"/>
      <g class="l-flame">
        <ellipse cx="24" cy="26" rx="5" ry="7" fill="#FF8C00" opacity="0.9"/>
        <ellipse cx="24" cy="27" rx="3.5" ry="5" fill="#FFD700"/>
        <ellipse cx="24" cy="28" rx="2" ry="3" fill="#FFFAAA"/>
        <ellipse cx="24" cy="22" rx="1.5" ry="2.5" fill="#FF6600" opacity="0.7"/>
      </g>
      <rect x="18" y="14" width="2" height="10" fill="rgba(255,255,255,0.12)" rx="1"/>
      <rect x="14" y="39" width="20" height="3" fill="#8B6914" rx="1"/>
      <rect x="19" y="44" width="10" height="3" fill="#8B6914" rx="1"/>
    </g>
  </svg>
</div>
<div id="nmn-toast"></div>
<div class="nmn-beam nmn-beam-1"></div>
<div class="nmn-beam nmn-beam-2"></div>
<div class="nmn-beam nmn-beam-3"></div>
<div class="nmn-beam nmn-beam-4"></div>
`);

// ── INJECT PIXEL NAV ──
// Detect current page for back link
const path = window.location.pathname.split('/').pop() || 'index.html';
const isHome = path === 'index.html' || path === '';
const isGame = ['collector.html','motherlode.html','depths.html','battle.html',
  'digger.html','descent.html','loom.html','gemslots.html'].includes(path);
const isOracle = ['tora.html','reliquary.html','well.html','starmap.html',
  'dualsouls.html','mirror.html','lorevault.html','grimoire.html','canary.html'].includes(path);

document.body.insertAdjacentHTML('afterbegin',`
<nav id="nmn-nav">
  <a href="index.html" class="nmn-nav-logo">⛏ NMN</a>
  <div class="nmn-nav-links">
    <a href="games.html" class="nmn-nav-link">🎮 GAMES</a>
    <a href="oracle.html" class="nmn-nav-link">🔮 ORACLE</a>
    <a href="archives.html" class="nmn-nav-link">📖 BOOKS</a>
    <a href="gemshop.html" class="nmn-nav-link">💎 GEMS</a>
    <a href="lantern.html" class="nmn-nav-link">🕯 MINE</a>
    <a href="https://patreon.com/lordoro" target="_blank" class="nmn-nav-link">🏅 PATREON</a>
    <a href="https://gofund.me/e643a8283" target="_blank" class="nmn-nav-link">🙏 FUND</a>
  </div>
  ${!isHome ? '<a href="javascript:history.back()" class="nmn-nav-back">← BACK</a>' : ''}
</nav>
`);

// ── CURSOR LOGIC ──
const CE = document.getElementById('nmn-cursor');
const HA = document.getElementById('nmn-halo');
const PO = document.getElementById('nmn-pool');

document.addEventListener('mousemove', e => {
  CE.style.left = e.clientX + 'px'; CE.style.top = e.clientY + 'px';
  HA.style.left = e.clientX + 'px'; HA.style.top = e.clientY + 'px';
  PO.style.left = e.clientX + 'px'; PO.style.top = e.clientY + 'px';
});

// Re-run after DOM settles to catch dynamically added elements
function bindHotElements() {
  document.querySelectorAll('a,button,.nmn-card,.game-card,.work-card,.px-btn,.btn,.nmn-btn,.shop-buy,.tier-btn,.book-btn,.gtab,.gctrl').forEach(el => {
    if(el._nmnHot) return;
    el._nmnHot = true;
    el.addEventListener('mouseenter', () => { CE.classList.add('hot'); HA.classList.add('hot'); PO.classList.add('hot'); });
    el.addEventListener('mouseleave', () => { CE.classList.remove('hot'); HA.classList.remove('hot'); PO.classList.remove('hot'); });
  });
}
bindHotElements();
setTimeout(bindHotElements, 500);
setTimeout(bindHotElements, 1500);

// ── TOAST HELPER (global) ──
window.nmnToast = function(msg, duration) {
  const t = document.getElementById('nmn-toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._nmnToastTimer);
  window._nmnToastTimer = setTimeout(() => t.classList.remove('show'), duration || 2200);
};

// ── FADE IN OBSERVER ──
if('IntersectionObserver' in window) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.nmn-fade').forEach(el => obs.observe(el));
}

// ── DISABLE OLD CURSOR LAMP IF EXISTS ──
const oldLamp = document.getElementById('cursor-lamp');
if(oldLamp) { oldLamp.style.display = 'none'; }

// ── CURSOR:NONE handled by nmn-theme.css * rule — no override needed ──
// Just ensure the SVG cursor element is visible
if(CE) CE.style.opacity = '1';

})();

// ── LANGUAGE SYSTEM — available on ALL pages ──
// Gemini's timing fix: setTimeout ensures DOM is fully painted before swap

window.NMN_LANGS = {
  en:{flag:'🇺🇸',label:'EN',title:'The goldmine',em:'is within.'},
  ko:{flag:'🇰🇷',label:'한',title:'금광은',em:'내 안에 있다.'},
  es:{flag:'🇵🇷',label:'ES',title:'La mina de oro',em:'está dentro.'},
  ja:{flag:'🇯🇵',label:'JP',title:'金鉱は',em:'内にある。'},
  no:{flag:'🇳🇴',label:'NO',title:'Gullgruven',em:'er inni deg.'},
};

window.setLang = function(l) {
  var d = window.NMN_LANGS[l];
  if(!d) return;

  // 1. Update trigger button
  var btn = document.getElementById('langBtn');
  if(btn) btn.textContent = d.flag + ' ' + d.label;

  // 2. Gemini's explicit textNode targeting — keeps <em> intact
  var titleEl = document.querySelector('.hero-title');
  if(titleEl) {
    var textNode = Array.from(titleEl.childNodes).find(function(n){ return n.nodeType === 3; });
    if(textNode) textNode.textContent = d.title + ' ';
    var emEl = titleEl.querySelector('em');
    if(emEl) emEl.textContent = d.em;
  }

  // 3. Save preference
  try { localStorage.setItem('nmn_lang', l); } catch(e){}

  // 4. Close menu
  var menu = document.getElementById('langMenu');
  if(menu) menu.classList.remove('open');

  // 5. Fire lesson popup if available
  if(l !== 'en' && typeof launchLesson === 'function') launchLesson(l);
};

window.toggleLang = function() {
  var menu = document.getElementById('langMenu');
  if(menu) menu.classList.toggle('open');
};

// Close on outside click
document.addEventListener('click', function(e) {
  if(!e.target.closest('.lang-switcher')) {
    var menu = document.getElementById('langMenu');
    if(menu) menu.classList.remove('open');
  }
});

// Restore saved lang — Gemini's 100ms delay for full DOM paint
window.addEventListener('DOMContentLoaded', function() {
  try {
    var saved = localStorage.getItem('nmn_lang');
    if(saved && saved !== 'en') {
      setTimeout(function() { setLang(saved); }, 100);
    }
  } catch(e){}
});
