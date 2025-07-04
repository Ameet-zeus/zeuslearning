export class StatusBar {
  constructor() {
    this.cellRef = document.getElementById("cell-reference");
    this.rowColInfo = document.getElementById("row-col-info");
    this.selectionInfo = document.getElementById("selection-info");
    this.sumInfo = document.getElementById("sum-info");
    this.countInfo = document.getElementById("count-info");
    this.avgInfo = document.getElementById("average-info");
  }

  getColumnLabel(index) {
    let label = "";
    while (index >= 0) {
      label = String.fromCharCode((index % 26) + 65) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  }

  update(selection, data) {
    if (!selection) {
      this.cellRef.textContent = "Cell: ";
      this.rowColInfo.textContent = "Row: , Col: ";
      this.selectionInfo.textContent = "No selection";
      this.sumInfo.textContent = "Sum: 0";
      this.countInfo.textContent = "Count: 0";
      this.avgInfo.textContent = "Average: 0";
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
      return;
    }

    // Range selection
    let startRow = selection.startRow ?? selection.row ?? 0;
    let endRow = selection.endRow ?? selection.row ?? 0;
    let startCol = selection.startCol ?? selection.col ?? 0;
    let endCol = selection.endCol ?? selection.col ?? 0;
    if (selection.type === "range" || selection.type === "rows" || selection.type === "columns") {
      if (selection.type === "rows") {
        startRow = selection.start;
        endRow = selection.end;
        startCol = 0;
        endCol = data.data ? Math.max(...[...data.data.keys()].map(k => parseInt(k.split("C")[1]))) : 0;
      } else if (selection.type === "columns") {
        startCol = selection.start;
        endCol = selection.end;
        startRow = 0;
        endRow = data.data ? Math.max(...[...data.data.keys()].map(k => parseInt(k.split("R")[1].split("C")[0]))) : 0;
      }
      let count = 0, sum = 0;
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          const v = parseFloat(data.get(r, c));
          if (!isNaN(v)) {
            sum += v;
            count++;
          }
        }
      }
      this.cellRef.textContent = `Cell: ${this.getColumnLabel(startCol)}${startRow + 1}`;
      this.rowColInfo.textContent = `Row: ${startRow + 1}, Col: ${this.getColumnLabel(startCol)}`;
      this.selectionInfo.textContent = `${(endRow - startRow + 1) * (endCol - startCol + 1)} cells selected`;
      this.sumInfo.textContent = `Sum: ${sum}`;
      this.countInfo.textContent = `Count: ${count}`;
      this.avgInfo.textContent = `Average: ${count ? (sum / count).toFixed(2) : 0}`;
      return;
    }

    if (selection.type === "all") {
      this.cellRef.textContent = "Cell: All";
      this.rowColInfo.textContent = "Row: All, Col: All";
      this.selectionInfo.textContent = "All cells selected";
      this.sumInfo.textContent = "";
      this.countInfo.textContent = "";
      this.avgInfo.textContent = "";
      return;
    }
  }
}