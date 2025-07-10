export class ColumnSelectionStrategy {
  /**
   * Handles column selection and dragging in a spreadsheet-like interface.
   * @param {*} inputManager to manage user input
   * @param {*} renderer to render the grid
   * @param {*} canvas canvas element for rendering
   */
  constructor(inputManager, renderer, canvas) {
    this.inputManager = inputManager;
    this.renderer = renderer;
    this.canvas = canvas;
    this.dragging = null;
  }

  /**
   * Checks if the pointer event is a hit on a column header.
   * @param {*} e Pointer event
   */
  hitTest(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const result = this.inputManager.getCellFromMouse(x, y);
    return result && result.type === 'column';
  }

  /**
   * Handles pointer down events to initiate column selection.
   * @param {*} e Pointer event
   */
  onPointerDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const result = this.inputManager.getCellFromMouse(x, y);
    if (result && result.type === 'column') {
      this.inputManager.selectionManager.selectColumn(result.col);
      this.inputManager.positionEditor(0, result.col);
      this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
      this.dragging = {
        startCol: result.col,
        endCol: result.col,
        hasMoved: false,
      };
      e.preventDefault();
    }
  }

  /**
   * Handles pointer move events to update column selection during dragging.
   * @param {*} e Pointer event
   */
  onPointerMove(e) {
    if (!this.dragging) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const result = this.inputManager.getCellFromMouse(x, y);
    if (result && (result.type === 'column' || result.type === 'cell')) {
      this.dragging.hasMoved = true;
      this.dragging.endCol = result.col;
      this.inputManager.selectionManager.selectColumn(this.dragging.startCol, result.col);
      this.inputManager.positionEditor(0, this.dragging.startCol);
      this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
    }
  }

  /**
   * Handles pointer up events to finalize column selection.
   * @param {*} e Pointer event
   */
  onPointerUp(e) {
    this.dragging = null;
    this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
  }
}
