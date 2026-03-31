// services/gameService.js - 游戏核心服务（刷新调度、道具管理、鱼干计算）

const cloudService = require('./cloudService');
const CONFIG = require('../data/config');

class GameService {
  constructor() {
    this._refreshTimer = null;
    this._countdownTimer = null;
    this._onRefreshCallback = null;
  }

  // 启动自动刷新
  startAutoRefresh(scene, onRefresh) {
    this.stopAutoRefresh();
    this._onRefreshCallback = onRefresh;
    this._countdownTimer = setInterval(async () => {
      if (this._onRefreshCallback) {
        await this._onRefreshCallback(scene);
      }
    }, CONFIG.REFRESH_INTERVAL);
  }

  stopAutoRefresh() {
    if (this._countdownTimer) {
      clearInterval(this._countdownTimer);
      this._countdownTimer = null;
    }
  }

  // 执行一次猫咪刷新
  async refresh(scene) {
    return cloudService.refreshCats(scene);
  }

  // 放置道具到场景
  async placeItem(scene, slotIndex, itemId, currentInventory) {
    const oldItemId = null; // 由调用方传入
    await cloudService.updateSlot(scene, slotIndex, itemId);
    await cloudService.addToInventory(itemId, -1);
    return cloudService.getInventory();
  }

  // 收取鱼干
  async collectFish(pendingFish, pendingGoldFish) {
    return cloudService.updateFishCount(pendingFish, pendingGoldFish);
  }
}

module.exports = new GameService();
