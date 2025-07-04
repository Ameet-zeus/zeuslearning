export class ScrollEvents {
  /**
   * @param {*} inputManager to manage user inputs
   * @param {*} viewport to manage the viewport
   * @param {*} renderer to render the grid
   */
  constructor(inputManager, viewport, renderer) {
    this.inputManager = inputManager;
    this.viewport = viewport;
    this.renderer = renderer;
    this.attach();
  }

  /**
   * Attaches the scroll event listener to the wrapper element.
   */
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