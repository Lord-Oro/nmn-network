/* nmn-wallet.js — NMN Gold & Gem Wallet
   Load this FIRST before nmn-nav.js and nmn-scene.js
   Defines window.NMNWallet globally so any page can use it
*/
(function(){
  const KEY = 'nmn_wallet_v2';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {gold:0,gems:0,xp:0,level:1};
    } catch(e) {
      return {gold:0,gems:0,xp:0,level:1};
    }
  }

  function save(w) {
    try {
      localStorage.setItem(KEY, JSON.stringify(w));
      // Legacy key compat
      localStorage.setItem('nmn_total_gold', w.gold);
    } catch(e){}
  }

  function notify(msg) {
    if(typeof nmnToast === 'function') nmnToast(msg);
  }

  window.NMNWallet = {
    get: function() { return load(); },

    addGold: function(amount) {
      const w = load();
      w.gold = Math.max(0, (w.gold||0) + amount);
      save(w);
      // Update any depth gauge on page
      const el = document.getElementById('dgGold');
      if(el) el.textContent = w.gold;
      return w;
    },

    addGem: function() {
      const w = load();
      w.gems = (w.gems||0) + 1;
      save(w);
      const el = document.getElementById('dgGems');
      if(el) el.textContent = w.gems;
      return w;
    },

    addXP: function(amount) {
      const w = load();
      w.xp = (w.xp||0) + amount;
      // Level up every 500 XP
      w.level = 1 + Math.floor(w.xp / 500);
      save(w);
      return w;
    },

    convertGems: function() {
      const w = load();
      if((w.gems||0) < 3) { notify('NEED 3 GEMS TO CONVERT'); return; }
      w.gems -= 3;
      w.gold = (w.gold||0) + 100;
      save(w);
      notify('3 GEMS → 100 GOLD');
      const gEl = document.getElementById('dgGold');
      if(gEl) gEl.textContent = w.gold;
    },

    reset: function() {
      save({gold:0,gems:0,xp:0,level:1});
    }
  };

  // Auto-update depth gauge on load
  document.addEventListener('DOMContentLoaded', function(){
    const w = load();
    const gEl = document.getElementById('dgGold');
    if(gEl) gEl.textContent = w.gold;
  });

})();
