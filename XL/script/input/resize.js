import { CONFIG } from "../config.js";

export function getColEdge(x, y, renderer, viewport) {
  const { scrollX } = viewport;
  const rowHeaderWidth = renderer.rowHeaderWidth;

  if (y >= CONFIG.cellHeight) return -1;
  if (x < rowHeaderWidth) return -1;

  const { startCol, endCol } = renderer.getVisibleRange();

  let colX = rowHeaderWidth - scrollX;
  for (let c = 0; c <= endCol; c++) {
    if (c > 0) colX += renderer.colManager.get(c - 1);

    if (c >= startCol && Math.abs(x - colX) < 5) {
      return c - 1;
    }

    if (colX > x + 5) break;
  }

  return -1;
}

export function getRowEdge(x, y, renderer, viewport) {
  const { scrollY } = viewport;
  const rowHeaderWidth = renderer.rowHeaderWidth;

  if (x >= rowHeaderWidth) return -1;
  if (y < CONFIG.cellHeight) return -1;

  const { startRow, endRow } = renderer.getVisibleRange();

  let rowY = CONFIG.cellHeight - scrollY;
  for (let r = 0; r <= endRow; r++) {
    if (r > 0) rowY += renderer.rowManager.get(r - 1);
    if (r >= startRow && Math.abs(y - rowY) < 5) {
      return r - 1;
    }
    if (rowY > y + 5) break;
  }

  return -1;
}