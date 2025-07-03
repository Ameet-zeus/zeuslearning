export class ScrollEvents {
  constructor(inputManager, viewport, renderer) {
    this.inputManager = inputManager;
    this.viewport = viewport;
    this.renderer = renderer;
    this.attach();
  }

  attach() {
    const wrapper = document.getElementById('wrapper');
    wrapper.addEventListener('scroll', () => {
      this.viewport.scrollX = wrapper.scrollLeft;
      this.viewport.scrollY = wrapper.scrollTop;

      const sel = this.inputManager.selectionManager.getSelection();
      this.renderer.drawGrid(sel);

      if (this.inputManager.editor.style.display !== "none" &&
        sel && sel.type === 'cell' && sel.row != null && sel.col != null) {
        this.inputManager.positionEditor(sel.row, sel.col);
      }
    });
  }
}