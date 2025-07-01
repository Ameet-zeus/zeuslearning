import { CONFIG } from "../config.js";


export class InputManager {
  constructor(viewport, renderer, data, selectionManager) {
    this.data = data;
    this.renderer = renderer;
    this.viewport = viewport;
    this.selectionManager = selectionManager;
    this.editor = document.getElementById("cell-editor");
  }

  getCellFromMouse(x, y) {
    return this.selectionManager.getCellFromMouse(x, y);
  }

  selectCell(row, col, edit = false) {
    this.selectionManager.selectCell(row, col, edit);
    if (edit) {
      this.showEditor(row, col);
    } else {
      this.hideEditor();
    }
  }

    positionEditor(row, col) {
    const { scrollX, scrollY } = this.viewport;
    const rowHeaderWidth = this.renderer.rowHeaderWidth;
    const cellWidth = this.renderer.colManager.get(col);
    const cellHeight = this.renderer.rowManager.get(row);
    const x = this.renderer.getColumnX(col, scrollX);
    const y = this.renderer.getRowY(row, scrollY);

    if (y < CONFIG.cellHeight || x < rowHeaderWidth) {
      this.editor.style.display = "none";
      return;
    }

    this.editor.style.left = `${x + 2}px`;
    this.editor.style.top = `${y + 2}px`;
    this.editor.style.width = `${cellWidth - 4}px`;
    this.editor.style.height = `${cellHeight - 4}px`;
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