import { CONFIG } from "./config.js";

export class Viewport {
  /**
   * @param scrollX sets the offset that viewport has been scrolled by in x
   * @param scrollY sets the offset that viewport has been scrolled by in y
   * @param width sets the width of the viewport
   * @param height sets the height of the viewport
   */
  constructor() {
    this.scrollX = 0;
    this.scrollY = 0;
    this.width = window.innerWidth - 18;
    this.height = window.innerHeight - 18;
    this.dpr = window.devicePixelRatio || 1;
  }

  //getting the viewport dimensions on resize
  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  //resizing canvas on resize
  resizeCanvas(canvas, ctx) {
    const dpr = window.devicePixelRatio || 1;
    const wrapper = document.getElementById('wrapper');
    const displayWidth = wrapper.clientWidth;
    const displayHeight = wrapper.clientHeight;

    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    ctx.scale(dpr, dpr);

    this.resize(displayWidth, displayHeight);
  }

  //for adjusting to device pizel ratio
  alignToPixel(coord) {
    return Math.floor(coord * this.dpr) / this.dpr + 0.5;
  }

  //scrolling input into view
  scrollCellIntoView(row, col, renderer) {
    const rowHeaderWidth = renderer ? renderer.rowHeaderWidth : 40;
    const cellLeft = col * CONFIG.cellWidth;
    const cellRight = cellLeft + CONFIG.cellWidth;
    const cellTop = row * CONFIG.cellHeight;
    const cellBottom = cellTop + CONFIG.cellHeight;
    const viewportLeft = this.scrollX;
    const viewportRight = this.scrollX + this.width - rowHeaderWidth;
    const viewportTop = this.scrollY;
    const viewportBottom = this.scrollY + this.height - CONFIG.cellHeight;
    const wrapper = document.getElementById("wrapper");

    if (cellLeft < viewportLeft) {
      this.scrollX = cellLeft;
    } else if (cellRight > viewportRight) {
      this.scrollX = cellRight - this.width + rowHeaderWidth;
    }

    if (cellTop < viewportTop) {
      this.scrollY = cellTop;
    } else if (cellBottom > viewportBottom) {
      this.scrollY = cellBottom - this.height + CONFIG.cellHeight;
    }

    if (wrapper) {
      wrapper.scrollLeft = this.scrollX;
      wrapper.scrollTop = this.scrollY;
    }
  }
}