// ColumnResizeStrategy.js (Fixed)
import { ResizeColumnCommand } from "../../commands/commands.js";

export class ColumnResizeStrategy {
  /**
   * Handles column resizing in a spreadsheet-like interface.
   * @param {*} colManager to manage column widths
   * @param {*} renderer to render the grid
   * @param {*} canvas canvas element for rendering
   * @param {*} resizer to handle resizing logic
   */
  constructor(colManager, renderer, canvas, resizer) {
    this.colManager = colManager;
    this.renderer = renderer;
    this.canvas = canvas;
    this.resizer = resizer;
    this.resizing = null;
  }

  /**
   * Checks if the pointer event is a hit on a column edge.
   * @param {*} e Pointer event
   */
  hitTest(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const colEdge = this.resizer.getColEdge(x, y);
    return colEdge !== -1;
  }

  setCursor() {
    this.canvas.style.cursor = "ew-resize";
  }

  /**
   * Handles pointer down events to initiate column resizing.
   * @param {*} e Pointer event for mouse down
   */
  onPointerDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const colEdge = this.resizer.getColEdge(x, y);
    if (colEdge !== -1) {
      this.resizing = {
        index: colEdge,
        start: this.colManager.get(colEdge),
        startPos: x,
      };
      this.originalWidth = this.colManager.get(colEdge);
      e.preventDefault();
    }
  }

  /**
   * Handles pointer move events to resize the column.
   * @param {*} e Pointer event for mouse move
   */
  onPointerMove(e) {
    if (!this.resizing) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const delta = x - this.resizing.startPos;
    let newWidth = this.resizing.start + delta;
    newWidth = Math.max(20, newWidth);
    this.colManager.set(this.resizing.index, newWidth);
    this.renderer.drawGrid();
    this.canvas.style.cursor = "ew-resize";
  }

  /**
   * Handles pointer up events to finalize column resizing.
   * @param {*} e Pointer event for mouse up
   */
  onPointerUp(e) {
    if (this.resizing && typeof window.CommandManagerInstance !== 'undefined') {
      const { index } = this.resizing;
      const newWidth = this.colManager.get(index);

      if (newWidth !== this.originalWidth) {
        const command = new ResizeColumnCommand(this.colManager, index, newWidth, this.renderer);
        command.oldWidth = this.originalWidth;
        window.CommandManagerInstance.executeCommand(command);
      }
    }
    this.resizing = null;
  }
}
