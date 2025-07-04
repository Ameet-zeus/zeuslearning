export class DataManager {
  /**
   * @param data stores the data in a map
   */
  constructor() {
    this.data = new Map();
  }

  //Set value in map
  /**
   * @param {*} row key of row
   * @param {*} col key of column
   * @param {*} value data to be set
   */
  set(row, col, value) {
    const key = `R${row}C${col}`;
    if (value === "" || value == null) {
      this.data.delete(key);
    } else {
      this.data.set(key, value);
    }
  }

  //Get value from map
  /**
   * @param {*} row key of row
   * @param {*} col key of column
   * @returns data at the specified row and column or an empty string if not set
   */
  get(row, col) {
    const key = `R${row}C${col}`;
    return this.data.get(key) || "";
  }

}
