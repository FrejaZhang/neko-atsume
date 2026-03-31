// data/config.js - 游戏配置常量

module.exports = {
  // 刷新间隔（毫秒）
  REFRESH_INTERVAL: 30 * 1000,      // 30秒前台刷新
  BG_REFRESH_DELAY: 5 * 60 * 1000,  // 从后台恢复后5分钟内不自动刷新

  // 场景槽位配置
  YARD_SLOTS: 6,      // 后院槽位数
  INDOOR_SLOTS: 6,    // 室内槽位数

  // 货币汇率
  GOLD_FISH_RATE: 10, // 1金鱼干 = 10普通鱼干（展示用）

  // 新玩家初始数据
  INIT_FISH: 100,
  INIT_GOLD_FISH: 0,
  INIT_ITEMS: [
    { itemId: 'item_bowl', count: 2 },
  ],

  // 猫咪刷新相关
  MAX_CATS_PER_SCENE: 5,    // 单场景最多同时在访猫数
  CAT_STAY_MIN: 1,           // 猫咪最短停留（刷新轮次数）
  CAT_STAY_MAX: 4,           // 猫咪最长停留（刷新轮次数）

  // 场景 ID
  SCENES: {
    YARD: 'yard',
    INDOOR: 'indoor',
  },

  // 稀有度对应的基础吸引概率调整
  RARITY_BASE_CHANCE: {
    common: 1.0,
    uncommon: 0.5,
    rare: 0.2,
    special: 0.05,
  },
};
