export class Renderer {
  /**
   * 
   * @param {*} ctx gets and stores the instance of canvas
   * @param {*} renderer renders and draws the canvas
   * @param {*} data manages data storage and retrieval
   */
  constructor(ctx, viewport, data) {
    this.data = data;
    this.ctx = ctx;
    this.viewport = viewport;
    this.cellWidth = 100;
    this.cellHeight = 30;
    this.numCols = 1000;
    this.numsRows = 100000;
    this.headerColor = "#f5f5f5";
    this.headerTextColor = "black";
    this.selectedBorderColor = "#137e43";
    this.headerHighlightColor = "#137e43";
    this.fullColRowHighlightColor = "#caead8";
    this.fullSheetHighlightColor = "#caead8";
    this.gridColor = "#d0d7de";
    this.cellTextColor = "#222";
    this.padding = 8;
    this.dpr = window.devicePixelRatio || 1;
    this.calculateHeaderWidth();
  }

  alignToPixel(coord) {
    return Math.floor(coord * this.dpr) / this.dpr + 0.1;
  }

  calculateHeaderWidth() {
    this.ctx.font = "12px sans-serif";
    const text = this.numsRows.toString();
    const width = this.ctx.measureText(text).width;
    this.rowHeaderWidth = Math.ceil(width + this.padding * 2);
  }

  drawGrid(selected = null) {
    const { ctx } = this;
    const { scrollX, scrollY, width, height } = this.viewport;
    const startCol = Math.floor(scrollX / this.cellWidth);
    const startRow = Math.floor(scrollY / this.cellHeight);
    const endCol = Math.min(
      this.numCols - 1,
      Math.ceil((scrollX + width - this.rowHeaderWidth) / this.cellWidth)
    );
    const endRow = Math.min(
      this.numsRows - 1,
      Math.ceil((scrollY + height - this.cellHeight) / this.cellHeight)
    );

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = this.gridColor;
    ctx.lineWidth = 1;

    if (selected?.type === 'col') {
      const x = selected.col * this.cellWidth - scrollX + this.rowHeaderWidth;
      ctx.fillStyle = this.fullColRowHighlightColor;
      ctx.fillRect(x, 0, this.cellWidth, height);
    }
    if (selected?.type === 'row') {
      const y = selected.row * this.cellHeight - scrollY + this.cellHeight;
      ctx.fillStyle = this.fullColRowHighlightColor;
      ctx.fillRect(0, y, width, this.cellHeight);
    }
    if (selected?.type === 'all') {
      ctx.fillStyle = this.fullSheetHighlightColor;
      ctx.fillRect(0, 0, width, height);
    }

    for (let col = startCol; col <= endCol; col++) {
      const x = this.alignToPixel(this.rowHeaderWidth + col * this.cellWidth - scrollX);
      ctx.beginPath();
      ctx.moveTo(x, this.cellHeight);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let row = startRow; row <= endRow; row++) {
      const y = this.alignToPixel(this.cellHeight + row * this.cellHeight - scrollY);
      ctx.beginPath();
      ctx.moveTo(this.rowHeaderWidth, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const x = col * this.cellWidth - scrollX + this.rowHeaderWidth;
        const y = row * this.cellHeight - scrollY + this.cellHeight;

        const val = this.data?.get(row, col);

        if (val) {
          ctx.fillStyle = this.cellTextColor;
          ctx.font = "12px Arial";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(val, x + 5, y + this.cellHeight / 2);
        }

        if (selected && selected.type === 'cell' && selected.row === row && selected.col === col) {
          ctx.strokeStyle = this.selectedBorderColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, this.cellWidth, this.cellHeight);
        }
      }
    }

    this.drawHeaders(startCol, endCol, startRow, endRow);

    if (selected) {
      this.drawHeaderHighlight(selected);
    }
  }

  drawHeaderHighlight(selected) {
    const { ctx, cellWidth, cellHeight, rowHeaderWidth, viewport } = this;
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = this.headerHighlightColor;

    if (selected.type === 'cell') {
      const x = selected.col * cellWidth - viewport.scrollX + rowHeaderWidth;
      const y = selected.row * cellHeight - viewport.scrollY + cellHeight;
      ctx.fillRect(x, 0, cellWidth, cellHeight);
      ctx.fillRect(0, y, rowHeaderWidth, cellHeight);
      ctx.fillStyle = 'white';
      const colLabel = this.getColumnLabel(selected.col);
      ctx.fillText(colLabel, x + cellWidth / 2, cellHeight / 2);
      ctx.fillText(selected.row + 1, rowHeaderWidth / 2, y + cellHeight / 2);
    }
    if (selected.type === 'row') {
      const y = selected.row * cellHeight - viewport.scrollY + cellHeight;
      ctx.fillRect(0, y, rowHeaderWidth, cellHeight);
      ctx.fillStyle = 'white';
      ctx.fillText(selected.row + 1, rowHeaderWidth / 2, y + cellHeight / 2);
    }
    if (selected.type === 'col') {
      const x = selected.col * cellWidth - viewport.scrollX + rowHeaderWidth;
      ctx.fillRect(x, 0, cellWidth, cellHeight);
      ctx.fillStyle = 'white';
      const colLabel = this.getColumnLabel(selected.col);
      ctx.fillText(colLabel, x + cellWidth / 2, cellHeight / 2);
    }
    if (selected.type === 'all') {
      ctx.fillRect(0, 0, rowHeaderWidth, cellHeight);
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
  }

  drawHeaders(startCol, endCol, startRow, endRow) {
    const { ctx, cellWidth, cellHeight, viewport } = this;

    ctx.fillStyle = this.headerColor;
    ctx.fillRect(this.rowHeaderWidth, 0, viewport.width, cellHeight);
    ctx.fillRect(0, this.cellHeight, this.rowHeaderWidth, viewport.height);

    ctx.fillStyle = this.headerTextColor;
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let col = startCol; col <= endCol; col++) {
      const x = this.rowHeaderWidth + col * cellWidth - viewport.scrollX;
      const label = this.getColumnLabel(col);
      ctx.fillText(label, x + cellWidth / 2, cellHeight / 2);

      const xdpi = this.alignToPixel(x);
      ctx.beginPath();
      ctx.moveTo(xdpi, 0);
      ctx.lineTo(xdpi, cellHeight);
      ctx.strokeStyle = this.gridColor;
      ctx.stroke();
    }

    for (let row = startRow; row <= endRow; row++) {
      const y = this.cellHeight + row * cellHeight - viewport.scrollY;
      ctx.fillText(row + 1, this.rowHeaderWidth / 2, y + cellHeight / 2);

      const ydpi = this.alignToPixel(y);
      ctx.beginPath();
      ctx.moveTo(0, ydpi);
      ctx.lineTo(this.rowHeaderWidth, ydpi);
      ctx.strokeStyle = this.gridColor;
      ctx.stroke();
    }
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, this.rowHeaderWidth, this.cellHeight);
    ctx.strokeStyle = this.gridColor;
    ctx.strokeRect(0, 0, this.rowHeaderWidth, this.cellHeight);
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
