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

    this.setupScrollListener();
    this.setupResizeListener();
  }

  setupScrollListener() {
    const wrapper = document.getElementById('wrapper');
    wrapper.addEventListener('scroll', () => {
      this.scrollX = wrapper.scrollLeft;
      this.scrollY = wrapper.scrollTop;
    });
  }

  setupResizeListener() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth - 18;
      this.height = window.innerHeight - 18;
      const canvas = document.getElementById('spreadsheet-canvas');
      canvas.width = this.width * (window.devicePixelRatio || 1);
      canvas.height = this.height * (window.devicePixelRatio || 1);
      canvas.style.width = this.width + 'px';
      canvas.style.height = this.height + 'px';
    });
  }
}