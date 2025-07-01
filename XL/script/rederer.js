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
  /** */
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
    let x = this.rowHeaderWidth - scrollX;
    for (let c = 0; c < col; c++) {
      x += this.colManager.get(c);
    }
    return x;
  }

  //Helper method to get Y position for a row
  getRowY(row, scrollY) {
    let y = CONFIG.cellHeight - scrollY;
    for (let r = 0; r < row; r++) {
      y += this.rowManager.get(r);
    }
    return y;
  }

  //Drawing the excel sheet
  drawGrid(selected = null) {
    const { ctx } = this;
    const { width, height } = this.viewport;
    const { startCol, endCol, startRow, endRow } = this.getVisibleRange();

    ctx.clearRect(0, 0, width, height);

    if (selected && selected.type !== 'cell') {
      this.drawSelectionHighlights(selected, startCol, endCol, startRow, endRow);
    }

    this.drawGridLines(startCol, endCol, startRow, endRow);
    this.drawCellContent(startCol, endCol, startRow, endRow);
    this.drawHeaders(startCol, endCol, startRow, endRow);

    if (selected) {
      this.drawSelectionEffects(selected);
    }
  }

  //Highlighting selections
  drawSelectionHighlights(selected, startCol, endCol, startRow, endRow) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { width, height } = viewport;

    if (!selected) return;

    const lightGreen = 'rgba(198, 239, 206, 0.7)';

    if (selected.type === 'all') {
      ctx.fillStyle = lightGreen;
      ctx.fillRect(rowHeaderWidth, CONFIG.cellHeight, width - rowHeaderWidth, height - CONFIG.cellHeight);
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
      const rowHeight = this.rowManager.get(row);

      for (let col = startCol; col <= endCol; col++) {
        const x = this.getColumnX(col, scrollX);
        const colWidth = this.colManager.get(col);
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
      const colWidth = this.colManager.get(col);

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
      const rowHeight = this.rowManager.get(row);

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
    if (selected.type === 'cell') {
      this.drawCellSelection(selected);
      this.drawHeaderUnderline(selected);
    } else if (selected.type === 'row') {
      this.drawRowSelection(selected);
      this.drawAllColumnHeaderUnderlines();
    } else if (selected.type === 'column') {
      this.drawColumnSelection(selected);
      this.drawAllRowHeaderUnderlines();
    } else if (selected.type === 'all') {
      this.drawAllSelection();
    }
  }

  //Cell selection
  drawCellSelection(selected) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX, scrollY } = viewport;
    const { row, col } = selected;

    const x = this.getColumnX(col, scrollX);
    const y = this.getRowY(row, scrollY);
    const cellWidth = this.colManager.get(col);
    const cellHeight = this.rowManager.get(row);

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
    const rowHeight = this.rowManager.get(selected.row);

    if (y + rowHeight > CONFIG.cellHeight && y < viewport.height) {
      ctx.fillStyle = '#107C10';
      ctx.fillRect(0, y, rowHeaderWidth, rowHeight);
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold ' + CONFIG.headerFont;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(selected.row + 1, rowHeaderWidth / 2, y + rowHeight / 2);
    }
  }

  //Column selection
  drawColumnSelection(selected) {
    const { ctx, viewport, rowHeaderWidth } = this;
    const { scrollX } = viewport;

    const x = this.getColumnX(selected.col, scrollX);
    const colWidth = this.colManager.get(selected.col);

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
    const colWidth = colManager.get(col);
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
    const rowHeight = rowManager.get(row);
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
    const colWidth = this.colManager.get(selected.col);

    if (x + colWidth > rowHeaderWidth && x < viewport.width) {
      ctx.beginPath();
      ctx.moveTo(x, CONFIG.cellHeight - 2);
      ctx.lineTo(x + colWidth, CONFIG.cellHeight - 2);
      ctx.stroke();
    }

    //Row header underline
    const y = this.getRowY(selected.row, scrollY);
    const rowHeight = this.rowManager.get(selected.row);

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
      const colWidth = this.colManager.get(col);

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
      const rowHeight = this.rowManager.get(row);

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