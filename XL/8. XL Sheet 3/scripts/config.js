// CONFIG DATA
export class Config {
  static DEFAULT_CELL_WIDTH = 100;
  static DEFAULT_CELL_HEIGHT = 30;
  static HEADER_HEIGHT = 30;
  static HEADER_WIDTH = 50;
  static ROWS = 1000;
  static COLS = 100;
  static RESIZE_THRESHOLD = 6;
  static MIN_CELL_WIDTH = 30;
  static MIN_CELL_HEIGHT = 20;
  static COLORS = {
    CELL_BACKGROUND: "#ffffff",
    CELL_BORDER: "#e0e0e0",
    CELL_TEXT: "black",
    HEADER_BACKGROUND: "#f5f5f5",
    HEADER_TEXT: "black",
    SELECTION_BORDER: "#137e43",
    SELECTED_CELL_HEADER_BACKGROUND: "#caead8",
    SELECTED_CELL_HEADER_SHADOW: "#137e43",
    SELECTED_HEADER: "#137e43",
    SELECTED_HEADER_TEXT: "white",
  };
}

// UTILITY FUNCTIONS
export class Utils {
  static getColLabel(index) {
    let label = "";
    while (index >= 0) {
      label = String.fromCharCode((index % 26) + 65) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  }
}