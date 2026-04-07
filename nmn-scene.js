/* ════════════════════════════════════════════
   nmn-scene.js — Shared Scene Manager
   Fixes level stalls / memory leaks in all games
   Include AFTER nmn-wallet.js and nmn-nav.js
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
    
    // Remove all event listeners safely
    _listeners.forEach(({ el, type, fn }) => {
      if(el) el.removeEventListener(type, fn);
    });
    _listeners = [];
    
    // Clear all canvases on page & reset pending draw paths
    document.querySelectorAll('canvas').forEach(cv => {
      try { 
        const ctx = cv.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, cv.width, cv.height); 
            ctx.beginPath(); // Prevents ghost-rendering from previous scene
        }
      } catch(e){}
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
    if(!el) return;
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

/* NOTE: The legacy NMNWallet block has been permanently REMOVED from this file.
  It was causing a namespace collision and relying on volatile sessionStorage.
  The global economy is now securely managed by `nmn-wallet.js` (localStorage V2).
*/
