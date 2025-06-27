export class Selection {
  constructor() {
    this.selected = null;
  }

  selectCell(row, col) {
    this.selected = { type: 'cell', row, col };
  }

  selectRow(row) {
    this.selected = { type: 'row', row };
  }

  selectCol(col) {
    this.selected = { type: 'col', col };
  }

  selectAll() {
    this.selected = { type: 'all' };
  }

  clear() {
    this.selected = null;
  }

  isCellSelected(row, col) {
    return this.selected?.type === 'cell' && this.selected.row === row && this.selected.col === col;
  }

  isRowSelected(row) {
    return this.selected?.type === 'row' && this.selected.row === row;
  }

  isColSelected(col) {
    return this.selected?.type === 'col' && this.selected.col === col;
  }

  isAllSelected() {
    return this.selected?.type === 'all';
  }
}