export function attachGestures(
  el: HTMLCanvasElement,
  handlers: {
    onWheel: (dx: number, dy: number) => void;
    onPan: (dx: number, dy: number) => void;
    onPinch: (scaleDelta: number) => void;
    onTap?: (x: number, y: number, buttons: number) => void;
  }
) {
  let isDown = false;
  let lastX = 0;
  let lastY = 0;
  let lastDist = 0;

  const onMouseDown = (e: MouseEvent) => {
    isDown = true;
    lastX = e.clientX;
    lastY = e.clientY;
    el.setPointerCapture(e.pointerId || 0);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDown) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    handlers.onPan(dx, dy);
  };

  const onMouseUp = () => {
    isDown = false;
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    handlers.onWheel(e.deltaX, e.deltaY);
  };

  const onClick = (e: MouseEvent) => {
    handlers.onTap?.(e.offsetX, e.offsetY, e.buttons);
  };

  el.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  el.addEventListener('wheel', onWheel, { passive: false });
  el.addEventListener('click', onClick);

  // touch
  el.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
    if (e.touches.length === 2) {
      const [a, b] = e.touches;
      lastDist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    }
  }, { passive: true });

  el.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      const dx = t.clientX - lastX;
      const dy = t.clientY - lastY;
      lastX = t.clientX; lastY = t.clientY;
      handlers.onPan(dx, dy);
    } else if (e.touches.length === 2) {
      const [a, b] = e.touches;
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      const d = dist / lastDist;
      lastDist = dist;
      handlers.onPinch(d);
    }
  }, { passive: true });

  return () => {
    el.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    el.removeEventListener('wheel', onWheel);
    el.removeEventListener('click', onClick);
  };
}
