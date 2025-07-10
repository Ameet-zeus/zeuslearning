import { CONFIG } from "./config.js";

/**
 * Renderer handles drawing the spreadsheet grid, headers, and selection highlights.
 */
export class Renderer {
  /**
   * @param ctx - The canvas rendering context.
   * @param {*} viewport - The viewport object with scroll and size info.
   * @param {*} data - The data manager for cell values.
   * @param {*} rowManager - The row manager for heights.
   * @param {*} colManager - The column manager for widths.
   */
  constructor(ctx, viewport, data, rowManager, colManager) {
    this.data = data;
    this.ctx = ctx;
    this.viewport = viewport;
    this.rowManager = rowManager;
    this.colManager = colManager;
    this.calculateHeaderWidth();
  }

  /**
   * Calculates and sets the width of the row header.
   */
  calculateHeaderWidth() {
    this.ctx.font = CONFIG.font;
    const text = CONFIG.numRows.toString();
    const width = this.ctx.measureText(text).width;
    this.rowHeaderWidth = Math.ceil(width + CONFIG.padding * 2);
  }

  /**
   * Binary search for the offset index.
   * @param {*} offsets - Array of cumulative offsets.
   * @param {*} value - The value to search for.
   * @returns {*} The found index.
   */
  binarySearchOffset(offsets, value) {
    let low = 0, high = offsets.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (offsets[mid] <= value) low = mid + 1;
      else high = mid - 1;
    }
    return Math.max(0, low - 1);
  }

  /**
   * Gets the visible range of rows and columns.
   * @returns {*} The visible range {startRow, endRow, startCol, endCol}.
   */
  getVisibleRange() {
    const { scrollX, scrollY, width, height } = this.viewport;
    const colOffsets = this.colManager.getCumulativeWidths();
    const rowOffsets = this.rowManager.getCumulativeHeights();
    const startCol = this.binarySearchOffset(colOffsets, scrollX);
    const endCol = this.binarySearchOffset(colOffsets, scrollX + width - this.rowHeaderWidth);
    const startRow = this.binarySearchOffset(rowOffsets, scrollY);
    const endRow = this.binarySearchOffset(rowOffsets, scrollY + height - CONFIG.cellHeight);
    return { startRow, endRow, startCol, endCol };
  }

  /**
   * Gets the X coordinate for a column.
   * @param {*} col - The column index.
   * @param {*} scrollX - The horizontal scroll offset.
   * @returns {*} The X coordinate.
   */
  getColumnX(col, scrollX) {
    const colOffsets = this.colManager.getCumulativeWidths();
    return this.rowHeaderWidth + colOffsets[col] - scrollX;
  }

  /**
   * Gets the Y coordinate for a row.
   * @param {*} row - The row index.
   * @param {*} scrollY - The vertical scroll offset.
   * @returns {*} The Y coordinate.
   */
  getRowY(row, scrollY) {
    const rowOffsets = this.rowManager.getCumulativeHeights();
    return CONFIG.cellHeight + rowOffsets[row] - scrollY;
  }

  /**
   * Gets the width of a column.
   * @param {*} col - The column index.
   * @returns {*} The column width.
   */
  getColumnWidth(col) {
    const colOffsets = this.colManager.getCumulativeWidths();
    return colOffsets[col + 1] - colOffsets[col];
  }

  /**
   * Gets the height of a row.
   * @param {*} row - The row index.
   * @returns {*} The row height.
   */
  getRowHeight(row) {
    const rowOffsets = this.rowManager.getCumulativeHeights();
    return rowOffsets[row + 1] - rowOffsets[row];
  }

  /**
   * Checks if a column is visible in the viewport.
   * @param {*} col - The column index.
   * @param {*} scrollX - The horizontal scroll offset.
   * @param {*} width - The viewport width.
   * @returns {*} True if visible.
   */
  isColumnVisible(col, scrollX, width) {
    const x = this.getColumnX(col, scrollX);
    const colWidth = this.getColumnWidth(col);
    return x + colWidth > this.rowHeaderWidth && x < width;
  }

  /**
   * Checks if a row is visible in the viewport.
   * @param {*} row - The row index.
   * @param {*} scrollY - The vertical scroll offset.
   * @param {*} height - The viewport height.
   * @returns {*} True if visible.
   */
  isRowVisible(row, scrollY, height) {
    const y = this.getRowY(row, scrollY);
    const rowHeight = this.getRowHeight(row);
    return y + rowHeight > CONFIG.cellHeight && y < height;
  }

  /**
   * Draws the grid, headers, and selection highlights in proper layering order.
   * @param {*} selected - The current selection object.
   */
  drawGrid(selected) {
    const { ctx } = this;
    const { width, height } = this.viewport;
    const { startCol, endCol, startRow, endRow } = this.getVisibleRange();

    ctx.clearRect(0, 0, width, height);

    if (selected) {
      this.drawCellBackgroundHighlights(selected, startCol, endCol, startRow, endRow);
    }
    this.drawGridLines(startCol, endCol, startRow, endRow);
    this.drawCellContent(startCol, endCol, startRow, endRow);
    if (selected) {
      this.drawCellSelectionBorders(selected);
    }
    this.drawHeaderBackgrounds();
    this.drawHeaderContent(startCol, endCol, startRow, endRow);
    if (selected) {
      this.drawHeaderHighlights(selected, startCol, endCol, startRow, endRow);
    }
    if (selected) {
      this.drawHeaderSelections(selected, startCol, endCol, startRow, endRow);
    }
    if (selected) {
      this.drawHeaderUnderlines(selected);
    }
    this.drawTopCorner(selected);
  }

  /**
   * Draws cell background highlights for selections.
   */
  drawCellBackgroundHighlights(selected, startCol, endCol, startRow, endRow) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { width, height, scrollX, scrollY } = viewport;
    const lightGreen = 'rgba(198, 239, 206, 0.6)';
    ctx.fillStyle = lightGreen;

    if (selected.type === 'all') {
      ctx.fillRect(rowHeaderWidth, CONFIG.cellHeight, width - rowHeaderWidth, height - CONFIG.cellHeight);
      ctx.fillRect(rowHeaderWidth, 0, width - rowHeaderWidth, CONFIG.cellHeight);
      ctx.fillRect(0, CONFIG.cellHeight, rowHeaderWidth, height - CONFIG.cellHeight);
    } else if (selected.type === 'row') {
      const y = this.getRowY(selected.row, scrollY);
      const rowHeight = this.getRowHeight(selected.row);
      if (this.isRowVisible(selected.row, scrollY, height))
        ctx.fillRect(rowHeaderWidth, y, width - rowHeaderWidth, rowHeight);
    } else if (selected.type === 'rows') {
      for (let row = selected.start; row <= selected.end; row++) {
        const y = this.getRowY(row, scrollY);
        const rowHeight = this.getRowHeight(row);
        if (this.isRowVisible(row, scrollY, height))
          ctx.fillRect(rowHeaderWidth, y, width - rowHeaderWidth, rowHeight);
      }
    } else if (selected.type === 'column') {
      const x = this.getColumnX(selected.col, scrollX);
      const colWidth = this.getColumnWidth(selected.col);
      if (this.isColumnVisible(selected.col, scrollX, width))
        ctx.fillRect(x, CONFIG.cellHeight, colWidth, height - CONFIG.cellHeight);
    } else if (selected.type === 'columns') {
      for (let col = selected.start; col <= selected.end; col++) {
        const x = this.getColumnX(col, scrollX);
        const colWidth = this.getColumnWidth(col);
        if (this.isColumnVisible(col, scrollX, width))
          ctx.fillRect(x, CONFIG.cellHeight, colWidth, height - CONFIG.cellHeight);
      }
    } else if (selected.type === 'range') {
      const x1 = this.getColumnX(selected.startCol, scrollX);
      const y1 = this.getRowY(selected.startRow, scrollY);
      const x2 = this.getColumnX(selected.endCol, scrollX) + this.getColumnWidth(selected.endCol);
      const y2 = this.getRowY(selected.endRow, scrollY) + this.getRowHeight(selected.endRow);
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    }
  }

  /**
   * Draws grid lines for visible rows and columns.
   */
  drawGridLines(startCol, endCol, startRow, endRow) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY, width, height } = viewport;
    ctx.strokeStyle = '#D4D4D4';
    ctx.lineWidth = 1 / window.devicePixelRatio || 1;

    for (let col = startCol; col <= endCol + 1 && col <= CONFIG.numCols; col++) {
      const x = this.getColumnX(col, scrollX);
      const alignedX = viewport.alignToPixel(x);

      if (alignedX >= rowHeaderWidth && alignedX <= width) {
        ctx.beginPath();
        ctx.moveTo(alignedX, CONFIG.cellHeight);
        ctx.lineTo(alignedX, height);
        ctx.stroke();
      }
    }

    // Horizontal lines
    for (let row = startRow; row <= endRow + 1 && row <= CONFIG.numRows; row++) {
      const y = this.getRowY(row, scrollY);
      const alignedY = viewport.alignToPixel(y);
      if (alignedY >= CONFIG.cellHeight && alignedY <= height) {
        ctx.beginPath();
        ctx.moveTo(rowHeaderWidth, alignedY);
        ctx.lineTo(width, alignedY);
        ctx.stroke();
      }
    }
  }

  /**
   * Draws cell content for visible cells.
   */
  drawCellContent(startCol, endCol, startRow, endRow) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY } = viewport;
    ctx.fillStyle = '#000';
    ctx.font = CONFIG.font;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    for (let row = startRow; row <= endRow; row++) {
      const y = this.getRowY(row, scrollY);
      const rowHeight = this.getRowHeight(row);
      for (let col = startCol; col <= endCol; col++) {
        const x = this.getColumnX(col, scrollX);
        const colWidth = this.getColumnWidth(col);
        const val = this.data?.get(row, col);
        if (val && x + colWidth > rowHeaderWidth && x < viewport.width) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, colWidth, rowHeight);
          ctx.clip();
          ctx.fillText(val, x + 5, y + rowHeight / 2);
          ctx.restore();
        }
      }
    }
  }

  /**
   * Draws cell selection borders (over cells but under headers).
   */
  drawCellSelectionBorders(selected) {
    const { ctx, viewport } = this;
    const { scrollX, scrollY } = viewport;

    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;

    if (selected.type === 'cell') {
      const x = this.getColumnX(selected.col, scrollX);
      const y = this.getRowY(selected.row, scrollY);
      const cellWidth = this.getColumnWidth(selected.col);
      const cellHeight = this.getRowHeight(selected.row);
      ctx.strokeRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
    } else if (selected.type === 'range') {
      const x1 = this.getColumnX(selected.startCol, scrollX);
      const y1 = this.getRowY(selected.startRow, scrollY);
      const x2 = this.getColumnX(selected.endCol, scrollX) + this.getColumnWidth(selected.endCol);
      const y2 = this.getRowY(selected.endRow, scrollY) + this.getRowHeight(selected.endRow);
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      if (selected.startCol === selected.endCol && selected.startRow === selected.endRow) {
        const anchorX = this.getColumnX(selected.anchorCol, scrollX);
        const anchorY = this.getRowY(selected.anchorRow, scrollY);
        const anchorWidth = this.getColumnWidth(selected.anchorCol);
        const anchorHeight = this.getRowHeight(selected.anchorRow);

        ctx.save();
        ctx.strokeStyle = '#107C10';
        ctx.lineWidth = 3;
        ctx.strokeRect(anchorX + 1, anchorY + 1, anchorWidth - 2, anchorHeight - 2);
        ctx.restore();
      }
    } else if (selected.type === 'row') {
      const y = this.getRowY(selected.row, scrollY);
      const rowHeight = this.getRowHeight(selected.row);
      if (this.isRowVisible(selected.row, scrollY, viewport.height)) {
        ctx.strokeRect(this.rowHeaderWidth, y, viewport.width - this.rowHeaderWidth, rowHeight);
      }
    } else if (selected.type === 'rows') {
      const y1 = this.getRowY(selected.start, scrollY);
      const y2 = this.getRowY(selected.end, scrollY) + this.getRowHeight(selected.end);
      ctx.strokeRect(this.rowHeaderWidth, y1, viewport.width - this.rowHeaderWidth, y2 - y1);
    } else if (selected.type === 'column') {
      const x = this.getColumnX(selected.col, scrollX);
      const colWidth = this.getColumnWidth(selected.col);
      if (this.isColumnVisible(selected.col, scrollX, viewport.width)) {
        ctx.strokeRect(x, CONFIG.cellHeight, colWidth, viewport.height - CONFIG.cellHeight);
      }
    } else if (selected.type === 'columns') {
      const x1 = this.getColumnX(selected.start, scrollX);
      const x2 = this.getColumnX(selected.end, scrollX) + this.getColumnWidth(selected.end);
      ctx.strokeRect(x1, CONFIG.cellHeight, x2 - x1, viewport.height - CONFIG.cellHeight);
    }

    ctx.restore();
  }

  /**
   * Draws header backgrounds (base layer for headers).
   */
  drawHeaderBackgrounds() {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { width, height } = viewport;
    const headerBg = '#F2F2F2';

    ctx.fillStyle = headerBg;
    ctx.fillRect(rowHeaderWidth, 0, width - rowHeaderWidth, CONFIG.cellHeight);
    ctx.fillRect(0, CONFIG.cellHeight, rowHeaderWidth, height - CONFIG.cellHeight);
  }

  /**
   * Draws header content (text and separators).
   */
  drawHeaderContent(startCol, endCol, startRow, endRow) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY, width, height } = viewport;

    ctx.strokeStyle = '#BEBEBE';
    ctx.lineWidth = 1 / (window.devicePixelRatio || 1);
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.cellHeight);
    ctx.lineTo(width, CONFIG.cellHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rowHeaderWidth, 0);
    ctx.lineTo(rowHeaderWidth, height);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = CONFIG.headerFont;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let col = startCol; col <= endCol; col++) {
      const x = this.getColumnX(col, scrollX);
      const colWidth = this.getColumnWidth(col);
      if (x + colWidth > rowHeaderWidth && x < width) {
        ctx.fillText(this.getColumnLabel(col), x + colWidth / 2, CONFIG.cellHeight / 2);
        const xSep = viewport.alignToPixel(x + colWidth);
        if (xSep <= width) {
          ctx.beginPath();
          ctx.moveTo(xSep, 0);
          ctx.lineTo(xSep, CONFIG.cellHeight);
          ctx.stroke();
        }
      }
    }

    for (let row = startRow; row <= endRow; row++) {
      const y = this.getRowY(row, scrollY);
      const rowHeight = this.getRowHeight(row);
      if (y + rowHeight > CONFIG.cellHeight && y < height) {
        ctx.textAlign = "right";
        ctx.fillText(row + 1, rowHeaderWidth - 5, y + rowHeight / 2);
        const ySep = viewport.alignToPixel(y + rowHeight);
        if (ySep <= height) {
          ctx.beginPath();
          ctx.moveTo(0, ySep);
          ctx.lineTo(rowHeaderWidth, ySep);
          ctx.stroke();
        }
      }
    }
  }

  /**
   * Draws header highlights (light backgrounds for selections).
   */
  drawHeaderHighlights(selected, startCol, endCol, startRow, endRow) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY, width, height } = viewport;
    const lightGreen = 'rgba(198, 239, 206, 0.3)';

    ctx.save();
    ctx.fillStyle = lightGreen;

    if (selected.type === 'cell') {
      this.drawSingleColumnHeaderHighlight(selected.col, scrollX, width);
      this.drawSingleRowHeaderHighlight(selected.row, scrollY, height);
    } else if (selected.type === 'range') {
      for (let col = selected.startCol; col <= selected.endCol; col++) {
        this.drawSingleColumnHeaderHighlight(col, scrollX, width);
      }
      for (let row = selected.startRow; row <= selected.endRow; row++) {
        this.drawSingleRowHeaderHighlight(row, scrollY, height);
      }
    } else if (selected.type === 'row' || selected.type === 'rows') {
      for (let col = startCol; col <= endCol; col++) {
        this.drawSingleColumnHeaderHighlight(col, scrollX, width);
      }
      if (selected.type === 'row') {
        this.drawSingleRowHeaderHighlight(selected.row, scrollY, height);
      } else {
        for (let row = selected.start; row <= selected.end; row++) {
          this.drawSingleRowHeaderHighlight(row, scrollY, height);
        }
      }
    } else if (selected.type === 'column' || selected.type === 'columns') {
      for (let row = startRow; row <= endRow; row++) {
        this.drawSingleRowHeaderHighlight(row, scrollY, height);
      }
      if (selected.type === 'column') {
        this.drawSingleColumnHeaderHighlight(selected.col, scrollX, width);
      } else {
        for (let col = selected.start; col <= selected.end; col++) {
          this.drawSingleColumnHeaderHighlight(col, scrollX, width);
        }
      }
    } else if (selected.type === 'all') {
      for (let col = startCol; col <= endCol; col++) {
        this.drawSingleColumnHeaderHighlight(col, scrollX, width);
      }
      for (let row = startRow; row <= endRow; row++) {
        this.drawSingleRowHeaderHighlight(row, scrollY, height);
      }
    }
    ctx.restore();
  }

  /**
   * Draws a single column header highlight.
   */
  drawSingleColumnHeaderHighlight(col, scrollX, width) {
    const { ctx, rowHeaderWidth } = this;
    const x = this.getColumnX(col, scrollX);
    const colWidth = this.getColumnWidth(col);
    if (x + colWidth > rowHeaderWidth && x < width) {
      ctx.fillRect(x, 0, colWidth, CONFIG.cellHeight);
    }
  }

  /**
   * Draws a single row header highlight.
   */
  drawSingleRowHeaderHighlight(row, scrollY, height) {
    const { ctx, rowHeaderWidth } = this;
    const y = this.getRowY(row, scrollY);
    const rowHeight = this.getRowHeight(row);
    if (y + rowHeight > CONFIG.cellHeight && y < height) {
      ctx.fillRect(0, y, rowHeaderWidth, rowHeight);
    }
  }

  /**
   * Draws header selections (selected headers with green background).
   */
  drawHeaderSelections(selected, startCol, endCol, startRow, endRow) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY } = viewport;

    ctx.save();
    ctx.fillStyle = '#107C10';
    ctx.font = 'bold ' + CONFIG.headerFont;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (selected.type === 'column') {
      this.drawSingleColumnSelection(selected.col, scrollX);
    } else if (selected.type === 'columns') {
      for (let col = selected.start; col <= selected.end; col++) {
        this.drawSingleColumnSelection(col, scrollX);
        if (col < selected.end) {
          const x = this.getColumnX(col, scrollX);
          const colWidth = this.getColumnWidth(col);
          ctx.save();
          ctx.strokeStyle = '#FFF';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + colWidth, 0);
          ctx.lineTo(x + colWidth, CONFIG.cellHeight);
          ctx.stroke();
          ctx.restore();
        }
      }
    } else if (selected.type === 'row') {
      this.drawSingleRowSelection(selected.row, scrollY);
    } else if (selected.type === 'rows') {
      for (let row = selected.start; row <= selected.end; row++) {
        this.drawSingleRowSelection(row, scrollY);
        if (row < selected.end) {
          const y = this.getRowY(row, scrollY);
          const rowHeight = this.getRowHeight(row);
          ctx.save();
          ctx.strokeStyle = '#FFF';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, y + rowHeight);
          ctx.lineTo(rowHeaderWidth, y + rowHeight);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    ctx.restore();
  }

  /**
   * Draws a single column selection.
   */
  drawSingleColumnSelection(col, scrollX) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { width } = viewport;
    const x = this.getColumnX(col, scrollX);
    const colWidth = this.getColumnWidth(col);

    if (this.isColumnVisible(col, scrollX, width)) {
      ctx.fillRect(x, 0, colWidth, CONFIG.cellHeight);
      // Draw white text
      ctx.fillStyle = '#FFF';
      ctx.fillText(this.getColumnLabel(col), x + colWidth / 2, CONFIG.cellHeight / 2);
      ctx.fillStyle = '#107C10';
    }
  }

  /**
   * Draws a single row selection.
   */
  drawSingleRowSelection(row, scrollY) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { height } = viewport;
    const y = this.getRowY(row, scrollY);
    const rowHeight = this.getRowHeight(row);

    if (this.isRowVisible(row, scrollY, height)) {
      ctx.fillRect(0, y, rowHeaderWidth, rowHeight);
      // Draw white text
      ctx.fillStyle = '#FFF';
      ctx.textAlign = "right";
      ctx.fillText(row + 1, rowHeaderWidth - 5, y + rowHeight / 2);
      ctx.fillStyle = '#107C10';
      ctx.textAlign = "center";
    }
  }

  /**
   * Draws header underlines for selections.
   */
  drawHeaderUnderlines(selected) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY, width, height } = viewport;

    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;

    const rowHeaderUnderlineX = rowHeaderWidth - 0.5;
    const colHeaderUnderlineY = CONFIG.cellHeight - 0.5;

    if (selected.type === 'cell') {
      // Column underline
      const x = this.getColumnX(selected.col, scrollX);
      const colWidth = this.getColumnWidth(selected.col);
      if (x + colWidth > rowHeaderWidth && x < width) {
        ctx.beginPath();
        ctx.moveTo(x, colHeaderUnderlineY);
        ctx.lineTo(x + colWidth, colHeaderUnderlineY);
        ctx.stroke();
      }
      const y = this.getRowY(selected.row, scrollY);
      const rowHeight = this.getRowHeight(selected.row);
      if (y + rowHeight > CONFIG.cellHeight && y < height) {
        ctx.beginPath();
        ctx.moveTo(rowHeaderUnderlineX, y);
        ctx.lineTo(rowHeaderUnderlineX, y + rowHeight);
        ctx.stroke();
      }
    } else if (selected.type === 'range') {
      for (let col = selected.startCol; col <= selected.endCol; col++) {
        const x = this.getColumnX(col, scrollX);
        const colWidth = this.getColumnWidth(col);
        if (this.isColumnVisible(col, scrollX, width)) {
          ctx.beginPath();
          ctx.moveTo(x, colHeaderUnderlineY);
          ctx.lineTo(x + colWidth, colHeaderUnderlineY);
          ctx.stroke();
        }
      }
      for (let row = selected.startRow; row <= selected.endRow; row++) {
        const y = this.getRowY(row, scrollY);
        const rowHeight = this.getRowHeight(row);
        if (this.isRowVisible(row, scrollY, height)) {
          ctx.beginPath();
          ctx.moveTo(rowHeaderUnderlineX, y);
          ctx.lineTo(rowHeaderUnderlineX, y + rowHeight);
          ctx.stroke();
        }
      }
    } else if (selected.type === 'row') {
      const { startCol, endCol } = this.getVisibleRange();
      for (let col = startCol; col <= endCol; col++) {
        const x = this.getColumnX(col, scrollX);
        const colWidth = this.getColumnWidth(col);
        if (x + colWidth > rowHeaderWidth && x < width) {
          ctx.beginPath();
          ctx.moveTo(x, colHeaderUnderlineY);
          ctx.lineTo(x + colWidth, colHeaderUnderlineY);
          ctx.stroke();
        }
      }
      const y = this.getRowY(selected.row, scrollY);
      const rowHeight = this.getRowHeight(selected.row);
      if (y + rowHeight > CONFIG.cellHeight && y < height) {
        ctx.beginPath();
        ctx.moveTo(rowHeaderUnderlineX, y);
        ctx.lineTo(rowHeaderUnderlineX, y + rowHeight);
        ctx.stroke();
      }
    } else if (selected.type === 'rows') {
      const { startCol, endCol } = this.getVisibleRange();
      for (let col = startCol; col <= endCol; col++) {
        const x = this.getColumnX(col, scrollX);
        const colWidth = this.getColumnWidth(col);
        if (x + colWidth > rowHeaderWidth && x < width) {
          ctx.beginPath();
          ctx.moveTo(x, colHeaderUnderlineY);
          ctx.lineTo(x + colWidth, colHeaderUnderlineY);
          ctx.stroke();
        }
      }
      for (let row = selected.start; row <= selected.end; row++) {
        const y = this.getRowY(row, scrollY);
        const rowHeight = this.getRowHeight(row);
        if (y + rowHeight > CONFIG.cellHeight && y < height) {
          ctx.beginPath();
          ctx.moveTo(rowHeaderUnderlineX, y);
          ctx.lineTo(rowHeaderUnderlineX, y + rowHeight);
          ctx.stroke();
        }
      }
    } else if (selected.type === 'column') {
      const { startRow, endRow } = this.getVisibleRange();
      for (let row = startRow; row <= endRow; row++) {
        const y = this.getRowY(row, scrollY);
        const rowHeight = this.getRowHeight(row);
        if (y + rowHeight > CONFIG.cellHeight && y < height) {
          ctx.beginPath();
          ctx.moveTo(rowHeaderUnderlineX, y);
          ctx.lineTo(rowHeaderUnderlineX, y + rowHeight);
          ctx.stroke();
        }
      }
      const x = this.getColumnX(selected.col, scrollX);
      const colWidth = this.getColumnWidth(selected.col);
      if (x + colWidth > rowHeaderWidth && x < width) {
        ctx.beginPath();
        ctx.moveTo(x, colHeaderUnderlineY);
        ctx.lineTo(x + colWidth, colHeaderUnderlineY);
        ctx.stroke();
      }
    } else if (selected.type === 'columns') {
      const { startRow, endRow } = this.getVisibleRange();
      for (let row = startRow; row <= endRow; row++) {
        const y = this.getRowY(row, scrollY);
        const rowHeight = this.getRowHeight(row);
        if (y + rowHeight > CONFIG.cellHeight && y < height) {
          ctx.beginPath();
          ctx.moveTo(rowHeaderUnderlineX, y);
          ctx.lineTo(rowHeaderUnderlineX, y + rowHeight);
          ctx.stroke();
        }
      }
      for (let col = selected.start; col <= selected.end; col++) {
        const x = this.getColumnX(col, scrollX);
        const colWidth = this.getColumnWidth(col);
        if (x + colWidth > rowHeaderWidth && x < width) {
          ctx.beginPath();
          ctx.moveTo(x, colHeaderUnderlineY);
          ctx.lineTo(x + colWidth, colHeaderUnderlineY);
          ctx.stroke();
        }
      }
    } else if (selected.type === 'all') {
      const { startCol, endCol, startRow, endRow } = this.getVisibleRange();
      for (let col = startCol; col <= endCol; col++) {
        const x = this.getColumnX(col, scrollX);
        const colWidth = this.getColumnWidth(col);
        if (x + colWidth > rowHeaderWidth && x < width) {
          ctx.beginPath();
          ctx.moveTo(x, colHeaderUnderlineY);
          ctx.lineTo(x + colWidth, colHeaderUnderlineY);
          ctx.stroke();
        }
      }
      for (let row = startRow; row <= endRow; row++) {
        const y = this.getRowY(row, scrollY);
        const rowHeight = this.getRowHeight(row);
        if (y + rowHeight > CONFIG.cellHeight && y < height) {
          ctx.beginPath();
          ctx.moveTo(rowHeaderUnderlineX, y);
          ctx.lineTo(rowHeaderUnderlineX, y + rowHeight);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  /**
   * Draws the top corner (intersection of row and column headers).
   */
  drawTopCorner(selected) {
    const { ctx, rowHeaderWidth } = this;
    const headerBg = '#F2F2F2';

    ctx.save();

    // Draw corner background
    if (selected && selected.type === 'all') {
      ctx.fillStyle = '#107C10';
    } else {
      ctx.fillStyle = headerBg;
    }
    ctx.fillRect(0, 0, rowHeaderWidth, CONFIG.cellHeight);
    ctx.strokeStyle = '#BEBEBE';
    ctx.lineWidth = 1 / (window.devicePixelRatio || 1);
    ctx.strokeRect(0, 0, rowHeaderWidth, CONFIG.cellHeight);

    ctx.restore();
  }

  /**
   * Gets the spreadsheet-style column label for a given index.
   * @param {*} index - The column index.
   * @returns {string} The column label (e.g., "A", "B", ..., "AA").
   */
  getColumnLabel(index) {
    let label = "";
    while (index >= 0) {
      label = String.fromCharCode((index % 26) + 65) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  }
}