// pages/yard/yard.js - 核心游戏场景逻辑

const cloudService = require('../../services/cloudService');
const { CATS } = require('../../data/cats');
const { ITEMS } = require('../../data/items');
const CONFIG = require('../../data/config');

Page({
  data: {
    // 场景
    currentScene: 'yard', // 'yard' | 'indoor'
    sceneName: '后院',

    // 场景槽位（6个）
    slots: Array(6).fill(null),  // 每个元素：itemId 或 null
    cats: [],                     // [{ catId, slotIndex, stayRounds }]
    slotsData: [],                // 渲染用：[{ slotIndex, itemId, cat }]
    
    // 货币
    fishCount: 0,
    goldFishCount: 0,
    pendingFish: 0,
    pendingGoldFish: 0,

    // 背包相关
    showBagPanel: false,
    inventory: {},         // { itemId: count }
    bagItemList: [],       // 渲染用道具列表
    selectedSlot: -1,      // 当前选中的槽位

    // 猫咪详情弹窗
    showCatDetail: false,
    detailCat: null,

    // UI 状态
    isRefreshing: false,
    hasPendingFish: false,

    // 刷新倒计时
    refreshCountdown: 30,
  },

  _refreshTimer: null,
  _countdownTimer: null,

  onLoad() {
    this._loadGameData();
  },

  onShow() {
    const app = getApp();
    this.setData({
      fishCount: app.globalData.fishCount || 0,
      goldFishCount: app.globalData.goldFishCount || 0,
    });
    this._startRefreshTimer();
  },

  onHide() {
    this._stopTimers();
  },

  onUnload() {
    this._stopTimers();
  },

  // 供 app.js 调用
  onRefreshTrigger() {
    this._doRefresh();
  },

  // ===== slotsData 构建（将 slots + cats 合并为渲染用数据）=====
  _buildSlotsData(slots, cats) {
    return slots.map((itemId, idx) => {
      const cat = (cats || []).find(c => c.slotIndex === idx) || null;
      return { slotIndex: idx, itemId: itemId || '', cat };
    });
  },

  // ===== 数据加载 =====

  async _loadGameData() {
    wx.showLoading({ title: '加载中...', mask: true });
    try {
      const [playerData, inventory, layout] = await Promise.all([
        cloudService.getPlayerData(),
        cloudService.getInventory(),
        cloudService.getSceneLayout(this.data.currentScene),
      ]);

      const app = getApp();
      const fishCount = playerData.fishCount ?? app.globalData.fishCount ?? CONFIG.INIT_FISH;
      const goldFishCount = playerData.goldFishCount ?? app.globalData.goldFishCount ?? 0;
      
      app.globalData.fishCount = fishCount;
      app.globalData.goldFishCount = goldFishCount;

      const bagItemList = this._buildBagList(inventory);

      const slotsArr = layout.slots || Array(6).fill(null);
      const catsArr = layout.cats || [];

      this.setData({
        fishCount,
        goldFishCount,
        inventory,
        bagItemList,
        slots: slotsArr,
        cats: catsArr,
        slotsData: this._buildSlotsData(slotsArr, catsArr),
        pendingFish: layout.pendingFish || 0,
        pendingGoldFish: layout.pendingGoldFish || 0,
        hasPendingFish: (layout.pendingFish || 0) > 0,
      });
    } catch (e) {
      console.error('_loadGameData error:', e);
    } finally {
      wx.hideLoading();
    }
    this._startRefreshTimer();
  },

  _buildBagList(inventory) {
    return ITEMS
      .filter(item => (inventory[item.id] || 0) > 0 || item.isDefault)
      .map(item => ({
        ...item,
        count: inventory[item.id] || (item.isDefault ? 1 : 0),
      }));
  },

  // ===== 定时刷新 =====

  _startRefreshTimer() {
    this._stopTimers();
    this._countdownTimer = setInterval(() => {
      const cd = this.data.refreshCountdown - 1;
      if (cd <= 0) {
        this.setData({ refreshCountdown: CONFIG.REFRESH_INTERVAL / 1000 });
        this._doRefresh();
      } else {
        this.setData({ refreshCountdown: cd });
      }
    }, 1000);
  },

  _stopTimers() {
    if (this._refreshTimer) clearTimeout(this._refreshTimer);
    if (this._countdownTimer) clearInterval(this._countdownTimer);
  },

  async _doRefresh() {
    if (this.data.isRefreshing) return;
    this.setData({ isRefreshing: true });
    try {
      const result = await cloudService.refreshCats(this.data.currentScene);
      const { cats, pendingFish, pendingGoldFish } = result;

      const totalPending = (this.data.pendingFish || 0) + (pendingFish || 0);
      const totalPendingGold = (this.data.pendingGoldFish || 0) + (pendingGoldFish || 0);

      // 更新图鉴（新到访的猫）
      const prevCatIds = new Set(this.data.cats.map(c => c.catId));
      for (const cat of (cats || [])) {
        if (!prevCatIds.has(cat.catId)) {
          await cloudService.unlockCat(cat.catId);
        }
      }

      this.setData({
        cats: cats || [],
        slotsData: this._buildSlotsData(this.data.slots, cats || []),
        pendingFish: totalPending,
        pendingGoldFish: totalPendingGold,
        hasPendingFish: totalPending > 0,
        refreshCountdown: CONFIG.REFRESH_INTERVAL / 1000,
      });

      if (pendingFish > 0) {
        wx.showToast({ title: `猫咪带来 ${pendingFish} 🐟`, icon: 'none', duration: 1500 });
      }
    } catch (e) {
      console.error('refresh error:', e);
    } finally {
      this.setData({ isRefreshing: false });
    }
  },

  // ===== 场景切换 =====

  onSceneSwitch() {
    const newScene = this.data.currentScene === 'yard' ? 'indoor' : 'yard';
    const newName = newScene === 'yard' ? '后院' : '室内';
    this.setData({
      currentScene: newScene,
      sceneName: newName,
      slots: Array(6).fill(null),
      cats: [],
      slotsData: this._buildSlotsData(Array(6).fill(null), []),
      selectedSlot: -1,
      showBagPanel: false,
    });
    this._loadSceneLayout(newScene);
  },

  async _loadSceneLayout(scene) {
    const layout = await cloudService.getSceneLayout(scene);
    this.setData({
      slots: layout.slots || Array(6).fill(null),
      cats: layout.cats || [],
      slotsData: this._buildSlotsData(layout.slots || Array(6).fill(null), layout.cats || []),
      pendingFish: (this.data.pendingFish || 0) + (layout.pendingFish || 0),
      hasPendingFish: (this.data.pendingFish || 0) + (layout.pendingFish || 0) > 0,
    });
  },

  // ===== 收取鱼干 =====

  async onCollectFish() {
    const { pendingFish, pendingGoldFish } = this.data;
    if (pendingFish <= 0 && pendingGoldFish <= 0) return;

    const result = await cloudService.updateFishCount(pendingFish, pendingGoldFish);
    const app = getApp();
    app.globalData.fishCount = result.fishCount;
    app.globalData.goldFishCount = result.goldFishCount;

    this.setData({
      fishCount: result.fishCount,
      goldFishCount: result.goldFishCount,
      pendingFish: 0,
      pendingGoldFish: 0,
      hasPendingFish: false,
    });

    wx.showToast({
      title: `收取 ${pendingFish}🐟 ${pendingGoldFish > 0 ? pendingGoldFish + '🌟' : ''}`,
      icon: 'success',
      duration: 2000,
    });
  },

  // ===== 背包和道具摆放 =====

  onOpenBag() {
    const bagItemList = this._buildBagList(this.data.inventory);
    this.setData({ showBagPanel: true, bagItemList });
  },

  onCloseBag() {
    this.setData({ showBagPanel: false, selectedSlot: -1 });
  },

  onSlotTap(e) {
    const { slotIndex, itemId } = e.detail;
    if (this.data.showBagPanel) {
      // 背包面板打开时：点击槽位切换选中
      this.setData({ selectedSlot: slotIndex });
    } else if (itemId) {
      // 没打开背包：点击有道具的槽位可以收回
      wx.showActionSheet({
        itemList: ['收回道具'],
        success: async (res) => {
          if (res.tapIndex === 0) {
            await this._removeItemFromSlot(slotIndex);
          }
        }
      });
    } else {
      // 空槽位：打开背包
      this.setData({ showBagPanel: true, selectedSlot: slotIndex });
    }
  },

  onCatTap(e) {
    const { cat } = e.detail;
    const catData = CATS.find(c => c.id === cat.catId);
    this.setData({ showCatDetail: true, detailCat: catData });
  },

  onCloseCatDetail() {
    this.setData({ showCatDetail: false, detailCat: null });
  },

  async onSelectItem(e) {
    const { itemId } = e.currentTarget.dataset;
    const { selectedSlot, slots, inventory } = this.data;
    
    if (selectedSlot < 0) {
      // 先选槽位
      wx.showToast({ title: '请先选择一个槽位', icon: 'none' });
      return;
    }
    
    if ((inventory[itemId] || 0) <= 0) {
      wx.showToast({ title: '道具数量不足', icon: 'none' });
      return;
    }

    const newSlots = [...slots];
    const oldItemId = newSlots[selectedSlot];
    newSlots[selectedSlot] = itemId;

    // 更新本地状态
    const newInventory = { ...inventory };
    newInventory[itemId] = (newInventory[itemId] || 0) - 1;
    if (oldItemId) {
      newInventory[oldItemId] = (newInventory[oldItemId] || 0) + 1;
    }

    this.setData({
      slots: newSlots,
      inventory: newInventory,
      bagItemList: this._buildBagList(newInventory),
      slotsData: this._buildSlotsData(newSlots, this.data.cats),
      showBagPanel: false,
      selectedSlot: -1,
    });

    // 同步到云端
    await cloudService.updateSlot(this.data.currentScene, selectedSlot, itemId);
    await cloudService.addToInventory(itemId, -1);
    if (oldItemId) await cloudService.addToInventory(oldItemId, 1);
  },

  async _removeItemFromSlot(slotIndex) {
    const { slots, inventory, currentScene } = this.data;
    const itemId = slots[slotIndex];
    if (!itemId) return;

    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    const newInventory = { ...inventory };
    newInventory[itemId] = (newInventory[itemId] || 0) + 1;

    this.setData({
      slots: newSlots,
      inventory: newInventory,
      bagItemList: this._buildBagList(newInventory),
      slotsData: this._buildSlotsData(newSlots, this.data.cats),
    });

    await cloudService.updateSlot(currentScene, slotIndex, null);
    await cloudService.addToInventory(itemId, 1);
  },

  // 手动刷新
  async onManualRefresh() {
    await this._doRefresh();
  },
});
