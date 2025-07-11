export class CornerSelectionStrategy {
  /**
   * Handles corner selection in a spreadsheet-like interface.
   * @param {*} context - Context containing inputManager and canvas
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * Checks if the pointer event hits the corner selection area.
   * @param {*} e Pointer event to check if it hits the corner selection area
   */
  hitTest(e) {
    const { inputManager, canvas } = this.context;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const result = inputManager.getCellFromMouse(x, y);
    return result && result.type === 'corner';
  }

  setCursor() {
    this.canvas.style.cursor = "cell";
  }

  /**
   * Handles pointer down events to select all cells in the spreadsheet.
   * @param {*} e Pointer event for mouse down
   */
  onPointerDown(e) {
    const { inputManager } = this.context;
    inputManager.selectionManager.selectAll();
    inputManager.positionEditor(0, 0);
    e.preventDefault();
  }
  onPointerMove(e) {}
  onPointerUp(e) {}
}
