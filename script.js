const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const lineWidth = document.getElementById('lineWidth');
const lineWidthValue = document.getElementById('lineWidthValue');
const alphaSlider = document.getElementById('alphaSlider');
const alphaValue = document.getElementById('alphaValue');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const bgColorPicker = document.getElementById('bgColorPicker');

let drawing = false;
let lastX = 0;
let lastY = 0;

function hexToRgba(hex, alpha = 1) {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    let r = 0;
    let g = 0;
    let b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }
    return `rgba(${r},${g},${b},${alpha})`;
}

function getStrokeColor() {
    const alpha = alphaSlider ? Number(alphaSlider.value) / 100 : 1;
    return hexToRgba(colorPicker ? colorPicker.value : '#000000', alpha);
}

function getStrokeAlpha() {
    return alphaSlider ? Number(alphaSlider.value) / 100 : 1;
}

function updateAlphaDisplay() {
    if (!alphaSlider || !alphaValue) return;
    alphaValue.textContent = `${alphaSlider.value}%`;
}

updateAlphaDisplay();
if (alphaSlider) {
    alphaSlider.addEventListener('input', updateAlphaDisplay);
}

function fillCanvasBackground(color) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function resizeCanvas() {
    // Set canvas size to wrapper size
    const wrapper = canvas.parentElement;
    // Save current image
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    // Fill background with current bg color
    fillCanvasBackground(bgColorPicker ? bgColorPicker.value : '#fff');
    // Restore image (scaled)
    try {
        ctx.putImageData(image, 0, 0);
    } catch {}
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    // Set initial canvas background
    fillCanvasBackground(bgColorPicker ? bgColorPicker.value : '#fff');
});

function startDraw(x, y) {
    drawing = true;
    [lastX, lastY] = [x, y];
}

function draw(x, y) {
    if (!drawing) return;
    ctx.save();
    ctx.strokeStyle = colorPicker.value;
    ctx.globalAlpha = getStrokeAlpha();
    ctx.lineWidth = lineWidth.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Interpolation für weiche Linien
    const dx = x - lastX;
    const dy = y - lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const step = 1; // Abstand zwischen Interpolationspunkten (Pixel)
    if (dist > 0) {
        for (let i = 0; i < dist; i += step) {
            const t = i / dist;
            const ix = lastX + dx * t;
            const iy = lastY + dy * t;
            ctx.beginPath();
            ctx.moveTo(ix, iy);
            ctx.lineTo(ix + 0.1, iy + 0.1); // winzige Linie für kontinuierlichen Strich
            ctx.stroke();
        }
    }
    [lastX, lastY] = [x, y];
    ctx.restore();
}

function stopDraw() {
    drawing = false;
}

// Mouse events
canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    startDraw(e.clientX - rect.left, e.clientY - rect.top);
});
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    draw(e.clientX - rect.left, e.clientY - rect.top);
});
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseleave', stopDraw);

// Touch events
canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        startDraw(touch.clientX - rect.left, touch.clientY - rect.top);
    }
    e.preventDefault();
});
canvas.addEventListener('touchmove', e => {
    if (e.touches.length === 1) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        draw(touch.clientX - rect.left, touch.clientY - rect.top);
    }
    e.preventDefault();
});
canvas.addEventListener('touchend', stopDraw);
canvas.addEventListener('touchcancel', stopDraw);


// Update line width value
lineWidth.addEventListener('input', () => {
    lineWidthValue.textContent = lineWidth.value;
});

// Canvas-Hintergrundfarbe ändern
if (bgColorPicker) {
    bgColorPicker.addEventListener('input', () => {
        // Lösche alles und setze neuen Hintergrund
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fillCanvasBackground(bgColorPicker.value);
    });
}

// Clear canvas
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fillCanvasBackground(bgColorPicker ? bgColorPicker.value : '#fff');
});

// Save canvas as image
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'zeichnung.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
