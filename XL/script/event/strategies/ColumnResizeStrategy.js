// ColumnResizeStrategy.js (Fixed)
import { ResizeColumnCommand } from "../../commands/commands.js";

export class ColumnResizeStrategy {
  constructor(colManager, renderer, canvas, resizer) {
    this.colManager = colManager;
    this.renderer = renderer;
    this.canvas = canvas;
    this.resizer = resizer;
    this.resizing = null;
  }

  hitTest(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const colEdge = this.resizer.getColEdge(x, y);
    return colEdge !== -1;
  }

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
