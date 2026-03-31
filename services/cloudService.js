// services/cloudService.js - 微信云开发封装层

const { CATS } = require('../data/cats');
const { ITEMS } = require('../data/items');
const CONFIG = require('../data/config');

const DB_COLLECTIONS = {
  PLAYERS: 'players',
  INVENTORY: 'inventory',
  SCENE_LAYOUT: 'scene_layout',
  CATBOOK: 'catbook',
};

class CloudService {
  constructor() {
    this._db = null;
    this._openid = null;
  }

  get db() {
    if (!this._db) {
      this._db = wx.cloud.database();
    }
    return this._db;
  }

  // ===== 初始化 =====

  async initPlayer() {
    try {
      const res = await wx.cloud.callFunction({ name: 'initPlayer' });
      return res.result;
    } catch (e) {
      console.error('initPlayer error:', e);
      return this._getLocalPlayerData();
    }
  }

  // ===== 玩家数据 =====

  async getPlayerData() {
    try {
      const res = await this.db.collection(DB_COLLECTIONS.PLAYERS)
        .where({ _openid: '{openid}' })
        .get();
      if (res.data && res.data.length > 0) {
        const data = res.data[0];
        this._cachePlayerData(data);
        return data;
      }
    } catch (e) {
      console.error('getPlayerData error:', e);
    }
    return this._getLocalPlayerData();
  }

  async updateFishCount(delta, goldDelta = 0) {
    const app = getApp();
    const newFish = (app.globalData.fishCount || 0) + delta;
    const newGold = (app.globalData.goldFishCount || 0) + goldDelta;
    app.globalData.fishCount = newFish;
    app.globalData.goldFishCount = newGold;
    
    // 本地缓存
    this._cachePlayerData({ fishCount: newFish, goldFishCount: newGold });
    
    // 云端同步（防抖处理）
    clearTimeout(this._fishSyncTimer);
    this._fishSyncTimer = setTimeout(async () => {
      try {
        await this.db.collection(DB_COLLECTIONS.PLAYERS)
          .where({ _openid: '{openid}' })
          .update({
            data: {
              fishCount: newFish,
              goldFishCount: newGold,
              updatedAt: this.db.serverDate(),
            }
          });
      } catch (e) {
        console.error('sync fish error:', e);
      }
    }, 2000);
    
    return { fishCount: newFish, goldFishCount: newGold };
  }

  // ===== 背包 =====

  async getInventory() {
    try {
      const res = await this.db.collection(DB_COLLECTIONS.INVENTORY)
        .where({ _openid: '{openid}' })
        .get();
      const inventory = {};
      (res.data || []).forEach(item => {
        inventory[item.itemId] = item.count;
      });
      wx.setStorageSync('inventory', inventory);
      return inventory;
    } catch (e) {
      return wx.getStorageSync('inventory') || {};
    }
  }

  async addToInventory(itemId, count = 1) {
    const inventory = await this.getInventory();
    const current = inventory[itemId] || 0;
    const newCount = current + count;
    
    try {
      const existing = await this.db.collection(DB_COLLECTIONS.INVENTORY)
        .where({ _openid: '{openid}', itemId })
        .get();
      
      if (existing.data && existing.data.length > 0) {
        await this.db.collection(DB_COLLECTIONS.INVENTORY)
          .doc(existing.data[0]._id)
          .update({ data: { count: newCount } });
      } else {
        await this.db.collection(DB_COLLECTIONS.INVENTORY)
          .add({ data: { itemId, count: newCount } });
      }
    } catch (e) {
      console.error('addToInventory error:', e);
    }
    
    // 更新本地缓存
    const cached = wx.getStorageSync('inventory') || {};
    cached[itemId] = newCount;
    wx.setStorageSync('inventory', cached);
    
    return newCount;
  }

  // ===== 场景布局 =====

  async getSceneLayout(scene) {
    try {
      const res = await this.db.collection(DB_COLLECTIONS.SCENE_LAYOUT)
        .where({ _openid: '{openid}', scene })
        .get();
      if (res.data && res.data.length > 0) {
        const layout = res.data[0];
        wx.setStorageSync(`scene_${scene}`, layout);
        return layout;
      }
    } catch (e) {
      console.error('getSceneLayout error:', e);
    }
    return wx.getStorageSync(`scene_${scene}`) || {
      scene,
      slots: Array(CONFIG.YARD_SLOTS).fill(null),
      cats: [],
      pendingFish: 0,
    };
  }

  async updateSlot(scene, slotIndex, itemId) {
    const layout = await this.getSceneLayout(scene);
    layout.slots[slotIndex] = itemId;
    
    try {
      const res = await this.db.collection(DB_COLLECTIONS.SCENE_LAYOUT)
        .where({ _openid: '{openid}', scene })
        .get();
      
      if (res.data && res.data.length > 0) {
        await this.db.collection(DB_COLLECTIONS.SCENE_LAYOUT)
          .doc(res.data[0]._id)
          .update({ data: { slots: layout.slots, updatedAt: this.db.serverDate() } });
      } else {
        await this.db.collection(DB_COLLECTIONS.SCENE_LAYOUT)
          .add({ data: { scene, slots: layout.slots, cats: [], pendingFish: 0 } });
      }
    } catch (e) {
      console.error('updateSlot error:', e);
    }
    
    wx.setStorageSync(`scene_${scene}`, layout);
    return layout;
  }

  // ===== 猫咪刷新 =====

  async refreshCats(scene) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'refreshCats',
        data: { scene },
      });
      
      if (res.result) {
        const { cats, pendingFish, pendingGoldFish } = res.result;
        
        // 更新本地缓存
        const layout = wx.getStorageSync(`scene_${scene}`) || {};
        layout.cats = cats || [];
        layout.pendingFish = (layout.pendingFish || 0) + (pendingFish || 0);
        layout.pendingGoldFish = (layout.pendingGoldFish || 0) + (pendingGoldFish || 0);
        wx.setStorageSync(`scene_${scene}`, layout);
        
        return { cats: cats || [], pendingFish, pendingGoldFish };
      }
    } catch (e) {
      console.error('refreshCats cloud error, using local fallback:', e);
      return this._localRefreshCats(scene);
    }
  }

  // 本地兜底刷新逻辑
  async _localRefreshCats(scene) {
    const layout = wx.getStorageSync(`scene_${scene}`) || { slots: [], cats: [] };
    const slots = layout.slots || [];
    
    // 计算吸引力
    let totalWeight = 0;
    const weights = {};
    CATS.forEach(cat => {
      let w = 0;
      slots.forEach(itemId => {
        if (!itemId) return;
        const item = ITEMS.find(i => i.id === itemId);
        if (!item) return;
        const base = item.attractWeight * CONFIG.RARITY_BASE_CHANCE[cat.rarity];
        const multi = item.catMultiplier[cat.id] || 1;
        w += base * multi;
      });
      weights[cat.id] = w;
      totalWeight += w;
    });
    
    if (totalWeight === 0) return { cats: [], pendingFish: 0 };
    
    // 按权重随机选取猫咪
    const maxCats = Math.min(CONFIG.MAX_CATS_PER_SCENE, slots.filter(Boolean).length);
    const selectedCats = [];
    const pool = [...CATS];
    
    for (let i = 0; i < maxCats && pool.length > 0; i++) {
      const roll = Math.random() * totalWeight;
      let sum = 0;
      let selected = null;
      for (const cat of pool) {
        sum += weights[cat.id] || 0;
        if (roll <= sum) { selected = cat; break; }
      }
      if (selected && Math.random() < 0.7) {
        selectedCats.push({ catId: selected.id, slotIndex: i, stayRounds: Math.floor(Math.random() * 3) + 1 });
        pool.splice(pool.indexOf(selected), 1);
      }
    }
    
    layout.cats = selectedCats;
    wx.setStorageSync(`scene_${scene}`, layout);
    return { cats: selectedCats, pendingFish: 0 };
  }

  // ===== 图鉴 =====

  async getCatbook() {
    try {
      const res = await this.db.collection(DB_COLLECTIONS.CATBOOK)
        .where({ _openid: '{openid}' })
        .get();
      const catbook = {};
      (res.data || []).forEach(record => {
        catbook[record.catId] = record;
      });
      wx.setStorageSync('catbook', catbook);
      return catbook;
    } catch (e) {
      return wx.getStorageSync('catbook') || {};
    }
  }

  async unlockCat(catId) {
    const catbook = await this.getCatbook();
    const now = new Date().toISOString();
    
    if (!catbook[catId]) {
      catbook[catId] = { catId, firstVisit: now, visitCount: 1, lastVisit: now };
      try {
        await this.db.collection(DB_COLLECTIONS.CATBOOK)
          .add({ data: { catId, firstVisit: now, visitCount: 1, lastVisit: now } });
      } catch (e) {
        console.error('unlockCat error:', e);
      }
    } else {
      catbook[catId].visitCount += 1;
      catbook[catId].lastVisit = now;
      try {
        const res = await this.db.collection(DB_COLLECTIONS.CATBOOK)
          .where({ _openid: '{openid}', catId })
          .get();
        if (res.data && res.data.length > 0) {
          await this.db.collection(DB_COLLECTIONS.CATBOOK)
            .doc(res.data[0]._id)
            .update({ data: { visitCount: catbook[catId].visitCount, lastVisit: now } });
        }
      } catch (e) {
        console.error('update catbook error:', e);
      }
    }
    
    wx.setStorageSync('catbook', catbook);
    return catbook[catId];
  }

  // ===== 内部工具 =====

  _cachePlayerData(data) {
    wx.setStorageSync('playerData', {
      fishCount: data.fishCount || 0,
      goldFishCount: data.goldFishCount || 0,
    });
  }

  _getLocalPlayerData() {
    const cached = wx.getStorageSync('playerData');
    return {
      fishCount: cached ? cached.fishCount : CONFIG.INIT_FISH,
      goldFishCount: cached ? cached.goldFishCount : 0,
    };
  }
}

module.exports = new CloudService();
