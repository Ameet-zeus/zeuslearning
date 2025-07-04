
import { CONFIG } from "../config.js";

export class ResizeHelper {
  /**
    * @param renderer Accessing renderer functions
    * @param viewport To access scroll coordinates
 */
  constructor(renderer, viewport) {
    this.renderer = renderer;
    this.viewport = viewport;
  }

  /**
   * @param {*} x The x-coordinate of the element
   * @param {*} y The y-coordinate of the element
   * @returns the column index if the mouse is near the edge of a column, otherwise -1
   */
  getColEdge(x, y) {
    const { scrollX } = this.viewport;
    const rowHeaderWidth = this.renderer.rowHeaderWidth;

    if (y >= CONFIG.cellHeight) return -1;
    if (x < rowHeaderWidth) return -1;

    const { startCol, endCol } = this.renderer.getVisibleRange();
    const colOffsets = this.renderer.colManager.getCumulativeWidths();

    for (let c = startCol; c <= endCol; c++) {
      const colEdge = rowHeaderWidth + colOffsets[c] - scrollX;
      if (Math.abs(x - colEdge) < 5) {
        return c - 1;
      }
      if (colEdge > x + 5) break;
    }
    return -1;
  }

    /**
   * @param {*} x The x-coordinate of the element
   * @param {*} y The y-coordinate of the element
   * @returns the row index if the mouse is near the edge of a column, otherwise -1
   */
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