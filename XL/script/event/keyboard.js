import { CONFIG } from "../config.js";
import { CommandRegistry } from "../commands/commands.js";

export class KeyboardEvents {
  /**
   * @param {*} inputManager to manage user inputs
   */
  constructor(inputManager) {
    this.inputManager = inputManager;
    this.attach();
  }

  /**
   * Attaches keyboard event listeners to the editor and document.
   */
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
          if (window.updateStatusBar) window.updateStatusBar(sel, this.inputManager.data);
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
      const isEditorFocused = this.inputManager.editor === document.activeElement;
      const isEditorPositioned = this.inputManager.editor.dataset.positioned === "true";

      if (isEditorFocused && !isEditorPositioned) {
        return;
      }

      const sel = this.inputManager.selectionManager.getSelection();

      let activeRow, activeCol;
      if (sel) {
        switch (sel.type) {
          case 'cell':
            activeRow = sel.row;
            activeCol = sel.col;
            break;
          case 'range':
            activeRow = sel.anchorRow;
            activeCol = sel.anchorCol;
            break;
          case 'row':
            activeRow = sel.row;
            activeCol = 0;
            break;
          case 'rows':
            activeRow = sel.anchorRow;
            activeCol = 0;
            break;
          case 'column':
            activeRow = 0;
            activeCol = sel.col;
            break;
          case 'columns':
            activeRow = 0;
            activeCol = sel.anchorCol;
            break;
          case 'all':
            activeRow = 0;
            activeCol = 0;
            break;
          default:
            return;
        }
      } else {
        return;
      }

      if (sel && (sel.type === "cell" || sel.type === "range")) {
        let anchorRow = sel.anchorRow ?? sel.row;
        let anchorCol = sel.anchorCol ?? sel.col;
        let row = sel.type === "range" ? sel.endRow : sel.row;
        let col = sel.type === "range" ? sel.endCol : sel.col;
        let changed = false;

        if (e.shiftKey && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
          let newRow = row, newCol = col;
          switch (e.key) {
            case "ArrowUp":
              if (newRow > 0) newRow--;
              break;
            case "ArrowDown":
              if (newRow < CONFIG.numRows - 1) newRow++;
              break;
            case "ArrowLeft":
              if (newCol > 0) newCol--;
              break;
            case "ArrowRight":
              if (newCol < CONFIG.numCols - 1) newCol++;
              break;
          }
          this.inputManager.selectionManager.selectCellRange(
            anchorRow, anchorCol, newRow, newCol
          );
          this.inputManager.viewport.scrollCellIntoView(newRow, newCol, this.inputManager.renderer);
          this.inputManager.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
          e.preventDefault();
          return;
        }

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
          this.inputManager.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
        }
      } else {
        switch (e.key) {
          case 'Enter':
          case 'F2':
            e.preventDefault();
            this.inputManager.selectCell(activeRow, activeCol, true);
            return;
          case 'Escape':
            this.inputManager.hideEditor();
            this.inputManager.selectCell(activeRow, activeCol, false);
            break;
          default:
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
              e.preventDefault();
              this.inputManager.selectCell(activeRow, activeCol, false);
              this.inputManager.showEditor(activeRow, activeCol, e.key);
            }
            return;
        }
      }
    });
  }
}