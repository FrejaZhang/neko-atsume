// services/catbookService.js - 图鉴服务

const cloudService = require('./cloudService');
const { CATS } = require('../data/cats');

class CatbookService {
  // 解锁/更新猫咪记录
  async unlock(catId) {
    return cloudService.unlockCat(catId);
  }

  // 获取全部图鉴数据
  async getAll() {
    return cloudService.getCatbook();
  }

  // 获取已发现数量
  async getFoundCount() {
    const catbook = await this.getAll();
    return Object.keys(catbook).length;
  }

  // 判断某只猫是否已发现
  async isFound(catId) {
    const catbook = await this.getAll();
    return !!catbook[catId];
  }

  // 获取某只猫的详细记录
  async getRecord(catId) {
    const catbook = await this.getAll();
    return catbook[catId] || null;
  }
}

module.exports = new CatbookService();
