import { CONFIG } from "./config.js";

export class Renderer {
  constructor(ctx, viewport, data) {
    this.data = data;
    this.ctx = ctx;
    this.viewport = viewport;
    this.dpr = window.devicePixelRatio || 1;
    this.calculateHeaderWidth();
  }

  calculateHeaderWidth() {
    this.ctx.font = CONFIG.font;
    const text = CONFIG.numRows.toString();
    const width = this.ctx.measureText(text).width;
    this.rowHeaderWidth = Math.ceil(width + CONFIG.padding * 2);
  }

  drawGrid(selected = null) {
    const { ctx } = this;
    const { scrollX, scrollY, width, height } = this.viewport;
    const startCol = Math.floor(scrollX / CONFIG.cellWidth);
    const startRow = Math.floor(scrollY / CONFIG.cellHeight);
    const endCol = Math.min(
      CONFIG.numCols - 1,
      Math.ceil((scrollX + width - this.rowHeaderWidth) / CONFIG.cellWidth)
    );
    const endRow = Math.min(
      CONFIG.numRows - 1,
      Math.ceil((scrollY + height - CONFIG.cellHeight) / CONFIG.cellHeight)
    );

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = CONFIG.gridColor;
    ctx.lineWidth = 1;

    if (selected?.type === 'col') {
      const x = selected.col * CONFIG.cellWidth - scrollX + this.rowHeaderWidth;
      ctx.fillStyle = CONFIG.fullColRowHighlightColor;
      ctx.fillRect(x, 0, CONFIG.cellWidth, height);
    }
    if (selected?.type === 'row') {
      const y = selected.row * CONFIG.cellHeight - scrollY + CONFIG.cellHeight;
      ctx.fillStyle = CONFIG.fullColRowHighlightColor;
      ctx.fillRect(0, y, width, CONFIG.cellHeight);
    }
    if (selected?.type === 'all') {
      ctx.fillStyle = CONFIG.fullSheetHighlightColor;
      ctx.fillRect(0, 0, width, height);
    }

    for (let col = startCol; col <= endCol; col++) {
      const x = this.viewport.alignToPixel(this.rowHeaderWidth + col * CONFIG.cellWidth - scrollX);
      ctx.beginPath();
      ctx.moveTo(x, CONFIG.cellHeight);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let row = startRow; row <= endRow; row++) {
      const y = this.viewport.alignToPixel(CONFIG.cellHeight + row * CONFIG.cellHeight - scrollY);
      ctx.beginPath();
      ctx.moveTo(this.rowHeaderWidth, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const x = col * CONFIG.cellWidth - scrollX + this.rowHeaderWidth;
        const y = row * CONFIG.cellHeight - scrollY + CONFIG.cellHeight;

        const val = this.data?.get(row, col);

        if (val) {
          ctx.fillStyle = CONFIG.cellTextColor;
          ctx.font = CONFIG.font;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(val, x + 5, y + CONFIG.cellHeight / 2);
        }

        if (selected && selected.type === 'cell' && selected.row === row && selected.col === col) {
          ctx.strokeStyle = CONFIG.selectedBorderColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, CONFIG.cellWidth, CONFIG.cellHeight);
        }
      }
    }

    this.drawHeaders(startCol, endCol, startRow, endRow);

    if (selected) {
      this.drawHeaderHighlight(selected);
    }
  }

  drawHeaderHighlight(selected) {
    const { ctx, rowHeaderWidth, viewport } = this;
    ctx.font = "bold " + CONFIG.headerFont;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = CONFIG.headerHighlightColor;

    if (selected.type === 'cell') {
      const x = selected.col * CONFIG.cellWidth - viewport.scrollX + rowHeaderWidth;
      const y = selected.row * CONFIG.cellHeight - viewport.scrollY + CONFIG.cellHeight;
      ctx.fillRect(x, 0, CONFIG.cellWidth, CONFIG.cellHeight);
      ctx.fillRect(0, y, rowHeaderWidth, CONFIG.cellHeight);
      ctx.fillStyle = 'white';
      const colLabel = this.getColumnLabel(selected.col);
      ctx.fillText(colLabel, x + CONFIG.cellWidth / 2, CONFIG.cellHeight / 2);
      ctx.fillText(selected.row + 1, rowHeaderWidth / 2, y + CONFIG.cellHeight / 2);
    }
    if (selected.type === 'row') {
      const y = selected.row * CONFIG.cellHeight - viewport.scrollY + CONFIG.cellHeight;
      ctx.fillRect(0, y, rowHeaderWidth, CONFIG.cellHeight);
      ctx.fillStyle = 'white';
      ctx.fillText(selected.row + 1, rowHeaderWidth / 2, y + CONFIG.cellHeight / 2);
    }
    if (selected.type === 'col') {
      const x = selected.col * CONFIG.cellWidth - viewport.scrollX + rowHeaderWidth;
      ctx.fillRect(x, 0, CONFIG.cellWidth, CONFIG.cellHeight);
      ctx.fillStyle = 'white';
      const colLabel = this.getColumnLabel(selected.col);
      ctx.fillText(colLabel, x + CONFIG.cellWidth / 2, CONFIG.cellHeight / 2);
    }
    if (selected.type === 'all') {
      ctx.fillRect(0, 0, rowHeaderWidth, CONFIG.cellHeight);
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    //Redraw top left box
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, rowHeaderWidth, CONFIG.cellHeight);
    ctx.strokeStyle = CONFIG.gridColor;
    ctx.strokeRect(0, 0, rowHeaderWidth, CONFIG.cellHeight);
  }

  drawHeaders(startCol, endCol, startRow, endRow) {
    const { ctx, viewport } = this;

    ctx.fillStyle = CONFIG.headerColor;
    ctx.fillRect(this.rowHeaderWidth, 0, viewport.width, CONFIG.cellHeight);
    ctx.fillRect(0, CONFIG.cellHeight, this.rowHeaderWidth, viewport.height);

    ctx.fillStyle = CONFIG.headerTextColor;
    ctx.font = CONFIG.headerFont;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let col = startCol; col <= endCol; col++) {
      const x = this.rowHeaderWidth + col * CONFIG.cellWidth - viewport.scrollX;
      const label = this.getColumnLabel(col);
      ctx.fillText(label, x + CONFIG.cellWidth / 2, CONFIG.cellHeight / 2);

      const xdpi = this.viewport.alignToPixel(x);
      ctx.beginPath();
      ctx.moveTo(xdpi, 0);
      ctx.lineTo(xdpi, CONFIG.cellHeight);
      ctx.strokeStyle = CONFIG.gridColor;
      ctx.stroke();
    }

    for (let row = startRow; row <= endRow; row++) {
      const y = CONFIG.cellHeight + row * CONFIG.cellHeight - viewport.scrollY;
      ctx.fillText(row + 1, this.rowHeaderWidth / 2, y + CONFIG.cellHeight / 2);

      const ydpi = this.viewport.alignToPixel(y);
      ctx.beginPath();
      ctx.moveTo(0, ydpi);
      ctx.lineTo(this.rowHeaderWidth, ydpi);
      ctx.strokeStyle = CONFIG.gridColor;
      ctx.stroke();
    }
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, this.rowHeaderWidth, CONFIG.cellHeight);
    ctx.strokeStyle = CONFIG.gridColor;
    ctx.strokeRect(0, 0, this.rowHeaderWidth, CONFIG.cellHeight);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
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