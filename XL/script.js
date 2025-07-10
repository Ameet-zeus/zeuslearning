
import { Viewport } from "./script/viewport.js";
import { Renderer } from "./script/renderer.js";
import { DataManager } from "./script/data/data.js";
import { InputManager } from "./script/input/input.js";
import { EventsManager } from "./script/event/events.js";
import { SelectionManager } from "./script/input/select.js";
import { RowManager } from "./script/data/row.js";
import { ColManager } from "./script/data/column.js";
import { StatusBar } from "./script/data/statusbar.js";
import { AddHandler } from "./script/modify/add.js";
import { initSheet } from "./script/modify/initSheet.js";
import { LoadDataHandler } from "./script/modify/loadData.js";
import { CommandManager, EditCellCommand, ResizeRowCommand, ResizeColumnCommand, AddRowCommand, AddColumnCommand } from "./script/commands/commands.js";

/**
 * Initializes the spreadsheet application.
 */
function init() {
  initSheet();

  const canvas = document.getElementById("spreadsheet-canvas");
  const ctx = canvas.getContext("2d");

  const viewport = new Viewport();
  viewport.resizeCanvas(canvas, ctx);

  const data = new DataManager();
  const rowManager = new RowManager();
  const colManager = new ColManager();
  const statusBar = new StatusBar();
  const renderer = new Renderer(ctx, viewport, data, rowManager, colManager);
  const selectionManager = new SelectionManager(viewport, renderer, data);
  const inputManager = new InputManager(
    viewport,
    renderer,
    data,
    selectionManager
  );

  window.updateStatusBar = (sel, data) => statusBar.update(sel, data);
  window.AddHandlerInstance = new AddHandler(selectionManager, data, renderer);
  window.CommandManagerInstance = new CommandManager();
  window.EditCellCommand = EditCellCommand;
  window.ResizeRowCommand = ResizeRowCommand;
  window.ResizeColumnCommand = ResizeColumnCommand;
  window.AddRowCommand = AddRowCommand;
  window.AddColumnCommand = AddColumnCommand;
  window.undoXL = () => window.CommandManagerInstance.undo();
  window.redoXL = () => window.CommandManagerInstance.redo();

  window.LoadDataHandlerInstance = new LoadDataHandler(data, renderer, rowManager, colManager);

  const jsonInput = document.getElementById("json-file-input");
  if (jsonInput) {
    jsonInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const jsonData = JSON.parse(e.target.result);
          window.LoadDataHandlerInstance.load(jsonData);
        } catch (err) {
          alert("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    });
  }

  new EventsManager(
    inputManager,
    viewport,
    renderer,
    canvas,
    ctx,
    rowManager,
    colManager
  );

  renderer.drawGrid();
}

init();
