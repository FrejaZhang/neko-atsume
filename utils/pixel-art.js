// utils/pixel-art.js - SVG 像素画工具

/**
 * 将像素矩阵数组转换为 SVG data URI
 * @param {string[]} pixelRows - 每行是字符串，每字符代表一个像素颜色
 * @param {Object} colorMap - 字符 -> 颜色值 映射
 * @param {number} cellSize - 每个像素块的大小（px）
 */
function pixelMatrixToSVG(pixelRows, colorMap, cellSize = 8) {
  const rows = pixelRows.map(r => r.replace(/\s/g, ''));
  const maxWidth = Math.max(...rows.map(r => r.length));
  const height = rows.length;

  const rects = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.' || !colorMap[ch]) return;
      rects.push(
        `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${colorMap[ch]}"/>`
      );
    });
  });

  const svgWidth = maxWidth * cellSize;
  const svgHeight = height * cellSize;
  const svgStr = `<svg xmlns='http://www.w3.org/2000/svg' width='${svgWidth}' height='${svgHeight}' shape-rendering='crispEdges'>${rects.join('')}</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
}

/**
 * 生成纯色圆形占位图（用于头像等）
 */
function makeCircleSVG(color, size = 40) {
  const r = size / 2;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><circle cx='${r}' cy='${r}' r='${r}' fill='${color}'/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

module.exports = { pixelMatrixToSVG, makeCircleSVG };
