import { CONFIG } from "../config.js";

/**
 * @param colWidth to store col width in map
 * @param cumulativeWidths to store cumulative widths
 * @param isDirty to check whether cumulative widths is upto date
 */
export class ColManager {
  constructor() {
    this.colWidth = new Map();
    this.cumulativeWidths = [];
    this.isDirty = true;
  }

  //Set the value in map
  set(col, value) {
    const key = `R${col}`;
    if (value === "" || value == null) {
      this.colWidth.delete(key);
    } else {
      this.colWidth.set(key, value);
    }
    this.isDirty = true;
  }

  //Get value from map
  get(col) {
    const key = `R${col}`;
    return this.colWidth.get(key) || CONFIG.cellWidth;
  }

  //Get cumulative widths
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