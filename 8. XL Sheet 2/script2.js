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
        SELECTED_CELL_HEADER_BACKGROUND: '#caead8',     // Background color of selected header cells
        SELECTED_CELL_HEADER_SHADOW: '#137e43',     //Shadow color for selected header cells
        SELECTED_HEADER: '#137e43',     // Background color for selected headers
        SELECTED_HEADER_TEXT: 'white',      //Text color for selected header
    };
}

//UTILITY FUNCTIONS
class Utils {
    static getColLabel(index) {
        let label = '';
        while (index >= 0) {
            label = String.fromCharCode((index % 26) + 65) + label;
            index = Math.floor(index / 26) - 1;
        }
        return label;
    }
    getStartIndex() { };
    getEndIndex() { };
}

//DATA STRUCTURES
class Rows {
    resizeRow() { };
    handleMouseDown() { };
    handleMouseDrag() { };
    handleMouseUp() { };
}

class Columns {
    resizeCol() { };
    handleMouseDown() { };
    handleMouseDrag() { };
    handleMouseUp() { };
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.value = '';
    }
    handleClick() { };
}

//HANDLING DATA
class Data {
    storeData(cell, value) { };
    retrieveData(cell) { };
}

//HANDLING INPUT
class Input {
    showInput(cell) { };
    hideInput() { };
}

//HANDLE SELECTION
class Selection {
    constructor() { }
    selectCell(row, col) { };
    selectRange(startRow, startCol, endRow, endCol) { };
    getSelectedCells() { };
    clearSelection() { };
}

//HANDLES SNAPSHOTS
class snapshot {
    getSnapShot() { };
    captureSnapShot() { };
}

//HANDLES CLIPBOARD
class Clipboard {
    copy(cells) { };
    cut(cells) { };
    paste(targetCell, data) { };
}

//HADNLES COMMANDS
class History {
    undo() { };
    redo() { };
    clear() { };
}

//MANAGES FORMULA ENGINES
class FormulaEngine {
    evaluate(cell, data) { };
    parse(formula) { };
    updateDependencies(cell, formula) { };
}

//HANDLES CUSTOM CELL STYLING
class CellStyle {
    setStyle(cell, styleObj) { };
    getStyle(cell) { };
}

//MANAGES ALL EVENTS
class EventManager {
    constructor(container, spreadsheet) { }
    attachEvents() { };
    detachEvents() { };
}

//MANAGES IMPORTING AND EXPORTING FILES
class FileManager {
    import(file) { }
    export(format) { }
}

//HANDLES THE CONTENT WITHIN THE VIEWPORT
class Viewport {
    constructor(container, data) {
        this.container = container;
        this.data = data;
        this.scrollX = 0;
        this.scrollY = 0;
        this.visibleRows = 20;
        this.visibleCols = 10;
    }

    getVisibleCells() {
        const startRow = Math.floor(this.scrollY / Config.DEFAULT_CELL_HEIGHT);
        const endRow = Math.min(startRow + this.visibleRows, Config.ROWS);
        const startCol = Math.floor(this.scrollX / Config.DEFAULT_CELL_WIDTH);
        const endCol = Math.min(startCol + this.visibleCols, Config.COLS);
        return { startRow, endRow, startCol, endCol };
    }

    setScroll(x, y) {
        this.scrollX = x;
        this.scrollY = y;
    }
}

// RENDERS THE SPREADSHEET
class Render {
    constructor(container, spreadsheet) {
        this.container = container;
        this.spreadsheet = spreadsheet;
        this.canvas = document.getElementById('spreadsheet');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = Config.HEADER_WIDTH + spreadsheet.viewport.visibleCols * Config.DEFAULT_CELL_WIDTH;
        this.canvas.height = Config.HEADER_HEIGHT + spreadsheet.viewport.visibleRows * Config.DEFAULT_CELL_HEIGHT;
        this.render();
        this.canvas.addEventListener('wheel', (e) => this.handleScroll(e));
    }

    render() {
        this.renderGrid();
        this.renderHeaders();
    }

    renderGrid() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const { startRow, endRow, startCol, endCol } = this.spreadsheet.viewport.getVisibleCells();
        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                ctx.fillStyle = Config.COLORS.CELL_BACKGROUND;
                ctx.fillRect(
                    Config.HEADER_WIDTH + (col - startCol) * Config.DEFAULT_CELL_WIDTH,
                    Config.HEADER_HEIGHT + (row - startRow) * Config.DEFAULT_CELL_HEIGHT,
                    Config.DEFAULT_CELL_WIDTH,
                    Config.DEFAULT_CELL_HEIGHT
                );
                ctx.strokeStyle = Config.COLORS.CELL_BORDER;
                ctx.strokeRect(
                    Config.HEADER_WIDTH + (col - startCol) * Config.DEFAULT_CELL_WIDTH,
                    Config.HEADER_HEIGHT + (row - startRow) * Config.DEFAULT_CELL_HEIGHT,
                    Config.DEFAULT_CELL_WIDTH,
                    Config.DEFAULT_CELL_HEIGHT
                );
            }
        }
    }

    renderHeaders() {
        const ctx = this.ctx;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const { startRow, endRow, startCol, endCol } = this.spreadsheet.viewport.getVisibleCells();

        // COLUMN HEADERS
        for (let col = startCol; col < endCol; col++) {
            ctx.fillStyle = Config.COLORS.HEADER_BACKGROUND;
            ctx.fillRect(
                Config.HEADER_WIDTH + (col - startCol) * Config.DEFAULT_CELL_WIDTH,
                0,
                Config.DEFAULT_CELL_WIDTH,
                Config.HEADER_HEIGHT
            );
            ctx.strokeStyle = Config.COLORS.CELL_BORDER;
            ctx.strokeRect(
                Config.HEADER_WIDTH + (col - startCol) * Config.DEFAULT_CELL_WIDTH,
                0,
                Config.DEFAULT_CELL_WIDTH,
                Config.HEADER_HEIGHT
            );
            ctx.fillStyle = Config.COLORS.HEADER_TEXT;
            ctx.fillText(
                Utils.getColLabel(col),
                Config.HEADER_WIDTH + (col - startCol) * Config.DEFAULT_CELL_WIDTH + Config.DEFAULT_CELL_WIDTH / 2,
                Config.HEADER_HEIGHT / 2
            );
        }

        // ROW HEADERS
        for (let row = startRow; row < endRow; row++) {
            ctx.fillStyle = Config.COLORS.HEADER_BACKGROUND;
            ctx.fillRect(
                0,
                Config.HEADER_HEIGHT + (row - startRow) * Config.DEFAULT_CELL_HEIGHT,
                Config.HEADER_WIDTH,
                Config.DEFAULT_CELL_HEIGHT
            );
            ctx.strokeStyle = Config.COLORS.CELL_BORDER;
            ctx.strokeRect(
                0,
                Config.HEADER_HEIGHT + (row - startRow) * Config.DEFAULT_CELL_HEIGHT,
                Config.HEADER_WIDTH,
                Config.DEFAULT_CELL_HEIGHT
            );
            ctx.fillStyle = Config.COLORS.HEADER_TEXT;
            ctx.fillText(
                (row + 1).toString(),
                Config.HEADER_WIDTH / 2,
                Config.HEADER_HEIGHT + (row - startRow) * Config.DEFAULT_CELL_HEIGHT + Config.DEFAULT_CELL_HEIGHT / 2
            );
        }

        // TOP LEFT CORNER CELL
        ctx.fillStyle = Config.COLORS.HEADER_BACKGROUND;
        ctx.fillRect(0, 0, Config.HEADER_WIDTH, Config.HEADER_HEIGHT);
        ctx.strokeStyle = Config.COLORS.CELL_BORDER;
        ctx.strokeRect(0, 0, Config.HEADER_WIDTH, Config.HEADER_HEIGHT);
    }

    handleScroll(e) {
        e.preventDefault();
        const deltaX = e.deltaX;
        const deltaY = e.deltaY;
        const viewport = this.spreadsheet.viewport;
        viewport.setScroll(
            Math.max(0, Math.min(viewport.scrollX + deltaX, Config.COLS * Config.DEFAULT_CELL_WIDTH - this.canvas.width)),
            Math.max(0, Math.min(viewport.scrollY + deltaY, Config.ROWS * Config.DEFAULT_CELL_HEIGHT - this.canvas.height))
        );
        this.render();
    }
}


//SPREADSHEET ITSELF
class Spreadsheet {
    constructor(container) {
        this.container = container;
        this.data = new Data();
        this.selection = new Selection();
        this.rows = new Rows();
        this.columns = new Columns();
        this.viewport = new Viewport(container, this.data);
        this.render = new Render(container, this);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    window.spreadsheet = new Spreadsheet(container);
});