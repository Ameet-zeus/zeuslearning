/**
 * Represents a manager for executing and undoing commands.
 * @member Command[] undoStack - An array of commands that have been executed and can be undone.
 * @member Command[] redoStack - An array of commands that have been undone and can be redone.
 */
export class CommandManager {
    undoStack = [];
    redoStack = [];

    /**
     * Executes a command and adds it to the undo stack.
     * @param command The command to execute
     */
    executeCommand(command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
    }

    /**
     * Undoes the last executed command and adds it to the redo stack.
     */
    undo() {
        const command = this.undoStack.pop();
        if (command) {
            command.undo();
            this.redoStack.push(command);
        }
    }

    /**
     * Redoes the last undone command and adds it to the undo stack.
     */
    redo() {
        const command = this.redoStack.pop();
        if (command) {
            command.execute();
            this.undoStack.push(command);
        }
    }

    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
}

export class EditCellCommand {
    /**
     * @param {object} dataManager - DataManager instance
     * @param {number} row
     * @param {number} col
     * @param {any} newValue
     */
    constructor(dataManager, row, col, newValue) {
        this.dataManager = dataManager;
        this.row = row;
        this.col = col;
        this.newValue = newValue;
        this.oldValue = dataManager.get(row, col);
    }
    execute() {
        this.dataManager.set(this.row, this.col, this.newValue);
    }
    undo() {
        this.dataManager.set(this.row, this.col, this.oldValue);
    }
}

export class ResizeRowCommand {
    /**
     * @param {object} rowManager - RowManager instance
     * @param {number} rowIndex
     * @param {number} newHeight
     * @param {object} renderer - Renderer instance (optional, for redraw)
     */
    constructor(rowManager, rowIndex, newHeight, renderer) {
        this.rowManager = rowManager;
        this.rowIndex = rowIndex;
        this.newHeight = newHeight;
        this.oldHeight = rowManager.get(rowIndex);
        this.renderer = renderer;
    }

    execute() {
        this.rowManager.set(this.rowIndex, this.newHeight);
        if (this.renderer) this.renderer.drawGrid();
    }

    undo() {
        this.rowManager.set(this.rowIndex, this.oldHeight);
        if (this.renderer) this.renderer.drawGrid();
    }
}

export class ResizeColumnCommand {
    /**
     * @param {object} colManager - ColManager instance
     * @param {number} colIndex
     * @param {number} newWidth
     * @param {object} renderer - Renderer instance (optional, for redraw)
     */
    constructor(colManager, colIndex, newWidth, renderer) {
        this.colManager = colManager;
        this.colIndex = colIndex;
        this.newWidth = newWidth;
        this.oldWidth = colManager.get(colIndex);
        this.renderer = renderer;
    }

    execute() {
        this.colManager.set(this.colIndex, this.newWidth);
        if (this.renderer) this.renderer.drawGrid();
    }

    undo() {
        this.colManager.set(this.colIndex, this.oldWidth);
        if (this.renderer) this.renderer.drawGrid();
    }
}

export class AddRowCommand {
    /**
     * @param {object} addHandler - AddHandler instance
     * @param {number} rowIndex - Where to insert
     */
    constructor(addHandler, rowIndex) {
        this.addHandler = addHandler;
        this.rowIndex = rowIndex;
        this.snapshot = new Map(addHandler.data.data);
    }
    execute() {
        this.addHandler.insertRow(this.rowIndex);
    }
    undo() {
        this.addHandler.data.data = new Map(this.snapshot);
        if (window.CONFIG) window.CONFIG.numRows -= 1;
        if (this.addHandler.renderer) this.addHandler.renderer.drawGrid();
    }
}

export class AddColumnCommand {
    /**
     * @param {object} addHandler - AddHandler instance
     * @param {number} colIndex - Where to insert
     */
    constructor(addHandler, colIndex) {
        this.addHandler = addHandler;
        this.colIndex = colIndex;
        this.snapshot = new Map(addHandler.data.data);
    }
    execute() {
        this.addHandler.insertColumn(this.colIndex);
    }
    undo() {
        this.addHandler.data.data = new Map(this.snapshot);
        if (window.CONFIG) window.CONFIG.numCols -= 1;
        if (this.addHandler.renderer) this.addHandler.renderer.drawGrid();
    }
}

window.undoXL = () => window.CommandManagerInstance && window.CommandManagerInstance.undo();
window.redoXL = () => window.CommandManagerInstance && window.CommandManagerInstance.redo();