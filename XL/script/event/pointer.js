import { CONFIG } from "../config.js";
import { ResizeHelper } from "../input/resizer.js";

export class PointerEvents {
  /**
   * @param {*} inputManager to manage user inputs
   * @param {*} viewport to manage the viewport
   * @param {*} renderer to render the grid
   * @param {*} rowManager to manage row heights
   * @param {*} colManager to manage column widths
   * @param {*} canvas to draw the grid
   */
  constructor(inputManager, viewport, renderer, rowManager, colManager, canvas) {
    this.inputManager = inputManager;
    this.viewport = viewport;
    this.renderer = renderer;
    this.rowManager = rowManager;
    this.colManager = colManager;
    this.canvas = canvas || document.getElementById("spreadsheet-canvas");
    this.resizing = null;
    this.dragging = null;
    this.resizeHelper = new ResizeHelper(renderer, viewport);
    this.attach();
  }

  /**
   * Attaches pointer event listeners to the canvas and wrapper.
   */
  attach() {
    const wrapper = document.getElementById("wrapper");
    const canvas = this.canvas;

    wrapper.addEventListener("dblclick", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const result = this.inputManager.getCellFromMouse(x, y);

      if (result.type === 'cell') {
        this.inputManager.selectCell(result.row, result.col, true);
      }
    });

    canvas.addEventListener("pointerdown", (e) => {
      if (this.dragging) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const col = this.resizeHelper.getColEdge(x, y);
      const row = this.resizeHelper.getRowEdge(x, y);

      if (col !== -1 && col >= 0) {
        this.resizing = { type: "col", index: col, start: this.colManager.get(col), startPos: x };
        e.preventDefault();
        return;
      } else if (row !== -1 && row >= 0) {
        this.resizing = { type: "row", index: row, start: this.rowManager.get(row), startPos: y };
        e.preventDefault();
        return;
      }

      if (this.inputManager.editor.style.display !== "none") {
        const sel = this.inputManager.selectionManager.getSelection();
        const val = this.inputManager.editor.value;
        if (sel && sel.type === 'cell') {
          this.inputManager.data.set(sel.row, sel.col, val);
          if (window.updateStatusBar) window.updateStatusBar(sel, this.inputManager.data);
        }
        this.inputManager.hideEditor();
      }

      const result = this.inputManager.getCellFromMouse(x, y);
      if (result) {
        if (result.type === 'cell') {
          this.inputManager.selectionManager.selectCell(result.row, result.col, false);
          this.inputManager.positionEditor(result.row, result.col);
        } else if (result.type === 'row') {
          this.inputManager.selectionManager.selectRow(result.row);
          this.inputManager.positionEditor(result.row, 0);
        } else if (result.type === 'column') {
          this.inputManager.selectionManager.selectColumn(result.col);
          this.inputManager.positionEditor(0, result.col);
        } else if (result.type === 'corner') {
          this.inputManager.selectionManager.selectAll();
          this.inputManager.positionEditor(0, 0);
        } else {
          this.inputManager.selectionManager.clearSelection();
          this.inputManager.hideEditor();
        }
      }

      if (result) {
        this.dragging = {
          startType: result.type,
          startRow: result.row,
          startCol: result.col,
          endRow: result.row,
          endCol: result.col,
          hasMoved: false,
          anchorRow: result.type === 'row' ? result.row : (result.type === 'column' ? 0 : result.row),
          anchorCol: result.type === 'column' ? result.col : (result.type === 'row' ? 0 : result.col)
        };
        e.preventDefault();
      }
    });

    document.addEventListener("pointermove", (e) => {
      if (this.resizing) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.resizing.type === "col") {
          const delta = x - this.resizing.startPos;
          let newWidth = this.resizing.start + delta;
          newWidth = Math.max(20, newWidth);
          this.colManager.set(this.resizing.index, newWidth);
          this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
          this.canvas.style.cursor = "ew-resize";
        } else if (this.resizing.type === "row") {
          const delta = y - this.resizing.startPos;
          let newHeight = this.resizing.start + delta;
          newHeight = Math.max(20, newHeight);
          this.rowManager.set(this.resizing.index, newHeight);
          this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
          this.canvas.style.cursor = "ns-resize";
        }
        return;
      }

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const colEdge = this.resizeHelper.getColEdge(x, y);
      const rowEdge = this.resizeHelper.getRowEdge(x, y);

      if (colEdge !== -1 && y < CONFIG.cellHeight) {
        this.canvas.style.cursor = "ew-resize";
      } else if (rowEdge !== -1 && x < this.renderer.rowHeaderWidth) {
        this.canvas.style.cursor = "ns-resize";
      } else if (y < CONFIG.cellHeight && x > this.renderer.rowHeaderWidth) {
        this.canvas.style.cursor = `url('/svg/arrow-down.svg') 8 8, pointer`;
      } else if (x < this.renderer.rowHeaderWidth && y > CONFIG.cellHeight) {
        this.canvas.style.cursor = `url('/svg/arrow-right.svg') 8 8, pointer`;
      } else {
        this.canvas.style.cursor = "cell";
      }

      if (!this.dragging) return;

      const result = this.inputManager.getCellFromMouse(x, y);

      if (result && (
        (result.type === 'cell' && typeof result.row === "number" && typeof result.col === "number") ||
        (result.type === 'row' && typeof result.row === "number") ||
        (result.type === 'column' && typeof result.col === "number")
      )) {
        this.dragging.hasMoved = true;
        this.dragging.endRow = result.row;
        this.dragging.endCol = result.col;

        if (this.dragging.startType === 'cell' && result.type === 'cell') {
          this.inputManager.selectionManager.selectCellRange(
            this.dragging.startRow,
            this.dragging.startCol,
            result.row,
            result.col
          );
          this.inputManager.positionEditor(this.dragging.anchorRow, this.dragging.anchorCol);
        } else if (this.dragging.startType === 'row' &&
          (result.type === 'row' || result.type === 'cell')) {
          this.inputManager.selectionManager.selectRow(
            this.dragging.startRow,
            result.row
          );
          this.inputManager.positionEditor(this.dragging.anchorRow, 0);
        } else if (this.dragging.startType === 'column' &&
          (result.type === 'column' || result.type === 'cell')) {
          this.inputManager.selectionManager.selectColumn(
            this.dragging.startCol,
            result.col
          );
          this.inputManager.positionEditor(0, this.dragging.anchorCol);
        }
        this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
      }
    });

    document.addEventListener("pointerup", (e) => {
      if (this.resizing) {
        this.resizing = null;
        return;
      }

      if (this.dragging) {
        if (this.dragging.hasMoved) {
          if (this.dragging.startType === 'cell') {
            this.inputManager.positionEditor(this.dragging.anchorRow, this.dragging.anchorCol);
          } else if (this.dragging.startType === 'row') {
            this.inputManager.positionEditor(this.dragging.anchorRow, 0);
          } else if (this.dragging.startType === 'column') {
            this.inputManager.positionEditor(0, this.dragging.anchorCol);
          }
        }

        this.dragging = null;
        this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
      }
    });

    canvas.addEventListener('wheel', (e) => {
      const wrapper = document.getElementById('wrapper');
      let deltaX = e.deltaX;
      let deltaY = e.deltaY;
      if (e.shiftKey && deltaX === 0 && deltaY !== 0) {
        deltaX = deltaY;
        deltaY = 0;
      }
      wrapper.scrollTop += deltaY;
      wrapper.scrollLeft += deltaX;
    }, { passive: false });
  }
}