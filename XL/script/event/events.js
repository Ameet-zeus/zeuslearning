import { CONFIG } from "../config.js";
import { ResizeHelper } from "../input/resize.js";

export class KeyboardEvents {
  constructor(inputManager) {
    this.inputManager = inputManager;
    this.attach();
  }

  attach() {
    this.inputManager.editor.addEventListener("keydown", (e) => {
      e.stopPropagation();

      if (e.key === "Escape") {
        e.preventDefault();
        this.inputManager.hideEditor();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const sel = this.inputManager.selectionManager.getSelection();
        const val = this.inputManager.editor.value;

        if (sel && sel.type === 'cell') {
          this.inputManager.data.set(sel.row, sel.col, val);
        }

        this.inputManager.hideEditor();

        if (sel && sel.type === 'cell') {
          let newRow = sel.row + 1;
          if (newRow < CONFIG.numRows) {
            this.inputManager.selectCell(newRow, sel.col, false);
            this.inputManager.viewport.scrollCellIntoView(newRow, sel.col, this.inputManager.renderer);
          }
        }
        this.inputManager.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
        return;
      }
    });

    document.addEventListener("keydown", (e) => {
      if (this.inputManager.editor.style.display !== "none") {
        return;
      }

      const sel = this.inputManager.selectionManager.getSelection();
      if (sel && sel.type === "cell") {
        let { row, col } = sel;
        let changed = false;

        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            if (row > 0) {
              row--;
              changed = true;
            }
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (row < CONFIG.numRows - 1) {
              row++;
              changed = true;
            }
            break;
          case 'ArrowLeft':
            e.preventDefault();
            if (col > 0) {
              col--;
              changed = true;
            }
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (col < CONFIG.numCols - 1) {
              col++;
              changed = true;
            }
            break;
          case 'Tab':
            e.preventDefault();
            if (e.shiftKey) {
              if (col > 0) {
                col--;
                changed = true;
              }
            } else {
              if (col < CONFIG.numCols - 1) {
                col++;
                changed = true;
              }
            }
            break;
          case 'Enter':
            e.preventDefault();
            this.inputManager.showEditor(row, col);
            const editor = this.inputManager.editor;
            if (editor) {
              const val = editor.value;
              editor.setSelectionRange(val.length, val.length);
            }
            return;
          case 'Escape':
            this.inputManager.hideEditor();
            break;
          case 'F2':
            e.preventDefault();
            this.inputManager.showEditor(row, col);
            return;
          default:
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
              this.inputManager.showEditor(row, col, e.key);
              e.preventDefault();
            }
            return;
        }

        if (changed) {
          this.inputManager.selectCell(row, col, false);
          this.inputManager.viewport.scrollCellIntoView(row, col, this.inputManager.renderer);
        }
      }
    });
  }
}

export class PointerEvents {
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

  attach() {
    const wrapper = document.getElementById("wrapper");
    const canvas = this.canvas;

    wrapper.addEventListener("click", (e) => {
      if (this.dragging) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const colEdge = this.resizeHelper.getColEdge(x, y);
      const rowEdge = this.resizeHelper.getRowEdge(x, y);

      if (colEdge !== -1 || rowEdge !== -1) {
        this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
        return;
      }

      const result = this.inputManager.getCellFromMouse(x, y);

      if (this.inputManager.editor.style.display !== "none") {
        const sel = this.inputManager.selectionManager.getSelection();
        const val = this.inputManager.editor.value;
        if (sel && sel.type === 'cell') {
          this.inputManager.data.set(sel.row, sel.col, val);
        }
        this.inputManager.hideEditor();
      }

      if (result.type === 'cell') {
        this.inputManager.selectionManager.selectCell(result.row, result.col, false);
      } else if (result.type === 'row') {
        this.inputManager.selectionManager.selectRow(result.row);
      } else if (result.type === 'column') {
        this.inputManager.selectionManager.selectColumn(result.col);
      } else if (result.type === 'corner') {
        this.inputManager.selectionManager.selectAll();
      } else {
        this.inputManager.selectionManager.clearSelection();
      }
      this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
    });

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
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const col = this.resizeHelper.getColEdge(x, y);
      const row = this.resizeHelper.getRowEdge(x, y);

      if (col !== -1 && col >= 0) {
        this.resizing = {
          type: "col",
          index: col,
          start: this.colManager.get(col),
          startPos: x
        };
        e.preventDefault();
        return;
      } else if (row !== -1 && row >= 0) {
        this.resizing = {
          type: "row",
          index: row,
          start: this.rowManager.get(row),
          startPos: y
        };
        e.preventDefault();
        return;
      }

      const result = this.inputManager.getCellFromMouse(x, y);
      if (result) {
        this.dragging = {
          startType: result.type,
          startRow: result.row,
          startCol: result.col,
          currentRow: result.row,
          currentCol: result.col,
          hasMoved: false
        };

        canvas.setPointerCapture(e.pointerId);
        e.preventDefault();
      }
    });

    document.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.resizing) {
        if (this.resizing.type === "col") {
          let newWidth = this.resizing.start + (x - this.resizing.startPos);
          newWidth = Math.max(newWidth, 20);
          this.colManager.set(this.resizing.index, newWidth);
        } else if (this.resizing.type === "row") {
          let newHeight = this.resizing.start + (y - this.resizing.startPos);
          newHeight = Math.max(newHeight, 15);
          this.rowManager.set(this.resizing.index, newHeight);
        }
        this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
        e.preventDefault();
        return;
      }

      if (this.dragging) {
        const result = this.inputManager.getCellFromMouse(x, y);
        if (result) {
          if (
            result.row !== this.dragging.startRow ||
            result.col !== this.dragging.startCol
          ) {
            this.dragging.hasMoved = true;
          }
          this.dragging.currentRow = result.row;
          this.dragging.currentCol = result.col;
          this.dragging.currentRow = result.row;
          this.dragging.currentCol = result.col;

          if (this.dragging.startType === 'cell' && result.type === 'cell') {
            this.inputManager.selectionManager.selectCellRange(
              this.dragging.startRow,
              this.dragging.startCol,
              result.row,
              result.col
            );
          } else if (this.dragging.startType === 'row' &&
            (result.type === 'row' || result.type === 'cell')) {
            const endRow = result.type === 'row' ? result.row : result.row;
            this.inputManager.selectionManager.selectRow(this.dragging.startRow, endRow);
          } else if (this.dragging.startType === 'column' &&
            (result.type === 'column' || result.type === 'cell')) {
            const endCol = result.type === 'column' ? result.col : result.col;
            this.inputManager.selectionManager.selectColumn(this.dragging.startCol, endCol);
          }
        }
        e.preventDefault();
        return;
      }

      const col = this.resizeHelper.getColEdge(x, y);
      const row = this.resizeHelper.getRowEdge(x, y);

      if (col !== -1) {
        canvas.style.cursor = "col-resize";
      } else if (row !== -1) {
        canvas.style.cursor = "row-resize";
      } else {
        canvas.style.cursor = "default";
      }
    });

    document.addEventListener("pointerup", (e) => {
      if (this.resizing) {
        this.resizing = null;
        canvas.style.cursor = "default";
        return;
      }

      if (this.dragging) {
        const wasDrag = this.dragging.hasMoved;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const colEdge = this.resizeHelper.getColEdge(x, y);
        const rowEdge = this.resizeHelper.getRowEdge(x, y);

        this.dragging = null;
        canvas.style.cursor = "default";

        if (!wasDrag && colEdge === -1 && rowEdge === -1) {
          const result = this.inputManager.getCellFromMouse(x, y);

          if (this.inputManager.editor.style.display !== "none") {
            const sel = this.inputManager.selectionManager.getSelection();
            const val = this.inputManager.editor.value;
            if (sel && sel.type === 'cell') {
              this.inputManager.data.set(sel.row, sel.col, val);
            }
            this.inputManager.hideEditor();
          }

          if (result && result.type === 'cell') {
            this.inputManager.selectionManager.selectCell(result.row, result.col, false);
          } else if (result && result.type === 'row') {
            this.inputManager.selectionManager.selectRow(result.row);
          } else if (result && result.type === 'column') {
            this.inputManager.selectionManager.selectColumn(result.col);
          } else if (result && result.type === 'corner') {
            this.inputManager.selectionManager.selectAll();
          } else {
            this.inputManager.selectionManager.clearSelection();
          }

          this.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
        }
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

export class ScrollEvents {
  constructor(inputManager, viewport, renderer) {
    this.inputManager = inputManager;
    this.viewport = viewport;
    this.renderer = renderer;
    this.attach();
  }

  attach() {
    const wrapper = document.getElementById('wrapper');
    wrapper.addEventListener('scroll', () => {
      this.viewport.scrollX = wrapper.scrollLeft;
      this.viewport.scrollY = wrapper.scrollTop;

      const sel = this.inputManager.selectionManager.getSelection();
      this.renderer.drawGrid(sel);

      if (this.inputManager.editor.style.display !== "none" &&
        sel && sel.type === 'cell' && sel.row != null && sel.col != null) {
        this.inputManager.positionEditor(sel.row, sel.col);
      }
    });
  }
}


export class ResizeEvents {
  constructor(inputManager, viewport, renderer, canvas, ctx) {
    this.inputManager = inputManager;
    this.viewport = viewport;
    this.renderer = renderer;
    this.canvas = canvas;
    this.ctx = ctx;
    this.attach();
  }

  attach() {
    window.addEventListener('resize', () => {
      this.viewport.resizeCanvas(this.canvas, this.ctx);
      this.renderer.calculateHeaderWidth();

      const sel = this.inputManager.selectionManager.getSelection();
      this.renderer.drawGrid(sel);
      if (this.inputManager.editor.style.display !== "none" &&
        sel && sel.type === 'cell' && sel.row != null && sel.col != null) {
        this.inputManager.positionEditor(sel.row, sel.col);
      }
    });
  }
}

export class EventsManager {
  constructor(inputManager, viewport, renderer, canvas, ctx, rowManager, colManager) {
    this.keyboard = new KeyboardEvents(inputManager);
    this.pointer = new PointerEvents(inputManager, viewport, renderer, rowManager, colManager, canvas);
    this.scroll = new ScrollEvents(inputManager, viewport, renderer);
    this.resize = new ResizeEvents(inputManager, viewport, renderer, canvas, ctx);
  }
}