/** @format */
// Example usage

// Link the start function to the button
document.getElementById("startButton").addEventListener("click", () => {
  folder.start();
});

// Add event listeners to mute buttons
document.getElementById("muteBase").addEventListener("click", () => {
  folder.muteAllOfInstrument("base");
});

document.getElementById("muteHarm").addEventListener("click", () => {
  folder.muteAllOfInstrument("harm");
});

document.getElementById("muteTrombone").addEventListener("click", () => {
  folder.muteAllOfInstrument("trombone");
});

document.getElementById("muteVoc").addEventListener("click", () => {
  folder.muteAllOfInstrument("voc");
});

document.getElementById("muteFill").addEventListener("click", () => {
  folder.muteAllOfInstrument("fill");
});

document.getElementById("muteDrum").addEventListener("click", () => {
  folder.muteAllOfInstrument("drum");
});
const mouseArea = document.getElementById("mouseArea");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

mouseArea.appendChild(canvas);

canvas.width = mouseArea.clientWidth;
canvas.height = mouseArea.clientHeight;

let isMouseDown = false;
let startX, startY, lastX, lastY;
let startTime, endTime;

// Function to determine the direction based on starting and ending coordinates

let lineLen = 0;

// Variables for brush settings
let brushColor = "black";
let brushSize = 5;
let brushOpacity = 1.0;

// Create UI for color, size, and opacity selection
const controls = document.createElement("div");
controls.innerHTML = `
  <label for="color">Color:</label>
  <select id="color">
    <option value="black">Black</option>
    <option value="red">Red</option>
    <option value="green">Green</option>
    <option value="blue">Blue</option>
    <option value="gold">Gold</option>
  </select>
  <label for="size">Size:</label>
  <input type="range" id="size" min="1" max="20" value="5">
  <label for="opacity">Opacity:</label>
  <input type="range" id="opacity" min="0.1" max="1" step="0.1" value="1.0">
`;
document.body.insertBefore(controls, mouseArea);

// Event listeners for brush settings
document.getElementById("color").addEventListener("change", (e) => {
  brushColor = e.target.value;
});

document.getElementById("size").addEventListener("input", (e) => {
  brushSize = e.target.value;
});

document.getElementById("opacity").addEventListener("input", (e) => {
  brushOpacity = e.target.value;
});

mouseArea.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  isMouseDown = true;
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;
  lastX = startX;
  lastY = startY;
  startTime = new Date(); // Record the start time

  ctx.strokeStyle = brushColor;
  ctx.lineWidth = brushSize;
  ctx.globalAlpha = brushOpacity;

  // Begin drawing path
  ctx.beginPath();
  ctx.moveTo(startX, startY);
});

mouseArea.addEventListener("mousemove", (e) => {
  if (isMouseDown) {
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // Draw line
    lineLen += Math.sqrt((currentX - lastX) ** 2 + (currentY - lastY) ** 2);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    // Determine direction

    lastX = currentX;
    lastY = currentY;
  }
});

mouseArea.addEventListener("mouseup", () => {
  if (isMouseDown) {
    isMouseDown = false;
    endTime = new Date(); // Record the end time

    // Calculate the duration and the length of the line

    const duration = endTime - startTime; // in seconds
    console.log(`Time taken: ${duration} seconds`);
    console.log(`Length of the line: ${lineLen}px`);
    console.log(lineLen / duration);
    speed = "slow";
    if (lineLen / duration > 2) {
      speed = "fast";
    }
    pickInstrument(brushColor, speed, brushSize);
  }
});

mouseArea.addEventListener("mouseleave", () => {
  if (isMouseDown) {
    isMouseDown = false;
  }
});

function pickInstrument(color, speed, size) {
  if (color === "black") {
    addInstrument("drum", speed, size);
  }
  if (color === "blue") {
    addInstrument("harm", speed, size);
  }
  if (color === "green") {
    addInstrument("base", speed, size);
  } else if (color === "red") {
    if (Math.random() < 0.5) {
      // Execute this block half the time
      addInstrument("trombone", speed, size);
    } else {
      // Execute the else block the other half of the time
      addInstrument("voc", speed, size); // Replace with the other block's logic
    }
  }
  if (color === "gold") {
    addInstrument("fill", speed, size);
  }
}
function addInstrument(type, speed, size) {
  folder.unmute(type, speed, size);
}
