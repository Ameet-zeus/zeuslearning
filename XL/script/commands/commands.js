import { copy } from "./copy.js";
import { paste } from "./paste.js";
import { undo } from "./undo.js";
import { redo } from "./redo.js";

export const CommandRegistry = {
  copy,
  paste,
  undo,
  redo,
};