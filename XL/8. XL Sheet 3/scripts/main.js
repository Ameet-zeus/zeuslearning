import { Config } from './config.js';
import { Data, Rows, Columns } from './data.js';
import { Selection, Input, Render, Viewport } from './render.js';

// HISTORY
export class History {
  constructor() {
    this.stack = [];
    this.redoStack = [];
  }
  push(cmd) {
    this.stack.push(cmd);
    this.redoStack = [];
  }
  undo(sheet) {
    if (this.stack.length === 0) return null;
    let cmd = this.stack.pop();
    this.redoStack.push(cmd);
    if (cmd.type === "paste") {
      // batch undo
      for (let c of cmd.cells) {
        sheet.data.set(c.row, c.col, c.old);
      }
    } else {
      sheet.data.set(cmd.row, cmd.col, cmd.old);
    }
    sheet.render.renderGrid();
    return cmd;
  }
  redo(sheet) {
    if (this.redoStack.length === 0) return null;
    let cmd = this.redoStack.pop();
    this.stack.push(cmd);
    if (cmd.type === "paste") {
      for (let c of cmd.cells) {
        sheet.data.set(c.row, c.col, c.val);
      }
    } else {
      sheet.data.set(cmd.row, cmd.col, cmd.val);
    }
    sheet.render.renderGrid();
    return cmd;
  }
  clear() {
    this.stack = [];
    this.redoStack = [];
  }
}

// CLIPBOARD
export class Clipboard {
  static async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window._internalClipboard = text;
    }
  }
  static async paste() {
    try {
      return await navigator.clipboard.readText();
    } catch {
      return window._internalClipboard || "";
    }
  }
  copy(cells, sheet) {
    let text = "";
    if (cells.length === 1) {
      let cell = cells[0];
      text = sheet.data.get(cell.row, cell.col);
    } else {
      let minRow = Math.min(...cells.map((c) => c.row)),
        maxRow = Math.max(...cells.map((c) => c.row));
      let minCol = Math.min(...cells.map((c) => c.col)),
        maxCol = Math.max(...cells.map((c) => c.col));
      let out = [];
      for (let r = minRow; r <= maxRow; r++) {
        let row = [];
        for (let c = minCol; c <= maxCol; c++) row.push(sheet.data.get(r, c));
        out.push(row.join("\t"));
      }
      text = out.join("\n");
    }
    Clipboard.copy(text);
  }
  async paste(targetCell, sheet) {
    let text = await Clipboard.paste();
    let lines = text.split("\n");
    let batch = [];
    for (let r = 0; r < lines.length; r++) {
      let vals = lines[r].split("\t");
      for (let c = 0; c < vals.length; c++) {
        let rr = targetCell.row + r,
          cc = targetCell.col + c;
        if (rr < Config.ROWS && cc < Config.COLS) {
          let old = sheet.data.get(rr, cc);
          batch.push({ row: rr, col: cc, old, val: vals[c] });
          sheet.data.set(rr, cc, vals[c]);
        }
      }
    }
    if (batch.length > 1) {
      sheet.history.push({ type: "paste", cells: batch });
    } else if (batch.length === 1) {
      sheet.history.push(batch[0]);
    }
    sheet.render.renderGrid();
  }
}

// Spreadsheet Structure
export class Spreadsheet {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.ctx = this.canvas.getContext("2d");
    this.scrollRow = 0;
    this.scrollCol = 0;
    this.data = new Data(Config.ROWS, Config.COLS);
    this.rows = new Rows(this);
    this.columns = new Columns(this);
    this.selection = new Selection(this);
    this.input = new Input(this);
    this.history = new History();
    this.clipboard = new Clipboard();
    this.viewport = new Viewport(this.canvas, this);
    this.render = new Render(this);
    this.attachUI();
    this.render.renderGrid();
    window.addEventListener('resize', () => {
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
      this.render.renderGrid();
    });
  }

  setScrollFromPixels(x, y) {
    let px = Config.HEADER_WIDTH, col = 0;
    while (col < Config.COLS && px < x) {
      px += this.columns.getWidth(col);
      col++;
    }
    this.scrollCol = col;

    let py = Config.HEADER_HEIGHT, row = 0;
    while (row < Config.ROWS && py < y) {
      py += this.rows.getHeight(row);
      row++;
    }
    this.scrollRow = row;
  }

  attachUI() {
    document.getElementById("undoBtn").onclick = () => this.history.undo(this);
    document.getElementById("redoBtn").onclick = () => this.history.redo(this);

    const eventManager = new EventManager(this.canvas, this);
    eventManager.attachEvents();

    this.canvas.addEventListener("mousedown", (e) => {
      let rect = this.canvas.getBoundingClientRect();
      let mx = e.clientX - rect.left,
        my = e.clientY - rect.top;
      if (my <= Config.HEADER_HEIGHT && mx > Config.HEADER_WIDTH) {
        let col = this.columns.findColEdge(mx, this.scrollCol);
        if (col !== null) {
          this.columns.resizing = {
            col,
            startX: mx,
            orig: this.columns.getWidth(col),
          };
          document.body.style.cursor = "col-resize";
        }
      }
      if (mx <= Config.HEADER_WIDTH && my > Config.HEADER_HEIGHT) {
        let row = this.rows.findRowEdge(my, this.scrollRow);
        if (row !== null) {
          this.rows.resizing = {
            row,
            startY: my,
            orig: this.rows.getHeight(row),
          };
          document.body.style.cursor = "row-resize";
        }
      }
    });
    window.addEventListener("mousemove", (e) => {
      if (this.columns.resizing) {
        let rect = this.canvas.getBoundingClientRect();
        let mx = e.clientX - rect.left;
        let { col, startX, orig } = this.columns.resizing;
        let newWidth = orig + (mx - startX);
        this.columns.resizeCol(col, newWidth);
      }
      if (this.rows.resizing) {
        let rect = this.canvas.getBoundingClientRect();
        let my = e.clientY - rect.top;
        let { row, startY, orig } = this.rows.resizing;
        let newHeight = orig + (my - startY);
        this.rows.resizeRow(row, newHeight);
      }
    });
    window.addEventListener("mouseup", () => {
      if (this.columns.resizing) {
        this.columns.resizing = null;
        document.body.style.cursor = "";
      }
      if (this.rows.resizing) {
        this.rows.resizing = null;
        document.body.style.cursor = "";
      }
    });
  }
}

//MANAGES ALL EVENTS
export class EventManager {
  constructor(container, spreadsheet) {
    this.container = container;
    this.sheet = spreadsheet;
  }

  attachEvents() {
    this.attachCanvasEvents();
    this.attachKeyboardEvents();
  }

  attachKeyboardEvents() {
    document.addEventListener("keydown", async (e) => {
      let cell = this.sheet.selection.focusCell;
      if (!this.sheet.selection.active) return;
      let handled = false;

      if (e.ctrlKey && e.key === "c") {
        this.sheet.clipboard.copy(
          this.sheet.selection.getSelectedCells(),
          this.sheet
        );
        e.preventDefault();
        handled = true;
      }

      if (e.ctrlKey && e.key === "v") {
        await this.sheet.clipboard.paste(
          this.sheet.selection.focusCell,
          this.sheet
        );
        e.preventDefault();
        handled = true;
      }
    });
  }

  attachCanvasEvents() {
    this.sheet.canvas.addEventListener("click", (e) => {
      let rect = this.sheet.canvas.getBoundingClientRect();
      let mx = e.clientX - rect.left,
        my = e.clientY - rect.top;
      let col = this.sheet.viewport.findColByX(mx),
        row = this.sheet.viewport.findRowByY(my);
      if (col !== null && row !== null) {
        this.sheet.selection.selectCell(row, col);
        this.sheet.render.renderGrid();
      }
    });

    this.sheet.canvas.addEventListener("dblclick", (e) => {
      let rect = this.sheet.canvas.getBoundingClientRect();
      let mx = e.clientX - rect.left,
        my = e.clientY - rect.top;
      let col = this.sheet.viewport.findColByX(mx),
        row = this.sheet.viewport.findRowByY(my);
      if (col !== null && row !== null) {
        this.sheet.selection.selectCell(row, col);
        this.sheet.input.showInput(row, col);
      }
    });

    let isMouseDown = false;
    let startCell = null;

    this.sheet.canvas.addEventListener("mousedown", (e) => {
      let rect = this.sheet.canvas.getBoundingClientRect();
      let mx = e.clientX - rect.left,
        my = e.clientY - rect.top;
      let col = this.sheet.viewport.findColByX(mx),
        row = this.sheet.viewport.findRowByY(my);

      if (col !== null && row !== null) {
        startCell = { row, col };
        this.sheet.selection.selectCell(row, col);
        isMouseDown = true;
        this.sheet.render.renderGrid();
      }
    });

    this.sheet.canvas.addEventListener("mousemove", (e) => {
      if (isMouseDown && startCell) {
        let rect = this.sheet.canvas.getBoundingClientRect();
        let mx = e.clientX - rect.left,
          my = e.clientY - rect.top;
        let col = this.sheet.viewport.findColByX(mx),
          row = this.sheet.viewport.findRowByY(my);

        if (col !== null && row !== null) {
          this.sheet.selection.selectRange(
            startCell.row,
            startCell.col,
            row,
            col
          );
          this.sheet.render.renderGrid();
        }
      }
    });

    this.sheet.canvas.addEventListener("mouseup", () => {
      isMouseDown = false;
      this.sheet.render.renderGrid();
    });

    this.sheet.canvas.addEventListener("wheel", (e) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      if (e.shiftKey) {
        this.sheet.scrollCol = Math.min(
          Math.max(0, this.sheet.scrollCol + (e.deltaY > 0 ? 1 : -1)),
          Config.COLS - 1
        );
      } else {
        this.sheet.scrollRow = Math.min(
          Math.max(0, this.sheet.scrollRow + (e.deltaY > 0 ? 1 : -1)),
          Config.ROWS - 1
        );
      }
      this.sheet.render.renderGrid();
    }, { passive: true });
  }
}