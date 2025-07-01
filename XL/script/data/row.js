import { CONFIG } from "../config.js";

/**
 * @param rowHeight to store row heights in map
 * @param cumulativeHeights to store cumulative height
 * @param isDirty to check whether cumulative height is upto date
 */
export class RowManager {
  constructor() {
    this.rowHeight = new Map();
    this.cumulativeHeights = [];
    this.isDirty = true;
  }

  //Set value in map
  set(row, value) {
    const key = `R${row}`;
    if (value === "" || value == null) {
      this.rowHeight.delete(key);
    } else {
      this.rowHeight.set(key, value);
    }
    this.isDirty = true;
  }

  //Get value from map
  get(row) {
    const key = `R${row}`;
    return Math.max(this.rowHeight.get(key) || CONFIG.cellHeight, 5);
  }

  //Get cumulative heights
  getCumulativeHeights() {
    if (!this.isDirty && this.cumulativeHeights.length === CONFIG.numRows + 1) {
      return this.cumulativeHeights;
    }

    this.cumulativeHeights = [0];
    for (let i = 0; i < CONFIG.numRows; i++) {
      const height = this.get(i);
      this.cumulativeHeights.push(this.cumulativeHeights[i] + height);
    }
    this.isDirty = false;
    return this.cumulativeHeights;
  }
}