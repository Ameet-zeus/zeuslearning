import { Config , Utils } from './config.js';

//HANDLES SNAPSHOTS
export class snapshot {
  getSnapShot() { }
  captureSnapShot() { }
}

//MANAGES FORMULA ENGINES
export class FormulaEngine {
  evaluate(cell, data) { }
  parse(formula) { }
  updateDependencies(cell, formula) { }
}

//HANDLES CUSTOM CELL STYLING
export class CellStyle {
  setStyle(cell, styleObj) { }
  getStyle(cell) { }
}

//MANAGES IMPORTING AND EXPORTING FILES
export class FileManager {
  import(file) { }
  export(format) { }
}