
import { CONFIG } from "../config.js";

/**
 * @param renderer Accessing renderer functions
 * @param viewport To access scroll coordinates
 */
export class ResizeHelper {
  constructor(renderer, viewport) {
    this.renderer = renderer;
    this.viewport = viewport;
  }

  getColEdge(x, y) {
    const { scrollX } = this.viewport;
    const rowHeaderWidth = this.renderer.rowHeaderWidth;

    if (y >= CONFIG.cellHeight) return -1;
    if (x < rowHeaderWidth) return -1;

    const { startCol, endCol } = this.renderer.getVisibleRange();

    let colX = rowHeaderWidth - scrollX;
    for (let c = 0; c <= endCol; c++) {
      if (c > 0) colX += this.renderer.colManager.get(c - 1);

      if (c >= startCol && Math.abs(x - colX) < 5) {
        return c - 1;
      }

      if (colX > x + 5) break;
    }

    return -1;
  }

  getRowEdge(x, y) {
    const { scrollY } = this.viewport;
    const rowHeaderWidth = this.renderer.rowHeaderWidth;

    if (x >= rowHeaderWidth) return -1;
    if (y < CONFIG.cellHeight) return -1;

    const { startRow, endRow } = this.renderer.getVisibleRange();

    let rowY = CONFIG.cellHeight - scrollY;
    for (let r = 0; r <= endRow; r++) {
      if (r > 0) rowY += this.renderer.rowManager.get(r - 1);
      if (r >= startRow && Math.abs(y - rowY) < 5) {
        return r - 1;
      }
      if (rowY > y + 5) break;
    }

    return -1;
  }
}