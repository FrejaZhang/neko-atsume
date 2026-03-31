// data/cats.js - 全部猫咪静态数据（20种）
// svgData 使用像素矩阵字符串：'.' = 透明, 字母 = 颜色代号

const CAT_COLORS = {
  // 常见毛色
  W: '#FFFFFF', // 白
  G: '#AAAAAA', // 灰
  O: '#E8935A', // 橘
  B: '#3E2723', // 黑/深棕
  T: '#C8A878', // 虎纹底色
  S: '#F5E6D0', // 奶白
  C: '#8B6914', // 茶色
  R: '#CC4444', // 红棕
  Y: '#F5C842', // 黄
  N: '#9E8060', // 棕灰
  P: '#FFB7C5', // 粉
  // 眼睛
  e: '#66BB6A', // 绿眼
  b: '#42A5F5', // 蓝眼
  y: '#FFD54F', // 黄眼
  r: '#EF5350', // 红眼（异瞳）
  // 其他
  '.': 'transparent',
  K: '#000000', // 纯黑
  L: '#E0D0C0', // 浅色条纹
};

// 像素画：16×12 网格的猫咪坐姿，每行16字符
// 格式：颜色字符矩阵
function makeCatSVG(pixels, colorMap, size = 16) {
  const rows = pixels.trim().split('\n').map(r => r.trim());
  const cellSize = size;
  const rects = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.' || !colorMap[ch]) return;
      rects.push(
        `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${colorMap[ch]}"/>`
      );
    });
  });
  const w = rows[0].length * cellSize;
  const h = rows.length * cellSize;
  return `data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' shape-rendering='crispEdges'>${rects.join('')}</svg>`;
}

// 通用猫咪像素模板（坐姿，12行×10列）
const PIXEL_CATS = {
  // 虎纹猫
  tabi_sit: `
..TTTTTT..
.TLTLTLT.
TTTTTTTTTT
T.eT..Te.T
TTTTTTTTTT
TTTLTTLTT.
.TTTTTTTTT
..TTTTTTTT
...TTTTT..
...TT.TT..
...T...T..
`,
  // 白猫
  white_sit: `
..WWWWWW..
.WWWWWWWW.
WWWWWWWWWW
W.bW..Wb.W
WWWWWWWWWW
WWWWWWWWWW
.WWWWWWWWW
..WWWWWWWW
...WWWWW..
...WW.WW..
...W...W..
`,
  // 黑猫
  black_sit: `
..BBBBBB..
.BBBBBBBB.
BBBBBBBBBB
B.yB..By.B
BBBBBBBBBB
BBBBBBBBBB
.BBBBBBBBB
..BBBBBBBB
...BBBBB..
...BB.BB..
...B...B..
`,
  // 橘猫
  orange_sit: `
..OOOOOO..
.OOOOOOOO.
OOOOOOOO
O.eO..Oe.O
OOOOOOOOOO
OOOOOOOOOO
.OOOOOOOOO
..OOOOOOOO
...OOOOO..
...OO.OO..
...O...O..
`,
  // 灰猫
  gray_sit: `
..GGGGGG..
.GGGGGGGG.
GGGGGGGGGG
G.bG..Gb.G
GGGGGGGGGG
GGGGGGGGGG
.GGGGGGGGG
..GGGGGGGG
...GGGGG..
...GG.GG..
...G...G..
`,
  // 奶牛猫
  calico_sit: `
..BWBWBW..
.WBWBWBWB.
BWBWBWBWBW
W.eW..We.W
BWBWBWBWBW
WWWBBBWWWW
.WWWWWWWWW
..BWBWBWBW
...WWWWW..
...WB.BW..
...W...W..
`,
  // 三花猫
  tricolor_sit: `
..ORWROW..
.OORRWWOO.
OORRWWRROO
O.eO..Oe.O
OOOORRRWWW
OOOOWWWRRR
.OOOOOOOO.
..OORRWWOO
...ORRWO..
...OR.WO..
...O...O..
`,
};

const CATS = [
  {
    id: 'tabi',
    name: '虎纹猫',
    nameEn: 'Tabitha',
    rarity: 'common',
    personality: '普通',
    preferItems: ['item_bowl', 'item_cushion', 'item_tunnel'],
    fishRange: [1, 3],
    goldFishChance: 0.05,
    color: '#C8A878',
    pixelKey: 'tabi_sit',
    description: '最常见的访客，性格温和，对普通食物就很满足。',
  },
  {
    id: 'snowball',
    name: '雪球',
    nameEn: 'Snowball',
    rarity: 'common',
    personality: '爱撒娇',
    preferItems: ['item_cushion', 'item_heater', 'item_wool'],
    fishRange: [1, 4],
    goldFishChance: 0.06,
    color: '#FFFFFF',
    pixelKey: 'white_sit',
    description: '洁白如雪的猫咪，喜欢温暖的地方。',
  },
  {
    id: 'shadow',
    name: '影子',
    nameEn: 'Shadow',
    rarity: 'common',
    personality: '神秘',
    preferItems: ['item_bowl_premium', 'item_paper_bag', 'item_box'],
    fishRange: [2, 4],
    goldFishChance: 0.08,
    color: '#3E2723',
    pixelKey: 'black_sit',
    description: '黑色的身影，总是悄悄出现又悄悄离开。',
  },
  {
    id: 'mochi',
    name: '麻糬',
    nameEn: 'Mochi',
    rarity: 'common',
    personality: '贪吃',
    preferItems: ['item_bowl_premium', 'item_bowl_deluxe', 'item_bowl'],
    fishRange: [2, 5],
    goldFishChance: 0.07,
    color: '#E8935A',
    pixelKey: 'orange_sit',
    description: '胖乎乎的橘猫，对高级食物情有独钟。',
  },
  {
    id: 'cloudy',
    name: '云朵',
    nameEn: 'Cloudy',
    rarity: 'common',
    personality: '慵懒',
    preferItems: ['item_cushion', 'item_heater', 'item_mat'],
    fishRange: [1, 3],
    goldFishChance: 0.05,
    color: '#AAAAAA',
    pixelKey: 'gray_sit',
    description: '灰色的猫咪，最喜欢趴在软垫上打盹。',
  },
  {
    id: 'patches',
    name: '花片',
    nameEn: 'Patches',
    rarity: 'uncommon',
    personality: '活泼',
    preferItems: ['item_ball', 'item_tunnel', 'item_wand'],
    fishRange: [2, 5],
    goldFishChance: 0.08,
    color: '#E8935A',
    pixelKey: 'calico_sit',
    description: '奶牛花纹的猫咪，超级喜欢玩玩具。',
  },
  {
    id: 'callie',
    name: '卡莉',
    nameEn: 'Callie',
    rarity: 'uncommon',
    personality: '高傲',
    preferItems: ['item_bowl_deluxe', 'item_cat_tower', 'item_cushion'],
    fishRange: [3, 6],
    goldFishChance: 0.10,
    color: '#E8935A',
    pixelKey: 'tricolor_sit',
    description: '三花美猫，只接受最好的待遇。',
  },
  {
    id: 'bolt',
    name: '闪电',
    nameEn: 'Bolt',
    rarity: 'uncommon',
    personality: '好动',
    preferItems: ['item_ball', 'item_wand', 'item_tunnel'],
    fishRange: [2, 5],
    goldFishChance: 0.07,
    color: '#F5C842',
    pixelKey: 'gray_sit',
    description: '动作敏捷，总是第一个冲向玩具。',
  },
  {
    id: 'misty',
    name: '薄雾',
    nameEn: 'Misty',
    rarity: 'uncommon',
    personality: '胆小',
    preferItems: ['item_bowl', 'item_paper_bag', 'item_box'],
    fishRange: [2, 4],
    goldFishChance: 0.08,
    color: '#AAAAAA',
    pixelKey: 'white_sit',
    description: '淡灰色的猫，喜欢藏在纸袋里偷窥。',
  },
  {
    id: 'cocoa',
    name: '可可',
    nameEn: 'Cocoa',
    rarity: 'uncommon',
    personality: '粘人',
    preferItems: ['item_heater', 'item_cushion', 'item_mat'],
    fishRange: [2, 5],
    goldFishChance: 0.09,
    color: '#8B6914',
    pixelKey: 'tabi_sit',
    description: '茶色猫咪，一旦来了就赖着不想走。',
  },
  {
    id: 'chairman',
    name: '会长',
    nameEn: 'Chairman Meow',
    rarity: 'rare',
    personality: '威严',
    preferItems: ['item_cat_tower', 'item_bowl_deluxe', 'item_mat'],
    fishRange: [5, 9],
    goldFishChance: 0.15,
    color: '#3E2723',
    pixelKey: 'black_sit',
    description: '气场十足的黑猫，坐上猫爬架便不动了。',
  },
  {
    id: 'princess',
    name: '公主',
    nameEn: 'Princess',
    rarity: 'rare',
    personality: '优雅',
    preferItems: ['item_cushion', 'item_bowl_deluxe', 'item_wool'],
    fishRange: [4, 8],
    goldFishChance: 0.12,
    color: '#FFB7C5',
    pixelKey: 'white_sit',
    description: '粉嫩色调的优雅猫咪，举止高贵。',
  },
  {
    id: 'butterscotch',
    name: '焦糖',
    nameEn: 'Butterscotch',
    rarity: 'rare',
    personality: '贪食',
    preferItems: ['item_bowl_deluxe', 'item_bowl_premium', 'item_heater'],
    fishRange: [4, 9],
    goldFishChance: 0.13,
    color: '#F5C842',
    pixelKey: 'orange_sit',
    description: '金黄色的肥猫，专挑豪华罐头来。',
  },
  {
    id: 'tempura',
    name: '天妇罗',
    nameEn: 'Tempura',
    rarity: 'rare',
    personality: '挑剔',
    preferItems: ['item_bowl_deluxe', 'item_cat_tower', 'item_tunnel'],
    fishRange: [4, 8],
    goldFishChance: 0.12,
    color: '#C8A878',
    pixelKey: 'tabi_sit',
    description: '花色独特，只有最好的食物才能吸引它。',
  },
  {
    id: 'xerxes',
    name: '薛西斯',
    nameEn: 'Xerxes IX',
    rarity: 'rare',
    personality: '孤傲',
    preferItems: ['item_cat_tower', 'item_cushion', 'item_mat'],
    fishRange: [5, 10],
    goldFishChance: 0.20,
    color: '#FFFFFF',
    pixelKey: 'white_sit',
    description: '传说中的神秘猫咪，极难吸引，但出手阔绰。',
  },
  {
    id: 'breezy',
    name: '微风',
    nameEn: 'Breezy',
    rarity: 'uncommon',
    personality: '自由',
    preferItems: ['item_tunnel', 'item_ball', 'item_wand'],
    fishRange: [2, 5],
    goldFishChance: 0.08,
    color: '#C8E6C9',
    pixelKey: 'gray_sit',
    description: '来去如风，从不停留太久。',
  },
  {
    id: 'sassy',
    name: '傲娇',
    nameEn: 'Sassy',
    rarity: 'uncommon',
    personality: '傲娇',
    preferItems: ['item_wool', 'item_cushion', 'item_paper_bag'],
    fishRange: [2, 5],
    goldFishChance: 0.09,
    color: '#E8935A',
    pixelKey: 'calico_sit',
    description: '表面高冷，其实很黏人。',
  },
  {
    id: 'mr_meow',
    name: '喵先生',
    nameEn: 'Mr. Meow',
    rarity: 'rare',
    personality: '绅士',
    preferItems: ['item_bowl_deluxe', 'item_cat_tower', 'item_cushion'],
    fishRange: [5, 10],
    goldFishChance: 0.18,
    color: '#3E2723',
    pixelKey: 'black_sit',
    description: '传闻中彬彬有礼的猫先生。',
  },
  {
    id: 'spots',
    name: '斑点',
    nameEn: 'Spots',
    rarity: 'common',
    personality: '好奇',
    preferItems: ['item_box', 'item_paper_bag', 'item_ball'],
    fishRange: [1, 3],
    goldFishChance: 0.05,
    color: '#FFFFFF',
    pixelKey: 'calico_sit',
    description: '充满好奇心，什么都想钻进去看看。',
  },
  {
    id: 'lucky',
    name: '幸运',
    nameEn: 'Lucky',
    rarity: 'special',
    personality: '神秘',
    preferItems: ['item_bowl_deluxe', 'item_cat_tower', 'item_heater'],
    fishRange: [10, 20],
    goldFishChance: 0.50,
    color: '#F5C842',
    pixelKey: 'white_sit',
    description: '传说中极稀有的幸运猫，遇见即是缘分。',
  },
];

// 生成猫咪简单像素头像 SVG（用于图鉴和场景展示）
function getCatSVG(catId, state = 'sit') {
  const cat = CATS.find(c => c.id === catId);
  if (!cat) return '';
  
  // 根据猫咪颜色生成简单像素图
  const color = cat.color;
  const darkColor = cat.color === '#FFFFFF' ? '#E0E0E0' : cat.color;
  
  // 简化的12×10像素猫咪图形（SVG rect 块）
  const gridSize = 8;
  
  // 坐姿猫咪像素矩阵（通用模板，用猫的主色调渲染）
  const sitGrid = [
    '..CCCC..',
    '.CCCCCC.',
    'CCCCCCCC',
    'C.CC..CC',
    'CCCCCCCC',
    '.CCCCCC.',
    '..CCCC..',
    '..CC.CC.',
    '..C...C.',
  ];
  
  const rects = [];
  sitGrid.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      const fill = ch === 'C' ? color : '#000000';
      rects.push(`<rect x="${x*gridSize}" y="${y*gridSize}" width="${gridSize}" height="${gridSize}" fill="${fill}"/>`);
    });
  });
  
  // 添加眼睛
  rects.push(`<rect x="${3*gridSize}" y="${3*gridSize}" width="${gridSize}" height="${gridSize}" fill="#66BB6A"/>`);
  rects.push(`<rect x="${5*gridSize}" y="${3*gridSize}" width="${gridSize}" height="${gridSize}" fill="#66BB6A"/>`);
  
  const w = 8 * gridSize;
  const h = 9 * gridSize;
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' shape-rendering='crispEdges'>${rects.join('')}</svg>`;
}

// 获取猫咪 SVG data URI
function getCatDataURI(catId) {
  const svg = getCatSVG(catId);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

module.exports = { CATS, getCatSVG, getCatDataURI };
