// components/cat-sprite/cat-sprite.js
const { CATS, getCatDataURI } = require('../../data/cats');

Component({
  properties: {
    catId: { type: String, value: '' },
    state: { type: String, value: 'sit' }, // sit | eat
    size: { type: Number, value: 64 },
    animate: { type: Boolean, value: true },
  },
  data: {
    catData: null,
    svgUri: '',
    isEating: false,
  },
  observers: {
    catId(id) {
      if (!id) return;
      const cat = CATS.find(c => c.id === id);
      const svgUri = getCatDataURI(id);
      this.setData({ catData: cat, svgUri });
    },
    state(s) {
      this.setData({ isEating: s === 'eat' });
    }
  },
});
