/* ════════════════════════════════════════════
   nmn-nav.js — The Empire's Central Nervous System
   Handles: Analytics, Global Nav, Lantern Cursor, 
   Lore Toasts, and Wallet Syncing.
   ════════════════════════════════════════════ */

// 1. Google Analytics Handshake
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

(function(){

// 2. The Architect's Styles (Direct Injection to fix Cursor/Nav visibility)
const injectStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        /* Cursor & Halo */
        #nmn-cursor { position: fixed; pointer-events: none; z-index: 100000; transform: translate(-50%, -50%); transition: transform 0.1s; opacity: 0; }
        #nmn-halo { position: fixed; pointer-events: none; z-index: 99999; width: 150px; height: 150px; background: radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%); transform: translate(-50%, -50%); pointer-events: none; }
        #nmn-pool { position: fixed; pointer-events: none; z-index: 99998; width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%); transform: translate(-50%, -50%); }
        
        #nmn-cursor.hot { transform: translate(-50%, -50%) scale(1.2); }
        .l-flame { animation: flicker 0.1s infinite alternate; }
        @keyframes flicker { from { opacity: 0.8; transform: scale(0.9); } to { opacity: 1; transform: scale(1.1); } }

        /* Shared Nav */
        #nmn-nav { position: fixed; top: 0; left: 0; right: 0; height: 56px; background: rgba(5,3,2,0.95); border-bottom: 2px solid #8B6914; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; z-index: 99997; backdrop-filter: blur(5px); font-family: 'Press Start 2P', cursive; }
        .nmn-nav-logo { color: #FFD700; text-decoration: none; font-size: 0.8rem; text-shadow: 0 0 10px rgba(255,215,0,0.4); }
        .nmn-nav-links { display: flex; gap: 15px; }
        .nmn-nav-link { color: #8a7654; text-decoration: none; font-size: 0.45rem; transition: color 0.3s; }
        .nmn-nav-link:hover { color: #FFD700; }
        .nmn-nav-back { color: #00FF88; text-decoration: none; font-size: 0.45rem; border: 1px solid #00FF88; padding: 5px 10px; }

        /* Toast Notifications */
        #nmn-toast { position: fixed; top: 70px; right: 20px; background: #000; border: 2px solid #FFD700; color: #FFF; padding: 15px; font-family: 'VT323', monospace; font-size: 1.2rem; z-index: 100001; transform: translateX(120%); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width: 300px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
        #nmn-toast.show { transform: translateX(0); }
    `;
    document.head.appendChild(style);
};

const initNav = () => {
    if (!document.body) return setTimeout(initNav, 50);
    injectStyles();

    // 3. Inject Cursor HTML
    document.body.insertAdjacentHTML('afterbegin',`
    <div id="nmn-pool"></div>
    <div id="nmn-halo"></div>
    <div id="nmn-cursor">
      <svg viewBox="0 0 48 64" width="32" height="42" xmlns="http://www.w3.org/2000/svg">
        <g class="l-body">
          <rect x="14" y="13" width="20" height="26" fill="#FFD700" opacity="0.3" rx="1"/>
          <g class="l-flame">
            <ellipse cx="24" cy="26" rx="5" ry="7" fill="#FF8C00" opacity="0.9"/>
            <ellipse cx="24" cy="27" rx="3.5" ry="5" fill="#FFD700"/>
          </g>
          <rect x="14" y="8" width="20" height="3" fill="#8B6914" rx="1"/>
          <rect x="14" y="13" width="3" height="26" fill="#8B6914"/>
          <rect x="31" y="13" width="3" height="26" fill="#8B6914"/>
          <rect x="14" y="39" width="20" height="3" fill="#8B6914" rx="1"/>
        </g>
      </svg>
    </div>
    <div id="nmn-toast"></div>
    `);

    // 4. Inject Dynamic Nav
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const isHome = path === 'index.html' || path === '';
    const backBtn = !isHome ? `<a href="index.html" class="nmn-nav-back">← BACK</a>` : '';

    document.body.insertAdjacentHTML('afterbegin',`
    <nav id="nmn-nav">
      <a href="index.html" class="nmn-nav-logo">⛏ NMN</a>
      <div class="nmn-nav-links">
        <a href="games.html" class="nmn-nav-link">GAMES</a>
        <a href="oracle.html" class="nmn-nav-link">ORACLE</a>
        <a href="library.html" class="nmn-nav-link">BOOKS</a>
        <a href="expansion.html" class="nmn-nav-link">UPDATES</a>
      </div>
      ${backBtn}
    </nav>
    `);

    // 5. Cursor Tracking Logic
    const CE = document.getElementById('nmn-cursor');
    const HA = document.getElementById('nmn-halo');
    const PO = document.getElementById('nmn-pool');
    const isTouch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));

    if (!isTouch) {
        CE.style.opacity = '1';
        document.addEventListener('mousemove', e => {
            const x = e.clientX, y = e.clientY;
            CE.style.left = x + 'px'; CE.style.top = y + 'px';
            HA.style.left = x + 'px'; HA.style.top = y + 'px';
            PO.style.left = x + 'px'; PO.style.top = y + 'px';
        });

        const bindHot = (el) => {
            el.addEventListener('mouseenter', () => CE.classList.add('hot'));
            el.addEventListener('mouseleave', () => CE.classList.remove('hot'));
        };
        document.querySelectorAll('a, button, .action-btn, .upgrade-card').forEach(bindHot);
    } else {
        [CE, HA, PO].forEach(el => el.style.display = 'none');
    }

    // 6. Global Toast System (Retention Injection)
    window.nmnToast = function(msg, duration = 3000) {
        const t = document.getElementById('nmn-toast');
        if(!t) return;
        t.innerHTML = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), duration);
    };

    // Auto-Lore Engagement (Triggers once every 5 minutes if tab stays open)
    setInterval(() => {
        const prompts = [
            "LORE EXTRACT: 'The first soul chose Felik before he was born...'",
            "EXTRACTION READY: 'Outbreak from the Stars' is now available.",
            "MINER TIP: Use Gold to unlock new chapters in the Grimoire."
        ];
        window.nmnToast(prompts[Math.floor(Math.random()*prompts.length)]);
    }, 300000);
};

initNav();
})();
