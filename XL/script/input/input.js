import { CONFIG } from "../config.js";

export class InputManager {
  constructor(viewport, renderer, data, selectionManager) {
    this.data = data;
    this.renderer = renderer;
    this.viewport = viewport;
    this.selectionManager = selectionManager;
    this.editor = document.getElementById("cell-editor");
  }

  getCellFromMouse(x, y) {
    return this.selectionManager.getCellFromMouse(x, y);
  }

  selectCell(row, col, edit = false) {
    this.selectionManager.selectCell(row, col, edit);
    if (edit) {
      this.viewport.scrollCellIntoView(row, col, this.renderer);
      this.showEditor(row, col);
    } else {
      this.hideEditor();
    }
  }

  positionEditor(row, col, show = true) {
    const { scrollX, scrollY } = this.viewport;
    const rowHeaderWidth = this.renderer.rowHeaderWidth;
    const cellWidth = this.renderer.getColumnWidth(col);
    const cellHeight = this.renderer.getRowHeight(row);
    const x = this.renderer.getColumnX(col, scrollX);
    const y = this.renderer.getRowY(row, scrollY);

    // Hide editor if the cell is not visible (above header or left of row headers)
    if (y < CONFIG.cellHeight || x < rowHeaderWidth) {
      this.editor.style.display = "none";
      return;
    }

    // Position the editor
    this.editor.style.left = `${x + 2}px`;
    this.editor.style.top = `${y + 2}px`;
    this.editor.style.width = `${cellWidth - 4}px`;
    this.editor.style.height = `${cellHeight - 4}px`;
    this.editor.style.minWidth = `${cellWidth - 4}px`;
    this.editor.style.minHeight = `${cellHeight - 4}px`;

    // Show editor if requested (for selection positioning)
    if (show) {
      // Get the current cell value
      const value = this.data.get(row, col) || "";
      this.editor.value = value;
      this.editor.style.display = "block";
      
      // Mark editor as positioned but not in edit mode
      this.editor.dataset.positioned = "true";
      this.editor.dataset.anchorRow = row.toString();
      this.editor.dataset.anchorCol = col.toString();
      this.editor.blur();
    }
  }

  showEditor(row, col, initialValue = null) {
    const value = initialValue !== null ? initialValue : this.data.get(row, col) || "";
    this.editor.value = value;
    this.editor.style.display = "block";
    this.positionEditor(row, col, false); // Position but don't show again
    
    // Mark editor as in edit mode
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

  hideEditor() {
    this.editor.style.display = "none";
    this.editor.dataset.positioned = "false";
    this.editor.dataset.anchorRow = "";
    this.editor.dataset.anchorCol = "";
  }
}