export class CornerSelectionStrategy {
  constructor(context) {
    this.context = context;
  }
  hitTest(e) {
    const { inputManager, canvas } = this.context;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const result = inputManager.getCellFromMouse(x, y);
    return result && result.type === 'corner';
  }
  onPointerDown(e) {
    const { inputManager } = this.context;
    inputManager.selectionManager.selectAll();
    inputManager.positionEditor(0, 0);
    e.preventDefault();
  }
  onPointerMove(e) {}
  onPointerUp(e) {}
}
