import { Config, Utils } from './config.js';

// SELECTION
export class Selection {
  constructor(spreadsheet) {
    this.sheet = spreadsheet;
    this.clearSelection();
  }

  selectCell(row, col) {
    this.start = { row, col };
    this.end = { row, col };
    this.active = true;
    this.selectedCells = [{ row, col }];
    this.sheet.input.updateInputForCell(row, col);
  }

  selectRange(startRow, startCol, endRow, endCol) {
    this.start = { row: startRow, col: startCol };
    this.end = { row: endRow, col: endCol };
    this.active = true;
    this.selectedCells = [];
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        this.selectedCells.push({ row: r, col: c });
      }
    }
    this.sheet.input.updateInputForCell(endRow, endCol);
  }

  getSelectedCells() {
    return this.selectedCells;
  }

  isCellSelected(r, c) {
    return this.selectedCells.some(cell => cell.row === r && cell.col === c);
  }

  get focusCell() {
    return this.end;
  }

  clearSelection() {
    this.start = { row: 0, col: 0 };
    this.end = { row: 0, col: 0 };
    this.selectedCells = [];
    this.active = false;
  }
}

// INPUT HANDLER
export class Input {
  constructor(spreadsheet) {
    this.sheet = spreadsheet;

    this.inputElem = document.createElement("input");
    this.inputElem.id = "cell-input";
    document.getElementById("container").appendChild(this.inputElem);

    this.inputElem.addEventListener("keydown", (e) => {
      let { row, col } = this.activeCell || this.sheet.selection.focusCell;
      let handled = false;

      if (
        ["Enter", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
      ) {
        this.commit();

        let dr = 0, dc = 0;
        if (e.key === "Enter") dr = e.shiftKey ? -1 : 1;
        if (e.key === "Tab") dc = e.shiftKey ? -1 : 1;
        if (e.key === "ArrowUp") dr = -1;
        if (e.key === "ArrowDown") dr = 1;
        if (e.key === "ArrowLeft") dc = -1;
        if (e.key === "ArrowRight") dc = 1;

        let nr = Math.min(Math.max(row + dr, 0), Config.ROWS - 1);
        let nc = Math.min(Math.max(col + dc, 0), Config.COLS - 1);

        this.sheet.selection.selectCell(nr, nc);
        this.sheet.render.renderGrid();
        this.showInput(nr, nc);

        e.preventDefault();
        handled = true;
      }

      if (e.key === "Escape") {
        this.hideInput();
        e.preventDefault();
      }
    });

    this.inputElem.addEventListener("blur", () => this.commit());
  }

  showInput(row, col) {
    const vp = this.sheet.viewport;
    const x = vp.colX(col);
    const y = vp.rowY(row);
    const w = this.sheet.columns.getWidth(col) - 1;
    const h = this.sheet.rows.getHeight(row) - 1;

    Object.assign(this.inputElem.style, {
      left: x + "px",
      top: y + "px",
      width: w + "px",
      height: h + "px",
      display: "block",
    });
    this.inputElem.value = this.sheet.data.get(row, col);
    this.inputElem.focus();
    this.inputElem.select();
    this.activeCell = { row, col };
  }

  hideInput() {
    this.inputElem.style.display = "none";
    this.activeCell = null;
  }

  updateInputForCell(row, col) {
    if (this.inputElem.style.display === "block") this.showInput(row, col);
  }

  commit() {
    if (!this.activeCell) return;
    let { row, col } = this.activeCell;
    let old = this.sheet.data.get(row, col);
    let val = this.inputElem.value;
    if (old !== val) {
      this.sheet.data.set(row, col, val);
      this.sheet.history.push({ row, col, old, val });
    }
    this.sheet.render.renderGrid();
    this.hideInput();
  }
}

// RENDERER
export class Render {
  constructor(spreadsheet) {
    this.sheet = spreadsheet;
    this.viewport = spreadsheet.viewport;
    this.canvas = spreadsheet.canvas;
    this.ctx = this.canvas.getContext("2d");
  }
  renderGrid() {
    let ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let sheet = this.sheet,
      vp = this.viewport;
    let colx = Config.HEADER_WIDTH;
    for (
      let c = sheet.scrollCol, i = 0;
      i < vp.visibleCols && c < Config.COLS;
      c++, i++
    ) {
      let w = sheet.columns.getWidth(c);
      ctx.fillStyle = Config.COLORS.HEADER_BACKGROUND;
      ctx.fillRect(colx, 0, w, Config.HEADER_HEIGHT);
      ctx.strokeStyle = Config.COLORS.CELL_BORDER;
      ctx.strokeRect(colx, 0, w, Config.HEADER_HEIGHT);
      ctx.fillStyle = Config.COLORS.HEADER_TEXT;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 15px Segoe UI, Arial";
      ctx.fillText(
        Utils.getColLabel(c),
        colx + w / 2,
        Config.HEADER_HEIGHT / 2
      );
      colx += w;
    }
    let rowy = Config.HEADER_HEIGHT;
    for (
      let r = sheet.scrollRow, i = 0;
      i < vp.visibleRows && r < Config.ROWS;
      r++, i++
    ) {
      let h = sheet.rows.getHeight(r);
      ctx.fillStyle = Config.COLORS.HEADER_BACKGROUND;
      ctx.fillRect(0, rowy, Config.HEADER_WIDTH, h);
      ctx.strokeStyle = Config.COLORS.CELL_BORDER;
      ctx.strokeRect(0, rowy, Config.HEADER_WIDTH, h);
      ctx.fillStyle = Config.COLORS.HEADER_TEXT;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 15px Segoe UI, Arial";
      ctx.fillText(r + 1, Config.HEADER_WIDTH / 2, rowy + h / 2);
      rowy += h;
    }
    ctx.fillStyle = Config.COLORS.HEADER_BACKGROUND;
    ctx.fillRect(0, 0, Config.HEADER_WIDTH, Config.HEADER_HEIGHT);
    ctx.strokeStyle = Config.COLORS.CELL_BORDER;
    ctx.strokeRect(0, 0, Config.HEADER_WIDTH, Config.HEADER_HEIGHT);

    rowy = Config.HEADER_HEIGHT;
    for (
      let r = sheet.scrollRow, i = 0;
      i < vp.visibleRows && r < Config.ROWS;
      r++, i++
    ) {
      let h = sheet.rows.getHeight(r),
        colx = Config.HEADER_WIDTH;
      for (
        let c = sheet.scrollCol, j = 0;
        j < vp.visibleCols && c < Config.COLS;
        c++, j++
      ) {
        let w = sheet.columns.getWidth(c);
        if (sheet.selection.isCellSelected(r, c)) {
          ctx.fillStyle = "#e9ffe5";
          ctx.fillRect(colx, rowy, w, h);
        } else {
          ctx.fillStyle = Config.COLORS.CELL_BACKGROUND;
          ctx.fillRect(colx, rowy, w, h);
        }
        ctx.strokeStyle = Config.COLORS.CELL_BORDER;
        ctx.strokeRect(colx, rowy, w, h);
        ctx.fillStyle = Config.COLORS.CELL_TEXT;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = "14px Segoe UI, Arial";
        let val = sheet.data.get(r, c);
        if (val) ctx.fillText(val, colx + 5, rowy + h / 2);
        if (
          sheet.selection.active &&
          sheet.selection.focusCell.row === r &&
          sheet.selection.focusCell.col === c
        ) {
          ctx.save();
          ctx.strokeStyle = Config.COLORS.SELECTION_BORDER;
          ctx.lineWidth = 2;
          ctx.strokeRect(colx + 1, rowy + 1, w - 2, h - 2);
          ctx.restore();
        }
        colx += w;
      }
      rowy += h;
    }
  }
}

// VIEWPORT
export class Viewport {
  constructor(canvas, spreadsheet) {
    this.canvas = canvas;
    this.sheet = spreadsheet;
  }
  get visibleCols() {
    let w = this.canvas.width - Config.HEADER_WIDTH,
      sum = 0,
      count = 0;
    for (let i = this.sheet.scrollCol; i < Config.COLS && sum < w; i++) {
      sum += this.sheet.columns.getWidth(i);
      count++;
    }
    return count;
  }
  get visibleRows() {
    let h = this.canvas.height - Config.HEADER_HEIGHT,
      sum = 0,
      count = 0;
    for (let i = this.sheet.scrollRow; i < Config.ROWS && sum < h; i++) {
      sum += this.sheet.rows.getHeight(i);
      count++;
    }
    return count;
  }
  colX(col) {
    let x = Config.HEADER_WIDTH;
    for (let i = this.sheet.scrollCol; i < col; i++)
      x += this.sheet.columns.getWidth(i);
    return x;
  }
  rowY(row) {
    let y = Config.HEADER_HEIGHT;
    for (let i = this.sheet.scrollRow; i < row; i++)
      y += this.sheet.rows.getHeight(i);
    return y;
  }
  findColByX(x) {
    let px = Config.HEADER_WIDTH;
    for (let i = this.sheet.scrollCol; i < Config.COLS; i++) {
      let w = this.sheet.columns.getWidth(i);
      if (x >= px && x < px + w) return i;
      px += w;
    }
    return null;
  }
  findRowByY(y) {
    let py = Config.HEADER_HEIGHT;
    for (let i = this.sheet.scrollRow; i < Config.ROWS; i++) {
      let h = this.sheet.rows.getHeight(i);
      if (y >= py && y < py + h) return i;
      py += h;
    }
    return null;
  }
}