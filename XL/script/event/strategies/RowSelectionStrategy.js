export class RowSelectionStrategy {
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
    return result && result.type === 'row';
  }

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

  onPointerUp(e) {
    this.dragging = null;
    this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
  }
}
