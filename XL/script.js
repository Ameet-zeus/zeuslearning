import { Viewport } from "./script/viewport.js";
import { Renderer } from "./script/rederer.js";
import { DataManager } from "./script/data.js";
import { InputManager } from "./script/input.js";

function init() {
  const canvas = document.getElementById('spreadsheet-canvas');
  const ctx = canvas.getContext('2d');

  function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = window.innerWidth - 18;
    const displayHeight = window.innerHeight - 18;

    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    ctx.scale(dpr, dpr);
  }

  setupCanvas();

  const viewport = new Viewport();
  const data = new DataManager();
  const renderer = new Renderer(ctx, viewport, data);
  const inputManager = new InputManager(viewport, renderer, data);

  renderer.drawGrid();

  const wrapper = document.getElementById('wrapper');
  wrapper.addEventListener('scroll', () => {
    viewport.scrollX = wrapper.scrollLeft;
    viewport.scrollY = wrapper.scrollTop;
    renderer.drawGrid(inputManager.selected);
  });

  window.addEventListener('resize', () => {
    setupCanvas();
    viewport.width = window.innerWidth - 18;
    viewport.height = window.innerHeight - 18;
    renderer.calculateHeaderWidth();
    renderer.drawGrid(inputManager.selected);
    if (inputManager.editor.style.display !== "none" && inputManager.selected.row != null && inputManager.selected.col != null) {
      inputManager.positionEditor(inputManager.selected.row, inputManager.selected.col);
    }
  });
}

init();