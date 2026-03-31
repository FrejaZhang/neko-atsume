// pages/profile/profile.js - 个人中心页

const cloudService = require('../../services/cloudService');
const { CATS } = require('../../data/cats');

const ACHIEVEMENTS = [
  { id: 'first_cat',    name: '初来乍到',  icon: '🐱', desc: '第一只猫咪来访',    condition: (s) => s.totalCatVisits >= 1 },
  { id: 'ten_cats',     name: '猫咪爱好者', icon: '😺', desc: '收集到10种不同猫咪', condition: (s) => s.foundCount >= 10 },
  { id: 'all_cats',     name: '猫咪大师',  icon: '👑', desc: '集齐所有猫咪',       condition: (s) => s.foundCount >= CATS.length },
  { id: 'rich',         name: '土豪猫奴',  icon: '💰', desc: '累计获得500鱼干',    condition: (s) => s.totalFishEarned >= 500 },
  { id: 'gold_fish',    name: '黄金守护',  icon: '🌟', desc: '获得第一枚金鱼干',   condition: (s) => s.goldFishEarned >= 1 },
  { id: 'week_player',  name: '老朋友',   icon: '📅', desc: '游玩超过7天',        condition: (s) => s.daysPlayed >= 7 },
];

Page({
  data: {
    userInfo: null,
    fishCount: 0,
    goldFishCount: 0,
    stats: {
      foundCount: 0,
      totalCatVisits: 0,
      totalFishEarned: 0,
      goldFishEarned: 0,
      daysPlayed: 0,
    },
    achievements: [],
  },

  onLoad() {
    this._loadProfile();
  },

  onShow() {
    this._loadProfile();
  },

  async _loadProfile() {
    // 获取微信用户信息
    try {
      const userInfoRes = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '展示个人信息',
          success: resolve,
          fail: reject,
        });
      });
      this.setData({ userInfo: userInfoRes.userInfo });
    } catch (e) {
      // 用户拒绝授权，用默认头像
    }

    const app = getApp();
    const playerData = await cloudService.getPlayerData();
    const catbook = await cloudService.getCatbook();

    const fishCount = playerData.fishCount ?? app.globalData.fishCount ?? 0;
    const goldFishCount = playerData.goldFishCount ?? app.globalData.goldFishCount ?? 0;

    const foundCount = Object.keys(catbook).length;
    const totalCatVisits = Object.values(catbook).reduce((s, r) => s + (r.visitCount || 0), 0);

    const createdAt = playerData.createdAt ? new Date(playerData.createdAt) : new Date();
    const daysPlayed = Math.max(1, Math.ceil((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

    const stats = {
      foundCount,
      totalCatVisits,
      totalFishEarned: playerData.totalFishEarned || fishCount,
      goldFishEarned: playerData.totalGoldFishEarned || goldFishCount,
      daysPlayed,
    };

    // 计算成就解锁状态
    const achievements = ACHIEVEMENTS.map(ach => ({
      ...ach,
      unlocked: ach.condition(stats),
    }));

    this.setData({ fishCount, goldFishCount, stats, achievements });
  },

  onGetUserInfo(e) {
    if (e.detail.userInfo) {
      this.setData({ userInfo: e.detail.userInfo });
    }
  },
});
