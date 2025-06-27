import { CONFIG } from "../config.js";

export class InputManager {
  constructor(viewport, renderer, data) {
    this.data = data;
    this.renderer = renderer;
    this.viewport = viewport;

    this.editor = document.getElementById("cell-editor");
    this.selected = { row: null, col: null };
  }

  getCellFromMouse(x, y) {
    const { scrollX, scrollY } = this.viewport;
    const rowHeaderWidth = this.renderer.rowHeaderWidth;

    if (x < rowHeaderWidth && y < CONFIG.cellHeight) {
      return { type: 'corner' };
    } else if (y < CONFIG.cellHeight) {
      const col = Math.floor((x + scrollX - rowHeaderWidth) / CONFIG.cellWidth);
      return { type: 'column', col };
    } else if (x < rowHeaderWidth) {
      const row = Math.floor((y + scrollY - CONFIG.cellHeight) / CONFIG.cellHeight);
      return { type: 'row', row };
    } else {
      const col = Math.floor((x + scrollX - rowHeaderWidth) / CONFIG.cellWidth);
      const row = Math.floor((y + scrollY - CONFIG.cellHeight) / CONFIG.cellHeight);
      return { type: 'cell', row, col };
    }
  }

  selectCell(row, col, edit = false) {
    if (row == null || col == null) return;

    this.selected = { row, col, type: 'cell' };
    this.renderer.drawGrid(this.selected);
    if (edit) {
      this.showEditor(row, col);
    } else {
      this.hideEditor();
    }
  }

  positionEditor(row, col) {
    const { scrollX, scrollY } = this.viewport;
    const rowHeaderWidth = this.renderer.rowHeaderWidth;
    const x = col * CONFIG.cellWidth - scrollX + rowHeaderWidth;
    const y = row * CONFIG.cellHeight - scrollY + CONFIG.cellHeight;

    if (y < CONFIG.cellHeight || x < rowHeaderWidth) {
      this.editor.style.display = "none";
      return;
    }

    this.editor.style.left = `${x + 2}px`;
    this.editor.style.top = `${y + 2}px`;
    this.editor.style.width = `${CONFIG.cellWidth - 4}px`;
    this.editor.style.height = `${CONFIG.cellHeight - 4}px`;
  }

  showEditor(row, col, initialValue = null) {
    const value = initialValue !== null ? initialValue : this.data.get(row, col) || "";
    this.editor.value = value;
    this.editor.style.display = "block";
    this.positionEditor(row, col);
    this.editor.focus();
    if (initialValue !== null) {
      this.editor.setSelectionRange(value.length, value.length);
    }
  }

  hideEditor() {
    this.editor.style.display = "none";
  }
}