import { CONFIG } from "../config.js";

export class KeyboardEvents {
  /**
   * Moves the anchor cell within a range selection
   * @param {*} sel Current selection object
   * @param {*} direction Direction to move: 'down', 'right', 'left', 'up'
   */
  moveAnchorInRange(sel, direction) {
    if (sel.type !== 'range') return;

    const { startRow, endRow, startCol, endCol } = sel;
    let currentAnchorRow = sel.anchorRow;
    let currentAnchorCol = sel.anchorCol;

    let newAnchorRow = currentAnchorRow;
    let newAnchorCol = currentAnchorCol;

    switch (direction) {
      case 'down':
        newAnchorRow++;
        if (newAnchorRow > endRow) {
          newAnchorRow = startRow;
          newAnchorCol++;
          if (newAnchorCol > endCol) {
            newAnchorCol = startCol;
          }
        }
        break;
      case 'right':
        newAnchorCol++;
        if (newAnchorCol > endCol) {
          newAnchorCol = startCol;
          newAnchorRow++;
          if (newAnchorRow > endRow) {
            newAnchorRow = startRow;
          }
        }
        break;
      case 'left':
        newAnchorCol--;
        if (newAnchorCol < startCol) {
          newAnchorCol = endCol;
          newAnchorRow--;
          if (newAnchorRow < startRow) {
            newAnchorRow = endRow;
          }
        }
        break;
      case 'up':
        newAnchorRow--;
        if (newAnchorRow < startRow) {
          newAnchorRow = endRow;
          newAnchorCol--;
          if (newAnchorCol < startCol) {
            newAnchorCol = endCol;
          }
        }
        break;
    }

    const newSelection = {
      ...sel,
      anchorRow: newAnchorRow,
      anchorCol: newAnchorCol
    };

    this.inputManager.selectionManager.selected = newSelection;
    this.inputManager.viewport.scrollCellIntoView(newAnchorRow, newAnchorCol, this.inputManager.renderer);
    this.inputManager.renderer.drawGrid(newSelection);
    if (window.updateStatusBar) window.updateStatusBar(newSelection, this.inputManager.data);
  }

  /**
   * @param {*} inputManager to manage user inputs
   */
  constructor(inputManager) {
    this.inputManager = inputManager;
    this.attach();
  }

  /**
     * Commits the value from the editor to the data model based on the selection type
     */
  commitEditorValue(sel, val) {
    if (!sel) return;
    const cmdMgr = window.CommandManagerInstance;
    const { EditCellCommand } = window.CommandManagerInstance.constructor.__proto__.constructor;
    switch (sel.type) {
      case 'cell':
        cmdMgr.executeCommand(new window.EditCellCommand(this.inputManager.data, sel.row, sel.col, val));
        break;
      case 'range':
        cmdMgr.executeCommand(new window.EditCellCommand(this.inputManager.data, sel.anchorRow, sel.anchorCol, val));
        break;
      case 'row':
      case 'rows':
        cmdMgr.executeCommand(new window.EditCellCommand(this.inputManager.data, sel.anchorRow, 0, val));
        break;
      case 'column':
      case 'columns':
        cmdMgr.executeCommand(new window.EditCellCommand(this.inputManager.data, 0, sel.anchorCol, val));
        break;
      case 'all':
        cmdMgr.executeCommand(new window.EditCellCommand(this.inputManager.data, 0, 0, val));
        break;
    }
    if (window.updateStatusBar) {
      window.updateStatusBar(sel, this.inputManager.data);
    }
  }

  /**
   * Attaches keyboard event listeners to the editor and document.
   */
  attach() {
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (window.CommandManagerInstance) window.CommandManagerInstance.undo();
        if (window.updateStatusBar) window.updateStatusBar(this.inputManager.selectionManager.getSelection(), this.inputManager.data);
        this.inputManager.renderer.drawGrid();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        e.preventDefault();
        if (window.CommandManagerInstance) window.CommandManagerInstance.redo();
        if (window.updateStatusBar) window.updateStatusBar(this.inputManager.selectionManager.getSelection(), this.inputManager.data);
        this.inputManager.renderer.drawGrid();
        return;
      }
      const isEditorFocused = this.inputManager.editor === document.activeElement;
      const isEditorPositioned = this.inputManager.editor.dataset.positioned === "true";

      const sel = this.inputManager.selectionManager.getSelection();
      const val = this.inputManager.editor.value;

      // Handle editor-specific keydown events when editor is focused
      if (isEditorFocused) {
        e.stopPropagation();

        if (e.key === "Escape") {
          e.preventDefault();
          this.inputManager.hideEditor();
          return;
        }

        if (e.key === "Enter") {
          e.preventDefault();

          if (sel) {
            this.commitEditorValue(sel, val);
          }

          this.inputManager.hideEditor();

          if (sel && sel.type === 'cell') {
            let newRow = sel.row + 1;
            if (newRow < CONFIG.numRows) {
              this.inputManager.selectCell(newRow, sel.col, false);
              this.inputManager.viewport.scrollCellIntoView(newRow, sel.col, this.inputManager.renderer);
            }
          } else if (sel && sel.type === 'range') {
            this.moveAnchorInRange(sel, 'down');
          }

          this.inputManager.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
          return;
        }

        if (e.key === "Tab") {
          e.preventDefault();

          if (sel) {
            this.commitEditorValue(sel, val);
          }

          this.inputManager.hideEditor();

          if (sel && sel.type === 'cell') {
            let newCol = sel.col + (e.shiftKey ? -1 : 1);
            if (newCol >= 0 && newCol < CONFIG.numCols) {
              this.inputManager.selectCell(sel.row, newCol, false);
              this.inputManager.viewport.scrollCellIntoView(sel.row, newCol, this.inputManager.renderer);
            }
          } else if (sel && sel.type === 'range') {
            this.moveAnchorInRange(sel, e.shiftKey ? 'left' : 'right');
          }

          this.inputManager.renderer.drawGrid(this.inputManager.selectionManager.getSelection());
          return;
        }

        // If editor is focused but not positioned, do not process further
        if (!isEditorPositioned) {
          return;
        }
      }

      // Handle document-level keydown events when editor is not focused or positioned
      if (!isEditorFocused || !isEditorPositioned) {
        if (!sel) return;

        let activeRow, activeCol;
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

        if (sel && (sel.type === "cell" || sel.type === "range")) {
          let anchorRow = sel.anchorRow ?? sel.row;
          let anchorCol = sel.anchorCol ?? sel.col;
          let row, col;
          if (sel.type === "range") {
            row = sel.activeRow ?? sel.endRow;
            col = sel.activeCol ?? sel.endCol;
          } else {
            row = sel.row;
            col = sel.col;
          }

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
                if (sel.type === 'range') {
                  this.moveAnchorInRange(sel, 'left');
                } else if (col > 0) {
                  col--;
                  changed = true;
                }
              } else {
                if (sel.type === 'range') {
                  this.moveAnchorInRange(sel, 'right');
                } else if (col < CONFIG.numCols - 1) {
                  col++;
                  changed = true;
                }
              }
              break;
            case 'Enter':
              e.preventDefault();
              const editRow = sel.type === "range" ? anchorRow : row;
              const editCol = sel.type === "range" ? anchorCol : col;
              this.inputManager.positionEditor(editRow, editCol);
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
              const f2EditRow = sel.type === "range" ? anchorRow : row;
              const f2EditCol = sel.type === "range" ? anchorCol : col;
              this.inputManager.showEditor(f2EditRow, f2EditCol);
              return;
            default:
              if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const typeEditRow = sel.type === "range" ? anchorRow : row;
                const typeEditCol = sel.type === "range" ? anchorCol : col;
                this.inputManager.showEditor(typeEditRow, typeEditCol, e.key);
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
      }
    });
  }
}
