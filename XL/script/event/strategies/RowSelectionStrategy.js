export class RowSelectionStrategy {
  /**
   * Handles row selection in a spreadsheet-like interface.
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
   * Checks if the pointer event is a hit on a row header.
   * @param {*} e Pointer event
   */
  hitTest(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const result = this.inputManager.getCellFromMouse(x, y);
    return result && result.type === 'row';
  }

  setCursor() {
    this.canvas.style.cursor = `url('/svg/arrow-right.svg') 8 8, pointer`;
  }

  /**
   * Handles pointer down events to initiate row selection.
   * @param {*} e Pointer event for mouse down
   */
  onPointerDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const result = this.inputManager.getCellFromMouse(x, y);
    if (result && result.type === 'row') {
      this.inputManager.selectionManager.selectRow(result.row);
      this.inputManager.positionEditor(result.row, 0);
      this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
      this.dragging = {
        startRow: result.row,
        endRow: result.row,
        hasMoved: false,
      };
      e.preventDefault();
    }
  }

  /**
   * Handles pointer move events to update row selection during dragging.
   * @param {*} e Pointer event for mouse move
   */
  onPointerMove(e) {
    if (!this.dragging) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const result = this.inputManager.getCellFromMouse(x, y);
    if (result && (result.type === 'row' || result.type === 'cell')) {
      this.dragging.hasMoved = true;
      this.dragging.endRow = result.row;
      this.inputManager.selectionManager.selectRow(this.dragging.startRow, result.row);
      this.inputManager.positionEditor(this.dragging.startRow, 0);
      this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
    }
  }

  /**
   * Handles pointer up events to finalize row selection.
   * @param {*} e Pointer event for mouse up
   */
  onPointerUp(e) {
    this.dragging = null;
    this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
  }
}
