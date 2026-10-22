import { lerp, smooth } from "./math";

/**
 * The designer's stylus path on the pen display, in tablet coordinates (x, y in −1…1,
 * y up) with `down` = 1 while the tip touches the screen. One source of truth for the
 * hand, the physical stylus and the cursor on the design monitor, so they always agree.
 * Each stroke corresponds to something appearing on the poster at the same moment.
 */

type PenKey = [g: number, x: number, y: number, down: number];
const KEYS: PenKey[] = [];
const lift = (g: number, x: number, y: number) => KEYS.push([g, x, y, 0]);
function stroke(g0: number, g1: number, points: [number, number][]) {
  points.forEach(([x, y], i) => KEYS.push([lerp(g0, g1, i / (points.length - 1)), x, y, 1]));
}
const line = (x0: number, y0: number, x1: number, y1: number, n = 6) =>
  Array.from({ length: n }, (_, i) => [lerp(x0, x1, i / (n - 1)), lerp(y0, y1, i / (n - 1))] as [number, number]);

// 3.1 — stylus picked up, hover to the artboard
lift(30.55, 0.25, 0.15);
lift(30.95, -0.15, -0.05);
// 3.2 — place the product, draw the circle, the wave and the headline
stroke(31.0, 31.55, line(-0.15, -0.05, 0.35, 0.05));
lift(31.66, 0.6, 0.45);
stroke(31.7, 32.3, Array.from({ length: 17 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  return [0.45 + Math.cos(a) * 0.15, 0.45 + Math.sin(a) * 0.15] as [number, number];
}));
lift(32.4, -0.6, -0.55);
stroke(32.45, 33.15, Array.from({ length: 17 }, (_, i) => [lerp(-0.6, 0.6, i / 16), -0.55 + Math.sin(i * 0.8) * 0.08] as [number, number]));
lift(33.22, -0.62, 0.62);
stroke(33.25, 33.45, line(-0.62, 0.62, 0.05, 0.62));
lift(33.5, -0.62, 0.44);
stroke(33.52, 33.7, line(-0.62, 0.44, -0.05, 0.44));
lift(33.75, -0.62, 0.27);
stroke(33.77, 33.95, line(-0.62, 0.27, -0.2, 0.27));
// 3.3 — adjust typography, palette and alignment with short drags on the side panel
lift(34.05, 0.72, 0.5);
for (let k = 0; k < 6; k++) {
  const y = 0.5 - k * 0.16;
  stroke(34.1 + k * 0.33, 34.3 + k * 0.33, line(0.72, y, 0.72, y - 0.09, 3));
  lift(34.38 + k * 0.33, 0.72, y - 0.16);
}
// 3.3 — tap to choose the strongest layout
lift(36.3, -0.3, -0.1);
stroke(36.55, 36.62, line(-0.3, -0.1, -0.3, -0.1, 2));
lift(36.8, 0.15, -0.2);
// 3.4 — review: stylus lifted, hand relaxed
lift(38.5, 0.3, -0.38);
lift(40, 0.3, -0.38);

export type PenState = { x: number; y: number; down: number; held: boolean };
export const PEN_PICKUP = 30.55;

export function penAt(g: number): PenState {
  const held = g >= PEN_PICKUP;
  if (g <= KEYS[0][0]) return { x: KEYS[0][1], y: KEYS[0][2], down: 0, held };
  const last = KEYS[KEYS.length - 1];
  if (g >= last[0]) return { x: last[1], y: last[2], down: 0, held };
  let i = 0;
  while (g > KEYS[i + 1][0]) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = (g - a[0]) / (b[0] - a[0]);
  // Constant speed along strokes; eased moves while hovering between them
  const k = a[3] && b[3] ? t : smooth(t);
  return { x: lerp(a[1], b[1], k), y: lerp(a[2], b[2], k), down: lerp(a[3], b[3], smooth(t)), held };
}
