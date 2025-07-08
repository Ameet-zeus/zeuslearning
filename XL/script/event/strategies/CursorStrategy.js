import { CONFIG } from "../../config.js";

export class CursorStrategy {
  constructor(renderer, canvas, resizeHelper) {
    this.renderer = renderer;
    this.canvas = canvas;
    this.resizeHelper = resizeHelper;
  }

  onPointerMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const colEdge = this.resizeHelper.getColEdge(x, y);
    const rowEdge = this.resizeHelper.getRowEdge(x, y);

    if (colEdge !== -1 && y < CONFIG.cellHeight) {
      this.canvas.style.cursor = "ew-resize";
    } else if (rowEdge !== -1 && x < this.renderer.rowHeaderWidth) {
      this.canvas.style.cursor = "ns-resize";
    } else if (y < CONFIG.cellHeight && x > this.renderer.rowHeaderWidth) {
      this.canvas.style.cursor = `url('/svg/arrow-down.svg') 8 8, pointer`;
    } else if (x < this.renderer.rowHeaderWidth && y > CONFIG.cellHeight) {
      this.canvas.style.cursor = `url('/svg/arrow-right.svg') 8 8, pointer`;
    } else {
      this.canvas.style.cursor = "cell";
    }
  }
}
