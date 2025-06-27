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

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

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

  alignToPixel(coord) {
    return Math.floor(coord * this.dpr) / this.dpr + 0.1;
  }
}