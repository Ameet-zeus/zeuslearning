import { Config } from './config.js';
import { Data, Rows, Columns } from './data.js';
import { Selection, Input, Render, Viewport } from './render.js';

// Spreadsheet Structure
export class Spreadsheet {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.ctx = this.canvas.getContext("2d");

    this.numCols = Config.numCols;
    this.numRows = Config.numRows;
    this.cellWidth = Config.cellWidth;
    this.cellHeight = Config.cellHeight;
    this.scrollRow = 0;
    this.scrollCol = 0;

    this.data = new Data(Config.ROWS, Config.COLS);
    this.rows = new Rows(this);
    this.columns = new Columns(this);
    this.selection = new Selection(this);
    this.input = new Input(this);
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

  renderViewport(scrollLeft, scrollTop, viewportWidth, viewportHeight) {
    const startCol = Math.floor(scrollLeft / this.cellWidth);
    const endCol = Math.min(this.numCols, Math.ceil((scrollLeft + viewportWidth) / this.cellWidth));
    const startRow = Math.floor(scrollTop / this.cellHeight);
    const endRow = Math.min(this.numRows, Math.ceil((scrollTop + viewportHeight) / this.cellHeight));

    this.ctx.clearRect(0, 0, viewportWidth, viewportHeight);
    this.scale(window.devicePixelRatio, window.devicePixelRatio);
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const x = col * this.cellWidth - scrollLeft;
        const y = row * this.cellHeight - scrollTop;
        this.ctx.strokeStyle = "#ccc";
        this.ctx.width = 0.1;
        this.ctx.strokeRect(x, y, this.cellWidth, this.cellHeight);
      }
    }
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
    const eventManager = new EventManager(this.canvas, this);
    eventManager.attachEvents();
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
    }, { passive: false });
  }
}