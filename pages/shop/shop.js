// pages/shop/shop.js - 商店页

const cloudService = require('../../services/cloudService');
const { ITEMS, getItemSVG } = require('../../data/items');

Page({
  data: {
    activeTab: 'food',   // food | goods
    fishCount: 0,
    goldFishCount: 0,
    inventory: {},
    displayItems: [],

    // 购买确认弹窗
    showConfirm: false,
    confirmItem: null,
  },

  onLoad() {
    this._loadData();
  },

  onShow() {
    const app = getApp();
    this.setData({
      fishCount: app.globalData.fishCount || 0,
      goldFishCount: app.globalData.goldFishCount || 0,
    });
    this._loadData();
  },

  async _loadData() {
    try {
      const inventory = await cloudService.getInventory();
      this.setData({ inventory });
      this._buildItems(this.data.activeTab, inventory);
    } catch (e) {
      this._buildItems(this.data.activeTab, {});
    }
  },

  _buildItems(tab, inventory) {
    inventory = inventory || this.data.inventory;
    const list = ITEMS
      .filter(item => item.type === tab && item.price > 0)
      .map(item => ({
        ...item,
        svgUri: getItemSVG(item.id),
        owned: (inventory[item.id] || 0) > 0,
        ownedCount: inventory[item.id] || 0,
        canAfford: (getApp().globalData.fishCount || 0) >= item.price,
      }));
    this.setData({ displayItems: list, activeTab: tab });
  },

  onTabChange(e) {
    this._buildItems(e.currentTarget.dataset.tab);
  },

  onBuyTap(e) {
    const { itemId } = e.currentTarget.dataset;
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return;
    this.setData({ showConfirm: true, confirmItem: item });
  },

  onCancelBuy() {
    this.setData({ showConfirm: false, confirmItem: null });
  },

  async onConfirmBuy() {
    const { confirmItem, fishCount } = this.data;
    if (!confirmItem) return;

    if (fishCount < confirmItem.price) {
      wx.showToast({ title: '鱼干不足！', icon: 'none' });
      this.setData({ showConfirm: false, confirmItem: null });
      return;
    }

    wx.showLoading({ title: '购买中...', mask: true });
    try {
      // 扣除鱼干
      const result = await cloudService.updateFishCount(-confirmItem.price);
      // 加入背包
      await cloudService.addToInventory(confirmItem.id, 1);

      const app = getApp();
      app.globalData.fishCount = result.fishCount;

      const newInventory = { ...this.data.inventory };
      newInventory[confirmItem.id] = (newInventory[confirmItem.id] || 0) + 1;

      this.setData({
        fishCount: result.fishCount,
        inventory: newInventory,
        showConfirm: false,
        confirmItem: null,
      });
      this._buildItems(this.data.activeTab, newInventory);

      wx.showToast({ title: `购买成功！`, icon: 'success' });
    } catch (e) {
      wx.showToast({ title: '购买失败，请重试', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },
});
