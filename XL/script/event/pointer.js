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
  /**
   * Initializes the PointerEvents class to handle user interactions with the spreadsheet.
   * @param {*} inputManager to manage user input
   * @param {*} viewport to manage the viewport
   * @param {*} renderer to render the grid
   * @param {*} rowManager manages row operations
   * @param {*} colManager manages column operations
   * @param {*} canvas canvas element for rendering
   */
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

  /**
   * Attaches event listeners to the wrapper and canvas elements for pointer events.
   */
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
      if (this.activeStrategy?.dragging) return;

      if (this.inputManager.editor?.style.display !== "none") {
        const sel = this.inputManager.selectionManager.getSelection();
        const val = this.inputManager.editor.value;
        if (sel?.type === 'cell') {
          if (window.CommandManagerInstance && window.EditCellCommand) {
            window.CommandManagerInstance.executeCommand(new window.EditCellCommand(this.inputManager.data, sel.row, sel.col, val));
          } else {
            this.inputManager.data.set(sel.row, sel.col, val);
          }
          window.updateStatusBar?.(sel, this.inputManager.data);
        }
        this.inputManager.hideEditor();
      }

      for (const strategy of this.strategies) {
        if (strategy.hitTest?.(e)) {
          this.activeStrategy = strategy;
          strategy.onPointerDown?.(e);
          strategy.setCursor();
          return;
        }
      }
      this.activeStrategy = null;
    });

    document.addEventListener("pointermove", (e) => {
      if (this.activeStrategy && this.activeStrategy.onPointerMove) {
        this.activeStrategy.onPointerMove(e);
      } else {
        for (const strategy of this.strategies) {
        if (strategy.hitTest?.(e)) {
          strategy.setCursor();
          return;
        }
      }
      }
    });

    document.addEventListener("pointerup", (e) => {
      if (this.activeStrategy && this.activeStrategy.onPointerUp) {
        this.activeStrategy.onPointerUp(e);
        this.activeStrategy = null;
      }
    });
  }
}