// components/item-slot/item-slot.js
const { ITEMS, getItemSVG } = require('../../data/items');

Component({
  properties: {
    slotIndex: { type: Number, value: 0 },
    itemId: { type: String, value: '' },
    cat: { type: Object, value: null },   // { catId, stayRounds }
    selected: { type: Boolean, value: false },
    isEmpty: { type: Boolean, value: true },
  },
  data: {
    itemData: null,
    itemSvgUri: '',
  },
  observers: {
    itemId(id) {
      if (!id) {
        this.setData({ itemData: null, itemSvgUri: '' });
        return;
      }
      const item = ITEMS.find(i => i.id === id);
      const svgUri = getItemSVG(id);
      this.setData({ itemData: item, itemSvgUri: svgUri });
    }
  },
  methods: {
    onTap() {
      this.triggerEvent('slottap', { slotIndex: this.data.slotIndex, itemId: this.data.itemId });
    },
    onCatTap() {
      if (this.data.cat) {
        this.triggerEvent('cattap', { cat: this.data.cat, slotIndex: this.data.slotIndex });
      }
    },
  }
});
