/* ════════════════════════════════════════════
   nmn-nav.js — V2 The Empire's Central Nervous System
   Handles: Analytics (GA4) & Lore Toasts.
   (Cursor and Nav are now handled natively per-page)
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

// 2. Toast Styles (Stripped old overlapping cursors & double navs)
const injectStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        /* Toast Notifications */
        #nmn-toast { 
            position: fixed; top: 70px; right: 20px; background: #000; 
            border: 2px solid #FFD700; color: #FFF; padding: 15px; 
            font-family: 'VT323', monospace; font-size: 1.2rem; 
            z-index: 1000000; transform: translateX(150%); 
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
            max-width: 300px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); 
            pointer-events: none;
        }
        #nmn-toast.show { transform: translateX(0); }
    `;
    document.head.appendChild(style);
};

const initNav = () => {
    if (!document.body) return setTimeout(initNav, 50);
    injectStyles();

    // 3. Inject Toast HTML ONLY
    document.body.insertAdjacentHTML('afterbegin',`
        <div id="nmn-toast"></div>
    `);

    // 4. Global Toast System (Retention Injection)
    window.nmnToast = function(msg, duration = 3000) {
        const t = document.getElementById('nmn-toast');
        if(!t) return;
        t.innerHTML = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), duration);
    };

    // 5. Auto-Lore Engagement (Triggers every 5 minutes)
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
