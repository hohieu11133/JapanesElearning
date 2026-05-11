import { state } from './state.js';

export function initCanvas() {
  const canvas = document.getElementById('draw-canvas');
  if (!canvas) return;

  // Size canvas to its container
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const rect = wrap.getBoundingClientRect();
    // Save existing drawing
    const img = canvas.width > 0 ? canvas.toDataURL() : null;
    canvas.width = rect.width || 400;
    canvas.height = rect.height || 300;
    // Restore
    if (img) { const i = new Image(); i.onload = () => getCtx()?.drawImage(i, 0, 0); i.src = img; }
  }

  resizeCanvas();
  new ResizeObserver(resizeCanvas).observe(canvas.parentElement);

  // Mouse events
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  // Touch events
  canvas.addEventListener('touchstart', e => { e.preventDefault(); startDrawing(touchToMouse(e, canvas)); }, { passive: false });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); draw(touchToMouse(e, canvas)); }, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);
}

export function touchToMouse(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  return { offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top };
}

export function getCtx() {
  return document.getElementById('draw-canvas')?.getContext('2d');
}

export function startDrawing(e) {
  state.canvas.drawing = true;
  const ctx = getCtx();
  if (!ctx) return;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

export function draw(e) {
  if (!state.canvas.drawing) return;
  const ctx = getCtx();
  const size = parseInt(document.getElementById('pen-size')?.value || 4);
  if (!ctx) return;

  ctx.lineWidth = state.canvas.tool === 'eraser' ? size * 4 : size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (state.canvas.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#e2e2eb';
  }

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

export function stopDrawing() {
  state.canvas.drawing = false;
  const ctx = getCtx();
  if (ctx) { ctx.globalCompositeOperation = 'source-over'; ctx.beginPath(); }
}

export function clearCanvas() {
  const canvas = document.getElementById('draw-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function setTool(tool) {
  state.canvas.tool = tool;
  document.getElementById('tool-pen').classList.toggle('active', tool === 'pen');
  document.getElementById('tool-eraser').classList.toggle('active', tool === 'eraser');
}
