export class DataManager {
  /**
   * @param data stores the data in a map
   */
  constructor() {
    this.data = new Map();
  }

  set(row, col, value) {
    const key = `R${row}C${col}`;
    if (value === "" || value == null) {
      this.data.delete(key);
    } else {
      this.data.set(key, value);
    }
  }

  get(row, col) {
    const key = `R${row}C${col}`;
    return this.data.get(key) || "";
  }

}
