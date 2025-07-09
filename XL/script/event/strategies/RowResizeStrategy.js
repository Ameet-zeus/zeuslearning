// RowResizeStrategy.js (Fixed)
import { ResizeRowCommand } from "../../commands/commands.js";

export class RowResizeStrategy {
  constructor(rowManager, renderer, canvas, resizer) {
    this.rowManager = rowManager;
    this.renderer = renderer;
    this.canvas = canvas;
    this.resizer = resizer;
    this.resizing = null;
  }

  hitTest(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rowEdge = this.resizer.getRowEdge(x, y);
    return rowEdge !== -1;
  }

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

  onPointerMove(e) {
    if (!this.resizing) return;
    const rect = this.canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const delta = y - this.resizing.startPos;
    let newHeight = this.resizing.start + delta;
    newHeight = Math.max(20, newHeight);
    this.rowManager.set(this.resizing.index, newHeight);
    this.renderer.drawGrid();
    this.canvas.style.cursor = "ns-resize";
  }

  onPointerUp(e) {
    if (this.resizing && typeof window.CommandManagerInstance !== 'undefined') {
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