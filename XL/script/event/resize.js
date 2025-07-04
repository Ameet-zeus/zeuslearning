export class ResizeEvents {
  /**
   * @param {*} inputManager to manage user inputs
   * @param {*} viewport to manage the viewport
   * @param {*} renderer to render the grid
   * @param {*} canvas to draw the grid
   * @param {*} ctx context of the canvas to draw on
   */
  constructor(inputManager, viewport, renderer, canvas, ctx) {
    this.inputManager = inputManager;
    this.viewport = viewport;
    this.renderer = renderer;
    this.canvas = canvas;
    this.ctx = ctx;
    this.attach();
  }

  attach() {
    window.addEventListener('resize', () => {
      this.viewport.resizeCanvas(this.canvas, this.ctx);
      this.renderer.calculateHeaderWidth();

      const sel = this.inputManager.selectionManager.getSelection();
      this.renderer.drawGrid(sel);
      if (this.inputManager.editor.style.display !== "none" &&
        sel && sel.type === 'cell' && sel.row != null && sel.col != null) {
        this.inputManager.positionEditor(sel.row, sel.col);
      }
    });
  }
}