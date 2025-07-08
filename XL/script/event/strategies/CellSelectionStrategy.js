export class CellSelectionStrategy {
  constructor(inputManager, renderer, canvas) {
    this.inputManager = inputManager;
    this.renderer = renderer;
    this.canvas = canvas;
    this.dragging = null;
  }

  hitTest(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const result = this.inputManager.getCellFromMouse(x, y);
    return result && result.type === 'cell';
  }

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

  onPointerUp(e) {
    this.dragging = null;
    // Always redraw grid to show final selection
    this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
  }
}
