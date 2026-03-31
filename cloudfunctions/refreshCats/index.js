// cloudfunctions/refreshCats/index.js
// 云函数：按道具权重刷新猫咪布局，计算离场鱼干奖励

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// ===== 猫咪静态数据（云函数侧副本，避免依赖本地 data 目录）=====
const CATS = [
  { id: 'tabi',        rarity: 'common',   preferItems: ['item_bowl','item_cushion','item_tunnel'],          fishRange: [1,3],   goldFishChance: 0.05 },
  { id: 'snowball',    rarity: 'common',   preferItems: ['item_cushion','item_heater','item_wool'],           fishRange: [1,4],   goldFishChance: 0.06 },
  { id: 'shadow',      rarity: 'common',   preferItems: ['item_bowl_premium','item_paper_bag','item_box'],    fishRange: [2,4],   goldFishChance: 0.08 },
  { id: 'mochi',       rarity: 'common',   preferItems: ['item_bowl_premium','item_bowl_deluxe','item_bowl'], fishRange: [2,5],   goldFishChance: 0.07 },
  { id: 'cloudy',      rarity: 'common',   preferItems: ['item_cushion','item_heater','item_mat'],            fishRange: [1,3],   goldFishChance: 0.05 },
  { id: 'patches',     rarity: 'uncommon', preferItems: ['item_ball','item_tunnel','item_wand'],              fishRange: [2,5],   goldFishChance: 0.08 },
  { id: 'callie',      rarity: 'uncommon', preferItems: ['item_bowl_deluxe','item_cat_tower','item_cushion'], fishRange: [3,6],   goldFishChance: 0.10 },
  { id: 'bolt',        rarity: 'uncommon', preferItems: ['item_ball','item_wand','item_tunnel'],              fishRange: [2,5],   goldFishChance: 0.07 },
  { id: 'misty',       rarity: 'uncommon', preferItems: ['item_bowl','item_paper_bag','item_box'],            fishRange: [2,4],   goldFishChance: 0.08 },
  { id: 'cocoa',       rarity: 'uncommon', preferItems: ['item_heater','item_cushion','item_mat'],            fishRange: [2,5],   goldFishChance: 0.09 },
  { id: 'chairman',    rarity: 'rare',     preferItems: ['item_cat_tower','item_bowl_deluxe','item_mat'],     fishRange: [5,9],   goldFishChance: 0.15 },
  { id: 'princess',    rarity: 'rare',     preferItems: ['item_cushion','item_bowl_deluxe','item_wool'],      fishRange: [4,8],   goldFishChance: 0.12 },
  { id: 'butterscotch',rarity: 'rare',     preferItems: ['item_bowl_deluxe','item_bowl_premium','item_heater'],fishRange:[4,9],  goldFishChance: 0.13 },
  { id: 'tempura',     rarity: 'rare',     preferItems: ['item_bowl_deluxe','item_cat_tower','item_tunnel'],  fishRange: [4,8],   goldFishChance: 0.12 },
  { id: 'xerxes',      rarity: 'rare',     preferItems: ['item_cat_tower','item_cushion','item_mat'],         fishRange: [5,10],  goldFishChance: 0.20 },
  { id: 'breezy',      rarity: 'uncommon', preferItems: ['item_tunnel','item_ball','item_wand'],              fishRange: [2,5],   goldFishChance: 0.08 },
  { id: 'sassy',       rarity: 'uncommon', preferItems: ['item_wool','item_cushion','item_paper_bag'],        fishRange: [2,5],   goldFishChance: 0.09 },
  { id: 'mr_meow',     rarity: 'rare',     preferItems: ['item_bowl_deluxe','item_cat_tower','item_cushion'], fishRange: [5,10],  goldFishChance: 0.18 },
  { id: 'spots',       rarity: 'common',   preferItems: ['item_box','item_paper_bag','item_ball'],            fishRange: [1,3],   goldFishChance: 0.05 },
  { id: 'lucky',       rarity: 'special',  preferItems: ['item_bowl_deluxe','item_cat_tower','item_heater'],  fishRange: [10,20], goldFishChance: 0.50 },
];

const ITEMS = [
  { id: 'item_bowl',         attractWeight: 10, catMultiplier: {} },
  { id: 'item_bowl_premium', attractWeight: 18, catMultiplier: { mochi: 1.5, butterscotch: 1.5 } },
  { id: 'item_bowl_deluxe',  attractWeight: 28, catMultiplier: { callie:2.0, chairman:1.8, butterscotch:2.0, mr_meow:2.0, xerxes:1.5, lucky:2.0 } },
  { id: 'item_cushion',      attractWeight: 15, catMultiplier: { snowball:1.5, cloudy:1.8, princess:1.5 } },
  { id: 'item_heater',       attractWeight: 20, catMultiplier: { snowball:2.0, cloudy:1.5, cocoa:1.8 } },
  { id: 'item_cat_tower',    attractWeight: 25, catMultiplier: { chairman:2.5, callie:1.5, xerxes:2.0, mr_meow:1.8 } },
  { id: 'item_ball',         attractWeight: 12, catMultiplier: { patches:1.8, bolt:2.0, spots:1.5 } },
  { id: 'item_tunnel',       attractWeight: 16, catMultiplier: { patches:1.5, breezy:2.0, spots:1.8, tabi:1.3 } },
  { id: 'item_paper_bag',    attractWeight: 10, catMultiplier: { shadow:1.8, misty:2.0, spots:1.5 } },
  { id: 'item_box',          attractWeight: 12, catMultiplier: { shadow:1.5, misty:1.5, spots:2.0 } },
  { id: 'item_wool',         attractWeight: 11, catMultiplier: { snowball:1.5, sassy:2.0, princess:1.3 } },
  { id: 'item_wand',         attractWeight: 13, catMultiplier: { bolt:1.8, patches:1.5, breezy:1.5 } },
  { id: 'item_mat',          attractWeight: 14, catMultiplier: { tabi:1.5, cloudy:1.3, cocoa:1.5 } },
];

const RARITY_BASE_CHANCE = { common: 1.0, uncommon: 0.5, rare: 0.2, special: 0.05 };
const MAX_CATS = 5;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const scene = event.scene || 'yard';

  try {
    // 1. 读取场景布局
    const layoutRes = await db.collection('scene_layout')
      .where({ _openid: OPENID, scene })
      .get();

    const layout = layoutRes.data[0] || { slots: [], cats: [], pendingFish: 0 };
    const slots = layout.slots || [];
    const prevCats = layout.cats || [];

    // 2. 计算离场的猫带来的鱼干
    let pendingFish = 0;
    let pendingGoldFish = 0;
    const leavingCats = prevCats.filter(c => (c.stayRounds || 1) <= 1);

    for (const lc of leavingCats) {
      const catData = CATS.find(c => c.id === lc.catId);
      if (!catData) continue;
      const fish = randInt(...catData.fishRange);
      pendingFish += fish;
      if (Math.random() < catData.goldFishChance) {
        pendingGoldFish += 1;
      }
    }

    // 3. 留下的猫（减少停留轮次）
    const stayingCats = prevCats
      .filter(c => (c.stayRounds || 1) > 1)
      .map(c => ({ ...c, stayRounds: c.stayRounds - 1 }));

    // 4. 计算各猫吸引权重
    const activeItems = slots.filter(Boolean);
    if (activeItems.length === 0) {
      // 没有摆放道具，返回空场景
      const newLayout = { ...layout, cats: stayingCats };
      await _saveLayout(db, OPENID, scene, newLayout, layoutRes.data[0]?._id);
      return { cats: stayingCats, pendingFish, pendingGoldFish };
    }

    const catWeights = {};
    let totalWeight = 0;
    for (const cat of CATS) {
      let w = 0;
      for (const itemId of activeItems) {
        const item = ITEMS.find(i => i.id === itemId);
        if (!item) continue;
        const base = item.attractWeight * RARITY_BASE_CHANCE[cat.rarity];
        const multi = (item.catMultiplier && item.catMultiplier[cat.id]) || 1;
        w += base * multi;
      }
      catWeights[cat.id] = w;
      totalWeight += w;
    }

    // 5. 按权重抽取新到访猫咪
    const occupiedSlots = new Set(stayingCats.map(c => c.slotIndex));
    const availableSlots = [];
    for (let i = 0; i < Math.max(activeItems.length, slots.length); i++) {
      if (slots[i] && !occupiedSlots.has(i)) availableSlots.push(i);
    }

    const newCats = [...stayingCats];
    const stayingIds = new Set(stayingCats.map(c => c.catId));
    const candidateCats = CATS.filter(c => !stayingIds.has(c.id));
    let remainWeight = candidateCats.reduce((s, c) => s + (catWeights[c.id] || 0), 0);

    for (const slot of availableSlots) {
      if (newCats.length >= MAX_CATS || candidateCats.length === 0) break;
      // 70% 概率有猫来
      if (Math.random() > 0.7) continue;

      const roll = Math.random() * remainWeight;
      let sum = 0;
      let chosen = null;
      for (const cat of candidateCats) {
        sum += catWeights[cat.id] || 0;
        if (roll <= sum) { chosen = cat; break; }
      }
      if (!chosen) continue;

      newCats.push({
        catId: chosen.id,
        slotIndex: slot,
        stayRounds: randInt(1, 4),
      });
      const idx = candidateCats.indexOf(chosen);
      candidateCats.splice(idx, 1);
      remainWeight -= catWeights[chosen.id] || 0;
    }

    // 6. 更新图鉴（新到访的猫）
    const newlyArrived = newCats.filter(c => !stayingIds.has(c.catId));
    for (const nc of newlyArrived) {
      await _updateCatbook(db, OPENID, nc.catId);
    }

    // 7. 更新鱼干
    if (pendingFish > 0 || pendingGoldFish > 0) {
      await _addFish(db, OPENID, pendingFish, pendingGoldFish);
    }

    // 8. 保存新布局
    const newLayout = { ...layout, cats: newCats, pendingFish: 0 };
    await _saveLayout(db, OPENID, scene, newLayout, layoutRes.data[0]?._id);

    return { cats: newCats, pendingFish, pendingGoldFish };

  } catch (err) {
    console.error('refreshCats error:', err);
    return { error: err.message, cats: [], pendingFish: 0 };
  }
};

async function _updateCatbook(db, openid, catId) {
  try {
    const existing = await db.collection('catbook')
      .where({ _openid: openid, catId })
      .get();
    const now = new Date().toISOString();
    if (existing.data && existing.data.length > 0) {
      await db.collection('catbook').doc(existing.data[0]._id).update({
        data: { visitCount: db.command.inc(1), lastVisit: now }
      });
    } else {
      await db.collection('catbook').add({
        data: { catId, firstVisit: now, lastVisit: now, visitCount: 1 }
      });
    }
  } catch (e) {
    console.error('_updateCatbook error:', catId, e);
  }
}

async function _addFish(db, openid, fish, goldFish) {
  try {
    const playerRes = await db.collection('players')
      .where({ _openid: openid })
      .get();
    if (playerRes.data && playerRes.data.length > 0) {
      const updateData = { fishCount: db.command.inc(fish) };
      if (goldFish > 0) updateData.goldFishCount = db.command.inc(goldFish);
      await db.collection('players').doc(playerRes.data[0]._id).update({ data: updateData });
    }
  } catch (e) {
    console.error('_addFish error:', e);
  }
}

async function _saveLayout(db, openid, scene, layout, existingId) {
  try {
    const saveData = { scene, slots: layout.slots || [], cats: layout.cats || [], updatedAt: new Date().toISOString() };
    if (existingId) {
      await db.collection('scene_layout').doc(existingId).update({ data: saveData });
    } else {
      await db.collection('scene_layout').add({ data: saveData });
    }
  } catch (e) {
    console.error('_saveLayout error:', e);
  }
}
