/* ════════════════════════════════════════════
   nmn-scene.js — Shared Scene Manager
   Architect's Edition: Fixes memory leaks & 
   syncs game transitions with the Empire's core.
   ════════════════════════════════════════════ */

window.NMNScene = (function(){

    let _afId = null;
    let _intervals = [];
    let _listeners = [];
    let _current = null;
    let _paused = false;

    // ── DESTROY: The "Total Wipe" protocol ──
    // Ensures no ghosts of previous games slow down the current one.
    function destroy() {
        if(_afId){ cancelAnimationFrame(_afId); _afId = null; }
        
        _intervals.forEach(id => clearInterval(id));
        _intervals = [];
        
        _listeners.forEach(({ el, type, fn }) => {
            if(el) el.removeEventListener(type, fn);
        });
        _listeners = [];
        
        document.querySelectorAll('canvas').forEach(cv => {
            try { 
                const ctx = cv.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, cv.width, cv.height); 
                    ctx.beginPath(); 
                }
            } catch(e){}
        });
        
        _current = null;
        _paused = false;
        console.log("NMN_SYSTEM: Scene purged. Memory cleared.");
    }

    // ── GO: Transition logic ──
    function go(name, initFn) {
        destroy();
        // Give the browser 1 frame to breathe before starting new game logic
        requestAnimationFrame(() => {
            _current = name;
            if(typeof initFn === 'function') initFn();
        });
    }

    // ── MANAGED RAF: Safe animation handling ──
    function raf(fn) {
        if (_paused) return;
        _afId = requestAnimationFrame(fn);
        return _afId;
    }

    // ── MANAGED INTERVAL: Safe timer handling ──
    function interval(fn, ms) {
        const id = setInterval(() => {
            if (!_paused) fn();
        }, ms);
        _intervals.push(id);
        return id;
    }

    // ── MANAGED EVENT LISTENER ──
    function on(el, type, fn) {
        if(!el) return;
        el.addEventListener(type, fn);
        _listeners.push({ el, type, fn });
    }

    // ── STATE CONTROLS ──
    function pause() { 
        _paused = true; 
        if(window.nmnToast) nmnToast("SYSTEM PAUSED");
    }
    function resume() { _paused = false; }
    function toggle() { _paused = !_paused; return _paused; }

    // ── THE EXTRACTION SCALE ──
    // Powers the "Infinite Depth" feel. Multiplier grows exponentially.
    function diffScale(level, cycle) {
        return Math.pow(1.20, (cycle - 1) * 5 + (level - 1));
    }

    // ── LEVEL UP PROTOCOL ──
    function checkLevel(score, level, cycle, threshold) {
        const baseThreshold = threshold || (level * 300 * cycle);
        if(score >= baseThreshold) {
            level++;
            if(level > 10) { level = 1; cycle++; }
            
            // Visual feedback for progression
            if(window.nmnToast) nmnToast(`EXTRACTION LEVEL UP: ${level}`, 1500);
            
            // Award bonus XP via global wallet
            if(window.NMNWallet) NMNWallet.addXP(25);

            return { level, cycle, leveled: true };
        }
        return { level, cycle, leveled: false };
    }

    return { destroy, go, raf, interval, on, pause, resume, isPaused: () => _paused, toggle, diffScale, checkLevel };

})();
