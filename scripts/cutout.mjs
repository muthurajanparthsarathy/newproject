// Removes the plain light-grey background from the Canva scene renders so they
// can sit on the "one team" island as transparent layers.
//
//   node scripts/cutout.mjs <input> <output.png> [--scale 4] [--local 12]
//
// --local is how different two neighbouring backdrop pixels may be. Raise it
// (e.g. 20) if patches of grey backdrop are left behind; lower it if the cut
// eats into the characters.
// --loose also clears backdrop-coloured pixels that are cut off from the edge
// (gaps between legs, under chairs). Check white shoes and screens after.
//
// The canvas size is kept (only multiplied by --scale), because the layer
// positions in lib/one-team-scenes.ts are percentages of the full image.
// Soft contact shadows are kept as semi-transparent black so the characters
// still look grounded on any background.
//
// Uses sharp, which ships with Next.js.

import sharp from "sharp";

const args = process.argv.slice(2);
const [input, output] = args;
const scaleIdx = args.indexOf("--scale");
const scale = scaleIdx > -1 ? Number(args[scaleIdx + 1]) : 1;
const localIdx = args.indexOf("--local");
const LOCAL = localIdx > -1 ? Number(args[localIdx + 1]) : 12;
const LOOSE = args.includes("--loose");

if (!input || !output) {
  console.error("usage: node scripts/cutout.mjs <input> <output.png> [--scale 4]");
  process.exit(1);
}

let img = sharp(input).removeAlpha();
const meta = await img.metadata();
if (scale !== 1) {
  img = img.resize(Math.round(meta.width * scale), Math.round(meta.height * scale), {
    kernel: "lanczos3",
  });
}
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
// Decide the mask on a slightly smoothed copy so JPEG noise doesn't leak.
const smooth = await sharp(data, { raw: { width: w, height: h, channels: 3 } })
  .blur(0.8)
  .removeAlpha()
  .raw()
  .toBuffer();
const px = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
const spx = (i) => [smooth[i * 3], smooth[i * 3 + 1], smooth[i * 3 + 2]];
const chroma = (c) => Math.max(...c) - Math.min(...c);
const diff = (a, b) =>
  Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
const lum = (c) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];

// Mean colour of the outer border = the background.
let sum = [0, 0, 0];
let n = 0;
for (let x = 0; x < w; x++) for (const y of [0, h - 1]) {
  const c = px(y * w + x);
  sum = sum.map((s, k) => s + c[k]);
  n++;
}
for (let y = 0; y < h; y++) for (const x of [0, w - 1]) {
  const c = px(y * w + x);
  sum = sum.map((s, k) => s + c[k]);
  n++;
}
const bg = sum.map((s) => s / n);
const bgLum = lum(bg);

// Grow the background in from the edges. A pixel joins when it is close to
// its neighbour (follows gradients and soft shadows), not too far from the
// overall background colour, and nearly colourless like the grey backdrop —
// that last check stops it leaking into beige trousers and skin.
const GLOBAL = 120;
const MAX_CHROMA = chroma(bg) + 22;
const isBg = new Uint8Array(w * h);
const stack = [];
for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
for (const i of stack) isBg[i] = 1;
while (stack.length) {
  const i = stack.pop();
  const c = spx(i);
  const x = i % w;
  const y = (i / w) | 0;
  for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
    if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
    const j = ny * w + nx;
    if (isBg[j]) continue;
    const cj = spx(j);
    if (diff(cj, c) < LOCAL && diff(cj, bg) < GLOBAL && chroma(cj) <= MAX_CHROMA) {
      isBg[j] = 1;
      stack.push(j);
    }
  }
}

if (LOOSE) {
  for (let i = 0; i < w * h; i++) {
    const c = spx(i);
    if (!isBg[i] && diff(c, bg) < 30 && chroma(c) <= MAX_CHROMA) isBg[i] = 1;
  }
}

// Foreground mask, softened by a small blur for anti-aliased edges.
const mask = Buffer.alloc(w * h);
for (let i = 0; i < w * h; i++) mask[i] = isBg[i] ? 0 : 255;
const soft = await sharp(mask, { raw: { width: w, height: h, channels: 1 } })
  .blur(0.6 * Math.max(1, scale / 2))
  .extractChannel(0)
  .raw()
  .toBuffer();
// Shadows are only kept close to something solid (contact shadows), never in
// the open backdrop where they would just be vignetting.
const near = await sharp(mask, { raw: { width: w, height: h, channels: 1 } })
  .blur(Math.max(2, h * 0.02))
  .extractChannel(0)
  .raw()
  .toBuffer();

const out = Buffer.alloc(w * h * 4);
for (let i = 0; i < w * h; i++) {
  const c = px(i);
  let a = isBg[i] ? Math.min(soft[i], 255) : 255;
  let rgb = c;
  if (isBg[i]) {
    // Keep shadows: darker-than-background areas become translucent black.
    const dark = bgLum - lum(spx(i)) - 14;
    const shadow =
      dark > 0 && near[i] > 8 ? Math.min((dark / bgLum) * 2.2, 0.5) * 255 : 0;
    if (shadow > a) {
      a = shadow;
      rgb = [0, 0, 0];
    }
  }
  out[i * 4] = rgb[0];
  out[i * 4 + 1] = rgb[1];
  out[i * 4 + 2] = rgb[2];
  out[i * 4 + 3] = a;
}

await sharp(out, { raw: { width: w, height: h, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(output);
console.log(`${output}  ${w}x${h}`);
