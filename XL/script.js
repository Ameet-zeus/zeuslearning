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
}

init();
