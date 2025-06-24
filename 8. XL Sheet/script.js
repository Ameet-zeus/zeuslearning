class SpreadsheetConfig {
  static DEFAULT_CELL_WIDTH = 100;
  static DEFAULT_CELL_HEIGHT = 30;
  static HEADER_HEIGHT = 30;
  static HEADER_WIDTH = 50;
  static ROWS = 100000;
  static COLS = 100;
  static RESIZE_THRESHOLD = 5;
  static MIN_CELL_WIDTH = 30;
  static MIN_CELL_HEIGHT = 20;

  static COLORS = {
    CELL_BACKGROUND: '#ffffff',
    CELL_BORDER: '#d0d7de',
    CELL_TEXT: '#24292f',
    HEADER_BACKGROUND: '#f6f8fa',
    HEADER_TEXT: '#656d76',
    SELECTION_BORDER: '#4285f4',
    SELECTION_BACKGROUND: '#dbeafe'
  };
}

class SpreadsheetUtils {
  static getColumnLabel(index) {
    let label = "";
    while (index >= 0) {
      label = String.fromCharCode((index % 26) + 65) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  }

  static getStartIndex(sizes, scrollOffset) {
    let sum = 0;
    for (let i = 0; i < sizes.length; i++) {
      if (sum + sizes[i] > scrollOffset) return i;
      sum += sizes[i];
    }
    return sizes.length - 1;
  }

  static getEndIndex(sizes, scrollOffset, viewportSize) {
    let sum = 0;
    for (let i = 0; i < sizes.length; i++) {
      sum += sizes[i];
      if (sum > scrollOffset + viewportSize) return i;
    }
    return sizes.length - 1;
  }

  static throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

class SpreadsheetData {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.data = Array.from({ length: rows }, () => Array(cols).fill(""));
    this.colWidths = new Array(cols).fill(SpreadsheetConfig.DEFAULT_CELL_WIDTH);
    this.rowHeights = new Array(rows).fill(SpreadsheetConfig.DEFAULT_CELL_HEIGHT);
    this.dirtyRegions = new Set();
  }

  getCellValue(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return "";
    return this.data[row][col] || "";
  }

  setCellValue(row, col, value) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    this.data[row][col] = value;
    this.markDirty(row, col);
  }

  markDirty(row, col) {
    this.dirtyRegions.add(`${row},${col}`);
  }

  clearDirty() {
    this.dirtyRegions.clear();
  }

  getCellPosition(row, col) {
    let x = SpreadsheetConfig.HEADER_WIDTH;
    for (let c = 0; c < col; c++) x += this.colWidths[c];
    let y = SpreadsheetConfig.HEADER_HEIGHT;
    for (let r = 0; r < row; r++) y += this.rowHeights[r];
    return { x, y };
  }

  getTotalWidth() {
    return SpreadsheetConfig.HEADER_WIDTH + this.colWidths.reduce((sum, w) => sum + w, 0);
  }

  getTotalHeight() {
    return SpreadsheetConfig.HEADER_HEIGHT + this.rowHeights.reduce((sum, h) => sum + h, 0);
  }
}

class ViewportManager {
  constructor(scrollArea, data) {
    this.scrollArea = scrollArea;
    this.data = data;
    this.lastScrollLeft = 0;
    this.lastScrollTop = 0;
    this.visibleCells = { startRow: 0, endRow: 0, startCol: 0, endCol: 0 };
  }

  updateViewport() {
    const scrollLeft = this.scrollArea.scrollLeft;
    const scrollTop = this.scrollArea.scrollTop;
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    this.visibleCells = {
      startCol: SpreadsheetUtils.getStartIndex(this.data.colWidths, scrollLeft),
      endCol: SpreadsheetUtils.getEndIndex(this.data.colWidths, scrollLeft, canvasWidth - SpreadsheetConfig.HEADER_WIDTH),
      startRow: SpreadsheetUtils.getStartIndex(this.data.rowHeights, scrollTop),
      endRow: SpreadsheetUtils.getEndIndex(this.data.rowHeights, scrollTop, canvasHeight - SpreadsheetConfig.HEADER_HEIGHT)
    };

    this.lastScrollLeft = scrollLeft;
    this.lastScrollTop = scrollTop;
  }

  getVisibleCells() {
    return this.visibleCells;
  }

  hasScrolled() {
    return this.scrollArea.scrollLeft !== this.lastScrollLeft ||
      this.scrollArea.scrollTop !== this.lastScrollTop;
  }
}

class SpreadsheetRenderer {
  constructor(canvas, data) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.data = data;
    this.setupCanvas();
    this.setupRenderingContext();
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before scaling
    this.ctx.scale(dpr, dpr);
  }

  setupRenderingContext() {
    this.ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "left";
  }

  render(viewport, selectedCells, editingCell) {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    const scrollLeft = viewport.scrollArea.scrollLeft;
    const scrollTop = viewport.scrollArea.scrollTop;
    const visible = viewport.getVisibleCells();

    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    this.drawMainGrid(visible, scrollLeft, scrollTop, editingCell);

    if (selectedCells && selectedCells.length > 0) {
      for (const [sr, sc] of selectedCells) {
        this.drawSelection([sr, sc], scrollLeft, scrollTop);
      }
    }
    this.drawHeaders(visible, scrollLeft, scrollTop, selectedCells && selectedCells[0]);
  }

  drawMainGrid(visible, scrollLeft, scrollTop, editingCell) {
    const { startRow, endRow, startCol, endCol } = visible;

    let yCursor = SpreadsheetConfig.HEADER_HEIGHT;
    for (let r = 0; r < startRow; r++) yCursor += this.data.rowHeights[r];

    for (let r = startRow; r <= endRow && r < this.data.rows; r++) {
      const rowH = this.data.rowHeights[r];
      let xCursor = SpreadsheetConfig.HEADER_WIDTH;
      for (let c = 0; c < startCol; c++) xCursor += this.data.colWidths[c];

      for (let c = startCol; c <= endCol && c < this.data.cols; c++) {
        const x = xCursor - scrollLeft;
        const y = yCursor - scrollTop;
        const colW = this.data.colWidths[c];

        const isEditing = editingCell && editingCell[0] === r && editingCell[1] === c;

        this.drawCell(x, y, colW, rowH, this.data.getCellValue(r, c), isEditing);

        xCursor += colW;
      }
      yCursor += rowH;
    }
  }

  drawCell(x, y, width, height, text, isEditing) {
    this.ctx.fillStyle = SpreadsheetConfig.COLORS.CELL_BACKGROUND;
    this.ctx.fillRect(x, y, width, height);

    this.ctx.strokeStyle = SpreadsheetConfig.COLORS.CELL_BORDER;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);

    if (!isEditing && text) {
      this.ctx.fillStyle = SpreadsheetConfig.COLORS.CELL_TEXT;
      this.ctx.fillText(text, x + 6, y + height / 2);
    }
  }

  drawSelection(selectedCell, scrollLeft, scrollTop) {
    const [sr, sc] = selectedCell;
    const pos = this.data.getCellPosition(sr, sc);
    const x = pos.x - scrollLeft;
    const y = pos.y - scrollTop;
    const w = this.data.colWidths[sc];
    const h = this.data.rowHeights[sr];

    if (y + h > SpreadsheetConfig.HEADER_HEIGHT && x + w > SpreadsheetConfig.HEADER_WIDTH &&
      x < window.innerWidth && y < window.innerHeight) {
      this.ctx.strokeStyle = SpreadsheetConfig.COLORS.SELECTION_BORDER;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, w, h);
      this.ctx.lineWidth = 1;
    }
  }

  drawHeaders(visible, scrollLeft, scrollTop, selectedCell) {
    this.drawColumnHeaders(visible, scrollLeft, selectedCell);
    this.drawRowHeaders(visible, scrollTop, selectedCell);
    this.drawCornerCell();
  }

  drawColumnHeaders(visible, scrollLeft, selectedCell) {
    const { startCol, endCol } = visible;
    const canvasWidth = window.innerWidth;

    this.ctx.fillStyle = SpreadsheetConfig.COLORS.HEADER_BACKGROUND;
    this.ctx.fillRect(SpreadsheetConfig.HEADER_WIDTH, 0, canvasWidth - SpreadsheetConfig.HEADER_WIDTH, SpreadsheetConfig.HEADER_HEIGHT);

    let xCursor = SpreadsheetConfig.HEADER_WIDTH;
    for (let c = 0; c < startCol; c++) xCursor += this.data.colWidths[c];

    for (let c = startCol; c <= endCol && c < this.data.cols; c++) {
      const colW = this.data.colWidths[c];
      const x = xCursor - scrollLeft;

      if (selectedCell && selectedCell[1] === c) {
        this.ctx.fillStyle = SpreadsheetConfig.COLORS.SELECTION_BACKGROUND;
        this.ctx.fillRect(x, 0, colW, SpreadsheetConfig.HEADER_HEIGHT);
      }

      this.ctx.strokeStyle = SpreadsheetConfig.COLORS.CELL_BORDER;
      this.ctx.strokeRect(x, 0, colW, SpreadsheetConfig.HEADER_HEIGHT);

      this.ctx.fillStyle = SpreadsheetConfig.COLORS.HEADER_TEXT;
      this.ctx.textAlign = "center";
      this.ctx.fillText(SpreadsheetUtils.getColumnLabel(c), x + colW / 2, SpreadsheetConfig.HEADER_HEIGHT / 2);
      this.ctx.textAlign = "left";

      xCursor += colW;
    }
  }

  drawRowHeaders(visible, scrollTop, selectedCell) {
    const { startRow, endRow } = visible;
    const canvasHeight = window.innerHeight;

    this.ctx.fillStyle = SpreadsheetConfig.COLORS.HEADER_BACKGROUND;
    this.ctx.fillRect(0, SpreadsheetConfig.HEADER_HEIGHT, SpreadsheetConfig.HEADER_WIDTH, canvasHeight - SpreadsheetConfig.HEADER_HEIGHT);

    let yCursor = SpreadsheetConfig.HEADER_HEIGHT;
    for (let r = 0; r < startRow; r++) yCursor += this.data.rowHeights[r];

    for (let r = startRow; r <= endRow && r < this.data.rows; r++) {
      const rowH = this.data.rowHeights[r];
      const y = yCursor - scrollTop;

      if (selectedCell && selectedCell[0] === r) {
        this.ctx.fillStyle = SpreadsheetConfig.COLORS.SELECTION_BACKGROUND;
        this.ctx.fillRect(0, y, SpreadsheetConfig.HEADER_WIDTH, rowH);
      }

      this.ctx.strokeStyle = SpreadsheetConfig.COLORS.CELL_BORDER;
      this.ctx.strokeRect(0, y, SpreadsheetConfig.HEADER_WIDTH, rowH);

      this.ctx.fillStyle = SpreadsheetConfig.COLORS.HEADER_TEXT;
      this.ctx.textAlign = "center";
      this.ctx.fillText((r + 1).toString(), SpreadsheetConfig.HEADER_WIDTH / 2, y + rowH / 2);
      this.ctx.textAlign = "left";

      yCursor += rowH;
    }
  }

  drawCornerCell() {
    this.ctx.fillStyle = SpreadsheetConfig.COLORS.HEADER_BACKGROUND;
    this.ctx.fillRect(0, 0, SpreadsheetConfig.HEADER_WIDTH, SpreadsheetConfig.HEADER_HEIGHT);
    this.ctx.strokeStyle = SpreadsheetConfig.COLORS.CELL_BORDER;
    this.ctx.strokeRect(0, 0, SpreadsheetConfig.HEADER_WIDTH, SpreadsheetConfig.HEADER_HEIGHT);
  }

  resize() {
    this.setupCanvas();
    this.setupRenderingContext();
  }
}

class InputManager {
  constructor(input, data) {
    this.input = input;
    this.data = data;
    this.selectedCell = null;
    this.isEditing = false;
    this.navigationCallback = null;
    this.setupEventListeners();
  }

  setNavigationCallback(callback) {
    this.navigationCallback = callback;
  }

  setupEventListeners() {
    this.input.addEventListener("blur", () => this.hideInput());
    this.input.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }

  showInput(cell, scrollLeft, scrollTop) {
    if (!cell) return;

    this.selectedCell = cell;
    const [row, col] = cell;
    const pos = this.data.getCellPosition(row, col);
    const x = pos.x - scrollLeft;
    const y = pos.y - scrollTop;

    const minX = SpreadsheetConfig.HEADER_WIDTH;
    const minY = SpreadsheetConfig.HEADER_HEIGHT;
    const maxX = window.innerWidth;
    const maxY = window.innerHeight;

    if (x + this.data.colWidths[col] > minX && y + this.data.rowHeights[row] > minY &&
      x < maxX && y < maxY) {

      const clippedX = Math.max(0, x - SpreadsheetConfig.HEADER_WIDTH);
      const clippedY = Math.max(0, y - SpreadsheetConfig.HEADER_HEIGHT);
      const clippedWidth = Math.min(this.data.colWidths[col], maxX - Math.max(x, minX));
      const clippedHeight = Math.min(this.data.rowHeights[row], maxY - Math.max(y, minY));

      if (clippedWidth > 0 && clippedHeight > 0) {
        this.input.style.left = `${clippedX}px`;
        this.input.style.top = `${clippedY}px`;
        this.input.style.width = `${clippedWidth}px`;
        this.input.style.height = `${clippedHeight}px`;
        this.input.value = this.data.getCellValue(row, col);
        this.input.style.display = "block";
        this.input.focus();
        this.input.select();
        this.isEditing = true;
      } else {
        this.input.style.display = "none";
        this.isEditing = false;
      }
    } else {
      this.input.style.display = "none";
      this.isEditing = false;
    }
  }

  hideInput() {
    if (this.selectedCell && this.isEditing) {
      const value = this.input.value;
      for (const key of window.spreadsheet.selectedCells) {
        const [r, c] = key.split(',').map(Number);
        window.spreadsheet.setCellValue(r, c, value);
      }
    }
    this.input.style.display = "none";
    this.isEditing = false;
    setTimeout(() => {
      this.selectedCell = null;
    }, 0);
    if (window.spreadsheet) {
      window.spreadsheet.render();
    }
  }

  updatePosition(scrollLeft, scrollTop) {
    if (this.selectedCell && this.isEditing) {
      this.showInput(this.selectedCell, scrollLeft, scrollTop);
    }
  }

  handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.hideInput();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (this.selectedCell) {
        const [r, c] = this.selectedCell;
        this.input.value = this.data.getCellValue(r, c);
      }
      this.hideInput();
    } else if (
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight"
    ) {
      e.preventDefault();
      const currentCell = this.selectedCell;
      if (this.isEditing) {
        const value = this.input.value;
        for (const key of window.spreadsheet.selectedCells) {
          const [r, c] = key.split(',').map(Number);
          window.spreadsheet.setCellValue(r, c, value);
        }
      }
      this.input.style.display = "none";
      this.isEditing = false;
      setTimeout(() => {
        this.selectedCell = null;
      }, 0);

      if (this.navigationCallback && currentCell) {
        this.navigationCallback(e.key, currentCell);
      }
    }
  }

  getEditingCell() {
    return this.isEditing ? this.selectedCell : null;
  }
}

class VirtualSpreadsheet {
  constructor(container) {
    this.container = container;
    this.data = new SpreadsheetData(SpreadsheetConfig.ROWS, SpreadsheetConfig.COLS);

    this.scrollArea = container.querySelector("#scrollArea");
    this.canvas = container.querySelector("#spreadsheet");
    this.input = container.querySelector("#textInput");

    this.renderer = new SpreadsheetRenderer(this.canvas, this.data);
    this.viewport = new ViewportManager(this.scrollArea, this.data);
    this.inputManager = new InputManager(this.input, this.data);

    this.selectedCells = new Set();
    this.lastSelectedCell = null;
    this.resizing = { col: -1, row: -1, startX: 0, startY: 0, origWidth: 0, origHeight: 0 };

    this.undoStack = [];
    this.redoStack = [];
    this.ignoreNextClick = false;
    this.didDrag = false;

    this.renderRequested = false;
    this.requestRender = this.requestRender.bind(this);

    this.throttledInputUpdate = SpreadsheetUtils.throttle(() => {
      this.inputManager.updatePosition(this.scrollArea.scrollLeft, this.scrollArea.scrollTop);
    }, 16);

    this.setupEventListeners();
    this.updateScrollerSize();
    this.render();
  }

  setupEventListeners() {
    this.inputManager.setNavigationCallback((key, currentCell) => {
      this.handleNavigation(key, currentCell);
    });

    this.scrollArea.addEventListener("scroll", () => {
      this.viewport.updateViewport();
      this.requestRender();
      this.throttledInputUpdate();
    });

    this.scrollArea.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.scrollArea.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.scrollArea.addEventListener("mouseup", () => this.handleMouseUp());
    this.scrollArea.addEventListener("click", (e) => this.handleClick(e));

    window.addEventListener("resize", SpreadsheetUtils.debounce(() => {
      this.renderer.resize();
      this.requestRender();
    }, 100));

    window.addEventListener("keydown", (e) => this.handleKeyDown(e));

    const undoBtn = document.getElementById("undoBtn");
    const redoBtn = document.getElementById("redoBtn");
    if (undoBtn) undoBtn.addEventListener("click", () => this.undo());
    if (redoBtn) redoBtn.addEventListener("click", () => this.redo());
  }

  requestRender() {
    if (this.renderRequested) return;
    this.renderRequested = true;
    requestAnimationFrame(() => {
      this.render();
      this.renderRequested = false;
    });
  }

  handleNavigation(key, currentCell) {
    if (!currentCell) return;

    const [row, col] = currentCell;
    let newRow = row;
    let newCol = col;

    switch (key) {
      case "ArrowUp":
        newRow = Math.max(0, row - 1);
        break;
      case "ArrowDown":
        newRow = Math.min(this.data.rows - 1, row + 1);
        break;
      case "ArrowLeft":
        newCol = Math.max(0, col - 1);
        break;
      case "ArrowRight":
        newCol = Math.min(this.data.cols - 1, col + 1);
        break;
    }
    this.selectedCells.clear();
    this.selectedCells.add(`${newRow},${newCol}`);
    this.lastSelectedCell = [newRow, newCol];
    this.inputManager.showInput(this.lastSelectedCell, this.scrollArea.scrollLeft, this.scrollArea.scrollTop);
    this.requestRender();
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    this.didDrag = false;

    if (clientY < SpreadsheetConfig.HEADER_HEIGHT && clientX >= SpreadsheetConfig.HEADER_WIDTH) {
      const col = this.getResizeColumn(clientX);
      if (col >= 0) {
        this.resizing = {
          col,
          row: -1,
          startX: clientX,
          startY: 0,
          origWidth: this.data.colWidths[col],
          origHeight: 0
        };
        e.preventDefault();
        return;
      }
    }

    if (clientX < SpreadsheetConfig.HEADER_WIDTH && clientY >= SpreadsheetConfig.HEADER_HEIGHT) {
      const row = this.getResizeRow(clientY);
      if (row >= 0) {
        this.resizing = {
          col: -1,
          row,
          startX: 0,
          startY: clientY,
          origWidth: 0,
          origHeight: this.data.rowHeights[row]
        };
        e.preventDefault();
        return;
      }
    }

    // Start cell selection
    const col = this.getColumnAtX(clientX + this.scrollArea.scrollLeft);
    const row = this.getRowAtY(clientY + this.scrollArea.scrollTop);
    if (row >= 0 && col >= 0 && row < this.data.rows && col < this.data.cols) {
      this.isSelecting = true;
      this.selectionStartCell = [row, col];
      this.selectedCells.clear();
      this.selectedCells.add(`${row},${col}`);
      this.lastSelectedCell = [row, col];
      this.inputManager.hideInput();
      this.requestRender();
      e.preventDefault();
    }
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (this.resizing.col >= 0) {
      const diff = clientX - this.resizing.startX;
      this.data.colWidths[this.resizing.col] = Math.max(SpreadsheetConfig.MIN_CELL_WIDTH, this.resizing.origWidth + diff);
      this.updateScrollerSize();
      this.requestRender();
      this.throttledInputUpdate();
      return;
    }

    if (this.resizing.row >= 0) {
      const diff = clientY - this.resizing.startY;
      this.data.rowHeights[this.resizing.row] = Math.max(SpreadsheetConfig.MIN_CELL_HEIGHT, this.resizing.origHeight + diff);
      this.updateScrollerSize();
      this.requestRender();
      this.throttledInputUpdate();
      return;
    }
    if (this.isSelecting && this.selectionStartCell) {
      const col = this.getColumnAtX(clientX + this.scrollArea.scrollLeft);
      const row = this.getRowAtY(clientY + this.scrollArea.scrollTop);
      if (
        row >= 0 && col >= 0 && row < this.data.rows && col < this.data.cols &&
        (row !== this.lastSelectedCell[0] || col !== this.lastSelectedCell[1])
      ) {
        this.selectRange(this.selectionStartCell, [row, col]);
        this.lastSelectedCell = [row, col];
        this.requestRender();
        this.didDrag = true;
      }
      return;
    }

    this.updateCursor(clientX, clientY);
  }

  handleMouseUp() {
    this.resizing = { col: -1, row: -1, startX: 0, startY: 0, origWidth: 0, origHeight: 0 };
    if (this.isSelecting && this.didDrag) {
      this.ignoreNextClick = true;
    }
    this.isSelecting = false;
    this.selectionStartCell = null;
  }

  handleClick(e) {
    if (this.ignoreNextClick) {
      this.ignoreNextClick = false;
      return;
    }

    if (this.resizing.col >= 0 || this.resizing.row >= 0) return;

    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (clientX < SpreadsheetConfig.HEADER_WIDTH || clientY < SpreadsheetConfig.HEADER_HEIGHT) {
      this.inputManager.hideInput();
      this.selectedCells.clear();
      this.lastSelectedCell = null;
      this.requestRender();
      return;
    }

    const col = this.getColumnAtX(clientX + this.scrollArea.scrollLeft);
    const row = this.getRowAtY(clientY + this.scrollArea.scrollTop);

    if (row >= 0 && col >= 0 && row < this.data.rows && col < this.data.cols) {
      if (e.shiftKey && this.lastSelectedCell) {
        this.selectRange(this.lastSelectedCell, [row, col]);
      } else if (e.ctrlKey || e.metaKey) {
        const key = `${row},${col}`;
        if (this.selectedCells.has(key)) {
          this.selectedCells.delete(key);
        } else {
          this.selectedCells.add(key);
        }
        this.lastSelectedCell = [row, col];
      } else {
        this.selectedCells.clear();
        this.selectedCells.add(`${row},${col}`);
        this.lastSelectedCell = [row, col];
      }
      if (
        this.selectedCells.size === 1 &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        this.inputManager.showInput([row, col], this.scrollArea.scrollLeft, this.scrollArea.scrollTop);
      } else {
        this.inputManager.hideInput();
      }
      this.requestRender();
    } else {
      this.inputManager.hideInput();
      this.selectedCells.clear();
      this.lastSelectedCell = null;
      this.requestRender();
    }
  }

  getColumnAtX(x) {
    if (x < SpreadsheetConfig.HEADER_WIDTH) return -1;
    let sum = SpreadsheetConfig.HEADER_WIDTH;
    for (let i = 0; i < this.data.cols; i++) {
      if (x >= sum && x < sum + this.data.colWidths[i]) return i;
      sum += this.data.colWidths[i];
    }
    return -1;
  }

  getRowAtY(y) {
    if (y < SpreadsheetConfig.HEADER_HEIGHT) return -1;
    let sum = SpreadsheetConfig.HEADER_HEIGHT;
    for (let i = 0; i < this.data.rows; i++) {
      if (y >= sum && y < sum + this.data.rowHeights[i]) return i;
      sum += this.data.rowHeights[i];
    }
    return -1;
  }

  getResizeColumn(clientX) {
    let sum = SpreadsheetConfig.HEADER_WIDTH;
    for (let i = 0; i < this.data.cols; i++) {
      const right = sum + this.data.colWidths[i];
      const screenRight = right - this.scrollArea.scrollLeft;
      if (Math.abs(clientX - screenRight) < SpreadsheetConfig.RESIZE_THRESHOLD &&
        screenRight > SpreadsheetConfig.HEADER_WIDTH) {
        return i;
      }
      sum = right;
    }
    return -1;
  }

  getResizeRow(clientY) {
    let sum = SpreadsheetConfig.HEADER_HEIGHT;
    for (let i = 0; i < this.data.rows; i++) {
      const bottom = sum + this.data.rowHeights[i];
      const screenBottom = bottom - this.scrollArea.scrollTop;
      if (Math.abs(clientY - screenBottom) < SpreadsheetConfig.RESIZE_THRESHOLD &&
        screenBottom > SpreadsheetConfig.HEADER_HEIGHT) {
        return i;
      }
      sum = bottom;
    }
    return -1;
  }

  updateCursor(clientX, clientY) {
    this.scrollArea.style.cursor = "default";

    if (clientY < SpreadsheetConfig.HEADER_HEIGHT && clientX >= SpreadsheetConfig.HEADER_WIDTH) {
      if (this.getResizeColumn(clientX) >= 0) {
        this.scrollArea.style.cursor = "col-resize";
      }
    }
    else if (clientX < SpreadsheetConfig.HEADER_WIDTH && clientY >= SpreadsheetConfig.HEADER_HEIGHT) {
      if (this.getResizeRow(clientY) >= 0) {
        this.scrollArea.style.cursor = "row-resize";
      }
    }
  }

  updateScrollerSize() {
    const scroller = this.container.querySelector("#scroller");
    scroller.style.width = this.data.getTotalWidth() + "px";
    scroller.style.height = this.data.getTotalHeight() + "px";
  }

  render() {
    this.viewport.updateViewport();
    this.renderer.render(
      this.viewport,
      Array.from(this.selectedCells).map(key => key.split(',').map(Number)),
      this.inputManager.getEditingCell()
    );
  }

  getCellValue(row, col) {
    return this.data.getCellValue(row, col);
  }

  getSnapshot() {
    return JSON.stringify({
      data: this.data.data.map(row => [...row]),
      colWidths: [...this.data.colWidths],
      rowHeights: [...this.data.rowHeights]
    });
  }

  restoreSnapshot(snapshot) {
    const state = JSON.parse(snapshot);
    this.data.data = state.data.map(row => [...row]);
    this.data.colWidths = [...state.colWidths];
    this.data.rowHeights = [...state.rowHeights];
    this.updateScrollerSize();
    this.requestRender();
  }

  pushUndo(clearRedo = true) {
    this.undoStack.push(this.getSnapshot());
    if (clearRedo) this.redoStack = [];
  }

  setCellValue(row, col, value) {
    this.pushUndo(true);
    this.data.setCellValue(row, col, value);
    this.requestRender();
  }

  addRow(index = this.data.rows) {
    this.pushUndo(true);
    this.data.rows++;
    this.data.data.splice(index, 0, Array(this.data.cols).fill(""));
    this.data.rowHeights.splice(index, 0, SpreadsheetConfig.DEFAULT_CELL_HEIGHT);
    this.updateScrollerSize();
    this.requestRender();
  }

  addColumn(index = this.data.cols) {
    this.pushUndo(true);
    this.data.cols++;
    this.data.colWidths.splice(index, 0, SpreadsheetConfig.DEFAULT_CELL_WIDTH);
    for (let row of this.data.data) {
      row.splice(index, 0, "");
    }
    this.updateScrollerSize();
    this.requestRender();
  }

  undo() {
    if (this.undoStack.length === 0) return;
    this.redoStack.push(this.getSnapshot());
    const snapshot = this.undoStack.pop();
    this.restoreSnapshot(snapshot);
  }

  redo() {
    if (this.redoStack.length === 0) return;
    this.undoStack.push(this.getSnapshot());
    const snapshot = this.redoStack.pop();
    this.restoreSnapshot(snapshot);
  }

  copySelection() {
    const copied = [];
    for (const key of this.selectedCells) {
      const [r, c] = key.split(',').map(Number);
      copied.push({ r, c, value: this.data.getCellValue(r, c) });
    }
    this.clipboard = copied;
  }

  pasteClipboard() {
    if (!this.clipboard || this.clipboard.length === 0 || !this.lastSelectedCell) return;
    const [baseRow, baseCol] = this.lastSelectedCell;
    for (const { r, c, value } of this.clipboard) {
      const newRow = baseRow + (r - this.clipboard[0].r);
      const newCol = baseCol + (c - this.clipboard[0].c);
      this.setCellValue(newRow, newCol, value);
    }
  }

  selectRange(start, end) {
    this.selectedCells.clear();
    const startRow = Math.min(start[0], end[0]);
    const endRow = Math.max(start[0], end[0]);
    const startCol = Math.min(start[1], end[1]);
    const endCol = Math.max(start[1], end[1]);
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        this.selectedCells.add(`${r},${c}`);
      }
    }
  }

  handleKeyDown(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          this.undo();
          return;
        case 'y':
          e.preventDefault();
          this.redo();
          return;
        case 'c':
          e.preventDefault();
          this.copySelection();
          return;
        case 'v':
          e.preventDefault();
          this.pasteClipboard();
          return;
      }
    }

    if (!this.lastSelectedCell) return;
    const [row, col] = this.lastSelectedCell;
    let newRow = row;
    let newCol = col;

    switch (e.key) {
      case "ArrowUp":
        newRow = Math.max(0, row - 1);
        break;
      case "ArrowDown":
        newRow = Math.min(this.data.rows - 1, row + 1);
        break;
      case "ArrowLeft":
        newCol = Math.max(0, col - 1);
        break;
      case "ArrowRight":
        newCol = Math.min(this.data.cols - 1, col + 1);
        break;
      case "Escape":
        this.inputManager.hideInput();
        this.selectedCells.clear();
        this.lastSelectedCell = null;
        this.requestRender();
        return;
      default:
        return;
    }

    e.preventDefault();
    this.selectedCells.clear();
    this.selectedCells.add(`${newRow},${newCol}`);
    this.lastSelectedCell = [newRow, newCol];
    this.inputManager.showInput(this.lastSelectedCell, this.scrollArea.scrollLeft, this.scrollArea.scrollTop);
    this.requestRender();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container');
  window.spreadsheet = new VirtualSpreadsheet(container);
});