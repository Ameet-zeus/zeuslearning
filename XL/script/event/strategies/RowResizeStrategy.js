// RowResizeStrategy.js (Fixed)
import { ResizeRowCommand } from "../../commands/commands.js";

export class RowResizeStrategy {
  /**
   * @param {*} rowManager to manage row heights
   * @param {*} renderer to render the grid
   * @param {*} canvas canvas element for rendering
   * @param {*} resizer to handle resizing logic
   */
  constructor(rowManager, renderer, canvas, resizer) {
    this.rowManager = rowManager;
    this.renderer = renderer;
    this.canvas = canvas;
    this.resizer = resizer;
    this.resizing = null;
  }

  /**
   * Checks if the pointer event is a hit on a row edge.
   * @param {*} e Pointer event to check if it hits a row edge
   */
  hitTest(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rowEdge = this.resizer.getRowEdge(x, y);
    return rowEdge !== -1;
  }

  setCursor() {
    this.canvas.style.cursor = "ns-resize";
  }
  /**
   * Handles pointer down events to initiate row resizing.
   * @param {*} e Pointer event for mouse down
   */
  onPointerDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rowEdge = this.resizer.getRowEdge(x, y);
    if (rowEdge !== -1) {
      this.resizing = {
        index: rowEdge,
        start: this.rowManager.get(rowEdge),
        startPos: y,
      };
      this.originalHeight = this.rowManager.get(rowEdge);
      e.preventDefault();
    }
  }

  /**
   * Handles pointer move events to resize the row.
   * @param {*} e Pointer event for mouse move
   */
  onPointerMove(e) {
    if (!this.resizing) return;
    const rect = this.canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const delta = y - this.resizing.startPos;
    let newHeight = this.resizing.start + delta;
    newHeight = Math.max(20, newHeight);
    this.rowManager.set(this.resizing.index, newHeight);
    this.renderer.drawGrid();
    
  }

  /**
   * Handles pointer up events to finalize row resizing.
   * @param {*} e Pointer event for mouse up
   */
  onPointerUp(e) {
    if (this.resizing) {
      const { index } = this.resizing;
      const newHeight = this.rowManager.get(index);

      if (newHeight !== this.originalHeight) {
        const command = new ResizeRowCommand(this.rowManager, index, newHeight, this.renderer);
        command.oldHeight = this.originalHeight;
        window.CommandManagerInstance.executeCommand(command);
      }
    }
    this.resizing = null;
  }
}