// app.js - 小程序入口
App({
  globalData: {
    userInfo: null,
    openid: null,
    fishCount: 0,
    goldFishCount: 0,
    cloudEnvId: 'your-cloud-env-id', // 替换为你的云开发环境 ID
  },

  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: this.globalData.cloudEnvId,
        traceUser: true,
      });
    }

    // 登录并初始化玩家数据
    this.initPlayer();
  },

  onShow() {
    // 从后台切回前台时触发一次猫咪刷新（由各页面监听）
    this.triggerRefresh();
  },

  triggerRefresh() {
    // 通知场景页刷新（如果已挂载）
    const pages = getCurrentPages();
    const yardPage = pages.find(p => p.route && p.route.includes('yard'));
    if (yardPage && yardPage.onRefreshTrigger) {
      yardPage.onRefreshTrigger();
    }
  },

  async initPlayer() {
    try {
      const loginRes = await wx.cloud.callFunction({ name: 'initPlayer' });
      const { openid, fishCount, goldFishCount } = loginRes.result;
      this.globalData.openid = openid;
      this.globalData.fishCount = fishCount || 0;
      this.globalData.goldFishCount = goldFishCount || 0;
    } catch (e) {
      // 离线兜底：从本地缓存读取
      const cached = wx.getStorageSync('playerData');
      if (cached) {
        this.globalData.fishCount = cached.fishCount || 0;
        this.globalData.goldFishCount = cached.goldFishCount || 0;
      }
    }
  },

  updateFishCount(delta, goldDelta = 0) {
    this.globalData.fishCount += delta;
    this.globalData.goldFishCount += goldDelta;
    // 持久化到本地缓存
    wx.setStorageSync('playerData', {
      fishCount: this.globalData.fishCount,
      goldFishCount: this.globalData.goldFishCount,
    });
  },
});
