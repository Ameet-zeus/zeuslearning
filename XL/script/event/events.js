import { KeyboardEvents } from "./keyboard.js";
import { PointerEvents } from "./pointer.js";
import { ScrollEvents } from "./scroll.js";
import { ResizeEvents } from "./resize.js";

export class EventsManager {
  constructor(inputManager, viewport, renderer, canvas, ctx, rowManager, colManager) {
    this.keyboard = new KeyboardEvents(inputManager);
    this.pointer = new PointerEvents(inputManager, viewport, renderer, rowManager, colManager, canvas);
    this.scroll = new ScrollEvents(inputManager, viewport, renderer);
    this.resize = new ResizeEvents(inputManager, viewport, renderer, canvas, ctx);
  }
}