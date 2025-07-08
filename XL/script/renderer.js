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
   * Draws the grid, headers, and selection highlights.
   * @param {*} selected - The current selection object.
   */
  drawGrid(selected) {
    const { ctx } = this;
    const { width, height } = this.viewport;
    const { startCol, endCol, startRow, endRow } = this.getVisibleRange();
    ctx.clearRect(0, 0, width, height);

    if (selected) this.drawSelectionHighlights(selected, startCol, endCol, startRow, endRow);
    this.drawGridLines(startCol, endCol, startRow, endRow);
    this.drawCellContent(startCol, endCol, startRow, endRow);
    this.drawHeaders(startCol, endCol, startRow, endRow);

    if (selected && selected.type === 'range') this.drawRangeHeaderHighlights(selected);
    if (selected) this.drawSelectionEffects(selected);
  }

  /**
   * Draws selection highlights for the given selection.
   * @param {*} selected - The selection object.
   * @param {*} startCol
   * @param {*} endCol
   * @param {*} startRow
   * @param {*} endRow
   */
  drawSelectionHighlights(selected, startCol, endCol, startRow, endRow) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { width, height, scrollX, scrollY } = viewport;
    const lightGreen = 'rgba(198, 239, 206, 0.6)';
    ctx.fillStyle = lightGreen;

    if (selected.type === 'all') {
      ctx.fillRect(rowHeaderWidth, CONFIG.cellHeight, width - rowHeaderWidth, height - CONFIG.cellHeight);
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
   * @param {*} startCol
   * @param {*} endCol
   * @param {*} startRow
   * @param {*} endRow
   */
  drawGridLines(startCol, endCol, startRow, endRow) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY, width, height } = viewport;
    ctx.strokeStyle = '#D4D4D4';
    ctx.lineWidth = 1/window.devicePixelRatio || 1;

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
   * @param {*} startCol
   * @param {*} endCol
   * @param {*} startRow
   * @param {*} endRow
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
   * Draws column and row headers.
   * @param {*} startCol
   * @param {*} endCol
   * @param {*} startRow
   * @param {*} endRow
   */
  drawHeaders(startCol, endCol, startRow, endRow) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY, width, height } = viewport;
    const headerBg = '#F2F2F2';
    ctx.fillStyle = headerBg;
    ctx.fillRect(rowHeaderWidth, 0, width - rowHeaderWidth, CONFIG.cellHeight);
    ctx.fillRect(0, CONFIG.cellHeight, rowHeaderWidth, height - CONFIG.cellHeight);

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
    ctx.fillStyle = headerBg;
    ctx.fillRect(0, 0, rowHeaderWidth, CONFIG.cellHeight);
    ctx.strokeStyle = '#BEBEBE';
    ctx.strokeRect(0, 0, rowHeaderWidth, CONFIG.cellHeight);
  }

  /**
   * Draws selection effects (bounding boxes, underlines, etc.) for the selection.
   * @param {*} selected - The selection object.
   */
  drawSelectionEffects(selected) {
    if (!selected) return;
    const { ctx, viewport, rowHeaderWidth } = this;
    const { width, height, scrollX, scrollY } = viewport;
    const lightGreen = 'rgba(198, 239, 206, 0.3)';
    if (selected.type === 'cell') {
      this.drawCellSelection(selected);
      this.drawHeaderUnderline(selected);
    } else if (selected.type === 'row') {
      // Highlight all visible column headers for the selected row
      const { startCol, endCol } = this.getVisibleRange();
      for (let col = startCol; col <= endCol; col++) {
        const x = this.getColumnX(col, scrollX);
        const colWidth = this.getColumnWidth(col);
        if (this.isColumnVisible(col, scrollX, width)) {
          ctx.save();
          ctx.fillStyle = lightGreen;
          ctx.fillRect(x, 0, colWidth, CONFIG.cellHeight);
          ctx.restore();
        }
      }
      this.drawRowSelection(selected);
      this.drawRowBounding(selected);
      this.drawAllColumnHeaderUnderlines(false);
    } else if (selected.type === 'column') {
      // Highlight all visible row headers for the selected column
      const { startRow, endRow } = this.getVisibleRange();
      for (let row = startRow; row <= endRow; row++) {
        const y = this.getRowY(row, scrollY);
        const rowHeight = this.getRowHeight(row);
        if (this.isRowVisible(row, scrollY, height)) {
          ctx.save();
          ctx.fillStyle = lightGreen;
          ctx.fillRect(0, y, rowHeaderWidth, rowHeight);
          ctx.restore();
        }
      }
      this.drawColumnSelection(selected);
      this.drawColumnBounding(selected);
      this.drawAllRowHeaderUnderlines(false);
    } else if (selected.type === 'rows') {
      // Highlight all visible column headers for the selected rows
      const { startCol, endCol } = this.getVisibleRange();
      for (let col = startCol; col <= endCol; col++) {
        const x = this.getColumnX(col, scrollX);
        const colWidth = this.getColumnWidth(col);
        if (this.isColumnVisible(col, scrollX, width)) {
          ctx.save();
          ctx.fillStyle = lightGreen;
          ctx.fillRect(x, 0, colWidth, CONFIG.cellHeight);
          ctx.restore();
        }
      }
      this.drawMultiRowSelection(selected);
      this.drawAllColumnHeaderUnderlines(false);
    } else if (selected.type === 'columns') {
      // Highlight all visible row headers for the selected columns
      const { startRow, endRow } = this.getVisibleRange();
      for (let row = startRow; row <= endRow; row++) {
        const y = this.getRowY(row, scrollY);
        const rowHeight = this.getRowHeight(row);
        if (this.isRowVisible(row, scrollY, height)) {
          ctx.save();
          ctx.fillStyle = lightGreen;
          ctx.fillRect(0, y, rowHeaderWidth, rowHeight);
          ctx.restore();
        }
      }
      this.drawMultiColumnSelection(selected);
      this.drawAllRowHeaderUnderlines(false);
    } else if (selected.type === 'range') {
      this.drawRangeSelection(selected);
      this.drawRangeHeaderUnderlines(selected);
      this.drawAnchorHighlight(selected.anchorRow, selected.anchorCol);
    } else if (selected.type === 'all') {
      this.drawAllSelection();
    }
  }

  /**
   * Draws a white highlight inside the anchor cell of a range selection.
   * @param {*} row - The row index of the anchor cell.
   * @param {*} col - The column index of the anchor cell.
   */
  drawAnchorHighlight(row, col) {
    const { ctx, viewport } = this;
    const { scrollX, scrollY } = viewport;
    const x = this.getColumnX(col, scrollX);
    const y = this.getRowY(row, scrollY);
    const cellWidth = this.getColumnWidth(col);
    const cellHeight = this.getRowHeight(row);
    ctx.save();
    ctx.fillStyle = '#FFFFFF'; // White fill inside
    ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
    ctx.restore();
  }

  /**
   * Draws a bounding box around a selected row.
   * @param {*} selected - The selection object with row property.
   */
  drawRowBounding(selected) {
    const { ctx, viewport } = this;
    const { scrollY } = viewport;
    const { row } = selected;
    const y = this.getRowY(row, scrollY);
    const rowHeight = this.getRowHeight(row);
    if (this.isRowVisible(row, scrollY, viewport.height)) {
      ctx.save();
      ctx.strokeStyle = '#107C10';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, y, viewport.width, rowHeight);
      ctx.restore();
    }
  }

  /**
   * Draws a bounding box around a selected column.
   * @param {*} selected - The selection object with col property.
   */
  drawColumnBounding(selected) {
    const { ctx, viewport } = this;
    const { scrollX } = viewport;
    const { col } = selected;
    const x = this.getColumnX(col, scrollX);
    const colWidth = this.getColumnWidth(col);
    if (this.isColumnVisible(col, scrollX, viewport.width)) {
      ctx.save();
      ctx.strokeStyle = '#107C10';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 0, colWidth, viewport.height);
      ctx.restore();
    }
  }

  /**
   * Draws selection for multiple rows.
   * @param {*} selected - The selection object with start and end properties.
   */
  drawMultiRowSelection(selected) {
    const { ctx, viewport } = this;
    const { scrollY } = viewport;
    for (let row = selected.start; row <= selected.end; row++) this.drawRowSelection({ row });
    const y1 = this.getRowY(selected.start, scrollY);
    const y2 = this.getRowY(selected.end, scrollY) + this.getRowHeight(selected.end);
    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, y1, viewport.width, y2 - y1);
    ctx.restore();
  }

  /**
   * Draws selection for multiple columns.
   * @param {*} selected - The selection object with start and end properties.
   */
  drawMultiColumnSelection(selected) {
    const { ctx, viewport } = this;
    const { scrollX } = viewport;
    for (let col = selected.start; col <= selected.end; col++) this.drawColumnSelection({ col });
    const x1 = this.getColumnX(selected.start, scrollX);
    const x2 = this.getColumnX(selected.end, scrollX) + this.getColumnWidth(selected.end);
    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;
    ctx.strokeRect(x1, 0, x2 - x1, viewport.height);
    ctx.restore();
  }

  /**
   * Draws a bounding box for a range selection.
   * @param {*} selected - The selection object with startCol, endCol, startRow, endRow.
   */
  drawRangeSelection(selected) {
    const { ctx, viewport } = this;
    const { scrollX, scrollY } = viewport;
    const x1 = this.getColumnX(selected.startCol, scrollX);
    const y1 = this.getRowY(selected.startRow, scrollY);
    const x2 = this.getColumnX(selected.endCol, scrollX) + this.getColumnWidth(selected.endCol);
    const y2 = this.getRowY(selected.endRow, scrollY) + this.getRowHeight(selected.endRow);
    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    ctx.restore();
  }

  /**
   * Highlights headers for a range selection.
   * @param {*} selected - The selection object with startCol, endCol, startRow, endRow.
   */
  drawRangeHeaderHighlights(selected) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY, width, height } = viewport;
    const lightGreen = 'rgba(198, 239, 206, 0.6)';
    ctx.save();
    for (let col = selected.startCol; col <= selected.endCol; col++) {
      const x = this.getColumnX(col, scrollX);
      const colWidth = this.getColumnWidth(col);
      if (this.isColumnVisible(col, scrollX, width)) {
        ctx.fillStyle = lightGreen;
        ctx.fillRect(x, 0, colWidth, CONFIG.cellHeight);
        ctx.fillStyle = '#000';
        ctx.font = CONFIG.headerFont;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.getColumnLabel(col), x + colWidth / 2, CONFIG.cellHeight / 2);
      }
    }
    for (let row = selected.startRow; row <= selected.endRow; row++) {
      const y = this.getRowY(row, scrollY);
      const rowHeight = this.getRowHeight(row);
      if (this.isRowVisible(row, scrollY, height)) {
        ctx.fillStyle = lightGreen;
        ctx.fillRect(0, y, rowHeaderWidth, rowHeight);
        ctx.fillStyle = '#000';
        ctx.font = CONFIG.headerFont;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(row + 1, rowHeaderWidth - 5, y + rowHeight / 2);
      }
    }
    ctx.restore();
  }

  /**
   * Draws header underlines for a range selection.
   * @param {*} selected - The selection object with startCol, endCol, startRow, endRow.
   */
  drawRangeHeaderUnderlines(selected) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY, width, height } = viewport;
    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;
    for (let col = selected.startCol; col <= selected.endCol; col++) {
      const x = this.getColumnX(col, scrollX);
      const colWidth = this.getColumnWidth(col);
      if (this.isColumnVisible(col, scrollX, width)) {
        ctx.beginPath();
        ctx.moveTo(x, CONFIG.cellHeight - 2);
        ctx.lineTo(x + colWidth, CONFIG.cellHeight - 2);
        ctx.stroke();
      }
    }
    for (let row = selected.startRow; row <= selected.endRow; row++) {
      const y = this.getRowY(row, scrollY);
      const rowHeight = this.getRowHeight(row);
      if (this.isRowVisible(row, scrollY, height)) {
        ctx.beginPath();
        ctx.moveTo(rowHeaderWidth - 2, y);
        ctx.lineTo(rowHeaderWidth - 2, y + rowHeight);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /**
   * Draws a bounding box for a selected cell.
   * @param {*} selected - The selection object with row and col.
   */
  drawCellSelection(selected) {
    const { ctx, viewport } = this;
    const { scrollX, scrollY } = viewport;
    const { row, col } = selected;
    const x = this.getColumnX(col, scrollX);
    const y = this.getRowY(row, scrollY);
    const cellWidth = this.getColumnWidth(col);
    const cellHeight = this.getRowHeight(row);
    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
    ctx.restore();
  }

  /**
   * Draws a selected row header.
   * @param {*} selected - The selection object with row.
   */
  drawRowSelection(selected) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollY } = viewport;
    const y = this.getRowY(selected.row, scrollY);
    const rowHeight = this.getRowHeight(selected.row);
    if (this.isRowVisible(selected.row, scrollY, viewport.height)) {
      ctx.fillStyle = '#107C10';
      ctx.fillRect(0, y, rowHeaderWidth, rowHeight);
      ctx.fillStyle = '#FFF';
      ctx.font = CONFIG.headerFont;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(selected.row + 1, rowHeaderWidth - 5, y + rowHeight / 2);
    }
  }

  /**
   * Draws a selected column header.
   * @param {*} selected - The selection object with col.
   */
  drawColumnSelection(selected) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX } = viewport;
    const x = this.getColumnX(selected.col, scrollX);
    const colWidth = this.getColumnWidth(selected.col);
    if (this.isColumnVisible(selected.col, scrollX, viewport.width)) {
      ctx.fillStyle = '#107C10';
      ctx.fillRect(x, 0, colWidth, CONFIG.cellHeight);
      ctx.fillStyle = '#FFF';
      ctx.font = CONFIG.headerFont;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.getColumnLabel(selected.col), x + colWidth / 2, CONFIG.cellHeight / 2);
    }
  }

  /**
   * Highlights a column header.
   * @param {*} col - The column index.
   * @param {CanvasRenderingContext2D} ctx
   * @param {*} scrollX
   * @param {*} rowHeaderWidth
   * @param {*} viewport
   * @param {*} colManager
   * @param {boolean} [drawText=true]
   */
  highlightColumnHeader(col, ctx, scrollX, rowHeaderWidth, viewport, colManager, drawText = true) {
    const lightGreen = 'rgba(198, 239, 206, 0.7)';
    const x = this.getColumnX(col, scrollX);
    const colWidth = this.getColumnWidth(col);
    if (x + colWidth > rowHeaderWidth && x < viewport.width) {
      ctx.save();
      ctx.fillStyle = lightGreen;
      ctx.fillRect(x, 0, colWidth, CONFIG.cellHeight);
      if (drawText) {
        ctx.fillStyle = '#000';
        ctx.font = CONFIG.headerFont;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.getColumnLabel(col), x + colWidth / 2, CONFIG.cellHeight / 2);
      }
      ctx.restore();
    }
  }

  /**
   * Highlights a row header.
   * @param {*} row - The row index.
   * @param {CanvasRenderingContext2D} ctx
   * @param {*} scrollY
   * @param {*} rowHeaderWidth
   * @param {*} viewport
   * @param {*} rowManager
   * @param {boolean} [drawText=true]
   */
  highlightRowHeader(row, ctx, scrollY, rowHeaderWidth, viewport, rowManager, drawText = true) {
    const lightGreen = 'rgba(198, 239, 206, 0.7)';
    const y = this.getRowY(row, scrollY);
    const rowHeight = this.getRowHeight(row);
    if (y + rowHeight > CONFIG.cellHeight && y < viewport.height) {
      ctx.save();
      ctx.fillStyle = lightGreen;
      ctx.fillRect(0, y, rowHeaderWidth, rowHeight);
      if (drawText) {
        ctx.fillStyle = '#000';
        ctx.font = CONFIG.headerFont;
        ctx.textBaseline = "middle";
        ctx.textAlign = "right";
        ctx.fillText(row + 1, rowHeaderWidth - 5, y + rowHeight / 2);
      }
      ctx.restore();
    }
  }

  /**
   * Draws header underlines for a selected cell.
   * @param {*} selected - The selection object with row and col.
   */
  drawHeaderUnderline(selected) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY } = viewport;
    this.highlightColumnHeader(selected.col, ctx, scrollX, rowHeaderWidth, viewport, this.colManager);
    this.highlightRowHeader(selected.row, ctx, scrollY, rowHeaderWidth, viewport, this.rowManager);
    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;
    const x = this.getColumnX(selected.col, scrollX);
    const colWidth = this.getColumnWidth(selected.col);
    if (x + colWidth > rowHeaderWidth && x < viewport.width) {
      ctx.beginPath();
      ctx.moveTo(x, CONFIG.cellHeight - 2);
      ctx.lineTo(x + colWidth, CONFIG.cellHeight - 2);
      ctx.stroke();
    }
    const y = this.getRowY(selected.row, scrollY);
    const rowHeight = this.getRowHeight(selected.row);
    if (y + rowHeight > CONFIG.cellHeight && y < viewport.height) {
      ctx.beginPath();
      ctx.moveTo(rowHeaderWidth - 2, y);
      ctx.lineTo(rowHeaderWidth - 2, y + rowHeight);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Draws underlines for all visible column headers.
   * @param {boolean} [drawHighlight=true]
   */
  drawAllColumnHeaderUnderlines(drawHighlight = true) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, width } = viewport;
    const { startCol, endCol } = this.getVisibleRange();
    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;
    for (let col = startCol; col <= endCol; col++) {
      if (drawHighlight) this.highlightColumnHeader(col, ctx, scrollX, rowHeaderWidth, viewport, this.colManager);
      const x = this.getColumnX(col, scrollX);
      const colWidth = this.getColumnWidth(col);
      if (x + colWidth > rowHeaderWidth && x < width) {
        ctx.beginPath();
        ctx.moveTo(x, CONFIG.cellHeight - 2);
        ctx.lineTo(x + colWidth, CONFIG.cellHeight - 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /**
   * Draws underlines for all visible row headers.
   * @param {boolean} [drawHighlight=true]
   */
  drawAllRowHeaderUnderlines(drawHighlight = true) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollY, height } = viewport;
    const { startRow, endRow } = this.getVisibleRange();
    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;
    for (let row = startRow; row <= endRow; row++) {
      if (drawHighlight) this.highlightRowHeader(row, ctx, scrollY, rowHeaderWidth, viewport, this.rowManager);
      const y = this.getRowY(row, scrollY);
      const rowHeight = this.getRowHeight(row);
      if (y + rowHeight > CONFIG.cellHeight && y < height) {
        ctx.beginPath();
        ctx.moveTo(rowHeaderWidth - 2, y);
        ctx.lineTo(rowHeaderWidth - 2, y + rowHeight);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /**
   * Draws selection for the entire grid.
   */
  drawAllSelection() {
    const { ctx, rowHeaderWidth } = this;
    ctx.fillStyle = '#107C10';
    ctx.fillRect(0, 0, rowHeaderWidth, CONFIG.cellHeight);
    this.drawAllColumnHeaderUnderlines();
    this.drawAllRowHeaderUnderlines();
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