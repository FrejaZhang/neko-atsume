// components/fish-counter/fish-counter.js
Component({
  properties: {
    fishCount: { type: Number, value: 0 },
    goldFishCount: { type: Number, value: 0 },
    pendingFish: { type: Number, value: 0 },
  },
  data: {
    displayFish: 0,
    displayGold: 0,
    showPending: false,
  },
  observers: {
    fishCount(v) { this.setData({ displayFish: v }); },
    goldFishCount(v) { this.setData({ displayGold: v }); },
    pendingFish(v) { this.setData({ showPending: v > 0 }); },
  },
});
