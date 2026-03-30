/* ════════════════════════════════════════════
   nmn-scene.js — Shared Scene Manager
   Fixes level stalls / memory leaks in all games
   Include AFTER nmn-nav.js:
   <script src="nmn-scene.js"></script>
   ════════════════════════════════════════════ */

window.NMNScene = (function(){

  let _afId = null;
  let _intervals = [];
  let _listeners = [];
  let _current = null;
  let _paused = false;

  // ── DESTROY current scene completely ──
  function destroy() {
    // Cancel animation frame
    if(_afId){ cancelAnimationFrame(_afId); _afId = null; }
    // Clear all intervals
    _intervals.forEach(id => clearInterval(id));
    _intervals = [];
    // Remove all event listeners
    _listeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    _listeners = [];
    // Clear all canvases on page
    document.querySelectorAll('canvas').forEach(cv => {
      try { cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); } catch(e){}
    });
    _current = null;
    _paused = false;
  }

  // ── TRANSITION to new scene ──
  function go(name, initFn) {
    destroy();
    requestAnimationFrame(() => {
      _current = name;
      if(typeof initFn === 'function') initFn();
    });
  }

  // ── MANAGED RAF ──
  function raf(fn) {
    _afId = requestAnimationFrame(fn);
    return _afId;
  }

  // ── MANAGED INTERVAL ──
  function interval(fn, ms) {
    const id = setInterval(fn, ms);
    _intervals.push(id);
    return id;
  }

  // ── MANAGED EVENT LISTENER ──
  function on(el, type, fn) {
    el.addEventListener(type, fn);
    _listeners.push({ el, type, fn });
  }

  // ── PAUSE / RESUME ──
  function pause() { _paused = true; }
  function resume() { _paused = false; }
  function isPaused() { return _paused; }
  function toggle() { _paused = !_paused; return _paused; }

  // ── INFINITE DIFFICULTY SCALING ──
  // Returns a multiplier that scales 15% per cycle, no ceiling
  function diffScale(level, cycle) {
    return Math.pow(1.15, (cycle - 1) * 5 + (level - 1));
  }

  // ── LEVEL UP HELPER ──
  // Call on every score increase. Returns {level, cycle, leveled} 
  function checkLevel(score, level, cycle, threshold) {
    const t = threshold || (level * 250 * cycle);
    if(score >= t) {
      level++;
      if(level > 6) { level = 1; cycle++; }
      return { level, cycle, leveled: true };
    }
    return { level, cycle, leveled: false };
  }

  return { destroy, go, raf, interval, on, pause, resume, isPaused, toggle, diffScale, checkLevel };

})();

// ── GLOBAL GOLD WALLET (persists across pages via sessionStorage) ──
window.NMNWallet = (function(){
  const KEY = 'nmn_wallet';

  function load() {
    try { return JSON.parse(sessionStorage.getItem(KEY)) || { gold:0, xp:0, level:1, gems:[false,false,false,false,false] }; }
    catch(e) { return { gold:0, xp:0, level:1, gems:[false,false,false,false,false] }; }
  }

  function save(w) {
    try { sessionStorage.setItem(KEY, JSON.stringify(w)); } catch(e) {}
  }

  function get() { return load(); }

  function addGold(n) {
    const w = load(); w.gold += n; save(w);
    window.nmnToast && nmnToast(`+${n} 💎 GOLD`);
    updateUI(w); return w;
  }

  function addXP(n) {
    const w = load(); w.xp += n;
    if(w.xp >= w.level * 100) { w.xp -= w.level * 100; w.level++; window.nmnToast && nmnToast(`⬆ RANK UP! LEVEL ${w.level}`); }
    save(w); updateUI(w); return w;
  }

  function addGem() {
    const w = load();
    const i = w.gems.findIndex(g => !g);
    if(i < 0) { convertGems(); return load(); }
    w.gems[i] = true;
    if(w.gems.every(Boolean)) { save(w); convertGems(); return load(); }
    save(w); updateUI(w); return w;
  }

  function convertGems() {
    const w = load();
    const n = w.gems.filter(Boolean).length;
    if(!n) return w;
    w.gold += n * 10; w.gems = [false,false,false,false,false];
    save(w); window.nmnToast && nmnToast(`💎 ${n} GEMS → +${n*10} GOLD`);
    updateUI(w); return w;
  }

  function updateUI(w) {
    ['nmn-gold','gold-disp','gold-display'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.textContent = w.gold;
    });
    ['nmn-xp','xp-disp'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.textContent = w.xp;
    });
    ['nmn-level','lvl-disp','player-level'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.textContent = w.level;
    });
    for(let i=0;i<5;i++) {
      const pip = document.getElementById('gp'+i) || document.getElementById('gem-pip-'+i);
      if(pip) { pip.classList.toggle('lit', w.gems[i]); pip.classList.toggle('nmn-gem-pip', true); }
    }
  }

  // Init UI on load
  document.addEventListener('DOMContentLoaded', () => updateUI(load()));

  return { get, addGold, addXP, addGem, convertGems, updateUI };

})();
