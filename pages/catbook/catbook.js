// pages/catbook/catbook.js - 猫咪图鉴页

const cloudService = require('../../services/cloudService');
const { CATS, getCatDataURI } = require('../../data/cats');

Page({
  data: {
    filterTab: 'all',   // all | found | notfound
    catbook: {},         // { catId: { visitCount, firstVisit, lastVisit } }
    displayList: [],     // 渲染用列表
    totalCount: CATS.length,
    foundCount: 0,

    // 详情弹窗
    showDetail: false,
    detailCat: null,
    detailRecord: null,
  },

  onLoad() {
    this._loadCatbook();
  },

  onShow() {
    this._loadCatbook();
  },

  async _loadCatbook() {
    wx.showLoading({ title: '加载图鉴...', mask: false });
    try {
      const catbook = await cloudService.getCatbook();
      const foundCount = Object.keys(catbook).length;
      this.setData({ catbook, foundCount });
      this._buildDisplayList(this.data.filterTab, catbook);
    } catch (e) {
      console.error('load catbook error:', e);
    } finally {
      wx.hideLoading();
    }
  },

  _buildDisplayList(tab, catbook) {
    catbook = catbook || this.data.catbook;
    let list = CATS.map(cat => {
      const record = catbook[cat.id];
      const found = !!record;
      return {
        ...cat,
        found,
        visitCount: record ? record.visitCount : 0,
        firstVisit: record ? record.firstVisit : null,
        svgUri: found ? getCatDataURI(cat.id) : '',
        rarityLabel: this._rarityLabel(cat.rarity),
      };
    });

    if (tab === 'found') list = list.filter(c => c.found);
    else if (tab === 'notfound') list = list.filter(c => !c.found);

    this.setData({ displayList: list, filterTab: tab });
  },

  _rarityLabel(rarity) {
    return { common: '普通', uncommon: '少见', rare: '稀有', special: '特殊' }[rarity] || '普通';
  },

  onTabChange(e) {
    this._buildDisplayList(e.currentTarget.dataset.tab);
  },

  onCatTap(e) {
    const { catId } = e.currentTarget.dataset;
    const cat = CATS.find(c => c.id === catId);
    const record = this.data.catbook[catId];
    if (!cat) return;
    this.setData({
      showDetail: true,
      detailCat: { ...cat, svgUri: getCatDataURI(catId), rarityLabel: this._rarityLabel(cat.rarity) },
      detailRecord: record || null,
    });
  },

  onCloseDetail() {
    this.setData({ showDetail: false, detailCat: null, detailRecord: null });
  },
});
