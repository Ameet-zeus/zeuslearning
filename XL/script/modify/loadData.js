
export class LoadDataHandler {
  /**
   * @param {DataManager} dataManager - The data manager instance
   * @param {Renderer} renderer - The renderer instance
   * @param {RowManager} rowManager - The row manager instance
   * @param {ColManager} colManager - The column manager instance
   */
  constructor(dataManager, renderer, rowManager, colManager) {
    this.dataManager = dataManager;
    this.renderer = renderer;
    this.rowManager = rowManager;
    this.colManager = colManager;
  }

  /**
   * Loads JSON data into the sheet, updates the data map, and rerenders.
   * @param {Array} jsonData - Array of objects (e.g., from info.json)
   */
  load(jsonData) {
    // this.dataManager.data.clear();
    jsonData.forEach((rowObj, rowIdx) => {
      let colIdx = 0;
      for (const key in rowObj) {
        this.dataManager.set(rowIdx, colIdx, rowObj[key]);
        colIdx++;
      }
    });
    this.renderer.drawGrid();
  }
}
