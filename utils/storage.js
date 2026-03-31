// utils/storage.js - 本地存储工具（带过期时间）

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24小时

const storage = {
  set(key, value, ttl = DEFAULT_TTL) {
    const data = {
      value,
      expireAt: ttl > 0 ? Date.now() + ttl : -1,
    };
    try {
      wx.setStorageSync(key, data);
    } catch (e) {
      console.error('storage.set error:', key, e);
    }
  },

  get(key, defaultValue = null) {
    try {
      const data = wx.getStorageSync(key);
      if (!data) return defaultValue;
      if (data.expireAt > 0 && Date.now() > data.expireAt) {
        wx.removeStorageSync(key);
        return defaultValue;
      }
      return data.value !== undefined ? data.value : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  remove(key) {
    try {
      wx.removeStorageSync(key);
    } catch (e) {}
  },

  clear() {
    try {
      wx.clearStorageSync();
    } catch (e) {}
  },
};

module.exports = storage;
