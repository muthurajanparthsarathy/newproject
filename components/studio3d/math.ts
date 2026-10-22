export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0 → 1 as `g` moves from `a` to `b`. */
export const range = (g: number, a: number, b: number) => clamp01((g - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** Rises over [a, a + fadeIn], holds, then falls over [b - fadeOut, b]. */
export const windowed = (g: number, a: number, b: number, fadeIn: number, fadeOut = fadeIn) =>
  Math.min(range(g, a, a + fadeIn), 1 - range(g, b - fadeOut, b));
/** Frame-rate independent exponential smoothing. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

/** Small deterministic PRNG, so procedural decoration is identical on every load. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Monotone cubic (Fritsch–Carlson) interpolation through (xs, ys): smooth, with no overshoot. */
export function monotoneCubic(xs: number[], ys: number[]) {
  const n = xs.length;
  const d: number[] = [];
  const m: number[] = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      m[i] = k * a * d[i];
      m[i + 1] = k * b * d[i];
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] +
      (t3 - 2 * t2 + t) * h * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] +
      (t3 - t2) * h * m[i + 1]
    );
  };
}

/** A keyed track: values at story positions, eased between neighbours. */
export type Keys<T> = ReadonlyArray<readonly [number, T]>;

/** Index of the segment containing `g` and the eased blend factor within it. */
export function keySegment<T>(g: number, keys: Keys<T>): [number, number] {
  if (g <= keys[0][0]) return [0, 0];
  const last = keys.length - 1;
  if (g >= keys[last][0]) return [last - 1, 1];
  let i = 0;
  while (g > keys[i + 1][0]) i++;
  return [i, smooth((g - keys[i][0]) / (keys[i + 1][0] - keys[i][0]))];
}

export function sampleNumber(g: number, keys: Keys<number>) {
  if (keys.length === 1) return keys[0][1];
  const [i, t] = keySegment(g, keys);
  return lerp(keys[i][1], keys[i + 1][1], t);
}
