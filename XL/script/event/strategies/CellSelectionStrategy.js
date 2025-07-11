export class CellSelectionStrategy {
  /**
   * Handles cell selection and dragging in a spreadsheet-like interface.
   * @param {*} inputManager to manage user input
   * @param {*} renderer renderer to render the grid
   * @param {*} canvas canvas element for rendering
   */
  constructor(inputManager, renderer, canvas) {
    this.inputManager = inputManager;
    this.renderer = renderer;
    this.canvas = canvas;
    this.dragging = null;
  }

  /**
   * Checks if the pointer event is a hit on a cell.
   * @param {*} e Pointer event
   */
  hitTest(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const result = this.inputManager.getCellFromMouse(x, y);
    return result && result.type === 'cell';
  }

  setCursor() {
    this.canvas.style.cursor = "cell";
  }

  /**
   * @param {*} e Pointer event for mouse down
   */
  onPointerDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const result = this.inputManager.getCellFromMouse(x, y);
    if (result && result.type === 'cell') {
      this.inputManager.selectionManager.selectCell(result.row, result.col, false);
      this.inputManager.positionEditor(result.row, result.col);
      this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
      this.dragging = {
        startRow: result.row,
        startCol: result.col,
        endRow: result.row,
        endCol: result.col,
        hasMoved: false,
      };
      e.preventDefault();
    }
  }

  /**
   * Handles pointer move events to update cell selection during dragging.
   * @param {*} e Pointer event for mouse move
   */
  onPointerMove(e) {
    if (!this.dragging) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const result = this.inputManager.getCellFromMouse(x, y);
    if (result && result.type === 'cell') {
      this.dragging.hasMoved = true;
      this.dragging.endRow = result.row;
      this.dragging.endCol = result.col;
      if (this.dragging.startRow === result.row && this.dragging.startCol === result.col) {
        this.inputManager.selectionManager.selectCell(result.row, result.col, false);
      } else {
        this.inputManager.selectionManager.selectCellRange(
          this.dragging.startRow,
          this.dragging.startCol,
          result.row,
          result.col
        );
      }
      this.inputManager.positionEditor(this.dragging.startRow, this.dragging.startCol);
      this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
    }
  }

  /**
    * Handles pointer up events to finalize cell selection.
   * @param {*} e Pointer event for mouse up
   */
  onPointerUp(e) {
    this.dragging = null;
    this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
  }
}
