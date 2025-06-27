export class KeyboardEvents {
  constructor(inputManager) {
    this.inputManager = inputManager;
    this.attach();
  }
  attach() {
    this.inputManager.editor.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.inputManager.hideEditor();
      if (e.key === "Enter") {
        const val = this.inputManager.editor.value;
        this.inputManager.data.set(this.inputManager.selected.row, this.inputManager.selected.col, val);
        this.inputManager.hideEditor();
        this.inputManager.renderer.drawGrid(this.inputManager.selected);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (
        this.inputManager.selected &&
        this.inputManager.selected.type === "cell" &&
        this.inputManager.editor.style.display === "none"
      ) {
        if (
          e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
        ) {
          this.inputManager.showEditor(this.inputManager.selected.row, this.inputManager.selected.col, e.key);
          e.preventDefault();
        } else if (e.key === "Enter" || e.key === "F2") {
          this.inputManager.showEditor(this.inputManager.selected.row, this.inputManager.selected.col);
          e.preventDefault();
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

      if (result.type === 'cell') {
        this.inputManager.selectCell(result.row, result.col, false); // false = do not edit
      } else if (result.type === 'row') {
        this.inputManager.selected = { row: result.row, col: null, type: 'row' };
        this.inputManager.hideEditor();
        this.renderer.drawGrid(this.inputManager.selected);
      } else if (result.type === 'column') {
        this.inputManager.selected = { row: null, col: result.col, type: 'col' };
        this.inputManager.hideEditor();
        this.renderer.drawGrid(this.inputManager.selected);
      } else if (result.type === 'corner') {
        this.inputManager.selected = { row: null, col: null, type: 'all' };
        this.inputManager.hideEditor();
        this.renderer.drawGrid(this.inputManager.selected);
      }
    });

    wrapper.addEventListener("dblclick", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const result = this.inputManager.getCellFromMouse(x, y);

      if (result.type === 'cell') {
        this.inputManager.selectCell(result.row, result.col, true); // true = edit
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
      this.renderer.drawGrid(this.inputManager.selected);
      if (this.inputManager.editor.style.display !== "none" && this.inputManager.selected.row != null && this.inputManager.selected.col != null) {
        this.inputManager.positionEditor(this.inputManager.selected.row, this.inputManager.selected.col);
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
      this.renderer.drawGrid(this.inputManager.selected);
      if (
        this.inputManager.editor.style.display !== "none" &&
        this.inputManager.selected.row != null &&
        this.inputManager.selected.col != null
      ) {
        this.inputManager.positionEditor(this.inputManager.selected.row, this.inputManager.selected.col);
      }
    });
  }
}

export class EventsManager {
  constructor(inputManager, viewport, renderer, canvas, ctx) {
    this.keyboard = new KeyboardEvents(inputManager);
    this.pointer = new PointerEvents(inputManager, viewport, renderer);
    this.scroll = new ScrollEvents(inputManager, viewport, renderer);
    this.resize = new ResizeEvents(inputManager, viewport, renderer, canvas, ctx);
  }
}