import { Viewport } from "./script/viewport.js";
import { Renderer } from "./script/rederer.js";
import { DataManager } from "./script/data/data.js";
import { InputManager } from "./script/input/input.js";
import { EventsManager } from "./script/event/events.js";
import { SelectionManager } from "./script/input/select.js";
import { RowManager } from "./script/data/row.js";
import { ColManager } from "./script/data/column.js";

function init() {
  const canvas = document.getElementById('spreadsheet-canvas');
  const ctx = canvas.getContext('2d');

  const viewport = new Viewport();
  viewport.resizeCanvas(canvas, ctx);

  const data = new DataManager();
  const rowManager = new RowManager();
  const colManager = new ColManager();
  const renderer = new Renderer(ctx, viewport, data, rowManager, colManager);
  const selectionManager = new SelectionManager(viewport, renderer, data);
  const inputManager = new InputManager(viewport, renderer, data, selectionManager);

  new EventsManager(inputManager, viewport, renderer, canvas, ctx, rowManager, colManager);

  renderer.drawGrid();

  renderer.scale = 1;
  const wrapper = document.getElementById('wrapper');
  canvas.addEventListener('wheel', function (e) {
    if (e.ctrlKey) {
      e.preventDefault();
      let newScale = renderer.scale - e.deltaY * 0.001;
      newScale = Math.max(0.5, Math.min(2, newScale)); // Clamp between 0.5x and 2x
      if (newScale !== renderer.scale) {
        renderer.scale = newScale;
        ctx.setTransform(renderer.scale, 0, 0, renderer.scale, 0, 0);
        renderer.drawGrid();
      }
    } else if (e.shiftKey) {
      wrapper.scrollLeft += e.deltaY;
      e.preventDefault();
    } else {
      wrapper.scrollTop += e.deltaY;
      wrapper.scrollLeft += e.deltaX;
      e.preventDefault();
    }
  }, { passive: false });
}

init();
