export class ColumnSelectionStrategy {
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
    return result && result.type === 'column';
  }

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

  onPointerUp(e) {
    this.dragging = null;
    this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
  }
}
