import { penAt } from "./designPen";
import { footageThumb } from "./editorUi";
import { easeInOut, lerp, range } from "./math";
import { paletteAt } from "./poster";

/** The poster artboard on the design monitor canvas (1280 × 720); the 3D poster planes sit exactly here. */
export const ARTBOARD = { x: 490, y: 64, w: 300, h: 375 } as const;

type Ctx = CanvasRenderingContext2D;
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const C = { bg: "#11141a", panel: "#181c24", panel2: "#1f2430", line: "#2a303c", text: "#d6dde8", dim: "#7d8797", accent: "#3b82f6", green: "#22c55e" };

function text(x: Ctx, s: string, px: number, py: number, size: number, color: string, weight = 500, align: CanvasTextAlign = "left") {
  x.font = `${weight} ${size}px ${FONT}`;
  x.fillStyle = color;
  x.textAlign = align;
  x.textBaseline = "middle";
  x.fillText(s, px, py);
}
function box(x: Ctx, px: number, py: number, w: number, h: number, r: number, color: string) {
  x.beginPath();
  x.roundRect(px, py, w, h, r);
  x.fillStyle = color;
  x.fill();
}

/** Flat illustration of the same blue bottle, for asset thumbnails. */
export function bottleIcon(x: Ctx, cx: number, cy: number, h: number) {
  const w = h * 0.3;
  x.fillStyle = "#2f6fe0";
  x.beginPath();
  x.roundRect(cx - w / 2, cy - h * 0.36, w, h * 0.78, w * 0.18);
  x.fill();
  x.fillStyle = "#e8ecf2";
  x.fillRect(cx - w / 2, cy - h * 0.04, w, h * 0.12);
  x.beginPath();
  x.roundRect(cx - w * 0.28, cy - h * 0.5, w * 0.56, h * 0.16, w * 0.08);
  x.fill();
}

export function designMainKey(g: number) {
  return String(Math.round(g * 80));
}

export function drawDesignMain(x: Ctx, w: number, h: number, g: number) {
  x.fillStyle = C.bg;
  x.fillRect(0, 0, w, h);

  // Title bar
  x.fillStyle = C.panel;
  x.fillRect(0, 0, w, 34);
  ["#ef4444", "#f59e0b", "#22c55e"].forEach((c, i) => {
    x.fillStyle = c;
    x.beginPath();
    x.arc(16 + i * 16, 17, 5, 0, Math.PI * 2);
    x.fill();
  });
  text(x, "Studio Design", 70, 17, 13, C.text, 700);
  ["File", "Edit", "Object", "Type", "Select", "View"].forEach((m, i) => text(x, m, 170 + i * 64, 17, 12, C.dim));
  text(x, "Hydration_Campaign_Post", w - 16, 17, 12, C.dim, 500, "right");

  // Tool bar — the active tool follows the action
  const pen = penAt(g);
  const tool = g < 31 ? 0 : g < 33.2 ? 1 : g < 34.05 ? 2 : g < 36.3 ? 0 : 3;
  x.fillStyle = C.panel;
  x.fillRect(0, 36, 48, h - 36);
  for (let i = 0; i < 8; i++) {
    box(x, 10, 50 + i * 40, 28, 28, 6, i === tool ? C.accent : C.panel2);
    x.strokeStyle = i === tool ? "#ffffff" : C.dim;
    x.lineWidth = 2;
    x.strokeRect(17, 57 + i * 40, 14, 14);
  }

  // Assets from the shoot, then layers as each element is created
  x.fillStyle = C.panel;
  x.fillRect(50, 36, 250, h - 36);
  text(x, "ASSETS", 66, 56, 11, C.dim, 700);
  const fromShoot = range(g, 29.6, 29.8);
  if (fromShoot > 0) {
    x.globalAlpha = fromShoot;
    box(x, 130, 46, 100, 20, 10, "rgba(34,197,94,0.18)");
    text(x, "From Shoot ✓", 180, 56, 10, C.green, 700, "center");
    x.globalAlpha = 1;
  }
  const assets = [29.7, 29.95, 30.2];
  assets.forEach((t, i) => {
    const p = range(g, t, t + 0.18);
    if (p <= 0) return;
    x.globalAlpha = p;
    const tx = 66 + (i % 2) * 112;
    const ty = 74 + Math.floor(i / 2) * 104;
    if (i < 2) {
      box(x, tx, ty, 100, 76, 8, i === 0 ? "#e8eef7" : "#dbeafe");
      bottleIcon(x, tx + 50, ty + 40, 60);
    } else {
      footageThumb(x, tx, ty, 100, 76, 1, true);
    }
    text(x, ["Bottle_cutout.png", "Bottle_angle.png", "A002_still.jpg"][i], tx, ty + 88, 10, C.text, 600);
    x.globalAlpha = 1;
  });
  text(x, "LAYERS", 66, 300, 11, C.dim, 700);
  const layers: [string, number][] = [
    ["Background", 30.85], ["Product", 31.0], ["Circle", 31.2], ["Wave", 31.7], ["Swoosh", 32.3], ["Headline", 32.3], ["Tagline", 33.4], ["Button", 33.6],
  ];
  let row = 0;
  for (const [name, at] of layers) {
    const p = range(g, at, at + 0.15);
    if (p <= 0) continue;
    x.globalAlpha = p;
    const active = g >= at && g < at + 0.6;
    box(x, 60, 314 + row * 32, 230, 26, 6, active ? "rgba(59,130,246,0.28)" : C.panel2);
    text(x, name, 74, 327 + row * 32, 12, C.text, active ? 700 : 500);
    x.globalAlpha = 1;
    row++;
  }

  // Canvas area with the artboard (the poster itself is drawn by 3D planes on top)
  x.fillStyle = "#0c0f14";
  x.fillRect(302, 36, 686, h - 36);
  text(x, "Post 4:5 · 1080 × 1350", ARTBOARD.x, ARTBOARD.y - 14, 11, C.dim, 600);
  x.fillStyle = "#ffffff";
  x.fillRect(ARTBOARD.x, ARTBOARD.y, ARTBOARD.w, ARTBOARD.h);
  const selected = range(g, 36.55, 36.7);
  if (selected > 0) {
    x.strokeStyle = `rgba(59,130,246,${selected})`;
    x.lineWidth = 4;
    x.strokeRect(ARTBOARD.x - 4, ARTBOARD.y - 4, ARTBOARD.w + 8, ARTBOARD.h + 8);
  }

  // Variants strip
  const variants = range(g, 35.0, 35.8);
  if (variants > 0) {
    x.globalAlpha = variants;
    const items: [string, string, string][] = [["Main", "#1d4ed8", "#38bdf8"], ["Variant A", "#f8fafc", "#dbeafe"], ["Variant B", "#facc15", "#fde68a"]];
    items.forEach(([label, a, b], i) => {
      const vx = 380 + i * 180;
      const vy = 470;
      const grad = x.createLinearGradient(vx, vy, vx + 56, vy + 70);
      grad.addColorStop(0, a);
      grad.addColorStop(1, b);
      x.fillStyle = grad;
      x.fillRect(vx, vy, 56, 70);
      bottleIcon(x, vx + (i === 1 ? 18 : 34), vy + 44, 40);
      const chosen = i === 0 && selected > 0;
      text(x, label, vx + 66, vy + 24, 12, chosen ? "#ffffff" : C.text, chosen ? 700 : 500);
      text(x, chosen ? "Selected ✓" : i === 0 ? "Draft" : "Alternative", vx + 66, vy + 44, 11, chosen ? C.green : C.dim, 600);
    });
    x.globalAlpha = 1;
  }

  // Pen cursor mirrors the stylus on the tablet
  if (pen.held && g < 36.9) {
    const cx = ARTBOARD.x + ((pen.x + 1) / 2) * ARTBOARD.w;
    const cy = ARTBOARD.y + (1 - (pen.y + 1) / 2) * ARTBOARD.h;
    x.strokeStyle = "#ffffff";
    x.lineWidth = 2;
    x.beginPath();
    x.arc(cx, cy, pen.down > 0.5 ? 5 : 9, 0, Math.PI * 2);
    x.stroke();
    if (pen.down > 0.5) {
      x.fillStyle = C.accent;
      x.beginPath();
      x.arc(cx, cy, 3, 0, Math.PI * 2);
      x.fill();
    }
  }

  // Properties
  x.fillStyle = C.panel;
  x.fillRect(990, 36, 290, h - 36);
  text(x, "TYPOGRAPHY", 1006, 56, 11, C.dim, 700);
  box(x, 1006, 70, 258, 30, 6, C.panel2);
  text(x, "Display Black Italic", 1018, 85, 12, C.text, 600);
  const typeAdjust = easeInOut(range(g, 34.0, 35.0));
  const typeActive = g > 34.0 && g < 35.1;
  text(x, "Size", 1006, 120, 12, C.dim);
  text(x, `${Math.round(lerp(96, 112, typeAdjust))} pt`, 1264, 120, 12, typeActive ? "#ffffff" : C.text, 700, "right");
  text(x, "Tracking", 1006, 146, 12, C.dim);
  text(x, `${Math.round(lerp(-10, -25, typeAdjust))}`, 1264, 146, 12, typeActive ? "#ffffff" : C.text, 700, "right");

  text(x, "COLOUR", 1006, 186, 11, C.dim, 700);
  const p = paletteAt(g);
  [p.bgA, p.bgB, p.shape, p.accent, p.ink].forEach((c, i) => {
    box(x, 1006 + i * 50, 200, 40, 40, 8, c);
    const cycling = g > 34.5 && g < 35.5 && Math.floor((g - 34.5) * 10) % 5 === i;
    if (cycling) {
      x.strokeStyle = "#ffffff";
      x.lineWidth = 3;
      x.strokeRect(1004 + i * 50, 198, 44, 44);
    }
  });
  text(x, g < 34.5 ? "Draft palette" : g < 35.5 ? "Trying palettes…" : "Brand palette ✓", 1006, 258, 11, g >= 35.5 ? C.green : C.dim, 600);

  text(x, "ALIGN", 1006, 292, 11, C.dim, 700);
  const aligning = g > 35.5 && g < 36.25;
  for (let i = 0; i < 6; i++) box(x, 1006 + i * 42, 306, 34, 30, 6, aligning && Math.floor((g - 35.5) * 8) % 6 === i ? C.accent : C.panel2);

  text(x, "EXPORT", 1006, 372, 11, C.dim, 700);
  text(x, "PNG · 1080 × 1350", 1006, 396, 12, C.text, 500);
  const approved = range(g, 38.95, 39.15);
  box(x, 1006, 420, 258, 40, 10, approved > 0.5 ? C.green : C.accent);
  text(x, approved > 0.5 ? "Approved ✓" : "Approve design", 1135, 440, 14, "#ffffff", 700, "center");
  if (approved > 0.5) text(x, "Ready for social publishing", 1006, 484, 11, C.green, 600);
}

/** Static content calendar on the social laptop. */
export function drawSocialLaptop(x: Ctx, w: number, h: number) {
  x.fillStyle = "#f8fafc";
  x.fillRect(0, 0, w, h);
  x.fillStyle = "#e2e8f0";
  x.fillRect(0, 0, w, 40);
  text(x, "Content calendar · This week", 18, 20, 15, "#0f172a", 700);
  ["Mon", "Tue", "Wed", "Thu", "Fri"].forEach((d, i) => {
    const cx = 18 + i * 122;
    text(x, d, cx, 62, 12, "#64748b", 700);
    for (let k = 0; k < 3; k++) {
      const filled = (i + k) % 2 === 0;
      box(x, cx, 78 + k * 102, 110, 92, 10, filled ? ["#dbeafe", "#fef3c7", "#ede9fe"][k] : "#ffffff");
      if (filled) {
        box(x, cx + 10, 88 + k * 102, 40, 40, 6, ["#2563eb", "#f59e0b", "#8b5cf6"][k]);
        text(x, ["Reel", "Post", "Story"][k], cx + 10, 146 + k * 102, 11, "#334155", 600);
      }
    }
  });
}
