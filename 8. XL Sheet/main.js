const container = document.getElementById("canvasContainer");
const canvas = document.getElementById("spreadsheet");
const ctx = canvas.getContext("2d");
const input = document.getElementById("textInput");

const cellWidth = 100;
const cellHeight = 30;
const rows = 100000;
const cols = 100;

let data = Array.from({ length: rows }, () => Array(cols).fill(""));
let selectedCell = null;

let visibleRows = 0;
let visibleCols = 0;

function resizeCanvas() {
  canvas.width = cols * cellWidth;
  canvas.height = rows * cellHeight;

  visibleCols = Math.floor(container.clientWidth / cellWidth);
  visibleRows = Math.floor(container.clientHeight / cellHeight);

  drawGrid();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 🧠 Main draw function
function drawGrid() {
  const scrollLeft = container.scrollLeft;
  const scrollTop = container.scrollTop;

  const viewportLeft = Math.floor(scrollLeft / cellWidth);
  const viewportTop = Math.floor(scrollTop / cellHeight);

  const offsetX = scrollLeft % cellWidth;
  const offsetY = scrollTop % cellHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "16px Arial";
  ctx.textBaseline = "middle";

  for (let r = 0; r <= visibleRows; r++) {
    for (let c = 0; c <= visibleCols; c++) {
      const dataRow = r + viewportTop;
      const dataCol = c + viewportLeft;

      if (dataRow >= rows || dataCol >= cols) continue;

      const x = c * cellWidth - offsetX;
      const y = r * cellHeight - offsetY;

      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(x, y, cellWidth, cellHeight);
      ctx.fillStyle = "black";
      ctx.fillText(data[dataRow][dataCol], x + 5, y + cellHeight / 2);
    }
  }

  // Draw selected cell highlight
  if (selectedCell) {
    const [selRow, selCol] = selectedCell;
    const rowInView = selRow - viewportTop;
    const colInView = selCol - viewportLeft;

    if (rowInView >= 0 && colInView >= 0 && rowInView <= visibleRows && colInView <= visibleCols) {
      const x = colInView * cellWidth - offsetX;
      const y = rowInView * cellHeight - offsetY;
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cellWidth, cellHeight);
    }
  }
}

// 🧭 Scroll triggers redraw
container.addEventListener("scroll", drawGrid);

// 🖱️ Click to edit
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const scrollLeft = container.scrollLeft;
  const scrollTop = container.scrollTop;

  const x = e.clientX - rect.left + scrollLeft;
  const y = e.clientY - rect.top + scrollTop;

  const col = Math.floor(x / cellWidth);
  const row = Math.floor(y / cellHeight);

  if (row >= rows || col >= cols) return;

  selectedCell = [row, col];
  const value = data[row][col];

  input.style.left = `${col * cellWidth - scrollLeft}px`;
  input.style.top = `${row * cellHeight - scrollTop}px`;
  input.style.width = `${cellWidth}px`;
  input.style.height = `${cellHeight}px`;
  input.value = value;
  input.style.display = "block";
  input.focus();

  drawGrid();
});

// Save input on blur
input.addEventListener("blur", () => {
  if (selectedCell) {
    const [r, c] = selectedCell;
    data[r][c] = input.value;
    input.style.display = "none";
    drawGrid();
  }
});
