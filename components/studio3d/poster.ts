import * as THREE from "three";
import { clamp01, easeInOut, easeOut, lerp, range } from "./math";
import { Kit, buildBottle } from "./props";
import { SCREEN_LAYER } from "./screens";

/**
 * Scene 3 poster system. The product in every poster is the same 3D bottle used in the
 * shoot (rendered once into a transparent texture), so its identity never changes.
 * Backgrounds and typography are canvases redrawn from the story position, so the poster
 * builds up — and un-builds when scrolling back — beat by beat.
 */

export type PosterVariant = "main" | "altA" | "altB";
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/** Renders the bottle once, on a transparent background, as a product cut-out. */
export class ProductShot {
  readonly target = new THREE.WebGLRenderTarget(256, 768, { samples: 4 });

  constructor(private readonly kit: Kit, private readonly envMap: THREE.Texture) {}

  render(gl: THREE.WebGLRenderer) {
    const scene = new THREE.Scene();
    scene.environment = this.envMap;
    scene.environmentIntensity = 0.55;
    const bottle = buildBottle(this.kit);
    bottle.rotation.y = 0.5;
    scene.add(bottle);
    const key = new THREE.DirectionalLight("#ffffff", 2.4);
    key.position.set(0.6, 0.7, 1);
    const rim = new THREE.DirectionalLight("#cfe4ff", 1.6);
    rim.position.set(-0.9, 0.4, -0.7);
    scene.add(key, rim, new THREE.HemisphereLight("#ffffff", "#9fb4d6", 0.7));
    const camera = new THREE.PerspectiveCamera(18, 1 / 3, 0.1, 5);
    camera.position.set(0, 0.03, 0.86);
    camera.lookAt(0, 0.008, 0);

    const previous = gl.getRenderTarget();
    const clear = gl.getClearColor(new THREE.Color());
    const alpha = gl.getClearAlpha();
    gl.setClearColor(0x000000, 0);
    gl.setRenderTarget(this.target);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(previous);
    gl.setClearColor(clear, alpha);
  }

  get texture() {
    return this.target.texture;
  }

  dispose() {
    this.target.dispose();
  }
}

// ---------------------------------------------------------------------------
// Poster artwork (4:5 social post)
// ---------------------------------------------------------------------------

type Palette = { bgA: string; bgB: string; shape: string; accent: string; highlight: string; text: string; ink: string };
const DRAFT: Palette = { bgA: "#0f766e", bgB: "#2dd4bf", shape: "#99f6e4", accent: "#a7f3d0", highlight: "#134e4a", text: "#ffffff", ink: "#042f2e" };
const FINAL: Palette = { bgA: "#1d4ed8", bgB: "#38bdf8", shape: "#bfdbfe", accent: "#facc15", highlight: "#facc15", text: "#ffffff", ink: "#0b1d4d" };

function mixColor(a: string, b: string, t: number) {
  return `#${new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString()}`;
}
export function paletteAt(g: number): Palette {
  const t = easeInOut(range(g, 34.5, 35.5));
  const out = {} as Palette;
  for (const k of Object.keys(DRAFT) as (keyof Palette)[]) out[k] = mixColor(DRAFT[k], FINAL[k], t);
  return out;
}

/** How "aligned" the layout is: shapes drift into their final grid positions during 3.3. */
const alignment = (g: number) => easeInOut(range(g, 35.5, 36.2));

export function posterBackgroundKey(g: number) {
  return String(Math.round(g * 50));
}

export function drawPosterBackground(x: CanvasRenderingContext2D, w: number, h: number, g: number, variant: PosterVariant) {
  x.clearRect(0, 0, w, h);
  if (variant === "altA") {
    x.fillStyle = "#f8fafc";
    x.fillRect(0, 0, w, h);
    x.fillStyle = "#dbeafe";
    x.beginPath();
    x.arc(w * 0.3, h * 0.58, w * 0.3, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = "#2563eb";
    x.fillRect(0, h * 0.94, w, h * 0.06);
    return;
  }
  if (variant === "altB") {
    x.fillStyle = "#facc15";
    x.fillRect(0, 0, w, h);
    x.fillStyle = "#ffffff";
    x.beginPath();
    x.ellipse(w * 0.5, h * 0.68, w * 0.42, h * 0.2, -0.2, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = "#1e3a8a";
    for (let i = 0; i < 6; i++) x.fillRect(w * (0.08 + i * 0.15), h * 0.93, w * 0.08, h * 0.02);
    return;
  }

  // Main poster: blank artboard → gradient → shapes assemble → palette and alignment refined
  const base = range(g, 30.85, 31.15);
  x.fillStyle = "#ffffff";
  x.fillRect(0, 0, w, h);
  if (base <= 0) {
    x.strokeStyle = "rgba(15,23,42,0.06)";
    for (let i = 1; i < 8; i++) {
      x.beginPath();
      x.moveTo((w * i) / 8, 0);
      x.lineTo((w * i) / 8, h);
      x.moveTo(0, (h * i) / 10);
      x.lineTo(w, (h * i) / 10);
      x.stroke();
    }
    return;
  }
  const p = paletteAt(g);
  const a = alignment(g);
  x.globalAlpha = base;
  const grad = x.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, p.bgA);
  grad.addColorStop(1, p.bgB);
  x.fillStyle = grad;
  x.fillRect(0, 0, w, h);

  // Large soft circle, top right
  const circle = easeOut(range(g, 31.2, 31.8));
  if (circle > 0) {
    x.globalAlpha = 0.22 * circle;
    x.fillStyle = "#ffffff";
    x.beginPath();
    x.arc(w * lerp(0.86, 0.82, a), h * lerp(0.2, 0.24, a), w * 0.36 * circle, 0, Math.PI * 2);
    x.fill();
    x.globalAlpha = 0.35 * circle;
    x.strokeStyle = "#ffffff";
    x.lineWidth = w * 0.008;
    x.beginPath();
    x.arc(w * lerp(0.86, 0.82, a), h * lerp(0.2, 0.24, a), w * 0.44 * circle, 0, Math.PI * 2);
    x.stroke();
  }
  // Wave rising at the bottom
  const wave = easeOut(range(g, 31.7, 32.5));
  if (wave > 0) {
    x.globalAlpha = 0.9;
    x.fillStyle = p.shape;
    const top = h * (1 - 0.26 * wave);
    x.beginPath();
    x.moveTo(0, h);
    x.lineTo(0, top);
    for (let i = 0; i <= 24; i++) {
      const px = (w * i) / 24;
      x.lineTo(px, top + Math.sin(i * 0.7 + lerp(0.6, 0, a)) * h * 0.022);
    }
    x.lineTo(w, h);
    x.fill();
  }
  // Accent swoosh behind the product
  const stripe = easeOut(range(g, 32.3, 32.9));
  if (stripe > 0) {
    x.globalAlpha = 0.95;
    x.fillStyle = p.accent;
    x.save();
    x.translate(w * 0.64, h * lerp(0.6, 0.58, a));
    x.rotate(-0.42);
    x.fillRect(-w * 0.55 * stripe, -h * 0.045, w * 1.1 * stripe, h * 0.09);
    x.restore();
  }
  // Droplets
  const drops = range(g, 32.7, 33.3);
  if (drops > 0) {
    x.fillStyle = "#ffffff";
    [[0.42, 0.42, 0.018], [0.9, 0.5, 0.012], [0.47, 0.75, 0.014], [0.88, 0.72, 0.02], [0.5, 0.3, 0.01]].forEach(([dx, dy, r], i) => {
      const k = clamp01(drops * 5 - i);
      if (k <= 0) return;
      x.globalAlpha = 0.85 * k;
      x.beginPath();
      x.arc(w * dx, h * dy, w * r * k, 0, Math.PI * 2);
      x.fill();
    });
  }
  // Soft product shadow
  if (range(g, 31.0, 31.6) > 0) {
    x.globalAlpha = 0.28 * range(g, 31.0, 31.6);
    x.fillStyle = "#0b1d4d";
    x.beginPath();
    x.ellipse(w * lerp(0.68, 0.64, a), h * 0.89, w * 0.14, h * 0.018, 0, 0, Math.PI * 2);
    x.fill();
  }
  x.globalAlpha = 1;
}

export function posterForegroundKey(g: number) {
  return String(Math.round(g * 60));
}

/** Largest font size (up to `size`) at which every line fits within `maxWidth`. */
function fitSize(x: CanvasRenderingContext2D, lines: string[], maxWidth: number, size: number, style = "900 italic") {
  x.font = `${style} ${size}px ${FONT}`;
  const widest = Math.max(...lines.map((l) => x.measureText(l).width));
  return widest > maxWidth ? (size * maxWidth) / widest : size;
}

export function drawPosterForeground(x: CanvasRenderingContext2D, w: number, h: number, g: number, variant: PosterVariant) {
  x.clearRect(0, 0, w, h);
  x.textBaseline = "alphabetic";
  if (variant === "altA") {
    x.textAlign = "left";
    const words = ["STAY", "HYDRATED.", "STAY", "ACTIVE."];
    const s = fitSize(x, words, w * 0.42, h * 0.085);
    x.font = `900 italic ${s}px ${FONT}`;
    words.forEach((word, i) => {
      x.fillStyle = i < 2 ? "#1e3a8a" : "#2563eb";
      x.fillText(word, w * 0.54, h * 0.36 + i * s * 1.05);
    });
    x.font = `600 ${h * 0.03}px ${FONT}`;
    x.fillStyle = "#475569";
    x.fillText("Your everyday bottle", w * 0.54, h * 0.36 + 4 * s * 1.05 + h * 0.02);
    return;
  }
  if (variant === "altB") {
    x.textAlign = "center";
    const s = fitSize(x, ["STAY HYDRATED"], w * 0.86, h * 0.11);
    x.font = `900 italic ${s}px ${FONT}`;
    x.fillStyle = "#1e3a8a";
    x.fillText("STAY HYDRATED", w * 0.5, h * 0.17);
    x.fillStyle = "#ffffff";
    x.fillText("STAY ACTIVE", w * 0.5, h * 0.17 + s * 1.1);
    return;
  }

  const p = paletteAt(g);
  const a = alignment(g);
  const left = w * lerp(0.085, 0.07, a);
  const lines = ["STAY HYDRATED.", "STAY ACTIVE."];
  // Typography grows during 3.3, but never beyond the poster's width
  const size = fitSize(x, lines, w - left * 2, h * lerp(0.098, 0.112, easeInOut(range(g, 34.0, 35.0))));
  const typed = Math.floor(range(g, 32.3, 33.6) * (lines[0].length + lines[1].length));
  x.textAlign = "left";
  x.font = `900 italic ${size}px ${FONT}`;
  let remaining = typed;
  lines.forEach((line, i) => {
    const shown = line.slice(0, Math.max(0, Math.min(line.length, remaining)));
    remaining -= line.length;
    if (!shown) return;
    const y = h * 0.16 + i * size * 1.08 + lerp(h * 0.012, 0, a) * i;
    if (i === 1) {
      const wFull = x.measureText(shown).width;
      x.fillStyle = p.highlight;
      x.fillRect(left - size * 0.08, y - size * 0.86, wFull + size * 0.16, size * 1.02);
      x.fillStyle = p.ink;
    } else {
      x.fillStyle = p.text;
    }
    x.fillText(shown, left, y);
  });
  // Text cursor while typing
  if (g > 32.3 && g < 33.7 && typed < lines[0].length + lines[1].length) {
    x.fillStyle = "#ffffff";
    x.fillRect(left + (typed < lines[0].length ? x.measureText(lines[0].slice(0, typed)).width : x.measureText(lines[1].slice(0, typed - lines[0].length)).width) + 3, h * 0.16 + (typed < lines[0].length ? 0 : size * 1.08) - size * 0.8, 3, size * 0.85);
  }
  const tagline = range(g, 33.4, 33.9);
  if (tagline > 0) {
    x.globalAlpha = tagline;
    x.fillStyle = p.text;
    x.font = `600 ${h * 0.03}px ${FONT}`;
    x.fillText("Your everyday bottle · 750 ml", left, h * 0.42);
  }
  const cta = easeOut(range(g, 33.6, 34.0));
  if (cta > 0) {
    x.globalAlpha = cta;
    const bw = w * 0.3;
    const bh = h * 0.06;
    const bx = left;
    const by = h * lerp(0.82, 0.84, a);
    x.fillStyle = "#ffffff";
    x.beginPath();
    x.roundRect(bx, by, bw * cta, bh, bh / 2);
    x.fill();
    x.fillStyle = FINAL.bgA;
    x.font = `800 ${h * 0.026}px ${FONT}`;
    x.textAlign = "center";
    x.fillText("SHOP NOW", bx + bw / 2, by + bh * 0.66);
    x.textAlign = "left";
  }
  const tag = range(g, 33.8, 34.2);
  if (tag > 0) {
    x.globalAlpha = tag * 0.9;
    x.fillStyle = "#ffffff";
    x.font = `700 ${h * 0.024}px ${FONT}`;
    x.textAlign = "right";
    x.fillText("#StayHydrated", w * 0.94, h * 0.955);
  }
  x.globalAlpha = 1;
}

/** Where the product cut-out sits on each layout (centre x, centre y, height), as fractions of the poster. */
function productLayout(g: number, variant: PosterVariant) {
  if (variant === "altA") return { x: 0.3, y: 0.58, h: 0.6, show: 1 };
  if (variant === "altB") return { x: 0.5, y: 0.64, h: 0.56, show: 1 };
  return { x: lerp(0.68, 0.64, alignment(g)), y: 0.6, h: 0.62, show: easeOut(range(g, 31.0, 31.6)) };
}

/** The canvases a poster draws from (shared between every on-screen copy of the same layout). */
export class PosterArt {
  readonly bg: HTMLCanvasElement;
  readonly fg: HTMLCanvasElement;
  readonly bgTex: THREE.CanvasTexture;
  readonly fgTex: THREE.CanvasTexture;
  private bgKey = "";
  private fgKey = "";

  constructor(readonly variant: PosterVariant) {
    const make = () => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 640;
      return c;
    };
    this.bg = make();
    this.fg = make();
    this.bgTex = new THREE.CanvasTexture(this.bg);
    this.fgTex = new THREE.CanvasTexture(this.fg);
    for (const t of [this.bgTex, this.fgTex]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
    }
  }

  update(g: number) {
    const bgKey = this.variant === "main" ? posterBackgroundKey(g) : "static";
    const fgKey = this.variant === "main" ? posterForegroundKey(g) : "static";
    if (bgKey !== this.bgKey) {
      this.bgKey = bgKey;
      drawPosterBackground(this.bg.getContext("2d")!, 512, 640, g, this.variant);
      this.bgTex.needsUpdate = true;
    }
    if (fgKey !== this.fgKey) {
      this.fgKey = fgKey;
      drawPosterForeground(this.fg.getContext("2d")!, 512, 640, g, this.variant);
      this.fgTex.needsUpdate = true;
    }
  }

  dispose() {
    this.bgTex.dispose();
    this.fgTex.dispose();
  }
}

/** One physical copy of a poster: background, product cut-out and typography as stacked planes. */
export class PosterView {
  readonly group = new THREE.Group();
  private readonly product: THREE.Mesh;
  private readonly productMat: THREE.MeshBasicMaterial;
  private readonly mats: THREE.Material[] = [];
  private readonly geos: THREE.BufferGeometry[] = [];

  constructor(readonly art: PosterArt, product: THREE.Texture, readonly width: number) {
    const height = width * 1.25;
    const plane = (w: number, h: number, mat: THREE.Material, z: number) => {
      const geo = new THREE.PlaneGeometry(w, h);
      this.geos.push(geo);
      this.mats.push(mat);
      const m = new THREE.Mesh(geo, mat);
      m.position.z = z;
      m.layers.set(SCREEN_LAYER);
      this.group.add(m);
      return m;
    };
    plane(width, height, new THREE.MeshBasicMaterial({ map: art.bgTex, toneMapped: false, transparent: true }), 0);
    // The cut-out was rendered over transparent black, so its colours are premultiplied:
    // blend with (1, 1 − α) and scale colour with opacity for clean edges and fades.
    this.productMat = new THREE.MeshBasicMaterial({
      map: product,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    this.product = plane(1 / 3, 1, this.productMat, 0.0006);
    plane(width, height, new THREE.MeshBasicMaterial({ map: art.fgTex, toneMapped: false, transparent: true, depthWrite: false }), 0.0012);
  }

  /** Overall opacity (for fading copies in and out). */
  set opacity(v: number) {
    for (const m of this.mats) (m as THREE.MeshBasicMaterial).opacity = v;
  }

  update(g: number) {
    const width = this.width;
    const height = width * 1.25;
    const p = productLayout(g, this.art.variant);
    this.product.visible = p.show > 0.001;
    const ph = p.h * height * (0.85 + 0.15 * p.show);
    this.product.scale.set(ph, ph, 1);
    this.product.position.set((p.x - 0.5) * width, (0.5 - p.y) * height + (1 - p.show) * height * 0.04, 0.0006);
    const o = p.show * (this.mats[0] as THREE.MeshBasicMaterial).opacity;
    this.productMat.opacity = o;
    this.productMat.color.setScalar(o);
  }

  dispose() {
    for (const m of this.mats) m.dispose();
    for (const g of this.geos) g.dispose();
  }
}

// ---------------------------------------------------------------------------
// The approved poster as one flat image (scenes 4–6: phone, posts, ads, website)
// ---------------------------------------------------------------------------

/** three.js ACES filmic curve, so the flattened product matches the tone-mapped 3D poster. */
function acesFilmic(r: number, g: number, b: number, exposure: number): [number, number, number] {
  const k = exposure / 0.6;
  r *= k;
  g *= k;
  b *= k;
  const ir = 0.59719 * r + 0.35458 * g + 0.04823 * b;
  const ig = 0.076 * r + 0.90834 * g + 0.01566 * b;
  const ib = 0.0284 * r + 0.13383 * g + 0.83777 * b;
  const fit = (v: number) => (v * (v + 0.0245786) - 0.000090537) / (v * (0.983729 * v + 0.432951) + 0.238081);
  const fr = fit(ir);
  const fg = fit(ig);
  const fb = fit(ib);
  return [
    clamp01(1.60475 * fr - 0.53108 * fg - 0.07367 * fb),
    clamp01(-0.10208 * fr + 1.10813 * fg - 0.00605 * fb),
    clamp01(-0.00327 * fr - 0.07276 * fg + 1.07602 * fb),
  ];
}
const toSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

/**
 * Flattens the finished poster (background, the rendered bottle cut-out and typography) into
 * one 512 × 640 canvas. The bottle pixels are read back once from the product render, so every
 * flat copy shows the identical product and layout as the approved 3D poster.
 */
export function composeFinalPoster(gl: THREE.WebGLRenderer, product: ProductShot, exposure: number) {
  const art = new PosterArt("main");
  art.update(45);
  const out = document.createElement("canvas");
  out.width = 512;
  out.height = 640;
  const x = out.getContext("2d")!;
  x.drawImage(art.bg, 0, 0);

  const { width: w, height: h } = product.target;
  const px = new Uint8Array(w * h * 4);
  gl.readRenderTargetPixels(product.target, 0, 0, w, h, px);
  const cut = document.createElement("canvas");
  cut.width = w;
  cut.height = h;
  const img = new ImageData(w, h);
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) {
      const src = ((h - 1 - yy) * w + xx) * 4; // read-back rows are bottom-up
      const dst = (yy * w + xx) * 4;
      const a = px[src + 3] / 255;
      if (a <= 0) continue;
      // Linear, premultiplied → tone-mapped sRGB with straight alpha
      const [r, g, b] = acesFilmic(px[src] / 255 / a, px[src + 1] / 255 / a, px[src + 2] / 255 / a, exposure);
      img.data[dst] = toSrgb(r) * 255;
      img.data[dst + 1] = toSrgb(g) * 255;
      img.data[dst + 2] = toSrgb(b) * 255;
      img.data[dst + 3] = a * 255;
    }
  }
  cut.getContext("2d")!.putImageData(img, 0, 0);
  const p = productLayout(45, "main");
  const ph = p.h * 640;
  x.drawImage(cut, p.x * 512 - ph / 6, p.y * 640 - ph / 2, ph / 3, ph);
  x.drawImage(art.fg, 0, 0);
  art.dispose();
  return out;
}

// ---------------------------------------------------------------------------
// Floating creative elements and the approval badge
// ---------------------------------------------------------------------------

function cardCanvas(paint: (x: CanvasRenderingContext2D, w: number, h: number) => void, w = 256, h = 256) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d")!;
  x.fillStyle = "rgba(255,255,255,0.96)";
  x.beginPath();
  x.roundRect(4, 4, w - 8, h - 8, 26);
  x.fill();
  x.strokeStyle = "rgba(37,99,235,0.25)";
  x.lineWidth = 3;
  x.stroke();
  paint(x, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Small design-tool cards (palette, type, shapes, grid) that float around the workstation in 3.3. */
export function buildFloatingCards() {
  const textures = [
    cardCanvas((x, w) => {
      ["#1d4ed8", "#38bdf8", "#bfdbfe", "#facc15", "#0b1d4d"].forEach((c, i) => {
        x.fillStyle = c;
        x.beginPath();
        x.roundRect(28 + i * 41, 96, 34, 72, 10);
        x.fill();
      });
      x.fillStyle = "#334155";
      x.font = `700 22px ${FONT}`;
      x.fillText("Palette", 28, 64);
      void w;
    }),
    cardCanvas((x, w, h) => {
      x.fillStyle = "#0f172a";
      x.font = `900 italic 120px ${FONT}`;
      x.textAlign = "center";
      x.fillText("Aa", w / 2, h * 0.62);
      x.font = `600 20px ${FONT}`;
      x.fillStyle = "#64748b";
      x.fillText("Display Black", w / 2, h * 0.84);
    }),
    cardCanvas((x) => {
      x.fillStyle = "#2563eb";
      x.beginPath();
      x.arc(80, 100, 44, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = "#facc15";
      x.beginPath();
      x.moveTo(176, 56);
      x.lineTo(222, 140);
      x.lineTo(130, 140);
      x.fill();
      x.fillStyle = "#38bdf8";
      x.beginPath();
      x.roundRect(60, 160, 140, 56, 14);
      x.fill();
    }),
  ];
  return textures.map((map) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.15, 0.15),
      new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false, depthWrite: false }),
    );
    mesh.layers.set(SCREEN_LAYER);
    return mesh;
  });
}

export function buildBadge() {
  const map = cardCanvas((x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.fillStyle = "#16a34a";
    x.beginPath();
    x.roundRect(6, 6, w - 12, h - 12, (h - 12) / 2);
    x.fill();
    x.strokeStyle = "#ffffff";
    x.lineWidth = 9;
    x.lineCap = "round";
    x.beginPath();
    x.moveTo(42, h / 2 + 2);
    x.lineTo(60, h / 2 + 20);
    x.lineTo(92, h / 2 - 16);
    x.stroke();
    x.fillStyle = "#ffffff";
    x.font = `800 40px ${FONT}`;
    x.textBaseline = "middle";
    x.fillText("Approved", 112, h / 2 + 2);
  }, 360, 96);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.04), new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false, depthWrite: false }));
  mesh.layers.set(SCREEN_LAYER);
  return mesh;
}
