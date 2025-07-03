export class ResizeEvents {
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