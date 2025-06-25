import { Config } from './scripts/config.js';
import { Spreadsheet } from './scripts/main.js'


// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {

  const virtualSheet = document.getElementById('virtual-sheet');
  virtualSheet.style.width = (Config.COLS * Config.DEFAULT_CELL_WIDTH) + 'px';
  virtualSheet.style.height = (Config.ROWS * Config.DEFAULT_CELL_HEIGHT) + 'px';

  const sheetScroll = document.getElementById('sheet-scroll');
  const canvas = document.getElementById('sheet-canvas');
  canvas.width = sheetScroll.clientWidth * window.devicePixelRatio;
  canvas.height = sheetScroll.clientHeight * window.devicePixelRatio;

  window.spreadsheet = new Spreadsheet("sheet-canvas", {
    COLS: Config.COLS,
    ROWS: Config.ROWS,
    DEFAULT_CELL_WIDTH: Config.DEFAULT_CELL_WIDTH,
    DEFAULT_CELL_HEIGHT: Config.DEFAULT_CELL_HEIGHT
  });

  sheetScroll.addEventListener('scroll', () => {
    const scrollLeft = sheetScroll.scrollLeft;
    const scrollTop = sheetScroll.scrollTop;
    canvas.style.left = scrollLeft + 'px';
    canvas.style.top = scrollTop + 'px';
    window.spreadsheet.renderViewport(scrollLeft, scrollTop, canvas.width, canvas.height);
  });
});