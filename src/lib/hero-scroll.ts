type Listener = () => void;

let target = 0;
let display = 0;
let vel = 0;
let spinTarget = 0;
let spin = 0;
let raf = 0;
let last = 0;
const listeners = new Set<Listener>();

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function smoothstep(t: number) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

export function easeInOut(t: number) {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function getProgress() {
  return display;
}

export function getSpin() {
  return spin;
}

export function yawAmount(p = display) {
  const x = clamp(p, 0, 1);
  if (x < 0.14) return 0;
  return easeInOut((x - 0.14) / 0.86);
}

export function subscribeProgress(fn: Listener) {
  listeners.add(fn);
  fn();
  return () => {
    listeners.delete(fn);
  };
}

function emit() {
  listeners.forEach((fn) => fn());
}

function tick(now: number) {
  const dt = last ? Math.min(0.033, (now - last) / 1000) : 0.016;
  last = now;
  vel *= Math.pow(0.12, dt);
  if (Math.abs(vel) < 0.000015) vel = 0;
  target = clamp(target + vel, 0, 1);
  const k = 1 - Math.exp(-7.2 * dt);
  display += (target - display) * k;
  if (Math.abs(target - display) < 0.00008) display = target;
  spin += (spinTarget - spin) * k;
  if (Math.abs(spinTarget - spin) < 0.02) spin = spinTarget;
  emit();
  if (vel !== 0 || Math.abs(target - display) > 0.00008 || Math.abs(spinTarget - spin) > 0.02) {
    raf = requestAnimationFrame(tick);
  } else {
    raf = 0;
    last = 0;
  }
}

function kick() {
  if (!raf) raf = requestAnimationFrame(tick);
}

export function setProgress(next: number) {
  target = clamp(next, 0, 1);
  kick();
}

function normalizeWheel(e: WheelEvent) {
  let dy = e.deltaY + e.deltaX;
  if (e.deltaMode === 1) dy *= 16;
  if (e.deltaMode === 2) dy *= window.innerHeight;
  return dy;
}

export function applyWheel(deltaY: number) {
  if (deltaY < 0 && target <= 0 && display <= 0 && vel <= 0) {
    vel = 0;
    if (spinTarget <= 0 && spin <= 0) return;
    spinTarget = Math.max(0, spinTarget + deltaY * 0.22);
    kick();
    return;
  }
  vel += deltaY * 0.00028;
  vel = clamp(vel, -0.048, 0.048);
  spinTarget += deltaY * 0.22;
  kick();
}

export function scrollToRest() {
  vel = 0;
  display = 0;
  target = 0;
  spin = 0;
  spinTarget = 0;
  emit();
}

export function bindPageScroll(root?: HTMLElement | null) {
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    applyWheel(normalizeWheel(e));
  };
  let lastY: number | null = null;
  const onTouchStart = (e: TouchEvent) => {
    lastY = e.touches[0]?.clientY ?? null;
  };
  const onTouchMove = (e: TouchEvent) => {
    const y = e.touches[0]?.clientY;
    if (y == null || lastY == null) return;
    e.preventDefault();
    applyWheel((lastY - y) * 0.95);
    lastY = y;
  };
  const onTouchEnd = () => {
    lastY = null;
  };

  const opts: AddEventListenerOptions = { passive: false, capture: true };
  document.addEventListener("wheel", onWheel, opts);
  window.addEventListener("wheel", onWheel, opts);
  root?.addEventListener("wheel", onWheel, opts);
  document.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
  document.addEventListener("touchmove", onTouchMove, opts);
  document.addEventListener("touchend", onTouchEnd, { capture: true });

  scrollToRest();

  return () => {
    document.removeEventListener("wheel", onWheel, opts);
    window.removeEventListener("wheel", onWheel, opts);
    root?.removeEventListener("wheel", onWheel, opts);
    document.removeEventListener("touchstart", onTouchStart, { capture: true });
    document.removeEventListener("touchmove", onTouchMove, opts);
    document.removeEventListener("touchend", onTouchEnd, { capture: true });
  };
}
