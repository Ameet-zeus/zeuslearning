/*jslint es6 */
import { CONFIG } from "./config.js";

/**
 * Refactored Renderer focusing on real redundancy issues
 */
export class Renderer {
  constructor(ctx, viewport, data, rowManager, colManager) {
    this.data = data;
    this.ctx = ctx;
    this.viewport = viewport;
    this.rowManager = rowManager;
    this.colManager = colManager;
    this.dpr = window.devicePixelRatio || 1;
    this.calculateHeaderWidth();
  }

  calculateHeaderWidth() {
    this.ctx.font = CONFIG.font;
    const text = CONFIG.numRows.toString();
    const width = this.ctx.measureText(text).width;
    this.rowHeaderWidth = Math.ceil(width + CONFIG.padding * 2);
  }

  binarySearchOffset(offsets, value) {
    let low = 0, high = offsets.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (offsets[mid] <= value) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return Math.max(0, low - 1);
  }

  getVisibleRange() {
    const { scrollX, scrollY, width, height } = this.viewport;
    const colOffsets = this.colManager.getCumulativeWidths();
    const rowOffsets = this.rowManager.getCumulativeHeights();

    return {
      startCol: this.binarySearchOffset(colOffsets, scrollX),
      endCol: this.binarySearchOffset(colOffsets, scrollX + width - this.rowHeaderWidth),
      startRow: this.binarySearchOffset(rowOffsets, scrollY),
      endRow: this.binarySearchOffset(rowOffsets, scrollY + height - CONFIG.cellHeight)
    };
  }

  // Use cumulative widths instead of loop
  getColumnX(col, scrollX) {
    const colOffsets = this.colManager.getCumulativeWidths();
    return this.rowHeaderWidth - scrollX + (col > 0 ? colOffsets[col - 1] : 0);
  }

  // Use cumulative heights instead of loop
  getRowY(row, scrollY) {
    const rowOffsets = this.rowManager.getCumulativeHeights();
    return CONFIG.cellHeight - scrollY + (row > 0 ? rowOffsets[row - 1] : 0);
  }

  // Single visibility check method
  isVisible(x, y, width, height) {
    const { viewport, rowHeaderWidth } = this;
    return x + width > rowHeaderWidth &&
      x < viewport.width &&
      y + height > CONFIG.cellHeight &&
      y < viewport.height;
  }

  // Main drawing method - single pass approach
  drawGrid(selected = null) {
    const { ctx, viewport } = this;
    const { width, height } = viewport;
    const visibleRange = this.getVisibleRange();

    ctx.clearRect(0, 0, width, height);

    // Single-pass drawing with selection awareness
    this.drawGridLines(visibleRange);
    this.drawCellContent(visibleRange);
    this.drawHeadersWithSelection(visibleRange, selected);
    this.drawSelectionOverlays(selected, visibleRange);
  }

  drawGridLines({ startCol, endCol, startRow, endRow }) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY, width, height } = viewport;

    ctx.strokeStyle = '#D4D4D4';
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Batch all lines in single draw call
    for (let col = startCol; col <= endCol + 1 && col <= CONFIG.numCols; col++) {
      const x = viewport.alignToPixel(this.getColumnX(col, scrollX));
      if (x >= rowHeaderWidth && x <= width) {
        ctx.moveTo(x, CONFIG.cellHeight);
        ctx.lineTo(x, height);
      }
    }

    for (let row = startRow; row <= endRow + 1 && row <= CONFIG.numRows; row++) {
      const y = viewport.alignToPixel(this.getRowY(row, scrollY));
      if (y >= CONFIG.cellHeight && y <= height) {
        ctx.moveTo(rowHeaderWidth, y);
        ctx.lineTo(width, y);
      }
    }

    ctx.stroke();
  }

  drawCellContent({ startCol, endCol, startRow, endRow }) {
    const { ctx, viewport } = this;
    const { scrollX, scrollY } = viewport;

    ctx.fillStyle = '#000';
    ctx.font = CONFIG.font;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    for (let row = startRow; row <= endRow; row++) {
      const y = this.getRowY(row, scrollY);
      const rowHeight = this.rowManager.get(row);

      for (let col = startCol; col <= endCol; col++) {
        const x = this.getColumnX(col, scrollX);
        const colWidth = this.colManager.get(col);

        if (this.isVisible(x, y, colWidth, rowHeight)) {
          const val = this.data?.get(row, col);
          if (val) {
            ctx.fillText(val, x + 5, y + rowHeight / 2);
          }
        }
      }
    }
  }

  // Draw headers with selection highlighting in single pass
  drawHeadersWithSelection({ startCol, endCol, startRow, endRow }, selected) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY, width, height } = viewport;

    // Determine which headers need highlighting
    const highlightedCols = this.getHighlightedColumns(selected, startCol, endCol);
    const highlightedRows = this.getHighlightedRows(selected, startRow, endRow);

    // Draw backgrounds first
    this.drawHeaderBackgrounds(highlightedCols, highlightedRows);

    // Draw borders
    this.drawHeaderBorders();

    // Draw text with appropriate styling
    this.drawHeaderText(startCol, endCol, startRow, endRow, highlightedCols, highlightedRows, selected);
  }

  getHighlightedColumns(selected, startCol, endCol) {
    if (!selected) return new Set();

    const highlighted = new Set();

    switch (selected.type) {
      case 'cell':
      case 'column':
        highlighted.add(selected.col);
        break;
      case 'columns':
        for (let col = selected.start; col <= selected.end; col++) {
          highlighted.add(col);
        }
        break;
      case 'range':
        for (let col = selected.startCol; col <= selected.endCol; col++) {
          highlighted.add(col);
        }
        break;
      case 'row':
      case 'rows':
      case 'all':
        for (let col = startCol; col <= endCol; col++) {
          highlighted.add(col);
        }
        break;
    }

    return highlighted;
  }

  getHighlightedRows(selected, startRow, endRow) {
    if (!selected) return new Set();

    const highlighted = new Set();

    switch (selected.type) {
      case 'cell':
      case 'row':
        highlighted.add(selected.row);
        break;
      case 'rows':
        for (let row = selected.start; row <= selected.end; row++) {
          highlighted.add(row);
        }
        break;
      case 'range':
        for (let row = selected.startRow; row <= selected.endRow; row++) {
          highlighted.add(row);
        }
        break;
      case 'column':
      case 'columns':
      case 'all':
        for (let row = startRow; row <= endRow; row++) {
          highlighted.add(row);
        }
        break;
    }

    return highlighted;
  }

  drawHeaderBackgrounds(highlightedCols, highlightedRows) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY, width, height } = viewport;

    // Default header background
    ctx.fillStyle = '#F2F2F2';
    ctx.fillRect(rowHeaderWidth, 0, width - rowHeaderWidth, CONFIG.cellHeight);
    ctx.fillRect(0, CONFIG.cellHeight, rowHeaderWidth, height - CONFIG.cellHeight);
    ctx.fillRect(0, 0, rowHeaderWidth, CONFIG.cellHeight); // Corner

    // Highlighted column headers
    if (highlightedCols.size > 0) {
      ctx.fillStyle = 'rgba(198, 239, 206, 0.6)';
      for (const col of highlightedCols) {
        const x = this.getColumnX(col, scrollX);
        const colWidth = this.colManager.get(col);
        if (this.isVisible(x, 0, colWidth, CONFIG.cellHeight)) {
          ctx.fillRect(x, 0, colWidth, CONFIG.cellHeight);
        }
      }
    }

    // Highlighted row headers
    if (highlightedRows.size > 0) {
      ctx.fillStyle = 'rgba(198, 239, 206, 0.6)';
      for (const row of highlightedRows) {
        const y = this.getRowY(row, scrollY);
        const rowHeight = this.rowManager.get(row);
        if (this.isVisible(0, y, rowHeaderWidth, rowHeight)) {
          ctx.fillRect(0, y, rowHeaderWidth, rowHeight);
        }
      }
    }
  }

  drawHeaderBorders() {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { width, height } = viewport;

    ctx.strokeStyle = '#BEBEBE';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.cellHeight);
    ctx.lineTo(width, CONFIG.cellHeight);
    ctx.moveTo(rowHeaderWidth, 0);
    ctx.lineTo(rowHeaderWidth, height);
    ctx.rect(0, 0, rowHeaderWidth, CONFIG.cellHeight);
    ctx.stroke();
  }

  drawHeaderText(startCol, endCol, startRow, endRow, highlightedCols, highlightedRows, selected) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY } = viewport;

    ctx.font = CONFIG.headerFont;
    ctx.textBaseline = "middle";

    // Column headers
    ctx.textAlign = "center";
    for (let col = startCol; col <= endCol; col++) {
      const x = this.getColumnX(col, scrollX);
      const colWidth = this.colManager.get(col);

      if (this.isVisible(x, 0, colWidth, CONFIG.cellHeight)) {
        // Special styling for selected headers
        const isSelected = this.isColumnSelected(col, selected);
        ctx.fillStyle = isSelected ? '#FFF' : '#000';
        if (isSelected) ctx.font = 'bold ' + CONFIG.headerFont;

        ctx.fillText(this.getColumnLabel(col), x + colWidth / 2, CONFIG.cellHeight / 2);

        if (isSelected) ctx.font = CONFIG.headerFont; // Reset
      }
    }

    // Row headers
    ctx.textAlign = "right";
    for (let row = startRow; row <= endRow; row++) {
      const y = this.getRowY(row, scrollY);
      const rowHeight = this.rowManager.get(row);

      if (this.isVisible(0, y, rowHeaderWidth, rowHeight)) {
        // Special styling for selected headers
        const isSelected = this.isRowSelected(row, selected);
        ctx.fillStyle = isSelected ? '#FFF' : '#000';
        if (isSelected) ctx.font = 'bold ' + CONFIG.headerFont;

        ctx.fillText(row + 1, rowHeaderWidth - 5, y + rowHeight / 2);

        if (isSelected) ctx.font = CONFIG.headerFont; // Reset
      }
    }

    // Draw underlines for highlighted headers
    this.drawHeaderUnderlines(highlightedCols, highlightedRows);
  }

  isColumnSelected(col, selected) {
    return selected && (
      (selected.type === 'column' && selected.col === col) ||
      (selected.type === 'columns' && col >= selected.start && col <= selected.end)
    );
  }

  isRowSelected(row, selected) {
    return selected && (
      (selected.type === 'row' && selected.row === row) ||
      (selected.type === 'rows' && row >= selected.start && row <= selected.end)
    );
  }

  drawHeaderUnderlines(highlightedCols, highlightedRows) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY } = viewport;

    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Column underlines
    for (const col of highlightedCols) {
      const x = this.getColumnX(col, scrollX);
      const colWidth = this.colManager.get(col);
      if (this.isVisible(x, 0, colWidth, CONFIG.cellHeight)) {
        ctx.moveTo(x, CONFIG.cellHeight - 2);
        ctx.lineTo(x + colWidth, CONFIG.cellHeight - 2);
      }
    }

    // Row underlines
    for (const row of highlightedRows) {
      const y = this.getRowY(row, scrollY);
      const rowHeight = this.rowManager.get(row);
      if (this.isVisible(0, y, rowHeaderWidth, rowHeight)) {
        ctx.moveTo(rowHeaderWidth - 2, y);
        ctx.lineTo(rowHeaderWidth - 2, y + rowHeight);
      }
    }

    ctx.stroke();
  }

  drawSelectionOverlays(selected, visibleRange) {
    if (!selected) return;

    // Draw selection backgrounds
    this.drawSelectionBackgrounds(selected, visibleRange);

    // Draw selection borders
    this.drawSelectionBorders(selected);
  }

  drawSelectionBackgrounds(selected, { startCol, endCol, startRow, endRow }) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY, width, height } = viewport;

    ctx.fillStyle = 'rgba(198, 239, 206, 0.7)';

    switch (selected.type) {
      case 'all':
        ctx.fillRect(rowHeaderWidth, CONFIG.cellHeight, width - rowHeaderWidth, height - CONFIG.cellHeight);
        break;

      case 'row':
        this.fillRowBackground(selected.row, scrollY, height);
        break;

      case 'rows':
        for (let row = selected.start; row <= selected.end; row++) {
          this.fillRowBackground(row, scrollY, height);
        }
        break;

      case 'column':
        this.fillColumnBackground(selected.col, scrollX, width);
        break;

      case 'columns':
        for (let col = selected.start; col <= selected.end; col++) {
          this.fillColumnBackground(col, scrollX, width);
        }
        break;

      case 'range':
        const x1 = this.getColumnX(selected.startCol, scrollX);
        const y1 = this.getRowY(selected.startRow, scrollY);
        const x2 = this.getColumnX(selected.endCol, scrollX) + this.colManager.get(selected.endCol);
        const y2 = this.getRowY(selected.endRow, scrollY) + this.rowManager.get(selected.endRow);
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
        break;
    }
  }

  fillRowBackground(row, scrollY, height) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const y = this.getRowY(row, scrollY);
    const rowHeight = this.rowManager.get(row);

    if (this.isVisible(rowHeaderWidth, y, viewport.width - rowHeaderWidth, rowHeight)) {
      ctx.fillRect(rowHeaderWidth, y, viewport.width - rowHeaderWidth, rowHeight);
    }
  }

  fillColumnBackground(col, scrollX, width) {
    const { ctx, viewport } = this;
    const x = this.getColumnX(col, scrollX);
    const colWidth = this.colManager.get(col);

    if (this.isVisible(x, CONFIG.cellHeight, colWidth, viewport.height - CONFIG.cellHeight)) {
      ctx.fillRect(x, CONFIG.cellHeight, colWidth, viewport.height - CONFIG.cellHeight);
    }
  }

  drawSelectionBorders(selected) {
    const { ctx, viewport } = this;
    const { scrollX, scrollY } = viewport;

    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;

    switch (selected.type) {
      case 'cell':
        const x = this.getColumnX(selected.col, scrollX);
        const y = this.getRowY(selected.row, scrollY);
        const cellWidth = this.colManager.get(selected.col);
        const cellHeight = this.rowManager.get(selected.row);
        ctx.strokeRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
        break;

      case 'range':
        const x1 = this.getColumnX(selected.startCol, scrollX);
        const y1 = this.getRowY(selected.startRow, scrollY);
        const x2 = this.getColumnX(selected.endCol, scrollX) + this.colManager.get(selected.endCol);
        const y2 = this.getRowY(selected.endRow, scrollY) + this.rowManager.get(selected.endRow);
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        break;

      case 'row':
        this.drawRowBorder(selected.row, scrollY);
        break;

      case 'column':
        this.drawColumnBorder(selected.col, scrollX);
        break;

      case 'rows':
        const y1_rows = this.getRowY(selected.start, scrollY);
        const y2_rows = this.getRowY(selected.end, scrollY) + this.rowManager.get(selected.end);
        ctx.strokeRect(0, y1_rows, viewport.width, y2_rows - y1_rows);
        break;

      case 'columns':
        const x1_cols = this.getColumnX(selected.start, scrollX);
        const x2_cols = this.getColumnX(selected.end, scrollX) + this.colManager.get(selected.end);
        ctx.strokeRect(x1_cols, 0, x2_cols - x1_cols, viewport.height);
        break;
    }

    ctx.restore();
  }

  drawRowBorder(row, scrollY) {
    const { ctx, viewport } = this;
    const y = this.getRowY(row, scrollY);
    const rowHeight = this.rowManager.get(row);

    if (this.isVisible(0, y, viewport.width, rowHeight)) {
      ctx.strokeRect(0, y, viewport.width, rowHeight);
    }
  }

  drawColumnBorder(col, scrollX) {
    const { ctx, viewport } = this;
    const x = this.getColumnX(col, scrollX);
    const colWidth = this.colManager.get(col);

    if (this.isVisible(x, 0, colWidth, viewport.height)) {
      ctx.strokeRect(x, 0, colWidth, viewport.height);
    }
  }

  getColumnLabel(index) {
    let label = "";
    while (index >= 0) {
      label = String.fromCharCode((index % 26) + 65) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  }
}