import { CONFIG } from "../config.js";

export class InputManager {
  /**
   * @param {*} viewport to manage the viewport
   * @param {*} renderer to render the grid
   * @param {*} data to manage the data
   * @param {*} selectionManager to manage cell selection
   */
  constructor(viewport, renderer, data, selectionManager) {
    this.data = data;
    this.renderer = renderer;
    this.viewport = viewport;
    this.selectionManager = selectionManager;
    this.editor = document.getElementById("cell-editor");
  }

  /**
   * @param {*} x x-coordinate of the mouse
   * @param {*} y y-coordinate of the mouse
   * @returns cell row and column based on mouse position
   */
  getCellFromMouse(x, y) {
    return this.selectionManager.getCellFromMouse(x, y);
  }

  /**
   * @param {*} row row index of the cell
   * @param {*} col column index of the cell
   * @param {*} edit flag to indicate whether to edit the cell
   */
  selectCell(row, col, edit = false) {
    this.selectionManager.selectCell(row, col, edit);
    if (edit) {
      this.viewport.scrollCellIntoView(row, col, this.renderer);
      this.showEditor(row, col);
    } else {
      this.hideEditor();
    }
  }

  /**
   * @param {*} row row index of the cell
   * @param {*} col column index of the cell
   * @param {*} show flag to show or hide the editor
   */
  positionEditor(row, col, show = true) {
    const { scrollX, scrollY } = this.viewport;
    const rowHeaderWidth = this.renderer.rowHeaderWidth;
    const cellWidth = this.renderer.getColumnWidth(col);
    const cellHeight = this.renderer.getRowHeight(row);
    const x = this.renderer.getColumnX(col, scrollX);
    const y = this.renderer.getRowY(row, scrollY);

    this.editor.style.left = `${x + 2}px`;
    this.editor.style.top = `${y + CONFIG.NAVBAR_HEIGHT + 2}px`;
    this.editor.style.width = `${cellWidth - 4}px`;
    this.editor.style.height = `${cellHeight - 4}px`;
    this.editor.style.minWidth = `${cellWidth - 4}px`;
    this.editor.style.minHeight = `${cellHeight - 4}px`;

    if (show) {
      const value = this.data.get(row, col) || "";
      this.editor.value = value;
      this.editor.style.display = "block";
      this.editor.dataset.positioned = "true";
      this.editor.dataset.anchorRow = row.toString();
      this.editor.dataset.anchorCol = col.toString();
      // Do not focus editor on selection, only on double click or keyboard input
      this.editor.blur();
    }
  }

  /**
   * @param {*} row row index of the cell
   * @param {*} col column index of the cell
   * @param {*} initialValue show the editor with an initial value if exists
   */
  showEditor(row, col, initialValue = null) {
    const value = initialValue !== null ? initialValue : this.data.get(row, col) || "";
    this.editor.value = value;
    this.editor.style.display = "block";
    this.positionEditor(row, col, false);
    this.editor.dataset.positioned = "false";
    this.editor.focus();

    if (initialValue !== null) {
      this.editor.setSelectionRange(value.length, value.length);
    }

    const cellWidth = this.renderer.getColumnWidth(col) - 4;
    const measureSpan = document.createElement('span');
    measureSpan.style.visibility = 'hidden';
    measureSpan.style.position = 'fixed';
    measureSpan.style.whiteSpace = 'pre';
    measureSpan.style.font = this.editor.style.font || window.getComputedStyle(this.editor).font;
    document.body.appendChild(measureSpan);

    const updateWidth = () => {
      measureSpan.textContent = this.editor.value || ' ';
      let newWidth = Math.max(cellWidth, measureSpan.offsetWidth + 10);
      this.editor.style.width = newWidth + 'px';
      this.editor.style.height = `${this.renderer.getRowHeight(row) - 4}px`;
    };

    this.editor.addEventListener('input', updateWidth);
    updateWidth();

    this.editor.onblur = () => {
      document.body.removeChild(measureSpan);
      this.editor.onblur = null;
    };
  }

  /**
   * Hides the editor and resets its state. 
   */
  hideEditor() {
    this.editor.style.display = "none";
    this.editor.dataset.positioned = "false";
    this.editor.dataset.anchorRow = "";
    this.editor.dataset.anchorCol = "";
  }
}