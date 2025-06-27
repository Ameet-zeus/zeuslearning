import { Viewport } from "./script/viewport.js";
import { Renderer } from "./script/rederer.js";
import { DataManager } from "./script/data/data.js";
import { InputManager } from "./script/input/input.js";
import { EventsManager } from "./script/event/events.js";

function init() {
  const canvas = document.getElementById('spreadsheet-canvas');
  const ctx = canvas.getContext('2d');

  const viewport = new Viewport();
  viewport.resizeCanvas(canvas, ctx);

  const data = new DataManager();
  const renderer = new Renderer(ctx, viewport, data);
  const inputManager = new InputManager(viewport, renderer, data);

  new EventsManager(inputManager, viewport, renderer, canvas, ctx);

  renderer.drawGrid();
}

init();