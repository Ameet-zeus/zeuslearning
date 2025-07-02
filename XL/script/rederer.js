/*jslint es6 */
import { CONFIG } from "./config.js";

/**
 * @param data to manage data
 * @param ctx to manage canvas
 * @param viewport access viewport methods
 * @param rowManager manage row hieghts
 * @param colManager manage col widths
 * @param dpr manage for bigger device pixel ratio
 * @param calculateHeaderWidth Calculate the header width
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

  //Calculate Row Header Width
  calculateHeaderWidth() {
    this.ctx.font = CONFIG.font;
    const text = CONFIG.numRows.toString();
    const width = this.ctx.measureText(text).width;
    this.rowHeaderWidth = Math.ceil(width + CONFIG.padding * 2);
  }

  //Binary search for efficient calculations of sum for visible range
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

  //Calculate values for visible range
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

  //Helper method to get X position for a column
  getColumnX(col, scrollX) {
    const colOffsets = this.colManager.getCumulativeWidths();
    return this.rowHeaderWidth + colOffsets[col] - scrollX;
  }

  //Helper method to get Y position for a row
  getRowY(row, scrollY) {
    const rowOffsets = this.rowManager.getCumulativeHeights();
    return CONFIG.cellHeight + rowOffsets[row] - scrollY;
  }

  //Helper method to get column width
  getColumnWidth(col) {
    const colOffsets = this.colManager.getCumulativeWidths();
    return colOffsets[col + 1] - colOffsets[col];
  }

  //Helper method to get row height
  getRowHeight(row) {
    const rowOffsets = this.rowManager.getCumulativeHeights();
    return rowOffsets[row + 1] - rowOffsets[row];
  }

  //Drawing the excel sheet
  drawGrid(selected = null) {
    const { ctx } = this;
    const { width, height } = this.viewport;
    const { startCol, endCol, startRow, endRow } = this.getVisibleRange();

    ctx.clearRect(0, 0, width, height);

    if (selected) {
      this.drawSelectionHighlights(selected, startCol, endCol, startRow, endRow);
    }

    this.drawGridLines(startCol, endCol, startRow, endRow);
    this.drawCellContent(startCol, endCol, startRow, endRow);
    this.drawHeaders(startCol, endCol, startRow, endRow);

    if (selected && selected.type === 'range') {
      const { viewport, rowHeaderWidth } = this;
      const { scrollX, scrollY } = viewport;
      const lightGreen = 'rgba(198, 239, 206, 0.6)';
      ctx.save();
      for (let col = selected.startCol; col <= selected.endCol; col++) {
        const x = this.getColumnX(col, scrollX);
        const colWidth = this.getColumnWidth(col);
        if (x + colWidth > rowHeaderWidth && x < width) {
          ctx.fillStyle = lightGreen;
          ctx.fillRect(x, 0, colWidth, CONFIG.cellHeight);
          ctx.fillStyle = '#000';
          ctx.font = CONFIG.headerFont;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const label = this.getColumnLabel(col);
          ctx.fillText(label, x + colWidth / 2, CONFIG.cellHeight / 2);
        }
      }
      for (let row = selected.startRow; row <= selected.endRow; row++) {
        const y = this.getRowY(row, scrollY);
        const rowHeight = this.getRowHeight(row);
        if (y + rowHeight > CONFIG.cellHeight && y < height) {
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
    if (selected) {
      this.drawSelectionEffects(selected);
    }
  }

  //Highlighting selections
  drawSelectionHighlights(selected, startCol, endCol, startRow, endRow) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { width, height, scrollX, scrollY } = viewport;

    if (!selected) return;

    const lightGreen = 'rgba(198, 239, 206, 0.7)';
    ctx.fillStyle = lightGreen;

    if (selected.type === 'all') {
      ctx.fillRect(rowHeaderWidth, CONFIG.cellHeight, width - rowHeaderWidth, height - CONFIG.cellHeight);
    } else if (selected.type === 'row') {
      const y = this.getRowY(selected.row, scrollY);
      const rowHeight = this.getRowHeight(selected.row);
      if (y + rowHeight > CONFIG.cellHeight && y < height) {
        ctx.fillRect(rowHeaderWidth, y, width - rowHeaderWidth, rowHeight);
      }
    } else if (selected.type === 'rows') {
      for (let row = selected.start; row <= selected.end; row++) {
        const y = this.getRowY(row, scrollY);
        const rowHeight = this.getRowHeight(row);
        if (y + rowHeight > CONFIG.cellHeight && y < height) {
          ctx.fillRect(rowHeaderWidth, y, width - rowHeaderWidth, rowHeight);
        }
      }
    } else if (selected.type === 'column') {
      const x = this.getColumnX(selected.col, scrollX);
      const colWidth = this.getColumnWidth(selected.col);
      if (x + colWidth > rowHeaderWidth && x < width) {
        ctx.fillRect(x, CONFIG.cellHeight, colWidth, height - CONFIG.cellHeight);
      }
    } else if (selected.type === 'columns') {
      for (let col = selected.start; col <= selected.end; col++) {
        const x = this.getColumnX(col, scrollX);
        const colWidth = this.getColumnWidth(col);
        if (x + colWidth > rowHeaderWidth && x < width) {
          ctx.fillRect(x, CONFIG.cellHeight, colWidth, height - CONFIG.cellHeight);
        }
      }
    } else if (selected.type === 'range') {
      const x1 = this.getColumnX(selected.startCol, scrollX);
      const y1 = this.getRowY(selected.startRow, scrollY);
      const x2 = this.getColumnX(selected.endCol, scrollX) + this.getColumnWidth(selected.endCol);
      const y2 = this.getRowY(selected.endRow, scrollY) + this.getRowHeight(selected.endRow);
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    }
  }

  //Drawing the gridlines
  drawGridLines(startCol, endCol, startRow, endRow) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY, width, height } = viewport;

    ctx.strokeStyle = '#D4D4D4';
    ctx.lineWidth = 1;

    // Drawing vertical lines
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

    // Drawing horizontal lines
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

  //Drawing the data inside
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
          ctx.fillText(val, x + 5, y + rowHeight / 2);
        }
      }
    }
  }

  //Drawing the headers
  drawHeaders(startCol, endCol, startRow, endRow) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY, width, height } = viewport;

    //Header background
    const headerBg = '#F2F2F2';
    ctx.fillStyle = headerBg;
    ctx.fillRect(rowHeaderWidth, 0, width - rowHeaderWidth, CONFIG.cellHeight);
    ctx.fillRect(0, CONFIG.cellHeight, rowHeaderWidth, height - CONFIG.cellHeight);

    //Header borders
    ctx.strokeStyle = '#BEBEBE';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.cellHeight);
    ctx.lineTo(width, CONFIG.cellHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rowHeaderWidth, 0);
    ctx.lineTo(rowHeaderWidth, height);
    ctx.stroke();

    //Header text
    ctx.fillStyle = '#000';
    ctx.font = CONFIG.headerFont;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    //Column headers
    for (let col = startCol; col <= endCol; col++) {
      const x = this.getColumnX(col, scrollX);
      const colWidth = this.getColumnWidth(col);

      if (x + colWidth > rowHeaderWidth && x < width) {
        const label = this.getColumnLabel(col);
        ctx.fillText(label, x + colWidth / 2, CONFIG.cellHeight / 2);

        //Vertical separator
        const xSep = viewport.alignToPixel(x + colWidth);
        if (xSep <= width) {
          ctx.beginPath();
          ctx.moveTo(xSep, 0);
          ctx.lineTo(xSep, CONFIG.cellHeight);
          ctx.stroke();
        }
      }
    }

    //Row headers
    for (let row = startRow; row <= endRow; row++) {
      const y = this.getRowY(row, scrollY);
      const rowHeight = this.getRowHeight(row);

      if (y + rowHeight > CONFIG.cellHeight && y < height) {
        ctx.textAlign = "right";
        ctx.fillText(row + 1, rowHeaderWidth - 5, y + rowHeight / 2);

        //Horizontal separator
        const ySep = viewport.alignToPixel(y + rowHeight);
        if (ySep <= height) {
          ctx.beginPath();
          ctx.moveTo(0, ySep);
          ctx.lineTo(rowHeaderWidth, ySep);
          ctx.stroke();
        }
      }
    }

    //Top-left corner
    ctx.fillStyle = headerBg;
    ctx.fillRect(0, 0, rowHeaderWidth, CONFIG.cellHeight);
    ctx.strokeStyle = '#BEBEBE';
    ctx.strokeRect(0, 0, rowHeaderWidth, CONFIG.cellHeight);
  }

  //Toggle selection effects
  drawSelectionEffects(selected) {
    if (!selected) return;

    if (selected.type === 'cell') {
      this.drawCellSelection(selected);
      this.drawHeaderUnderline(selected);
    } else if (selected.type === 'row') {
      this.drawRowSelection(selected);
      this.drawRowBounding(selected);
      this.drawAllColumnHeaderUnderlines();
    } else if (selected.type === 'column') {
      this.drawColumnSelection(selected);
      this.drawColumnBounding(selected);
      this.drawAllRowHeaderUnderlines();
    } else if (selected.type === 'rows') {
      this.drawMultiRowSelection(selected);
      this.drawAllColumnHeaderUnderlines();
    } else if (selected.type === 'columns') {
      this.drawMultiColumnSelection(selected);
      this.drawAllRowHeaderUnderlines();
    } else if (selected.type === 'range') {
      this.drawRangeSelection(selected);
      this.drawRangeHeaderUnderlines(selected);
    } else if (selected.type === 'all') {
      this.drawAllSelection();
    }
  }

  // Single row bounding box
  drawRowBounding(selected) {
    const { ctx, viewport } = this;
    const { scrollY } = viewport;
    const { row } = selected;

    const y = this.getRowY(row, scrollY);
    const rowHeight = this.getRowHeight(row);

    if (y + rowHeight > CONFIG.cellHeight && y < viewport.height) {
      ctx.save();
      ctx.strokeStyle = '#107C10';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, y, viewport.width, rowHeight);
      ctx.restore();
    }
  }

  // Single column bounding box
  drawColumnBounding(selected) {
    const { ctx, viewport } = this;
    const { scrollX } = viewport;
    const { col } = selected;

    const x = this.getColumnX(col, scrollX);
    const colWidth = this.getColumnWidth(col);

    if (x + colWidth > this.rowHeaderWidth && x < viewport.width) {
      ctx.save();
      ctx.strokeStyle = '#107C10';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 0, colWidth, viewport.height);
      ctx.restore();
    }
  }

  // Multi-row selection
  drawMultiRowSelection(selected) {
    const { ctx, viewport } = this;
    const { scrollY } = viewport;

    // Draw individual row selections
    for (let row = selected.start; row <= selected.end; row++) {
      this.drawRowSelection({ row });
    }

    // Draw bounding box around all selected rows
    const y1 = this.getRowY(selected.start, scrollY);
    const y2 = this.getRowY(selected.end, scrollY) + this.getRowHeight(selected.end);

    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, y1, viewport.width, y2 - y1);
    ctx.restore();
  }

  // Multi-column selection
  drawMultiColumnSelection(selected) {
    const { ctx, viewport } = this;
    const { scrollX } = viewport;

    // Draw individual column selections
    for (let col = selected.start; col <= selected.end; col++) {
      this.drawColumnSelection({ col });
    }

    // Draw bounding box around all selected columns
    const x1 = this.getColumnX(selected.start, scrollX);
    const x2 = this.getColumnX(selected.end, scrollX) + this.getColumnWidth(selected.end);

    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;
    ctx.strokeRect(x1, 0, x2 - x1, viewport.height);
    ctx.restore();
  }

  // Range selection (cell drag)
  drawRangeSelection(selected) {
    const { ctx, viewport } = this;
    const { scrollX, scrollY } = viewport;
    const x1 = this.getColumnX(selected.startCol, scrollX);
    const y1 = this.getRowY(selected.startRow, scrollY);
    const x2 = this.getColumnX(selected.endCol, scrollX) + this.getColumnWidth(selected.endCol);
    const y2 = this.getRowY(selected.endRow, scrollY) + this.getRowHeight(selected.endRow);

    // Dark green outline
    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    ctx.restore();
  }

  // Header underlines for range selection
  drawRangeHeaderUnderlines(selected) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY, width, height } = viewport;

    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;

    // Column header underlines
    for (let col = selected.startCol; col <= selected.endCol; col++) {
      const x = this.getColumnX(col, scrollX);
      const colWidth = this.getColumnWidth(col);

      if (x + colWidth > rowHeaderWidth && x < width) {
        ctx.beginPath();
        ctx.moveTo(x, CONFIG.cellHeight - 2);
        ctx.lineTo(x + colWidth, CONFIG.cellHeight - 2);
        ctx.stroke();
      }
    }

    // Row header underlines
    for (let row = selected.startRow; row <= selected.endRow; row++) {
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

  //Cell selection
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

  //Row selection
  drawRowSelection(selected) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollY } = viewport;

    const y = this.getRowY(selected.row, scrollY);
    const rowHeight = this.getRowHeight(selected.row);

    if (y + rowHeight > CONFIG.cellHeight && y < viewport.height) {
      ctx.fillStyle = '#107C10';
      ctx.fillRect(0, y, rowHeaderWidth, rowHeight);
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold ' + CONFIG.headerFont;
      ctx.textAlign = "right";
      ctx.fillText(selected.row + 1, rowHeaderWidth - 5, y + rowHeight / 2);
      ctx.textBaseline = "middle";
    }
  }

  //Column selection
  drawColumnSelection(selected) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX } = viewport;

    const x = this.getColumnX(selected.col, scrollX);
    const colWidth = this.getColumnWidth(selected.col);

    if (x + colWidth > rowHeaderWidth && x < viewport.width) {
      ctx.fillStyle = '#107C10';
      ctx.fillRect(x, 0, colWidth, CONFIG.cellHeight);
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold ' + CONFIG.headerFont;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const colLabel = this.getColumnLabel(selected.col);
      ctx.fillText(colLabel, x + colWidth / 2, CONFIG.cellHeight / 2);
    }
  }

  //Draw column header highlight
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
        const label = this.getColumnLabel(col);
        ctx.fillText(label, x + colWidth / 2, CONFIG.cellHeight / 2);
      }
      ctx.restore();
    }
  }

  //Draw row header highlight
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

  //Underlining for selected cell
  drawHeaderUnderline(selected) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY } = viewport;

    this.highlightColumnHeader(selected.col, ctx, scrollX, rowHeaderWidth, viewport, this.colManager);
    this.highlightRowHeader(selected.row, ctx, scrollY, rowHeaderWidth, viewport, this.rowManager);

    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;

    //Column header underline
    const x = this.getColumnX(selected.col, scrollX);
    const colWidth = this.getColumnWidth(selected.col);

    if (x + colWidth > rowHeaderWidth && x < viewport.width) {
      ctx.beginPath();
      ctx.moveTo(x, CONFIG.cellHeight - 2);
      ctx.lineTo(x + colWidth, CONFIG.cellHeight - 2);
      ctx.stroke();
    }

    //Row header underline
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

  //Draw all column header underlines
  drawAllColumnHeaderUnderlines() {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, width } = viewport;
    const { startCol, endCol } = this.getVisibleRange();

    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;

    for (let col = startCol; col <= endCol; col++) {
      this.highlightColumnHeader(col, ctx, scrollX, rowHeaderWidth, viewport, this.colManager);
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

  //Draw all row headers underlines
  drawAllRowHeaderUnderlines() {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollY, height } = viewport;
    const { startRow, endRow } = this.getVisibleRange();

    ctx.save();
    ctx.strokeStyle = '#107C10';
    ctx.lineWidth = 2;

    for (let row = startRow; row <= endRow; row++) {
      this.highlightRowHeader(row, ctx, scrollY, rowHeaderWidth, viewport, this.rowManager);
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

  //For select all
  drawAllSelection() {
    const { ctx, rowHeaderWidth } = this;

    ctx.fillStyle = '#107C10';
    ctx.fillRect(0, 0, rowHeaderWidth, CONFIG.cellHeight);

    this.drawAllColumnHeaderUnderlines();
    this.drawAllRowHeaderUnderlines();
  }

  //Column label calculator
  getColumnLabel(index) {
    let label = "";
    while (index >= 0) {
      label = String.fromCharCode((index % 26) + 65) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  }
}