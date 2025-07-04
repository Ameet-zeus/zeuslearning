import { CONFIG } from "../config.js";

export class SelectionManager {
  /**
   * @param {*} viewport To manage the viewport
   * @param {*} renderer To render the grid
   * @param {*} data To manage the data
   */
  constructor(viewport, renderer, data) {
    this.viewport = viewport;
    this.renderer = renderer;
    this.data = data;
    this.selected = null;
    this.isEditing = false;
    this.editor = document.getElementById("cell-editor");
  }

  /**
   * @param {*} x x-coordinate of the mouse
   * @param {*} y y-coordinate of the mouse
   * @returns the cell row and column based on mouse position
   */
  getCellFromMouse(x, y) {
    const { scrollX, scrollY } = this.viewport;
    const rowHeaderWidth = this.renderer.rowHeaderWidth;

    if (x < rowHeaderWidth && y < CONFIG.cellHeight) {
      return { type: 'corner' };
    }

    if (y < CONFIG.cellHeight && x >= rowHeaderWidth) {
      const colOffsets = this.renderer.colManager.getCumulativeWidths();
      for (let col = 0; col < CONFIG.numCols; col++) {
        const startX = rowHeaderWidth + colOffsets[col] - scrollX;
        const endX = rowHeaderWidth + colOffsets[col + 1] - scrollX;
        if (x >= startX && x < endX) {
          return { type: 'column', col };
        }
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

  /**
   * @param {*} row row index of the cell
   * @param {*} col column index of the cell
   * @param {*} edit flag to indicate whether to edit the cell
   * @returns selects the cell and optionally starts editing
   */
  selectCell(row, col, edit = false) {
    if (row == null || col == null || row < 0 || col < 0 ||
      row >= CONFIG.numRows || col >= CONFIG.numCols) {
      return;
    }
    this.selected = { type: 'cell', row, col, anchorRow: row, anchorCol: col };
    this.isEditing = edit;
    if (!edit && this.editor) {
      this.editor.blur();
    }
    if (window.updateStatusBar) window.updateStatusBar(this.selected, this.data);
  }

  /**
   * @param {*} row row index of the row to select
   * @param {*} endRow end row index for range selection
   * @returns this.selected object with row selection details
   */
  selectRow(row, endRow = null) {
    if (row < 0 || row >= CONFIG.numRows) return;
    if (endRow !== null && (endRow < 0 || endRow >= CONFIG.numRows)) return;
    if (endRow !== null && endRow !== row) {
      this.selected = {
        type: 'rows',
        start: Math.min(row, endRow),
        end: Math.max(row, endRow),
        anchorRow: row,
        anchorCol: 0
      };
    } else {
      this.selected = { type: 'row', row, anchorRow: row, anchorCol: 0 };
    }
    this.isEditing = false;
    if (window.updateStatusBar) window.updateStatusBar(this.selected, this.data);
  }

  /**
   * @param {*} col col index of the column to select
   * @param {*} endCol end column index for range selection
   * @returns this.selected object with column selection details
   */
  selectColumn(col, endCol = null) {
    if (col < 0 || col >= CONFIG.numCols) return;
    if (endCol !== null && (endCol < 0 || endCol >= CONFIG.numCols)) return;
    if (endCol !== null && endCol !== col) {
      this.selected = {
        type: 'columns',
        start: Math.min(col, endCol),
        end: Math.max(col, endCol),
        anchorRow: 0,
        anchorCol: col
      };
    } else {
      this.selected = { type: 'column', col, anchorRow: 0, anchorCol: col };
    }
    this.isEditing = false;
    if (window.updateStatusBar) window.updateStatusBar(this.selected, this.data);
  }

  /**
   * @param {*} startRow start row index of the range
   * @param {*} startCol start column index of the range
   * @param {*} endRow end row index of the range
   * @param {*} endCol end column index of the range
   * @returns selects a range of cells from start to end row and column
   */
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
      endCol: Math.max(startCol, endCol),
      anchorRow: startRow,
      anchorCol: startCol
    };
    this.isEditing = false;
    this.renderer.drawGrid(this.selected);
    if (window.updateStatusBar) window.updateStatusBar(this.selected, this.data);
  }

  /**
   * Selects all cells in the grid.
   */
  selectAll() {
    this.selected = { type: 'all' };
    this.isEditing = false;
    this.renderer.drawGrid(this.selected);
    if (window.updateStatusBar) window.updateStatusBar(this.selected, this.data);
  }

  /**
   * Clears the current selection.
   */
  clearSelection() {
    this.selected = null;
    this.isEditing = false;
    this.renderer.drawGrid();
    if (window.updateStatusBar) window.updateStatusBar(this.selected, this.data);
  }

  /**
   * @returns the currently selected cell or range of cells
   */
  getSelection() {
    return this.selected;
  }
}