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

  //Get the type of selection
  getCellFromMouse(x, y) {
    const { scrollX, scrollY } = this.viewport;
    const rowHeaderWidth = this.renderer.rowHeaderWidth;

    if (x < rowHeaderWidth && y < CONFIG.cellHeight) {
      return { type: 'corner' };
    }

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
  applySelectionVisuals() {
    this.renderer.drawGrid(this.selected);
  }

  //Update on selecting cell
  selectCell(row, col, edit = false) {
    if (row == null || col == null || row < 0 || col < 0 ||
      row >= CONFIG.numRows || col >= CONFIG.numCols) {
      return;
    }
    this.selected = { type: 'cell', row, col };
    this.isEditing = edit;
    this.applySelectionVisuals();
    if (!edit && this.editor) {
      this.editor.blur();
    }
  }

  //Update page on selecting row
  selectRow(row, endRow = null) {
    if (row < 0 || row >= CONFIG.numRows) return;
    if (endRow !== null && (endRow < 0 || endRow >= CONFIG.numRows)) return;
    if (endRow !== null && endRow !== row) {
      this.selected = {
        type: 'rows',
        start: Math.min(row, endRow),
        end: Math.max(row, endRow)
      };
    } else {
      this.selected = { type: 'row', row };
    }
    this.isEditing = false;
    this.applySelectionVisuals();
  }

  //Update page on selecting column
  selectColumn(col, endCol = null) {
    if (col < 0 || col >= CONFIG.numCols) return;
    if (endCol !== null && (endCol < 0 || endCol >= CONFIG.numCols)) return;
    if (endCol !== null && endCol !== col) {
      this.selected = {
        type: 'columns',
        start: Math.min(col, endCol),
        end: Math.max(col, endCol)
      };
    } else {
      this.selected = { type: 'column', col };
    }
    this.isEditing = false;
    this.applySelectionVisuals();
  }

  // Cell range selection
  selectCellRange(startRow, startCol, endRow, endCol) {
    startRow = Math.max(0, Math.min(startRow, CONFIG.numRows - 1));
    endRow = Math.max(0, Math.min(endRow, CONFIG.numRows - 1));
    startCol = Math.max(0, Math.min(startCol, CONFIG.numCols - 1));
    endCol = Math.max(0, Math.min(endCol, CONFIG.numCols - 1));

    this.selected = {
      type: 'range',
      startRow: Math.min(startRow, endRow),
      endRow: Math.max(startRow, endRow),
      startCol: Math.min(startCol, endCol),
      endCol: Math.max(startCol, endCol)
    };
    this.isEditing = false;
    this.applySelectionVisuals();
  }

  //Update page on select all
  selectAll() {
    this.selected = { type: 'all' };
    this.isEditing = false;
    this.renderer.drawGrid(this.selected);
  }

  //Update page on clear selection
  clearSelection() {
    this.selected = null;
    this.isEditing = false;
    this.renderer.drawGrid();
  }

  //Get selected cell
  getSelection() {
    return this.selected;
  }
}