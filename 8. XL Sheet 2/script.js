/**
 * SpreadsheetConfig contains default settings and constants
 * used throughout the spreadsheet, including dimensions and colors.
 */
class SpreadsheetConfig {
  static DEFAULT_CELL_WIDTH = 100;       // Default width of each cell in pixels
  static DEFAULT_CELL_HEIGHT = 30;       // Default height of each cell in pixels
  static HEADER_HEIGHT = 30;             // Height of the header row
  static HEADER_WIDTH = 50;              // Width of the header column
  static ROWS = 100000;                  // Number of rows in the spreadsheet
  static COLS = 100;                     // Number of columns in the spreadsheet
  static RESIZE_THRESHOLD = 5;           // Pixel threshold for detecting resize intent
  static MIN_CELL_WIDTH = 30;            // Minimum cell width allowed
  static MIN_CELL_HEIGHT = 20;           // Minimum cell height allowed

  static COLORS = {
    CELL_BACKGROUND: '#ffffff',         // Background color of normal cells
    CELL_BORDER: '#d0d7de',             // Border color for cells
    CELL_TEXT: '#24292f',               // Text color for cell content
    HEADER_BACKGROUND: '#f6f8fa',       // Background color of header cells
    HEADER_TEXT: '#656d76',             // Text color for headers
    SELECTION_BORDER: '#4285f4',        // Border color for selected cells
    SELECTION_BACKGROUND: '#dbeafe'     // Background color for selected cells
  };
}

/**
 * SpreadsheetUtils provides helper methods for spreadsheet logic,
 * like label generation, viewport index calculation, throttling and debouncing.
 */
class SpreadsheetUtils {
  /**
   * Converts a zero-based column index into Excel-style labels (e.g., 0 => A, 27 => AB).
   * @param {number} index - Zero-based column index
   * @returns {string} - Column label
   */
  static getColumnLabel(index) {
    let label = "";
    while (index >= 0) {
      label = String.fromCharCode((index % 26) + 65) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  }

  /**
   * Gets the starting index of a visible item from a scroll offset.
   * @param {number[]} sizes - Array of element sizes (e.g., column widths or row heights)
   * @param {number} scrollOffset - Current scroll offset
   * @returns {number} - Index of the first visible item
   */
  static getStartIndex(sizes, scrollOffset){
    let sum = 0;
    for (let i = 0; i < sizes.length; i++) {
      if (sum + sizes[i] > scrollOffset) return i;
      sum += sizes[i];
    }
    return sizes.length - 1;
  }

  /**
   * Gets the ending index of a visible item from scroll offset and viewport size.
   * @param {number[]} sizes - Array of element sizes
   * @param {number} scrollOffset - Current scroll offset
   * @param {number} viewportSize - Size of the viewport (width or height)
   * @returns {number} - Index of the last visible item
   */
  static getEndIndex(sizes, scrollOffset, viewportSize) {
    let sum = 0;
    for (let i = 0; i < sizes.length; i++) {
      sum += sizes[i];
      if (sum > scrollOffset + viewportSize) return i;
    }
    return sizes.length - 1;
  }

  /**
   * Throttle a function to limit its execution rate.
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time in ms between calls
   * @returns {Function} - Throttled function
   */
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

  /**
   * Debounce a function to delay its execution until after a wait period.
   * @param {Function} func - Function to debounce
   * @param {number} wait - Time in ms to wait before executing
   * @returns {Function} - Debounced function
   */
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

/**
 * Manages the core data of the spreadsheet, including cell values,
 * dimensions (row heights, column widths), and dirty regions for rendering.
 */
class SpreadsheetData {
  /**
   * @param {number} rows - Number of rows in the spreadsheet
   * @param {number} cols - Number of columns in the spreadsheet
   */
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.data = Array.from({ length: rows }, () => Array(cols).fill("")); // 2D array storing cell contents
    this.colWidths = new Array(cols).fill(SpreadsheetConfig.DEFAULT_CELL_WIDTH); // Column widths
    this.rowHeights = new Array(rows).fill(SpreadsheetConfig.DEFAULT_CELL_HEIGHT); // Row heights
    this.dirtyRegions = new Set(); // Track cells needing re-render
  }

  /**
   * Gets the value of a cell safely.
   * @param {number} row 
   * @param {number} col 
   * @returns {string} - Cell value or empty string
   */
  getCellValue(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return "";
    return this.data[row][col] || "";
  }

  /**
   * Sets the value of a cell and marks it as dirty.
   * @param {number} row 
   * @param {number} col 
   * @param {string} value 
   */
  setCellValue(row, col, value) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    this.data[row][col] = value;
    this.markDirty(row, col);
  }

  /**
   * Adds a cell to the dirty region set for redrawing.
   * @param {number} row 
   * @param {number} col 
   */
  markDirty(row, col) {
    this.dirtyRegions.add(`${row},${col}`);
  }

  /**
   * Clears the dirty region set.
   */
  clearDirty() {
    this.dirtyRegions.clear();
  }

  /**
   * Computes pixel position of the top-left corner of a cell.
   * @param {number} row 
   * @param {number} col 
   * @returns {{x: number, y: number}} - Pixel coordinates
   */
  getCellPosition(row, col) {
    let x = SpreadsheetConfig.HEADER_WIDTH;
    for (let c = 0; c < col; c++) x += this.colWidths[c];
    let y = SpreadsheetConfig.HEADER_HEIGHT;
    for (let r = 0; r < row; r++) y += this.rowHeights[r];
    return { x, y };
  }

  /**
   * Calculates total width of the spreadsheet including header.
   * @returns {number}
   */
  getTotalWidth() {
    return SpreadsheetConfig.HEADER_WIDTH + this.colWidths.reduce((sum, w) => sum + w, 0);
  }

  /**
   * Calculates total height of the spreadsheet including header.
   * @returns {number}
   */
  getTotalHeight() {
    return SpreadsheetConfig.HEADER_HEIGHT + this.rowHeights.reduce((sum, h) => sum + h, 0);
  }
}

/**
 * Tracks visible cells in the viewport for efficient rendering
 * and updates scroll tracking.
 */
class ViewportManager {
  /**
   * @param {HTMLElement} scrollArea - The scrolling container
   * @param {SpreadsheetData} data - Spreadsheet data source
   */
  constructor(scrollArea, data) {
    this.scrollArea = scrollArea;
    this.data = data;
    this.lastScrollLeft = 0;
    this.lastScrollTop = 0;
    this.visibleCells = { startRow: 0, endRow: 0, startCol: 0, endCol: 0 };
  }

  /**
   * Updates which rows and columns are visible based on scroll and window size.
   */
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

  /**
   * Returns the current visible cell range.
   * @returns {{startRow: number, endRow: number, startCol: number, endCol: number}}
   */
  getVisibleCells() {
    return this.visibleCells;
  }

  /**
   * Checks if scroll position has changed since last render.
   * @returns {boolean}
   */
  hasScrolled() {
    return this.scrollArea.scrollLeft !== this.lastScrollLeft ||
      this.scrollArea.scrollTop !== this.lastScrollTop;
  }
}

/**
 * Responsible for rendering spreadsheet contents on a canvas,
 * including cells, gridlines, selections, and headers.
 */
class SpreadsheetRenderer {
  /**
   * @param {HTMLCanvasElement} canvas - The canvas element used for rendering
   * @param {SpreadsheetData} data - The spreadsheet data object
   */
  constructor(canvas, data) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.data = data;

    this.setupCanvas();               // Initialize canvas size and DPI
    this.setupRenderingContext();    // Set font and alignment settings
  }

  /**
   * Sets up the canvas resolution and scaling for high-DPI displays.
   */
  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  /**
   * Configures the 2D drawing context with text style settings.
   */
  setupRenderingContext() {
    this.ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "left";
  }

  /**
   * Main render method to draw the entire spreadsheet view.
   * @param {ViewportManager} viewport - Provides visible cell range
   * @param {Array} selectedCells - Array of selected cell coordinates
   * @param {Array|null} editingCell - The currently editing cell or null
   */
  render(viewport, selectedCells, editingCell) {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    const scrollLeft = viewport.scrollArea.scrollLeft;
    const scrollTop = viewport.scrollArea.scrollTop;
    const visible = viewport.getVisibleCells();

    // Clear the canvas before drawing
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw cell contents and grid
    this.drawMainGrid(visible, scrollLeft, scrollTop, editingCell);

    // Draw selection highlights
    if (selectedCells && selectedCells.length > 0) {
      for (const [sr, sc] of selectedCells) {
        this.drawSelection([sr, sc], scrollLeft, scrollTop);
      }
    }

    // Draw headers
    this.drawHeaders(visible, scrollLeft, scrollTop, selectedCells && selectedCells[0]);
  }

  /**
   * Draws visible cells and grid lines.
   */
  drawMainGrid(visible, scrollLeft, scrollTop, editingCell) {
    const { startRow, endRow, startCol, endCol } = visible;

    let yCursor = SpreadsheetConfig.HEADER_HEIGHT;
    for (let r = 0; r < startRow; r++) yCursor += this.data.rowHeights[r];

    let xCursor = SpreadsheetConfig.HEADER_WIDTH;
    for (let c = 0; c < startCol; c++) xCursor += this.data.colWidths[c];

    // Draw cells
    let y = yCursor - scrollTop;
    for (let r = startRow; r <= endRow && r < this.data.rows; r++) {
      let rowH = this.data.rowHeights[r];
      let x = xCursor - scrollLeft;

      for (let c = startCol; c <= endCol && c < this.data.cols; c++) {
        let colW = this.data.colWidths[c];
        let cellText = this.data.getCellValue(r, c);
        let isEditing = editingCell && editingCell[0] === r && editingCell[1] === c;

        if (!isEditing && cellText) {
          this.ctx.fillStyle = SpreadsheetConfig.COLORS.CELL_TEXT;
          this.ctx.fillText(cellText, x + 6, y + rowH / 2);
        }

        x += colW;
      }

      y += rowH;
    }

    // Draw horizontal grid lines
    y = yCursor - scrollTop;
    this.ctx.strokeStyle = SpreadsheetConfig.COLORS.CELL_BORDER;
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    for (let r = startRow; r <= endRow + 1 && r <= this.data.rows; r++) {
      const alignedY = Math.floor(y) + 0.5;
      this.ctx.moveTo(SpreadsheetConfig.HEADER_WIDTH - scrollLeft, alignedY);
      this.ctx.lineTo(window.innerWidth, alignedY);
      if (r < this.data.rows) y += this.data.rowHeights[r];
    }
    this.ctx.stroke();

    // Draw vertical grid lines
    let x = xCursor - scrollLeft;
    this.ctx.beginPath();
    for (let c = startCol; c <= endCol + 1 && c <= this.data.cols; c++) {
      const alignedX = Math.floor(x) + 0.5;
      this.ctx.moveTo(alignedX, SpreadsheetConfig.HEADER_HEIGHT - scrollTop);
      this.ctx.lineTo(alignedX, window.innerHeight);
      if (c < this.data.cols) x += this.data.colWidths[c];
    }
    this.ctx.stroke();
  }

  /**
   * Draws a single cell with background, border, and optional text.
   */
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

  /**
   * Draws a highlighted selection box around the specified cell.
   */
  drawSelection(selectedCell, scrollLeft, scrollTop) {
    const [sr, sc] = selectedCell;
    const pos = this.data.getCellPosition(sr, sc);
    const x = pos.x - scrollLeft;
    const y = pos.y - scrollTop;
    const w = this.data.colWidths[sc];
    const h = this.data.rowHeights[sr];

    if (
      y + h > SpreadsheetConfig.HEADER_HEIGHT &&
      x + w > SpreadsheetConfig.HEADER_WIDTH &&
      x < window.innerWidth && y < window.innerHeight
    ) {
      this.ctx.strokeStyle = SpreadsheetConfig.COLORS.SELECTION_BORDER;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, w, h);
      this.ctx.lineWidth = 1;
    }
  }

  /**
   * Draws column and row headers.
   */
  drawHeaders(visible, scrollLeft, scrollTop, selectedCell) {
    this.drawColumnHeaders(visible, scrollLeft, selectedCell);
    this.drawRowHeaders(visible, scrollTop, selectedCell);
    this.drawCornerCell();
  }

  /**
   * Draws the column headers (A, B, C...).
   */
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

      // Highlight selected column header
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

  /**
   * Draws the row headers (1, 2, 3...).
   */
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

      // Highlight selected row header
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

  /**
   * Draws the top-left corner cell between headers.
   */
  drawCornerCell() {
    this.ctx.fillStyle = SpreadsheetConfig.COLORS.HEADER_BACKGROUND;
    this.ctx.fillRect(0, 0, SpreadsheetConfig.HEADER_WIDTH, SpreadsheetConfig.HEADER_HEIGHT);
    this.ctx.strokeStyle = SpreadsheetConfig.COLORS.CELL_BORDER;
    this.ctx.strokeRect(0, 0, SpreadsheetConfig.HEADER_WIDTH, SpreadsheetConfig.HEADER_HEIGHT);
  }

  /**
   * Reinitializes the canvas and text settings, e.g. on window resize.
   */
  resize() {
    this.setupCanvas();
    this.setupRenderingContext();
  }
}

/**
 * Handles editing input field logic for spreadsheet cells.
 * Controls showing/hiding the input, synchronizing value changes,
 * and keyboard navigation within the cell input.
 */
class InputManager {
  /**
   * @param {HTMLInputElement} input - The floating input field used for editing
   * @param {SpreadsheetData} data - Spreadsheet data instance
   */
  constructor(input, data) {
    this.input = input;
    this.data = data;
    this.selectedCell = null;       // Currently selected cell [row, col]
    this.isEditing = false;         // Whether currently in edit mode
    this.navigationCallback = null; // Callback for handling arrow key nav
    this.setupEventListeners();
  }

  /**
   * Allows setting a callback that gets triggered on arrow key navigation.
   * @param {function} callback - Function to call with (key, cell)
   */
  setNavigationCallback(callback) {
    this.navigationCallback = callback;
  }

  /**
   * Adds listeners to the input field for blur and key events.
   */
  setupEventListeners() {
    this.input.addEventListener("blur", () => this.hideInput());
    this.input.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }

  /**
   * Displays the input field over the target cell, clipped within viewport.
   * @param {[number, number]} cell - Cell to edit [row, col]
   * @param {number} scrollLeft - Current horizontal scroll offset
   * @param {number} scrollTop - Current vertical scroll offset
   */
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

    // Check if cell is visible in viewport
    if (x + this.data.colWidths[col] > minX && y + this.data.rowHeights[row] > minY &&
      x < maxX && y < maxY) {

      // Clip dimensions to stay inside viewport
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

  /**
   * Hides the input field and saves the value to the cell.
   */
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

  /**
   * Updates input position when scrolling (if visible).
   */
  updatePosition(scrollLeft, scrollTop) {
    if (this.selectedCell && this.isEditing) {
      this.showInput(this.selectedCell, scrollLeft, scrollTop);
    }
  }

  /**
   * Handles key presses while the input field is active.
   * @param {KeyboardEvent} e
   */
  handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.hideInput(); // Confirm edit
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (this.selectedCell) {
        const [r, c] = this.selectedCell;
        this.input.value = this.data.getCellValue(r, c); // Revert
      }
      this.hideInput();
    } else if (
      e.key === "ArrowUp" || e.key === "ArrowDown" ||
      e.key === "ArrowLeft" || e.key === "ArrowRight"
    ) {
      e.preventDefault();
      const currentCell = this.selectedCell;

      if (this.isEditing) {
        const value = this.input.value;
        for (const key of window.spreadsheet.selectedCells) {
          const [r, c] = k
          ey.split(',').map(Number);
          window.spreadsheet.setCellValue(r, c, value);
        }
      }

      this.input.style.display = "none";
      this.isEditing = false;
      this.selectedCell = null;
      
      if (this.navigationCallback && currentCell) {
        this.navigationCallback(e.key, currentCell); // Pass to main app
      }
    }
  }

  /**
   * Gets the currently edited cell.
   * @returns {[number, number] | null}
   */
  getEditingCell() {
    return this.isEditing ? this.selectedCell : null;
  }
}

/**
 * Main class that integrates rendering, data, input, and user interaction.
 * Manages the virtual spreadsheet lifecycle and user events.
 */
class VirtualSpreadsheet {
  /**
   * @param {HTMLElement} container - DOM element containing the spreadsheet UI
   */
  constructor(container) {
    this.container = container;

    // Initialize data model
    this.data = new SpreadsheetData(SpreadsheetConfig.ROWS, SpreadsheetConfig.COLS);

    // Cache references to DOM elements
    this.scrollArea = container.querySelector("#scrollArea");
    this.canvas = container.querySelector("#spreadsheet");
    this.input = container.querySelector("#textInput");

    // Initialize components
    this.renderer = new SpreadsheetRenderer(this.canvas, this.data);
    this.viewport = new ViewportManager(this.scrollArea, this.data);
    this.inputManager = new InputManager(this.input, this.data);

    // State tracking
    this.selectedCells = new Set(); // Set of "row,col" keys
    this.lastSelectedCell = null;
    this.resizing = { col: -1, row: -1, startX: 0, startY: 0, origWidth: 0, origHeight: 0 };

    this.undoStack = []; // For Ctrl+Z
    this.redoStack = []; // For Ctrl+Y
    this.ignoreNextClick = false;
    this.didDrag = false;
    this.renderRequested = false;

    this.requestRender = this.requestRender.bind(this); // Bind to requestAnimationFrame

    // Throttled input repositioning on scroll
    this.throttledInputUpdate = SpreadsheetUtils.throttle(() => {
      this.inputManager.updatePosition(this.scrollArea.scrollLeft, this.scrollArea.scrollTop);
    }, 16);

    // Initialize listeners and initial rendering
    this.setupEventListeners();
    this.updateScrollerSize();
    this.render();
  }

  /**
   * Attaches scroll, mouse, keyboard, and button event handlers.
   */
  setupEventListeners() {
    // Navigation from arrow keys in input
    this.inputManager.setNavigationCallback((key, currentCell) => {
      this.handleNavigation(key, currentCell);
    });

    // Scroll and window resize handling
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

    // Undo/Redo buttons if available
    const undoBtn = document.getElementById("undoBtn");
    const redoBtn = document.getElementById("redoBtn");
    if (undoBtn) undoBtn.addEventListener("click", () => this.undo());
    if (redoBtn) redoBtn.addEventListener("click", () => this.redo());
  }

  /**
   * Requests a render using requestAnimationFrame.
   */
  requestRender() {
    if (this.renderRequested) return;
    this.renderRequested = true;
    requestAnimationFrame(() => {
      this.render();
      this.renderRequested = false;
    });
  }

  /**
   * Handles keyboard navigation with arrow keys from input manager.
   * @param {string} key - Arrow key
   * @param {[number, number]} currentCell - Currently selected cell
   */
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
  /**
   * Handles mouse down events (selection start or resize).
   * @param {MouseEvent} e
   */
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    this.didDrag = false;

    // Column resize detection
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

    // Row resize detection
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

    // Start selection drag
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

  /**
   * Handles mouse drag for resize or selection range.
   * @param {MouseEvent} e
   */
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Column resizing
    if (this.resizing.col >= 0) {
      const diff = clientX - this.resizing.startX;
      this.data.colWidths[this.resizing.col] = Math.max(
        SpreadsheetConfig.MIN_CELL_WIDTH,
        this.resizing.origWidth + diff
      );
      this.updateScrollerSize();
      this.requestRender();
      this.throttledInputUpdate();
      return;
    }

    // Row resizing
    if (this.resizing.row >= 0) {
      const diff = clientY - this.resizing.startY;
      this.data.rowHeights[this.resizing.row] = Math.max(
        SpreadsheetConfig.MIN_CELL_HEIGHT,
        this.resizing.origHeight + diff
      );
      this.updateScrollerSize();
      this.requestRender();
      this.throttledInputUpdate();
      return;
    }

    // Range selection drag
    if (this.isSelecting && this.selectionStartCell) {
      const col = this.getColumnAtX(clientX + this.scrollArea.scrollLeft);
      const row = this.getRowAtY(clientY + this.scrollArea.scrollTop);
      if (
        row >= 0 && col >= 0 &&
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

  /**
   * Finalizes drag-resize or range-select.
   */
  handleMouseUp() {
    this.resizing = { col: -1, row: -1, startX: 0, startY: 0, origWidth: 0, origHeight: 0 };
    if (this.isSelecting && this.didDrag) this.ignoreNextClick = true;
    this.isSelecting = false;
    this.selectionStartCell = null;
  }

  /**
   * Handles single click selection behavior and input trigger.
   * @param {MouseEvent} e
   */
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

    if (row >= 0 && col >= 0) {
      const key = `${row},${col}`;

      if (e.shiftKey && this.lastSelectedCell) {
        this.selectRange(this.lastSelectedCell, [row, col]);
      } else if (e.ctrlKey || e.metaKey) {
        this.selectedCells.has(key) ? this.selectedCells.delete(key) : this.selectedCells.add(key);
        this.lastSelectedCell = [row, col];
      } else {
        this.selectedCells.clear();
        this.selectedCells.add(key);
        this.lastSelectedCell = [row, col];
      }

      // Show input only if one cell selected
      if (this.selectedCells.size === 1 && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        this.inputManager.showInput([row, col], this.scrollArea.scrollLeft, this.scrollArea.scrollTop);
      } else {
        this.inputManager.hideInput();
      }

      this.requestRender();
    }
  }

  /**
   * Finds the column index at a specific x coordinate.
   */
  getColumnAtX(x) {
    if (x < SpreadsheetConfig.HEADER_WIDTH) return -1;
    let sum = SpreadsheetConfig.HEADER_WIDTH;
    for (let i = 0; i < this.data.cols; i++) {
      if (x >= sum && x < sum + this.data.colWidths[i]) return i;
      sum += this.data.colWidths[i];
    }
    return -1;
  }

  /**
   * Finds the row index at a specific y coordinate.
   */
  getRowAtY(y) {
    if (y < SpreadsheetConfig.HEADER_HEIGHT) return -1;
    let sum = SpreadsheetConfig.HEADER_HEIGHT;
    for (let i = 0; i < this.data.rows; i++) {
      if (y >= sum && y < sum + this.data.rowHeights[i]) return i;
      sum += this.data.rowHeights[i];
    }
    return -1;
  }

  /**
   * Detects if mouse is near a column edge for resizing.
   */
  getResizeColumn(clientX) {
    let sum = SpreadsheetConfig.HEADER_WIDTH;
    for (let i = 0; i < this.data.cols; i++) {
      const right = sum + this.data.colWidths[i];
      const screenRight = right - this.scrollArea.scrollLeft;
      if (
        Math.abs(clientX - screenRight) < SpreadsheetConfig.RESIZE_THRESHOLD &&
        screenRight > SpreadsheetConfig.HEADER_WIDTH
      ) {
        return i;
      }
      sum = right;
    }
    return -1;
  }

  /**
   * Detects if mouse is near a row edge for resizing.
   */
  getResizeRow(clientY) {
    let sum = SpreadsheetConfig.HEADER_HEIGHT;
    for (let i = 0; i < this.data.rows; i++) {
      const bottom = sum + this.data.rowHeights[i];
      const screenBottom = bottom - this.scrollArea.scrollTop;
      if (
        Math.abs(clientY - screenBottom) < SpreadsheetConfig.RESIZE_THRESHOLD &&
        screenBottom > SpreadsheetConfig.HEADER_HEIGHT
      ) {
        return i;
      }
      sum = bottom;
    }
    return -1;
  }

  /**
   * Updates cursor style depending on position (resize/normal).
   */
  updateCursor(clientX, clientY) {
    this.scrollArea.style.cursor = "default";

    if (clientY < SpreadsheetConfig.HEADER_HEIGHT && clientX >= SpreadsheetConfig.HEADER_WIDTH) {
      if (this.getResizeColumn(clientX) >= 0) this.scrollArea.style.cursor = "col-resize";
    } else if (clientX < SpreadsheetConfig.HEADER_WIDTH && clientY >= SpreadsheetConfig.HEADER_HEIGHT) {
      if (this.getResizeRow(clientY) >= 0) this.scrollArea.style.cursor = "row-resize";
    }
  }

  /**
   * Resizes internal scrollable area to fit spreadsheet.
   */
  updateScrollerSize() {
    const scroller = this.container.querySelector("#scroller");
    scroller.style.width = this.data.getTotalWidth() + "px";
    scroller.style.height = this.data.getTotalHeight() + "px";
  }

  /**
   * Renders the spreadsheet on canvas.
   */
  render() {
    this.viewport.updateViewport();
    this.renderer.render(
      this.viewport,
      Array.from(this.selectedCells).map(key => key.split(',').map(Number)),
      this.inputManager.getEditingCell()
    );
  }

  /**
   * Returns the value of a specific cell.
   */
  getCellValue(row, col) {
    return this.data.getCellValue(row, col);
  }

  /**
   * Captures a snapshot of spreadsheet state for undo/redo.
   */
  getSnapshot() {
    return JSON.stringify({
      // data: this.data.data.map(row => [...row]),
      colWidths: [...this.data.colWidths],
      rowHeights: [...this.data.rowHeights]
    });
  }

  /**
   * Restores a snapshot from undo/redo history.
   */
  restoreSnapshot(snapshot) {
    const state = JSON.parse(snapshot);
    this.data.data = state.data.map(row => [...row]);
    this.data.colWidths = [...state.colWidths];
    this.data.rowHeights = [...state.rowHeights];
    this.updateScrollerSize();
    this.requestRender();
  }

  /**
   * Pushes a new undo point.
   */
  pushUndo(clearRedo = true) {
    this.undoStack.push(this.getSnapshot());
    if (clearRedo) this.redoStack = [];
  }

  /**
   * Sets a cell value and triggers re-render.
   */
  setCellValue(row, col, value) {
    this.pushUndo(true);
    this.data.setCellValue(row, col, value);
    this.requestRender();
  }

  /**
   * Adds a new row to the spreadsheet.
   */
  addRow(index = this.data.rows) {
    this.pushUndo(true);
    this.data.rows++;
    this.data.data.splice(index, 0, Array(this.data.cols).fill(""));
    this.data.rowHeights.splice(index, 0, SpreadsheetConfig.DEFAULT_CELL_HEIGHT);
    this.updateScrollerSize();
    this.requestRender();
  }

  /**
   * Adds a new column to the spreadsheet.
   */
  addColumn(index = this.data.cols) {
    this.pushUndo(true);
    this.data.cols++;
    this.data.colWidths.splice(index, 0, SpreadsheetConfig.DEFAULT_CELL_WIDTH);
    for (let row of this.data.data) row.splice(index, 0, "");
    this.updateScrollerSize();
    this.requestRender();
  }

  /**
   * Undo the last operation.
   */
  undo() {
    if (this.undoStack.length === 0) return;
    this.redoStack.push(this.getSnapshot());
    const snapshot = this.undoStack.pop();
    this.restoreSnapshot(snapshot);
  }

  /**
   * Redo the last undone operation.
   */
  redo() {
    if (this.redoStack.length === 0) return;
    this.undoStack.push(this.getSnapshot());
    const snapshot = this.redoStack.pop();
    this.restoreSnapshot(snapshot);
  }

  /**
   * Copies current selection to clipboard (in memory).
   */
  copySelection() {
    const copied = [];
    for (const key of this.selectedCells) {
      const [r, c] = key.split(',').map(Number);
      copied.push({ r, c, value: this.data.getCellValue(r, c) });
    }
    this.clipboard = copied;
  }

  /**
   * Pastes copied data relative to selected cell.
   */
  pasteClipboard() {
    if (!this.clipboard || this.clipboard.length === 0 || !this.lastSelectedCell) return;
    const [baseRow, baseCol] = this.lastSelectedCell;
    for (const { r, c, value } of this.clipboard) {
      const newRow = baseRow + (r - this.clipboard[0].r);
      const newCol = baseCol + (c - this.clipboard[0].c);
      this.setCellValue(newRow, newCol, value);
    }
  }

  /**
   * Selects a rectangular range of cells.
   */
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

  /**
   * Handles global keypresses like copy, paste, undo, arrow nav.
   */
  handleKeyDown(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'z': e.preventDefault(); this.undo(); return;
        case 'y': e.preventDefault(); this.redo(); return;
        case 'c': e.preventDefault(); this.copySelection(); return;
        case 'v': e.preventDefault(); this.pasteClipboard(); return;
      }
    }

    if (!this.lastSelectedCell) return;

    const [row, col] = this.lastSelectedCell;
    let newRow = row;
    let newCol = col;

    switch (e.key) {
      case "ArrowUp": newRow = Math.max(0, row - 1); break;
      case "ArrowDown": newRow = Math.min(this.data.rows - 1, row + 1); break;
      case "ArrowLeft": newCol = Math.max(0, col - 1); break;
      case "ArrowRight": newCol = Math.min(this.data.cols - 1, col + 1); break;
      case "Escape":
        this.inputManager.hideInput();
        this.selectedCells.clear();
        this.lastSelectedCell = null;
        this.requestRender();
        return;
      default: return;
    }

    e.preventDefault();
    this.selectedCells.clear();
    this.selectedCells.add(`${newRow},${newCol}`);
    this.lastSelectedCell = [newRow, newCol];
    this.inputManager.showInput(this.lastSelectedCell, this.scrollArea.scrollLeft, this.scrollArea.scrollTop);
    this.requestRender();
  }
}

// Initialize spreadsheet after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container');
  window.spreadsheet = new VirtualSpreadsheet(container);
});
