import { CONFIG } from "../config.js";
import { ResizeHelper } from "../input/resizer.js";
import { CellSelectionStrategy } from "./strategies/CellSelectionStrategy.js";
import { RowSelectionStrategy } from "./strategies/RowSelectionStrategy.js";
import { ColumnSelectionStrategy } from "./strategies/ColumnSelectionStrategy.js";
import { CornerSelectionStrategy } from "./strategies/CornerSelectionStrategy.js";
import { RowResizeStrategy } from "./strategies/RowResizeStrategy.js";
import { ColumnResizeStrategy } from "./strategies/ColumnResizeStrategy.js";
import { CursorStrategy } from "./strategies/CursorStrategy.js";

export class PointerEvents {
  constructor(inputManager, viewport, renderer, rowManager, colManager, canvas) {
    this.inputManager = inputManager;
    this.viewport = viewport;
    this.renderer = renderer;
    this.rowManager = rowManager;
    this.colManager = colManager;
    this.canvas = canvas || document.getElementById("spreadsheet-canvas");
    this.resizeHelper = new ResizeHelper(renderer, viewport);
    this.strategies = [
      new RowResizeStrategy(rowManager, renderer, this.canvas, this.resizeHelper),
      new ColumnResizeStrategy(colManager, renderer, this.canvas, this.resizeHelper),
      new CellSelectionStrategy(inputManager, renderer, this.canvas),
      new RowSelectionStrategy(inputManager, renderer, this.canvas),
      new ColumnSelectionStrategy(inputManager, renderer, this.canvas),
      new CornerSelectionStrategy({ inputManager, canvas: this.canvas }),
    ];
    this.cursorStrategy = new CursorStrategy(renderer, this.canvas, this.resizeHelper);
    this.activeStrategy = null;
    this.attach();
  }

  attach() {
    const wrapper = document.getElementById("wrapper");
    const canvas = this.canvas;


    wrapper.addEventListener("dblclick", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const result = this.inputManager.getCellFromMouse(x, y);
      if (result && result.type === 'cell') {
        this.inputManager.selectCell(result.row, result.col, true);
      }
    });

    canvas.addEventListener("pointerdown", (e) => {
      // If a drag is already in progress, ignore new pointerdown
      if (this.activeStrategy && this.activeStrategy.dragging) return;

      // Hide editor and commit value if open (like pointe.js)
      if (this.inputManager.editor && this.inputManager.editor.style.display !== "none") {
        const sel = this.inputManager.selectionManager.getSelection();
        const val = this.inputManager.editor.value;
        if (sel && sel.type === 'cell') {
          this.inputManager.data.set(sel.row, sel.col, val);
          if (window.updateStatusBar) window.updateStatusBar(sel, this.inputManager.data);
        }
        this.inputManager.hideEditor();
      }

      for (const strategy of this.strategies) {
        if (strategy.hitTest && strategy.hitTest(e)) {
          this.activeStrategy = strategy;
          if (strategy.onPointerDown) strategy.onPointerDown(e);
          return;
        }
      }
      this.activeStrategy = null;
    });

    document.addEventListener("pointermove", (e) => {
      if (this.activeStrategy && this.activeStrategy.onPointerMove) {
        this.activeStrategy.onPointerMove(e);
      } else {
        this.cursorStrategy.onPointerMove(e);
      }
    });

    document.addEventListener("pointerup", (e) => {
      if (this.activeStrategy && this.activeStrategy.onPointerUp) {
        this.activeStrategy.onPointerUp(e);
        this.activeStrategy = null;
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
