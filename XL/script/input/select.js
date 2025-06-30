
import { CONFIG } from "../config.js";

export class SelectionManager {
  constructor(viewport, renderer, data) {
    this.viewport = viewport;
    this.renderer = renderer;
    this.data = data;
    this.selected = null;
    this.isEditing = false;
    this.editor = document.getElementById("cell-editor");
  }

  getCellFromMouse(x, y) {
    const { scrollX, scrollY } = this.viewport;
    const rowHeaderWidth = this.renderer.rowHeaderWidth;

    // Select all
    if (x < rowHeaderWidth && y < CONFIG.cellHeight) {
      return { type: 'corner' };
    }

    // Column header
    if (y < CONFIG.cellHeight && x >= rowHeaderWidth) {
      let accX = rowHeaderWidth - scrollX;
      for (let col = 0; col < CONFIG.numCols; col++) {
        let w = this.renderer.colManager.get(col);
        if (x >= accX && x < accX + w) {
          return { type: 'column', col };
        }
        accX += w;
      }
    }

    // Row header
    if (x < rowHeaderWidth && y >= CONFIG.cellHeight) {
      let accY = CONFIG.cellHeight - scrollY;
      for (let row = 0; row < CONFIG.numRows; row++) {
        let h = this.renderer.rowManager.get(row);
        if (y >= accY && y < accY + h) {
          return { type: 'row', row };
        }
        accY += h;
      }
    }

    // Cell
    if (x >= rowHeaderWidth && y >= CONFIG.cellHeight) {
      let accY = CONFIG.cellHeight - scrollY;
      for (let row = 0; row < CONFIG.numRows; row++) {
        let h = this.renderer.rowManager.get(row);
        if (y >= accY && y < accY + h) {
          let accX = rowHeaderWidth - scrollX;
          for (let col = 0; col < CONFIG.numCols; col++) {
            let w = this.renderer.colManager.get(col);
            if (x >= accX && x < accX + w) {
              return { type: 'cell', row, col };
            }
            accX += w;
          }
        }
        accY += h;
      }
    }

    return null;
  }


  selectCell(row, col, edit = false) {
    if (row == null || col == null || row < 0 || col < 0 ||
      row >= CONFIG.numRows || col >= CONFIG.numCols) {
      return;
    }

    this.selected = { type: 'cell', row, col };
    this.isEditing = edit;
    this.renderer.drawGrid(this.selected);
    if (!edit && this.editor) {
      this.editor.blur();
    }
  }

  selectRow(row) {
    if (row == null || row < 0 || row >= CONFIG.numRows) {
      return;
    }

    this.selected = { type: 'row', row };
    this.isEditing = false;
    this.renderer.drawGrid(this.selected);
  }

  selectColumn(col) {
    if (col == null || col < 0 || col >= CONFIG.numCols) {
      return;
    }

    this.selected = { type: 'column', col };
    this.isEditing = false;
    this.renderer.drawGrid(this.selected);
  }

  selectAll() {
    this.selected = { type: 'all' };
    this.isEditing = false;
    this.renderer.drawGrid(this.selected);
  }

  clearSelection() {
    this.selected = null;
    this.isEditing = false;
    this.renderer.drawGrid();
  }

  getSelection() {
    return this.selected;
  }
}