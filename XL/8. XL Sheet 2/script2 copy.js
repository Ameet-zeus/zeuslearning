//CONFIG DATA
class Config {
    //Default values
    static DEFAULT_CELL_WIDTH = 100;       // Default width of each cell in pixels
    static DEFAULT_CELL_HEIGHT = 30;       // Default height of each cell in pixels
    static HEADER_HEIGHT = 30;             // Height of the header row
    static HEADER_WIDTH = 50;              // Width of the header column
    static ROWS = 100;                  // Number of rows in the spreadsheet
    static COLS = 40;                     // Number of columns in the spreadsheet
    static RESIZE_THRESHOLD = 5;           // Pixel threshold for detecting resize intent
    static MIN_CELL_WIDTH = 30;            // Minimum cell width allowed
    static MIN_CELL_HEIGHT = 20;           // Minimum cell height allowed

    static COLORS = {
        CELL_BACKGROUND: '#ffffff',         // Background color of normal cells
        CELL_BORDER: '#e0e0e0',             // Border color for cells
        CELL_TEXT: 'black',               // Text color for cell content
        HEADER_BACKGROUND: '#f5f5f5',       // Background color of header cells
        HEADER_TEXT: 'black',             // Text color for headers
        SELECTION_BORDER: '#137e43',        // Border color for selected cells
        SELECTED_CELL_HEADER_BACKGROUND: '#caead8',
        SELECTED_CELL_HEADER_SHADOW: '#137e43',
        SELECTED_HEADER: '#137e43',
        SELECTED_HEADER_TEXT: 'white',
    };
}

//UTILITY FUNCTIONS
class Utils {
    getColLabel(){};
    getStartIndex(){};
    getEndIndex(){};
}

//DATA STRUCTURES
class Rows {
    resizeRow(){};
    handleMouseDown(){};
    handleMouseDrag(){};
    handleMouseUp(){};
}

class Columns {
    resizeCol(){};
    handleMouseDown(){};
    handleMouseDrag(){};
    handleMouseUp(){};
}

class Cell {
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.value = '';
    }
    handleClick(){};
}

//HANDLING DATA
class Data{
    storeData(cell, value){};
    retrieveData(cell){};
}

//HANDLING INPUT
class Input {
    showInput(cell){};
    hideInput(){};
}

//HANDLE SELECTION
class Selection {
    constructor() {}
    selectCell(row, col){};
    selectRange(startRow, startCol, endRow, endCol){};
    getSelectedCells(){};
    clearSelection(){};
}

//HANDLES SNAPSHOTS
class snapshot {
    getSnapShot(){};
    captureSnapShot(){};
}

//HANDLES CLIPBOARD
class Clipboard {
    copy(cells){};
    cut(cells){};
    paste(targetCell, data){};
}

//HADNLES COMMANDS
class History {
    undo(){};
    redo(){};
    clear(){};
}

//MANAGES FORMULA ENGINES
class FormulaEngine {
    evaluate(cell, data){};
    parse(formula){};
    updateDependencies(cell, formula){};
}

//HANDLES CUSTOM CELL STYLING
class CellStyle {
    setStyle(cell, styleObj){};
    getStyle(cell){};
}

//MANAGES ALL EVENTS
class EventManager {
    constructor(container, spreadsheet) {}
    attachEvents(){};
    detachEvents(){};
}

//MANAGES IMPORTING AND EXPORTING FILES
class FileManager {
    import(file) {}
    export(format) {}
}

//HANDLES THE CONTENT WITHIN THE VIEWPORT
class Viewport {
    constructor(container, data) {
        this.container = container;
        this.data = data;
    }
    update(){};
    getVisibleCells(){};
}

//RENDERS THE SPREADSHEET
class Render {
    constructor(container) {
        this.container = container;
    }
    renderGrid(){};
    renderHeaders(){};
}

//SPREADSHEET ITSELF
class Spreadsheet {
    constructor(container) {}
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    window.spreadsheet = new Render(container);
});