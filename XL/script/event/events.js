import { CONFIG } from "../config.js";
import { getColEdge, getRowEdge } from "../input/resize.js";

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
            // Handle single character input
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
  constructor(inputManager, viewport, renderer) {
    this.inputManager = inputManager;
    this.viewport = viewport;
    this.renderer = renderer;
    this.attach();
  }

  attach() {
    const wrapper = document.getElementById("wrapper");
    const canvas = document.getElementById("spreadsheet-canvas");

    wrapper.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const result = this.inputManager.getCellFromMouse(x, y);

      this.inputManager.hideEditor();

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

export class MouseEvents {
  constructor(canvas, renderer, viewport, rowManager, colManager) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.viewport = viewport;
    this.rowManager = rowManager;
    this.colManager = colManager;
    this.resizing = null;
    this.attach();
  }

  attach() {
    this.canvas.addEventListener("mousemove", (e) => {
      if (this.resizing) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const col = getColEdge(x, y, this.renderer, this.viewport);
      const row = getRowEdge(x, y, this.renderer, this.viewport);

      if (col !== -1) {
        this.canvas.style.cursor = "col-resize";
      } else if (row !== -1) {
        this.canvas.style.cursor = "row-resize";
      } else {
        this.canvas.style.cursor = "default";
      }
    });

    this.canvas.addEventListener("mousedown", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const col = getColEdge(x, y, this.renderer, this.viewport);
      const row = getRowEdge(x, y, this.renderer, this.viewport);

      if (col !== -1 && col >= 0) {
        this.resizing = {
          type: "col",
          index: col,
          start: this.colManager.get(col),
          startPos: x
        };
        e.preventDefault();
      } else if (row !== -1 && row >= 0) {
        this.resizing = {
          type: "row",
          index: row,
          start: this.rowManager.get(row),
          startPos: y
        };
        e.preventDefault();
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (!this.resizing) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.resizing.type === "col") {
        let newWidth = this.resizing.start + (x - this.resizing.startPos);
        newWidth = Math.max(newWidth, 20);
        this.colManager.set(this.resizing.index, newWidth);
        this.renderer.drawGrid(this.renderer.viewport.selectionManager?.getSelection());
      } else if (this.resizing.type === "row") {
        let newHeight = this.resizing.start + (y - this.resizing.startPos);
        newHeight = Math.max(newHeight, 15);
        this.rowManager.set(this.resizing.index, newHeight);
        this.renderer.drawGrid(this.renderer.viewport.selectionManager?.getSelection());
      }

      e.preventDefault();
    });

    document.addEventListener("mouseup", (e) => {
      if (this.resizing) {
        this.resizing = null;
        this.canvas.style.cursor = "default";
      }
    });
  }
}

export class EventsManager {
  constructor(inputManager, viewport, renderer, canvas, ctx, rowManager, colManager) {
    this.keyboard = new KeyboardEvents(inputManager);
    this.pointer = new PointerEvents(inputManager, viewport, renderer);
    this.scroll = new ScrollEvents(inputManager, viewport, renderer);
    this.resize = new ResizeEvents(inputManager, viewport, renderer, canvas, ctx);
    this.mouse = new MouseEvents(canvas, renderer, viewport, rowManager, colManager);
  }
}