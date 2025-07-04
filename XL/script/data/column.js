import { CONFIG } from "../config.js";

export class ColManager {
  /**
 * @param colWidth to store col width in map
 * @param cumulativeWidths to store cumulative widths
 * @param isDirty to check whether cumulative widths is upto date
 */
  constructor() {
    this.colWidth = new Map();
    this.cumulativeWidths = [];
    this.isDirty = true;
  }

  //Set the value in map
  /**
   * @param {*} col key of the column
   * @param {*} value value of the column width
   */
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
  /**
   * @param {*} col key of the column 
   * @returns column width or default width if not set
   */
  get(col) {
    const key = `R${col}`;
    return this.colWidth.get(key) || CONFIG.cellWidth;
  }

  //Get cumulative widths
  /**
   * @returns an array of cumulative widths for each column
   */
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