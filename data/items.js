// data/items.js - 全部道具和食物静态数据

// 生成道具 SVG 图标
function makeItemSVG(shapeData, mainColor, accentColor) {
  const size = 8;
  const rects = [];
  shapeData.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      const fill = ch === 'M' ? mainColor : ch === 'A' ? accentColor : ch === 'K' ? '#000000' : '#FFFFFF';
      rects.push(`<rect x="${x*size}" y="${y*size}" width="${size}" height="${size}" fill="${fill}"/>`);
    });
  });
  const w = shapeData[0].length * size;
  const h = shapeData.length * size;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' shape-rendering='crispEdges'>${rects.join('')}</svg>`
  )}`;
}

// 道具像素图形定义
const ITEM_SHAPES = {
  bowl: {
    shape: [
      '........',
      '..MMMM..',
      '.MAAAAAM.',
      'MAAAAAAAM',
      'MAAAAAAAM',
      '.MMMMMMM.',
      '..MMMM..',
      '........',
    ],
    main: '#C8A878', accent: '#E8D5B0',
  },
  bowl_premium: {
    shape: [
      '.AAAAAAA.',
      'AMMMMMMMMA',
      'AMAAAAAAAMA',
      'AMMAAAAAAMMA',
      'AMMAAAAAAMMA',
      'AMMMMMMMMA',
      '.AAAAAAA.',
    ],
    main: '#C8A878', accent: '#F5C842',
  },
  bowl_deluxe: {
    shape: [
      '..AAAA..',
      '.AMMMMMA.',
      'AMMMMMMMMA',
      'AMMMMMMMMA',
      'AMMMMMMMMA',
      '.AMMMMMA.',
      '..AAAA..',
    ],
    main: '#E8935A', accent: '#F5C842',
  },
  cushion: {
    shape: [
      '.MMMMMM.',
      'MAAAAAAAM',
      'MAAAAAAAM',
      'MAAAAAAAM',
      'MAAAAAAAM',
      '.MMMMMM.',
    ],
    main: '#E8935A', accent: '#FFF3E0',
  },
  heater: {
    shape: [
      'MMMMMMMM',
      'MAAAAAAAM',
      'MAAAAAAAM',
      'MAAAAAAAM',
      'MAAAAAAAM',
      'MMAMAMAMM',
      'MMMMMMMM',
    ],
    main: '#616161', accent: '#EF5350',
  },
  cat_tower: {
    shape: [
      '..MAM..',
      '..MAM..',
      '.MMMM..',
      '.MAAM..',
      'MMMMM..',
      'MAAAAM.',
      'MMMMMMM',
    ],
    main: '#8D6E63', accent: '#D7CCC8',
  },
  ball: {
    shape: [
      '..MM...',
      '.MAAMM.',
      'MAAAAAM',
      'MAAAAAM',
      'MAAAAAM',
      '.MMMMM.',
      '..MM...',
    ],
    main: '#EF5350', accent: '#FFCDD2',
  },
  tunnel: {
    shape: [
      'MMMMMMM',
      'MAAAAAM',
      'MAAAAAM',
      'M.....M',
      'MAAAAAM',
      'MAAAAAM',
      'MMMMMMM',
    ],
    main: '#78909C', accent: '#B0BEC5',
  },
  paper_bag: {
    shape: [
      '.MMMMM.',
      'MAAAAAМ',
      'MAAAAAМ',
      'MAAAAAМ',
      'MAAAAAМ',
      'MMMMMМ',
    ],
    main: '#F5C842', accent: '#FFF9C4',
  },
  box: {
    shape: [
      'MMMMMMM',
      'MAAAAAМ',
      'MAAAAAМ',
      'MAAAAAМ',
      'MAAAAAМ',
      'MMMMMMM',
    ],
    main: '#8D6E63', accent: '#D7CCC8',
  },
  wool: {
    shape: [
      '..MMMM.',
      '.MAAAM.',
      'MMAAАМM',
      'MAAAААM',
      'MMAAАМM',
      '.MAAAM.',
      '..MMMM.',
    ],
    main: '#EC407A', accent: '#F8BBD9',
  },
  wand: {
    shape: [
      'M.......',
      '.M......',
      '..M.....',
      '...M....',
      '....M.A.',
      '.....MAM',
      '......AM',
      '.......M',
    ],
    main: '#8D6E63', accent: '#F5C842',
  },
  mat: {
    shape: [
      'MMMMMMMM',
      'MAAAAAАМ',
      'MAAAAAАМ',
      'MMMMMMМM',
    ],
    main: '#66BB6A', accent: '#E8F5E9',
  },
};

const ITEMS = [
  // ===== 食物 =====
  {
    id: 'item_bowl',
    name: '普通碗',
    type: 'food',
    subtype: 'food',
    price: 0,
    isDefault: true,
    attractWeight: 10,
    catMultiplier: {},
    description: '放上普通猫粮，能吸引常见猫咪。',
    shapeKey: 'bowl',
  },
  {
    id: 'item_bowl_premium',
    name: '高级罐头',
    type: 'food',
    subtype: 'food',
    price: 30,
    isDefault: false,
    attractWeight: 18,
    catMultiplier: { mochi: 1.5, butterscotch: 1.5 },
    description: '高品质猫罐头，能吸引挑剔的猫咪。',
    shapeKey: 'bowl_premium',
  },
  {
    id: 'item_bowl_deluxe',
    name: '豪华罐头',
    type: 'food',
    subtype: 'food',
    price: 90,
    isDefault: false,
    attractWeight: 28,
    catMultiplier: { callie: 2.0, chairman: 1.8, butterscotch: 2.0, mr_meow: 2.0, xerxes: 1.5, lucky: 2.0 },
    description: '顶级美食，稀有猫咪最爱的佳肴。',
    shapeKey: 'bowl_deluxe',
  },
  // ===== 道具 =====
  {
    id: 'item_cushion',
    name: '柔软垫',
    type: 'goods',
    subtype: 'furniture',
    price: 20,
    isDefault: false,
    attractWeight: 15,
    catMultiplier: { snowball: 1.5, cloudy: 1.8, princess: 1.5 },
    description: '柔软舒适，爱睡觉的猫咪特别喜欢。',
    shapeKey: 'cushion',
  },
  {
    id: 'item_heater',
    name: '暖炉',
    type: 'goods',
    subtype: 'furniture',
    price: 50,
    isDefault: false,
    attractWeight: 20,
    catMultiplier: { snowball: 2.0, cloudy: 1.5, cocoa: 1.8 },
    description: '冬日暖炉，让猫咪流连忘返。',
    shapeKey: 'heater',
  },
  {
    id: 'item_cat_tower',
    name: '猫爬架',
    type: 'goods',
    subtype: 'furniture',
    price: 80,
    isDefault: false,
    attractWeight: 25,
    catMultiplier: { chairman: 2.5, callie: 1.5, xerxes: 2.0, mr_meow: 1.8 },
    description: '高档猫爬架，权威猫咪的必争之地。',
    shapeKey: 'cat_tower',
  },
  {
    id: 'item_ball',
    name: '小皮球',
    type: 'goods',
    subtype: 'toy',
    price: 15,
    isDefault: false,
    attractWeight: 12,
    catMultiplier: { patches: 1.8, bolt: 2.0, spots: 1.5 },
    description: '简单的皮球，爱玩的猫咪会追着打。',
    shapeKey: 'ball',
  },
  {
    id: 'item_tunnel',
    name: '猫隧道',
    type: 'goods',
    subtype: 'toy',
    price: 35,
    isDefault: false,
    attractWeight: 16,
    catMultiplier: { patches: 1.5, breezy: 2.0, spots: 1.8, tabi: 1.3 },
    description: '钻来钻去的乐趣，好奇心旺盛的猫最爱。',
    shapeKey: 'tunnel',
  },
  {
    id: 'item_paper_bag',
    name: '纸袋',
    type: 'goods',
    subtype: 'toy',
    price: 5,
    isDefault: false,
    attractWeight: 10,
    catMultiplier: { shadow: 1.8, misty: 2.0, spots: 1.5 },
    description: '普通纸袋，胆小猫咪躲进去安心入睡。',
    shapeKey: 'paper_bag',
  },
  {
    id: 'item_box',
    name: '纸箱',
    type: 'goods',
    subtype: 'toy',
    price: 10,
    isDefault: false,
    attractWeight: 12,
    catMultiplier: { shadow: 1.5, misty: 1.5, spots: 2.0 },
    description: '猫咪就是爱钻箱子。',
    shapeKey: 'box',
  },
  {
    id: 'item_wool',
    name: '毛线球',
    type: 'goods',
    subtype: 'toy',
    price: 12,
    isDefault: false,
    attractWeight: 11,
    catMultiplier: { snowball: 1.5, sassy: 2.0, princess: 1.3 },
    description: '滚来滚去停不下来，温柔猫咪的最爱。',
    shapeKey: 'wool',
  },
  {
    id: 'item_wand',
    name: '逗猫棒',
    type: 'goods',
    subtype: 'toy',
    price: 18,
    isDefault: false,
    attractWeight: 13,
    catMultiplier: { bolt: 1.8, patches: 1.5, breezy: 1.5 },
    description: '挥动就能让猫疯狂，效果立竿见影。',
    shapeKey: 'wand',
  },
  {
    id: 'item_mat',
    name: '防水垫',
    type: 'goods',
    subtype: 'furniture',
    price: 25,
    isDefault: false,
    attractWeight: 14,
    catMultiplier: { tabi: 1.5, cloudy: 1.3, cocoa: 1.5 },
    description: '舒适的防水垫，多猫同时使用也没问题。',
    shapeKey: 'mat',
  },
];

// 根据道具形状生成 SVG data URI
function getItemSVG(itemId) {
  const item = ITEMS.find(i => i.id === itemId);
  if (!item || !ITEM_SHAPES[item.shapeKey]) return '';
  const { shape, main, accent } = ITEM_SHAPES[item.shapeKey];
  return makeItemSVG(shape, main, accent);
}

module.exports = { ITEMS, ITEM_SHAPES, getItemSVG };
