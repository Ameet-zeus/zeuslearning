export class StatusBar {
  /**
   * Creates a status bar to display information about the current cell selection and data statistics.
   */
  constructor() {
    this.cellRef = document.getElementById("cell-reference");
    this.rowColInfo = document.getElementById("row-col-info");
    this.selectionInfo = document.getElementById("selection-info");
    this.sumInfo = document.getElementById("sum-info");
    this.countInfo = document.getElementById("count-info");
    this.avgInfo = document.getElementById("average-info");
    this.minInfo = document.getElementById("min-info");
    this.maxInfo = document.getElementById("max-info");
  }

  /**
   * @param {*} index index of the column to get the label for
   */
  getColumnLabel(index) {
    let label = "";
    while (index >= 0) {
      label = String.fromCharCode((index % 26) + 65) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  }

  /**
   * @param {*} selection selection object containing information about the selected cells
   * @param {*} data  data manager containing the data of the grid
   */
  update(selection, data) {
    if (!selection) {
      this.cellRef.textContent = "Cell: ";
      this.rowColInfo.textContent = "Row: , Col: ";
      this.selectionInfo.textContent = "No selection";
      this.sumInfo.textContent = "Sum: 0";
      this.countInfo.textContent = "Count: 0";
      this.avgInfo.textContent = "Average: 0";
      this.minInfo.textContent = "Min: 0";
      this.maxInfo.textContent = "Max: 0";
      return;
    }

    if (selection.type === "cell") {
      const row = selection.row;
      const col = selection.col;
      this.cellRef.textContent = `Cell: ${this.getColumnLabel(col)}${row + 1}`;
      this.rowColInfo.textContent = `Row: ${row + 1}, Col: ${this.getColumnLabel(col)}`;
      this.selectionInfo.textContent = "1 cell selected";
      const val = parseFloat(data.get(row, col));
      const isNum = !isNaN(val);
      this.sumInfo.textContent = `Sum: ${isNum ? val : 0}`;
      this.countInfo.textContent = `Count: ${isNum ? 1 : 0}`;
      this.avgInfo.textContent = `Average: ${isNum ? val : 0}`;
      this.minInfo.textContent = `Min: ${isNum ? val : 0}`;
      this.maxInfo.textContent = `Max: ${isNum ? val : 0}`;
      return;
    }

    let startRow = selection.startRow ?? selection.row ?? 0;
    let endRow = selection.endRow ?? selection.row ?? 0;
    let startCol = selection.startCol ?? selection.col ?? 0;
    let endCol = selection.endCol ?? selection.col ?? 0;
    if (selection.type === "range") {
      let maxRow = 0, maxCol = 0;
      if (data.data && data.data.size > 0) {
        for (const key of data.data.keys()) {
          const match = key.match(/^R(\d+)C(\d+)$/);
          if (match) {
            const r = parseInt(match[1]);
            const c = parseInt(match[2]);
            if (r > maxRow) maxRow = r;
            if (c > maxCol) maxCol = c;
          }
        }
      }
      let count = 0, sum = 0, min = Infinity, max = -Infinity;
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          const v = parseFloat(data.get(r, c));
          if (!isNaN(v)) {
            sum += v;
            count++;
            if (v < min) min = v;
            if (v > max) max = v;
          }
        }
      }
      this.cellRef.textContent = `Cell: ${this.getColumnLabel(startCol)}${startRow + 1}`;
      const startLabel = `${this.getColumnLabel(startCol)}${startRow + 1}`;
      const endLabel = `${this.getColumnLabel(endCol)}${endRow + 1}`;
      this.rowColInfo.textContent = `Range: ${startLabel} - ${endLabel}`;
      this.selectionInfo.textContent = `${(endRow - startRow + 1) * (endCol - startCol + 1)} cells selected`;
      this.sumInfo.textContent = `Sum: ${sum}`;
      this.countInfo.textContent = `Count: ${count}`;
      this.avgInfo.textContent = `Average: ${count ? (sum / count).toFixed(2) : 0}`;
      this.minInfo.textContent = `Min: ${count ? min : 0}`;
      this.maxInfo.textContent = `Max: ${count ? max : 0}`;
      return;
    } else if (selection.type === "rows" || selection.type === "row") {
      let count = 0, sum = 0, min = Infinity, max = -Infinity;
      let start, end;
      if (selection.type === "rows") {
        start = selection.start;
        end = selection.end;
      } else {
        start = end = selection.row;
      }
      for (const key of data.data.keys()) {
        const match = key.match(/^R(\d+)C(\d+)$/);
        if (match) {
          const r = parseInt(match[1]);
          if (r >= start && r <= end) {
            const v = parseFloat(data.get(r, parseInt(match[2])));
            if (!isNaN(v)) {
              sum += v;
              count++;
              if (v < min) min = v;
              if (v > max) max = v;
            }
          }
        }
      }
      if (start === end) {
        this.cellRef.textContent = `Cell: ${this.getColumnLabel(0)}${start + 1}`;
        this.rowColInfo.textContent = `Row: ${start + 1}, Col: All`;
        this.selectionInfo.textContent = `1 row selected`;
      } else {
        this.cellRef.textContent = `Cell: ${this.getColumnLabel(0)}${start + 1}`;
        this.rowColInfo.textContent = `Row: ${start + 1} - ${end + 1}, Col: All`;
        this.selectionInfo.textContent = `${end - start + 1} rows selected`;
      }
      this.sumInfo.textContent = `Sum: ${sum}`;
      this.countInfo.textContent = `Count: ${count}`;
      this.avgInfo.textContent = `Average: ${count ? (sum / count).toFixed(2) : 0}`;
      this.minInfo.textContent = `Min: ${count ? min : 0}`;
      this.maxInfo.textContent = `Max: ${count ? max : 0}`;
      return;
    } else if (selection.type === "columns" || selection.type === "column") {
      let count = 0, sum = 0, min = Infinity, max = -Infinity;
      let start, end;
      if (selection.type === "columns") {
        start = selection.start;
        end = selection.end;
      } else {
        start = end = selection.col;
      }
      for (const key of data.data.keys()) {
        const match = key.match(/^R(\d+)C(\d+)$/);
        if (match) {
          const c = parseInt(match[2]);
          if (c >= start && c <= end) {
            const v = parseFloat(data.get(parseInt(match[1]), c));
            if (!isNaN(v)) {
              sum += v;
              count++;
              if (v < min) min = v;
              if (v > max) max = v;
            }
          }
        }
      }
      if (start === end) {
        this.cellRef.textContent = `Cell: ${this.getColumnLabel(start)}1`;
        this.rowColInfo.textContent = `Row: All, Col: ${this.getColumnLabel(start)}`;
        this.selectionInfo.textContent = `1 column selected`;
      } else {
        this.cellRef.textContent = `Cell: ${this.getColumnLabel(start)}1`;
        this.rowColInfo.textContent = `Row: All, Col: ${this.getColumnLabel(start)} - ${this.getColumnLabel(end)}`;
        this.selectionInfo.textContent = `${end - start + 1} columns selected`;
      }
      this.sumInfo.textContent = `Sum: ${sum}`;
      this.countInfo.textContent = `Count: ${count}`;
      this.avgInfo.textContent = `Average: ${count ? (sum / count).toFixed(2) : 0}`;
      this.minInfo.textContent = `Min: ${count ? min : 0}`;
      this.maxInfo.textContent = `Max: ${count ? max : 0}`;
      return;
    }

    if (selection.type === "all") {
      this.cellRef.textContent = "Cell: All";
      this.rowColInfo.textContent = "Row: All, Col: All";
      this.selectionInfo.textContent = "All cells selected";
      this.sumInfo.textContent = "";
      this.countInfo.textContent = "";
      this.avgInfo.textContent = "";
      this.minInfo.textContent = "";
      this.maxInfo.textContent = "";
      return;
    }
  }
}
