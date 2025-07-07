import { CONFIG } from "../config.js";

export class AddHandler {
  constructor(selectionManager, data) {
    this.selectionManager = selectionManager;
    this.data = data;
  }

  addRowTop() {
    const selection = this.selectionManager.getSelection();
    if (!selection) {
      console.warn("No selection for addRowTop");
      return;
    }
    let insertRow = 0;
    if (selection.type === 'cell' || selection.type === 'row' || selection.type === 'rows') {
      insertRow = selection.row !== undefined ? selection.row : selection.start !== undefined ? selection.start : 0;
    } else {
      console.warn("Invalid selection type for addRowTop:", selection.type);
      return;
    }
    this.insertRow(insertRow);
  }

  addRowBottom() {
    const selection = this.selectionManager.getSelection();
    if (!selection) {
      console.warn("No selection for addRowBottom");
      return;
    }
    let insertRow = 0;
    if (selection.type === 'cell' || selection.type === 'row' || selection.type === 'rows') {
      insertRow = (selection.row !== undefined ? selection.row : selection.end !== undefined ? selection.end : 0) + 1;
    } else {
      console.warn("Invalid selection type for addRowBottom:", selection.type);
      return;
    }
    this.insertRow(insertRow);
  }

  addColumnLeft() {
    const selection = this.selectionManager.getSelection();
    if (!selection) {
      console.warn("No selection for addColumnLeft");
      return;
    }
    let insertCol = 0;
    if (selection.type === 'cell' || selection.type === 'column' || selection.type === 'columns') {
      insertCol = selection.col !== undefined ? selection.col : selection.start !== undefined ? selection.start : 0;
    } else {
      console.warn("Invalid selection type for addColumnLeft:", selection.type);
      return;
    }
    this.insertColumn(insertCol);
  }

  addColumnRight() {
    const selection = this.selectionManager.getSelection();
    if (!selection) {
      console.warn("No selection for addColumnRight");
      return;
    }
    let insertCol = 0;
    if (selection.type === 'cell' || selection.type === 'column' || selection.type === 'columns') {
      insertCol = (selection.col !== undefined ? selection.col : selection.end !== undefined ? selection.end : 0) + 1;
    } else {
      console.warn("Invalid selection type for addColumnRight:", selection.type);
      return;
    }
    this.insertColumn(insertCol);
  }

  insertRow(rowIndex) {
    const newData = new Map();
    for (const [key, value] of this.data.data.entries()) {
      const match = key.match(/^R(\d+)C(\d+)$/);
      if (match) {
        let row = parseInt(match[1], 10);
        const col = parseInt(match[2], 10);
        if (row >= rowIndex) {
          row += 1;
        }
        const newKey = `R${row}C${col}`;
        newData.set(newKey, value);
      }
    }
    this.data.data = newData;
    CONFIG.numRows += 1;

    const selection = this.selectionManager.getSelection();
    if (selection && selection.row !== undefined && selection.row >= rowIndex) {
      this.selectionManager.selectCell(selection.row + 1, selection.col);
    } else if (selection && selection.start !== undefined && selection.start >= rowIndex) {
      this.selectionManager.selectRow(selection.start + 1, selection.end);
    } else if (selection && selection.end !== undefined && selection.end >= rowIndex) {
      this.selectionManager.selectRow(selection.start, selection.end + 1);
    }

    this.refreshUI();
  }

  insertColumn(colIndex) {
    const newData = new Map();
    for (const [key, value] of this.data.data.entries()) {
      const match = key.match(/^R(\d+)C(\d+)$/);
      if (match) {
        const row = parseInt(match[1], 10);
        let col = parseInt(match[2], 10);
        if (col >= colIndex) {
          col += 1;
        }
        const newKey = `R${row}C${col}`;
        newData.set(newKey, value);
      }
    }
    this.data.data = newData;
    CONFIG.numCols += 1;

    const selection = this.selectionManager.getSelection();
    if (selection && selection.col !== undefined && selection.col >= colIndex) {
      this.selectionManager.selectCell(selection.row, selection.col + 1);
    } else if (selection && selection.start !== undefined && selection.start >= colIndex) {
      this.selectionManager.selectColumn(selection.start + 1, selection.end);
    } else if (selection && selection.end !== undefined && selection.end >= colIndex) {
      this.selectionManager.selectColumn(selection.start, selection.end + 1);
    }

    this.refreshUI();
  }

  refreshUI() {
    console.log("UI refreshed");
    if (window.renderer && typeof window.renderer.drawGrid === "function") {
      window.renderer.drawGrid();
    } else if (window.renderSpreadsheet) {
      window.renderSpreadsheet();
    }
  }
}
