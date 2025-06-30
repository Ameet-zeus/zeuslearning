import { CONFIG } from "../config.js";

export class ColManager {
  constructor() {
    this.colWidth = new Map();
    this.cumulativeWidths = [];
    this.isDirty = true;
  }

  set(col, value) {
    const key = `R${col}`;
    if (value === "" || value == null) {
      this.colWidth.delete(key);
    } else {
      this.colWidth.set(key, value);
    }
    this.isDirty = true;
  }

  get(col) {
    const key = `R${col}`;
    return Math.max(this.colWidth.get(key) || CONFIG.cellWidth, 5);
  }

  getCumulativeWidths() {
    if (!this.isDirty && this.cumulativeWidths.length === CONFIG.numCols + 1) {
      return this.cumulativeWidths;
    }

    this.cumulativeWidths = [0];
    for (let i = 0; i < CONFIG.numCols; i++) {
      const width = this.get(i);
      this.cumulativeWidths.push(this.cumulativeWidths[i] + width);
    }

    this.isDirty = false;
    return this.cumulativeWidths;
  }
}