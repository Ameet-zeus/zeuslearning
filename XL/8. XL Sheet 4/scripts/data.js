import { Config } from './config.js';

// DATA HANDLING
export class Data {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.data = Array.from({ length: rows }, () => Array(cols).fill(""));
  }
  get(r, c) {
    return this.data[r]?.[c] ?? "";
  }
  set(r, c, v) {
    if (this.data[r][c]) this.data[r][c] = v;
  }
  storeData(cell, value) {
    this.set(cell.row, cell.col, value);
  }
  retrieveData(cell) {
    return this.get(cell.row, cell.col);
  }
}

// ROWS and COLUMNS
export class Rows {
  constructor(spreadsheet) {
    this.sheet = spreadsheet;
    this.heights = Array(Config.ROWS).fill(Config.DEFAULT_CELL_HEIGHT);
    this.resizing = null;
  }
  getHeight(row) {
    return this.heights[row];
  }
  resizeRow(row, newHeight) {
    this.heights[row] = Math.max(Config.MIN_CELL_HEIGHT, newHeight);
    this.sheet.render.renderGrid();
  }
  findRowByY(y, scrollRow) {
    let py = Config.HEADER_HEIGHT;
    for (let i = scrollRow; i < Config.ROWS; i++) {
      let h = this.heights[i];
      if (y >= py && y < py + h) return i;
      py += h;
    }
    return null;
  }
  findRowEdge(y, scrollRow) {
    let py = Config.HEADER_HEIGHT;
    for (let i = scrollRow; i < Config.ROWS; i++) {
      let h = this.heights[i];
      if (Math.abs(y - (py + h)) < Config.RESIZE_THRESHOLD) return i;
      py += h;
    }
    return null;
  }
}

export class Columns {
  constructor(spreadsheet) {
    this.sheet = spreadsheet;
    this.widths = Array(Config.COLS).fill(Config.DEFAULT_CELL_WIDTH);
    this.resizing = null;
  }
  getWidth(col) {
    return this.widths[col];
  }
  resizeCol(col, newWidth) {
    this.widths[col] = Math.max(Config.MIN_CELL_WIDTH, newWidth);
    this.sheet.render.renderGrid();
  }
  findColByX(x, scrollCol) {
    let px = Config.HEADER_WIDTH;
    for (let i = scrollCol; i < Config.COLS; i++) {
      let w = this.widths[i];
      if (x >= px && x < px + w) return i;
      px += w;
    }
    return null;
  }
  findColEdge(x, scrollCol) {
    let px = Config.HEADER_WIDTH;
    for (let i = scrollCol; i < Config.COLS; i++) {
      let w = this.widths[i];
      if (Math.abs(x - (px + w)) < Config.RESIZE_THRESHOLD) return i;
      px += w;
    }
    return null;
  }
}

// CELL CLASS
export class Cell {
  constructor(x, y, spreadsheet) {
    this.x = x;
    this.y = y;
    this.sheet = spreadsheet;
  }
  get value() {
    return this.sheet.data.get(this.x, this.y);
  }
  set value(val) {
    this.sheet.data.set(this.x, this.y, val);
  }
  handleClick() {
    this.sheet.selection.selectCell(this.x, this.y);
    this.sheet.render.renderGrid();
    this.sheet.input.updateInputForCell(this.x, this.y);
  }
}
