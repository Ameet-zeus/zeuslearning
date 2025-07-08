
/**
 * Creates a wrapper element and its children for the spreadsheet application.
 */

export function initSheet() {
  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';
  wrapper.id = 'wrapper';

  const canvas = document.createElement('canvas');
  canvas.id = 'spreadsheet-canvas';
  wrapper.appendChild(canvas);

  const scrollContainer = document.createElement('div');
  scrollContainer.id = 'scroll-container';
  wrapper.appendChild(scrollContainer);

  const cellEditor = document.createElement('input');
  cellEditor.type = 'text';
  cellEditor.id = 'cell-editor';
  wrapper.appendChild(cellEditor);

  const statusBar = document.querySelector('.status-bar');
  statusBar.parentNode.insertBefore(wrapper, statusBar);
}
