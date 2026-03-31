// cloudfunctions/initPlayer/index.js
// 云函数：新玩家初始化，返回玩家数据

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const INIT_FISH = 100;
const INIT_GOLD = 0;
const INIT_ITEMS = [
  { itemId: 'item_bowl', count: 2 },
];

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();

  try {
    // 查找是否已有玩家数据
    const existing = await db.collection('players')
      .where({ _openid: OPENID })
      .get();

    if (existing.data && existing.data.length > 0) {
      const player = existing.data[0];
      return {
        openid: OPENID,
        fishCount: player.fishCount || 0,
        goldFishCount: player.goldFishCount || 0,
        isNew: false,
      };
    }

    // 新玩家 - 创建档案
    const now = new Date().toISOString();
    await db.collection('players').add({
      data: {
        openid: OPENID,
        fishCount: INIT_FISH,
        goldFishCount: INIT_GOLD,
        createdAt: now,
        updatedAt: now,
      }
    });

    // 初始化背包
    for (const initItem of INIT_ITEMS) {
      await db.collection('inventory').add({
        data: {
          itemId: initItem.itemId,
          count: initItem.count,
        }
      });
    }

    // 初始化两个场景布局
    for (const scene of ['yard', 'indoor']) {
      await db.collection('scene_layout').add({
        data: {
          scene,
          slots: Array(6).fill(null),
          cats: [],
          pendingFish: 0,
          pendingGoldFish: 0,
          updatedAt: now,
        }
      });
    }

    return {
      openid: OPENID,
      fishCount: INIT_FISH,
      goldFishCount: INIT_GOLD,
      isNew: true,
    };

  } catch (err) {
    console.error('initPlayer error:', err);
    return { error: err.message, openid: OPENID, fishCount: INIT_FISH, goldFishCount: INIT_GOLD };
  }
};
