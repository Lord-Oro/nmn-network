/* ════════════════════════════════════════════
   nmn-wallet.js — The Empire's Treasury (V2.1)
   Handles: Gold, Gems, XP, Ranks, and Economy Sync.
   ════════════════════════════════════════════ */
(function(){
    const KEY = 'nmn_wallet_v2';

    // ── RANKS: Identity progression based on Level ──
    const RANKS = [
        "Surface Dweller", "Novice Digger", "Stone Worker", 
        "Vein Sealer", "Deep Miner", "Obsidian Guard", 
        "Artifact Hunter", "Abyssal Architect", "Empire Guardian"
    ];

    function load() {
        try {
            let w = JSON.parse(localStorage.getItem(KEY));
            if (!w) {
                const legacyGold = parseInt(localStorage.getItem('nmn_total_gold')) || 0;
                w = { gold: legacyGold, gems: 0, xp: 0, level: 1 };
                save(w);
            }
            return w;
        } catch(e) {
            return {gold: 0, gems: 0, xp: 0, level: 1};
        }
    }

    function save(w) {
        try {
            localStorage.setItem(KEY, JSON.stringify(w));
            localStorage.setItem('nmn_total_gold', w.gold); // Legacy support
            syncUI(w);
            window.dispatchEvent(new CustomEvent('nmn_wallet_update', { detail: w }));
        } catch(e){}
    }

    function syncUI(w) {
        const update = (id, val) => {
            const el = document.getElementById(id);
            if(el) el.textContent = val.toLocaleString();
        };
        update('dgGold', w.gold);
        update('dgGems', w.gems);
        update('dgLevel', w.level);
        
        // Update Rank Display if it exists
        const rankEl = document.getElementById('dgRank');
        if(rankEl) {
            const rankIdx = Math.min(Math.floor((w.level - 1) / 2), RANKS.length - 1);
            rankEl.textContent = RANKS[rankIdx].toUpperCase();
        }
    }

    function notify(msg) {
        if(typeof nmnToast === 'function') nmnToast(msg);
        else console.log("NMN_WALLET:", msg);
    }

    window.NMNWallet = {
        get: function() { return load(); },

        addGold: function(amount) {
            if (amount <= 0) return load();
            const w = load();
            w.gold = (w.gold || 0) + amount;
            save(w);
            return w;
        },

        spendGold: function(amount) {
            const w = load();
            if ((w.gold || 0) >= amount) {
                w.gold -= amount;
                save(w);
                return true; 
            }
            notify('INSUFFICIENT GOLD ⛏');
            return false; 
        },

        addGem: function(amount = 1) {
            const w = load();
            w.gems = (w.gems || 0) + amount;
            save(w);
            notify(`+${amount} GEM SECURED 💎`);
            return w;
        },

        spendGems: function(amount) {
            const w = load();
            if ((w.gems || 0) >= amount) {
                w.gems -= amount;
                save(w);
                return true;
            }
            notify('INSUFFICIENT GEMS 💎');
            return false;
        },

        addXP: function(amount) {
            const w = load();
            w.xp = (w.xp || 0) + amount;
            const oldLevel = w.level || 1;
            w.level = 1 + Math.floor(w.xp / 500); 
            
            if (w.level > oldLevel) {
                const rankIdx = Math.min(Math.floor((w.level - 1) / 2), RANKS.length - 1);
                notify(`RANK INCREASE: ${RANKS[rankIdx].toUpperCase()}`);
            }
            save(w);
            return w;
        },

        convertGems: function() {
            const w = load();
            if((w.gems || 0) < 3) { 
                notify('NEED 3 GEMS TO CONVERT'); 
                return false; 
            }
            w.gems -= 3;
            w.gold = (w.gold || 0) + 250; // BUFFED: 3 gems now worth 250 gold
            save(w);
            notify('ALCHEMICAL SUCCESS: +250 GOLD');
            return true;
        },

        // ── NEW: PASSIVE YIELD ──
        // Call this on page load to reward users for staying on the site
        applyPassiveYield: function() {
            const w = load();
            const now = Date.now();
            const last = parseInt(localStorage.getItem('nmn_last_yield') || now);
            const seconds = Math.floor((now - last) / 1000);
            
            if (seconds > 60) {
                const yield = Math.min(Math.floor(seconds / 60) * w.level, 100); // 1 gold per level per minute, capped at 100
                if (yield > 0) {
                    w.gold += yield;
                    save(w);
                    notify(`AUTO-EXTRACTORS FOUND ${yield}G WHILE AWAY`);
                }
            }
            localStorage.setItem('nmn_last_yield', now.toString());
        },

        reset: function() {
            if(confirm("PERMANENTLY WIPE EMPIRE STANDING?")) {
                save({gold: 0, gems: 0, xp: 0, level: 1});
                localStorage.removeItem('nmn_last_yield');
                location.reload();
            }
        }
    };

    document.addEventListener('DOMContentLoaded', function(){
        const wallet = load();
        syncUI(wallet);
        window.NMNWallet.applyPassiveYield();
    });

})();
