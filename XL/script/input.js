export class InputManager {
  constructor(viewport, renderer, data) {
    this.data = data;
    this.renderer = renderer;
    this.viewport = viewport;

    this.editor = document.getElementById("cell-editor");
    this.selected = { row: null, col: null };
    this.attachEvents();
  }

  attachEvents() {
    const wrapper = document.getElementById("wrapper");

    wrapper.addEventListener("click", (e) => {
      const canvas = document.getElementById("spreadsheet-canvas");
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const result = this.getCellFromMouse(x, y);

      if (result.type === 'cell') {
        this.selectCell(result.row, result.col);
      } else if (result.type === 'row') {
        this.selected = { row: result.row, col: null, type: 'row' };
        this.hideEditor();
        this.renderer.drawGrid(this.selected);
      } else if (result.type === 'column') {
        this.selected = { row: null, col: result.col, type: 'col' };
        this.hideEditor();
        this.renderer.drawGrid(this.selected);
      } else if (result.type === 'corner') {
        this.selected = { row: null, col: null, type: 'all' };
        this.hideEditor();
        this.renderer.drawGrid(this.selected);
      }
    });

    this.editor.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideEditor();
      }
      if (e.key === "Enter") {
        const val = this.editor.value;
        this.data.set(this.selected.row, this.selected.col, val);
        this.hideEditor();
        this.renderer.drawGrid(this.selected);
      }
    });

    wrapper.addEventListener("scroll", () => {
      this.viewport.scrollX = wrapper.scrollLeft;
      this.viewport.scrollY = wrapper.scrollTop;

      if (this.editor.style.display !== "none" && this.selected.row != null && this.selected.col != null) {
        this.positionEditor(this.selected.row, this.selected.col);
      }
    });
  }

  getCellFromMouse(x, y) {
    const { scrollX, scrollY } = this.viewport;
    const { cellWidth, cellHeight, rowHeaderWidth } = this.renderer;

    if (x < rowHeaderWidth && y < cellHeight) {
      return { type: 'corner' };
    } else if (y < cellHeight) {
      const col = Math.floor((x + scrollX - rowHeaderWidth) / cellWidth);
      return { type: 'column', col };
    } else if (x < rowHeaderWidth) {
      const row = Math.floor((y + scrollY - cellHeight) / cellHeight);
      return { type: 'row', row };
    } else {
      const col = Math.floor((x + scrollX - rowHeaderWidth) / cellWidth);
      const row = Math.floor((y + scrollY - cellHeight) / cellHeight);
      return { type: 'cell', row, col };
    }
  }

  selectCell(row, col) {
    if (row == null || col == null) return;

    this.selected = { row, col, type: 'cell' };
    this.showEditor(row, col);
    this.renderer.drawGrid(this.selected);
  }

  positionEditor(row, col) {
    const { scrollX, scrollY } = this.viewport;
    const { cellWidth, cellHeight, rowHeaderWidth } = this.renderer;
    const x = col * cellWidth - scrollX + rowHeaderWidth;
    const y = row * cellHeight - scrollY + cellHeight;
    this.editor.style.left = `${x + 2}px`;
    this.editor.style.top = `${y + 2}px`;
    this.editor.style.width = `${cellWidth - 4}px`;
    this.editor.style.height = `${cellHeight - 4}px`;
  }

  showEditor(row, col) {
    const val = this.data.get(row, col) || "";
    this.editor.value = val;
    this.editor.style.display = "block";
    this.positionEditor(row, col);
    this.editor.focus();
    this.editor.select();
  }

  hideEditor() {
    this.editor.style.display = "none";
  }
}