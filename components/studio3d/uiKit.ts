/**
 * Small 2D canvas helpers shared by the scene 4–5 screens and floating cards
 * (the scene 1–3 screens keep their own copies in editorUi.ts / designUi.ts).
 */

export type Ctx = CanvasRenderingContext2D;
export const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export function text(x: Ctx, s: string, px: number, py: number, size: number, color: string, weight = 500, align: CanvasTextAlign = "left") {
  x.font = `${weight} ${size}px ${FONT}`;
  x.fillStyle = color;
  x.textAlign = align;
  x.textBaseline = "middle";
  x.fillText(s, px, py);
}

export function box(x: Ctx, px: number, py: number, w: number, h: number, r: number, color: string | CanvasGradient) {
  x.beginPath();
  x.roundRect(px, py, w, h, r);
  x.fillStyle = color;
  x.fill();
}

export function outline(x: Ctx, px: number, py: number, w: number, h: number, r: number, color: string, width = 2) {
  x.beginPath();
  x.roundRect(px, py, w, h, r);
  x.strokeStyle = color;
  x.lineWidth = width;
  x.stroke();
}

export function check(x: Ctx, cx: number, cy: number, r: number, color = "#22c55e") {
  x.beginPath();
  x.arc(cx, cy, r, 0, Math.PI * 2);
  x.fillStyle = color;
  x.fill();
  x.strokeStyle = "#ffffff";
  x.lineWidth = r * 0.28;
  x.lineCap = "round";
  x.lineJoin = "round";
  x.beginPath();
  x.moveTo(cx - r * 0.45, cy + r * 0.02);
  x.lineTo(cx - r * 0.1, cy + r * 0.38);
  x.lineTo(cx + r * 0.5, cy - r * 0.35);
  x.stroke();
}

export function progress(x: Ctx, px: number, py: number, w: number, h: number, p: number, color = "#3b82f6", track = "rgba(15,23,42,0.1)") {
  box(x, px, py, w, h, h / 2, track);
  if (p > 0) box(x, px, py, Math.max(h, w * p), h, h / 2, color);
}

/** Card with a soft border, used as the base of every floating panel. */
export function card(x: Ctx, w: number, h: number, r = 22, fill = "#ffffff") {
  x.clearRect(0, 0, w, h);
  box(x, 3, 3, w - 6, h - 6, r, fill);
  outline(x, 3, 3, w - 6, h - 6, r, "rgba(37,99,235,0.22)", 3);
}

/** Pill-shaped label, e.g. "Illustrative example". Returns its width. */
export function pill(x: Ctx, s: string, px: number, cy: number, size: number, fg: string, bg: string, align: "left" | "right" = "left") {
  x.font = `700 ${size}px ${FONT}`;
  const w = x.measureText(s).width + size * 1.4;
  const left = align === "left" ? px : px - w;
  box(x, left, cy - size * 0.85, w, size * 1.7, size * 0.85, bg);
  text(x, s, left + w / 2, cy + size * 0.04, size, fg, 700, "center");
  return w;
}

export type Platform = "instagram" | "facebook" | "youtube";
export const PLATFORM_NAMES: Record<Platform, string> = { instagram: "Instagram", facebook: "Facebook", youtube: "YouTube" };

/** Simplified platform glyphs (flat, drawn in code; no logo files). */
export function platformIcon(x: Ctx, cx: number, cy: number, s: number, kind: Platform) {
  x.save();
  if (kind === "instagram") {
    const g = x.createLinearGradient(cx - s / 2, cy + s / 2, cx + s / 2, cy - s / 2);
    g.addColorStop(0, "#f59e0b");
    g.addColorStop(0.45, "#ec4899");
    g.addColorStop(1, "#7c3aed");
    box(x, cx - s / 2, cy - s / 2, s, s, s * 0.28, g);
    x.strokeStyle = "#ffffff";
    x.lineWidth = s * 0.085;
    x.beginPath();
    x.roundRect(cx - s * 0.3, cy - s * 0.3, s * 0.6, s * 0.6, s * 0.17);
    x.stroke();
    x.beginPath();
    x.arc(cx, cy, s * 0.14, 0, Math.PI * 2);
    x.stroke();
    x.fillStyle = "#ffffff";
    x.beginPath();
    x.arc(cx + s * 0.18, cy - s * 0.18, s * 0.04, 0, Math.PI * 2);
    x.fill();
  } else if (kind === "facebook") {
    x.fillStyle = "#1877f2";
    x.beginPath();
    x.arc(cx, cy, s / 2, 0, Math.PI * 2);
    x.fill();
    text(x, "f", cx + s * 0.04, cy + s * 0.08, s * 0.78, "#ffffff", 800, "center");
  } else {
    box(x, cx - s / 2, cy - s * 0.36, s, s * 0.72, s * 0.2, "#ef4444");
    x.fillStyle = "#ffffff";
    x.beginPath();
    x.moveTo(cx - s * 0.12, cy - s * 0.17);
    x.lineTo(cx + s * 0.2, cy);
    x.lineTo(cx - s * 0.12, cy + s * 0.17);
    x.fill();
  }
  x.restore();
}

/** Heart, speech bubble and share arrow glyphs in white (drawn over a coloured disc or on their own). */
export function heartPath(x: Ctx, cx: number, cy: number, s: number) {
  x.beginPath();
  x.moveTo(cx, cy + s * 0.32);
  x.bezierCurveTo(cx - s * 0.62, cy - s * 0.08, cx - s * 0.3, cy - s * 0.55, cx, cy - s * 0.2);
  x.bezierCurveTo(cx + s * 0.3, cy - s * 0.55, cx + s * 0.62, cy - s * 0.08, cx, cy + s * 0.32);
  x.closePath();
}
export function bubblePath(x: Ctx, cx: number, cy: number, s: number) {
  x.beginPath();
  x.ellipse(cx, cy - s * 0.04, s * 0.36, s * 0.28, 0, 0, Math.PI * 2);
  x.moveTo(cx - s * 0.2, cy + s * 0.16);
  x.lineTo(cx - s * 0.3, cy + s * 0.36);
  x.lineTo(cx - s * 0.02, cy + s * 0.22);
  x.closePath();
}
export function sharePath(x: Ctx, cx: number, cy: number, s: number) {
  x.beginPath();
  x.moveTo(cx + s * 0.34, cy - s * 0.04);
  x.lineTo(cx + s * 0.02, cy - s * 0.32);
  x.lineTo(cx + s * 0.02, cy - s * 0.16);
  x.bezierCurveTo(cx - s * 0.3, cy - s * 0.14, cx - s * 0.36, cy + s * 0.12, cx - s * 0.34, cy + s * 0.3);
  x.bezierCurveTo(cx - s * 0.22, cy + s * 0.1, cx - s * 0.08, cy + s * 0.06, cx + s * 0.02, cy + s * 0.07);
  x.lineTo(cx + s * 0.02, cy + s * 0.24);
  x.closePath();
}

export type Reaction = "like" | "comment" | "share";
export const REACTION_COLOR: Record<Reaction, string> = { like: "#ef4444", comment: "#3b82f6", share: "#22c55e" };

export function reactionGlyph(x: Ctx, cx: number, cy: number, s: number, kind: Reaction, color = "#ffffff") {
  if (kind === "like") heartPath(x, cx, cy, s);
  else if (kind === "comment") bubblePath(x, cx, cy, s);
  else sharePath(x, cx, cy, s);
  x.fillStyle = color;
  x.fill();
}

/** Compact counts: 1248 → "1.2K". */
export function compact(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(Math.round(n));
}

/** Text wrapped to `maxWidth`, top-aligned at `py`; returns the y after the last line. */
export function wrap(x: Ctx, s: string, px: number, py: number, maxWidth: number, size: number, color: string, weight = 500, lineHeight = 1.3) {
  x.font = `${weight} ${size}px ${FONT}`;
  const words = s.split(" ");
  let line = "";
  let y = py + size * 0.6;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (x.measureText(next).width > maxWidth && line) {
      text(x, line, px, y, size, color, weight);
      line = word;
      y += size * lineHeight;
    } else {
      line = next;
    }
  }
  if (line) text(x, line, px, y, size, color, weight);
  return y + size * 0.6;
}
