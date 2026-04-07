/* nmn-wallet.js — NMN Gold & Gem Wallet
   Load this FIRST before nmn-nav.js and nmn-scene.js
   Defines window.NMNWallet globally so any page can use it
*/
(function(){
  const KEY = 'nmn_wallet_v2';

  function load() {
    try {
      let w = JSON.parse(localStorage.getItem(KEY));
      // V1 to V2 Migration: If no v2 wallet exists, pull from legacy gold
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
      // Legacy key compat (so older pages don't break)
      localStorage.setItem('nmn_total_gold', w.gold);
      
      syncUI(w);
      // Broadcast event so active shops/games can instantly react to wallet changes
      window.dispatchEvent(new CustomEvent('nmn_wallet_update', { detail: w }));
    } catch(e){}
  }

  function syncUI(w) {
    // Automatically updates any gauge on the page that has these IDs
    const gEl = document.getElementById('dgGold');
    if(gEl) gEl.textContent = w.gold;

    const gemEl = document.getElementById('dgGems');
    if(gemEl) gemEl.textContent = w.gems;
    
    const lvlEl = document.getElementById('dgLevel');
    if(lvlEl) lvlEl.textContent = w.level;
  }

  function notify(msg) {
    if(typeof nmnToast === 'function') nmnToast(msg);
    else console.log("NMN Vault:", msg); // Fallback if toast isn't loaded
  }

  window.NMNWallet = {
    get: function() { return load(); },

    addGold: function(amount) {
      if (amount <= 0) return load(); // Prevent using addGold to spend
      const w = load();
      w.gold = (w.gold || 0) + amount;
      save(w);
      return w;
    },

    // Strict spending check — returns true if purchase successful, false if broke
    spendGold: function(amount) {
      const w = load();
      if ((w.gold || 0) >= amount) {
        w.gold -= amount;
        save(w);
        return true; 
      }
      notify('NOT ENOUGH GOLD ⛏');
      return false; 
    },

    addGem: function(amount = 1) {
      const w = load();
      w.gems = (w.gems || 0) + amount;
      save(w);
      return w;
    },

    // Strict gem spending for the Gem Shop
    spendGems: function(amount) {
      const w = load();
      if ((w.gems || 0) >= amount) {
        w.gems -= amount;
        save(w);
        return true;
      }
      notify('NOT ENOUGH GEMS 💎');
      return false;
    },

    addXP: function(amount) {
      const w = load();
      w.xp = (w.xp || 0) + amount;
      
      const oldLevel = w.level || 1;
      w.level = 1 + Math.floor(w.xp / 500); // Level up every 500 XP
      
      if (w.level > oldLevel) {
        notify(`LEVEL UP! You are now Level ${w.level}`);
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
      w.gold = (w.gold || 0) + 100;
      save(w);
      notify('3 GEMS → 100 GOLD');
      return true;
    },

    reset: function() {
      save({gold: 0, gems: 0, xp: 0, level: 1});
    }
  };

  // Auto-update the Depth Gauge on page load
  document.addEventListener('DOMContentLoaded', function(){
    syncUI(load());
  });

})();
