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

      if (this.inputManager.editor.style.display !== "none" && sel) {
        let row = null;
        let col = null;
        if (sel.type === 'cell') {
          row = sel.row;
          col = sel.col;
        } else if (sel.type === 'range') {
          row = sel.anchorRow ?? sel.startRow ?? 0;
          col = sel.anchorCol ?? sel.startCol ?? 0;
        } else if (sel.type === 'row') {
          row = sel.row;
          col = this.inputManager.selectionManager.selected?.col ?? 0;
        } else if (sel.type === 'rows') {
          row = sel.anchorRow ?? sel.start ?? 0;
          col = this.inputManager.selectionManager.selected?.col ?? 0;
        } else if (sel.type === 'column') {
          row = this.inputManager.selectionManager.selected?.row ?? 0;
          col = sel.col;
        } else if (sel.type === 'columns') {
          row = this.inputManager.selectionManager.selected?.row ?? 0;
          col = sel.anchorCol ?? sel.start ?? 0;
        } else if (sel.type === 'all') {
          row = this.inputManager.selectionManager.selected?.row ?? 0;
          col = this.inputManager.selectionManager.selected?.col ?? 0;
        }
        if (row != null && col != null) {
          this.inputManager.positionEditor(row, col);
        }
      }
    });
  }
}