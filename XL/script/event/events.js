import { KeyboardEvents } from "./keyboard.js";
import { PointerEvents } from "./pointer.js";
import { ScrollEvents } from "./scroll.js";
import { ResizeEvents } from "./resize.js";

export class EventsManager {
  /**
   * 
   * @param {*} inputManager manages user inputs
   * @param {*} viewport manages the viewport
   * @param {*} renderer manages the rendering of the grid
   * @param {*} canvas manages the canvas for drawing
   * @param {*} ctx manages the context of the canvas for drawing
   * @param {*} rowManager manages the rows of the grid
   * @param {*} colManager manages the columns of the grid
   */
  constructor(inputManager, viewport, renderer, canvas, ctx, rowManager, colManager) {
    this.keyboard = new KeyboardEvents(inputManager);
    this.pointer = new PointerEvents(inputManager, viewport, renderer, rowManager, colManager, canvas);
    this.scroll = new ScrollEvents(inputManager, viewport, renderer);
    this.resize = new ResizeEvents(inputManager, viewport, renderer, canvas, ctx);
  }
}