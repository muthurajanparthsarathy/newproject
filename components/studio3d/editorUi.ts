import { clamp01, easeInOut, easeOut, lerp, range } from "./math";

/**
 * 2D canvas drawings for every in-studio screen. Each is a pure function of the story
 * position `g`, so screens show the right state after any jump, forwards or backwards.
 */

type Ctx = CanvasRenderingContext2D;
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const C = {
  bg: "#11141a",
  panel: "#181c24",
  panel2: "#1f2430",
  line: "#2a303c",
  text: "#d6dde8",
  dim: "#7d8797",
  accent: "#3b82f6",
  violet: "#8b5cf6",
  teal: "#14b8a6",
  amber: "#f5b301",
  pink: "#ec4899",
  green: "#22c55e",
  red: "#ef4444",
};

function rr(x: Ctx, px: number, py: number, w: number, h: number, r: number) {
  x.beginPath();
  x.roundRect(px, py, w, h, r);
}
function fillRR(x: Ctx, px: number, py: number, w: number, h: number, r: number, color: string) {
  rr(x, px, py, w, h, r);
  x.fillStyle = color;
  x.fill();
}
function text(x: Ctx, s: string, px: number, py: number, size: number, color: string, weight = 500, align: CanvasTextAlign = "left") {
  x.font = `${weight} ${size}px ${FONT}`;
  x.fillStyle = color;
  x.textAlign = align;
  x.textBaseline = "middle";
  x.fillText(s, px, py);
}
function check(x: Ctx, cx: number, cy: number, r: number, color = C.green) {
  x.beginPath();
  x.arc(cx, cy, r, 0, Math.PI * 2);
  x.fillStyle = color;
  x.fill();
  x.strokeStyle = "#ffffff";
  x.lineWidth = r * 0.28;
  x.lineCap = "round";
  x.beginPath();
  x.moveTo(cx - r * 0.45, cy + r * 0.02);
  x.lineTo(cx - r * 0.1, cy + r * 0.38);
  x.lineTo(cx + r * 0.5, cy - r * 0.35);
  x.stroke();
}
function progressBar(x: Ctx, px: number, py: number, w: number, h: number, p: number, color = C.accent) {
  fillRR(x, px, py, w, h, h / 2, "rgba(255,255,255,0.14)");
  if (p > 0) fillRR(x, px, py, Math.max(h, w * p), h, h / 2, color);
}

/** Stylised still of the shoot footage (presenter with the blue bottle), for thumbnails. */
export function footageThumb(x: Ctx, px: number, py: number, w: number, h: number, variant = 0, graded = false) {
  x.save();
  rr(x, px, py, w, h, Math.min(w, h) * 0.06);
  x.clip();
  const g = x.createLinearGradient(px, py, px, py + h);
  g.addColorStop(0, graded ? "#f4ead9" : "#ddd8cf");
  g.addColorStop(1, graded ? "#e2cdb0" : "#c9c3b8");
  x.fillStyle = g;
  x.fillRect(px, py, w, h);
  const cx = px + w * (0.5 + (variant - 1) * 0.06);
  const s = h / 100;
  x.fillStyle = graded ? "#f8f6f1" : "#e9e7e2";
  x.beginPath();
  x.ellipse(cx, py + h * 1.02, 34 * s, 38 * s, 0, Math.PI, 0);
  x.fill();
  x.fillStyle = graded ? "#5a3826" : "#4b3a2f";
  x.beginPath();
  x.ellipse(cx, py + h * 0.42, 17 * s, 21 * s, 0, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = graded ? "#e7b48f" : "#cfae95";
  x.beginPath();
  x.ellipse(cx, py + h * 0.45, 11.5 * s, 14 * s, 0, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = graded ? "#2f6fe0" : "#4b6fae";
  rr(x, cx + 16 * s, py + h * (0.48 - variant * 0.04), 8 * s, 24 * s, 3 * s);
  x.fill();
  x.restore();
}

// ---------------------------------------------------------------------------
// Camera field monitor overlay (transparent canvas over the live/recorded feed)
// ---------------------------------------------------------------------------

export const REC_START = 12.45;
export const REC_STOP = 16.3;

export function cameraMonitorKey(g: number, time: number) {
  const blink = g >= REC_START && g < REC_STOP ? Math.floor(time * 2) % 2 : 0;
  return `${Math.round(g * 40)}:${blink}`;
}

export function drawCameraMonitor(x: Ctx, w: number, h: number, g: number, time: number) {
  x.clearRect(0, 0, w, h);
  const recording = g >= REC_START && g < REC_STOP;
  const s = w / 512;
  // Frame guides
  x.strokeStyle = "rgba(255,255,255,0.55)";
  x.lineWidth = 2 * s;
  const m = 26 * s;
  const L = 22 * s;
  for (const [cx, cy, dx, dy] of [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]] as const) {
    x.beginPath();
    x.moveTo(cx, cy + dy * L);
    x.lineTo(cx, cy);
    x.lineTo(cx + dx * L, cy);
    x.stroke();
  }
  // Top status strip
  x.fillStyle = "rgba(0,0,0,0.45)";
  x.fillRect(0, 0, w, 30 * s);
  const seconds = recording ? Math.floor(((g - REC_START) / (REC_STOP - REC_START)) * 18) : g >= REC_STOP ? 18 : 0;
  const tc = `00:00:${String(seconds).padStart(2, "0")}:${String(Math.floor((g * 97) % 25)).padStart(2, "0")}`;
  if (recording) {
    if (Math.floor(time * 2) % 2 === 0) {
      x.fillStyle = C.red;
      x.beginPath();
      x.arc(18 * s, 15 * s, 6 * s, 0, Math.PI * 2);
      x.fill();
    }
    text(x, "REC", 30 * s, 15 * s, 15 * s, "#ffffff", 700);
  } else if (g < REC_START) {
    text(x, "STBY", 14 * s, 15 * s, 15 * s, "#ffffff", 700);
  } else {
    text(x, "▶ PLAYBACK", 14 * s, 15 * s, 14 * s, "#ffffff", 700);
  }
  text(x, tc, w / 2, 15 * s, 14 * s, "#ffffff", 600, "center");
  text(x, "4K · 25p · ISO 800", w - 14 * s, 15 * s, 12 * s, "rgba(255,255,255,0.85)", 500, "right");
  // Audio meters
  for (let i = 0; i < 2; i++) {
    const level = recording ? 0.45 + 0.35 * Math.abs(Math.sin(time * (5 + i) + i)) : 0.15;
    x.fillStyle = "rgba(0,0,0,0.4)";
    x.fillRect(w - 26 * s + i * 9 * s, 46 * s, 6 * s, 90 * s);
    x.fillStyle = level > 0.75 ? "#facc15" : C.green;
    x.fillRect(w - 26 * s + i * 9 * s, 46 * s + 90 * s * (1 - level), 6 * s, 90 * s * level);
  }

  // Recording complete banner, then playback scrub bar
  const done = clamp01(range(g, REC_STOP, REC_STOP + 0.15)) * (1 - range(g, 17.05, 17.25));
  if (done > 0) {
    x.globalAlpha = done;
    fillRR(x, w / 2 - 150 * s, h / 2 - 28 * s, 300 * s, 56 * s, 12 * s, "rgba(15,23,42,0.82)");
    check(x, w / 2 - 112 * s, h / 2, 14 * s);
    text(x, "Recording complete", w / 2 - 88 * s, h / 2, 19 * s, "#ffffff", 700);
    x.globalAlpha = 1;
  }
  if (g >= 16.55 && g < 18.2) {
    const p = range(g, 16.6, 17.9);
    fillRR(x, 18 * s, h - 34 * s, w - 36 * s, 22 * s, 11 * s, "rgba(0,0,0,0.5)");
    progressBar(x, 52 * s, h - 26 * s, w - 150 * s, 6 * s, p);
    text(x, "▶", 32 * s, h - 23 * s, 13 * s, "#ffffff", 700, "center");
    text(x, `00:${String(Math.round(p * 18)).padStart(2, "0")} / 00:18`, w - 28 * s, h - 23 * s, 12 * s, "#ffffff", 600, "right");
  }

  // Transfer status
  const transferIn = range(g, 18.1, 18.3);
  const transferOut = 1 - range(g, 20.9, 21.2);
  if (transferIn > 0 && transferOut > 0) {
    const p = easeInOut(range(g, 18.25, 20.45));
    x.globalAlpha = Math.min(transferIn, transferOut);
    fillRR(x, w / 2 - 170 * s, h / 2 - 46 * s, 340 * s, 92 * s, 14 * s, "rgba(15,23,42,0.86)");
    if (p < 1) {
      text(x, "Transferring footage…", w / 2 - 146 * s, h / 2 - 16 * s, 18 * s, "#ffffff", 700);
      progressBar(x, w / 2 - 146 * s, h / 2 + 12 * s, 236 * s, 10 * s, p);
      text(x, `${Math.round(p * 100)}%`, w / 2 + 146 * s, h / 2 + 17 * s, 17 * s, "#ffffff", 700, "right");
    } else {
      check(x, w / 2 - 128 * s, h / 2, 16 * s);
      text(x, "Sent to edit", w / 2 - 100 * s, h / 2 - 9 * s, 19 * s, "#ffffff", 700);
      text(x, "3 clips · 4K · ready", w / 2 - 100 * s, h / 2 + 15 * s, 13 * s, "rgba(255,255,255,0.75)", 500);
    }
    x.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------------------
// Editor main monitor (the footage preview itself is a separate 3D plane)
// ---------------------------------------------------------------------------

/** Where the footage preview sits on the main monitor canvas (1280 × 720). */
export const PREVIEW = { x: 300, y: 44, w: 680, h: 382 } as const;

type Clip = { x: number; w: number; color: string; label: string };

function timelineClips(g: number): Clip[] {
  const base = 96;
  if (g < 22.55) return [];
  const drop = easeOut(range(g, 22.55, 22.95));
  if (g < 23.15) return [{ x: base, w: 760 * drop + 40, color: C.accent, label: "A001" }];
  // Razor cuts, trims and a swap of the last two clips
  const cut = range(g, 23.15, 23.45);
  const trim = easeInOut(range(g, 23.45, 23.75));
  const swap = easeInOut(range(g, 23.7, 24.0));
  const a = { x: base, w: lerp(250, 230, trim), color: C.accent, label: "A001 · Hook" };
  const bW = lerp(260, 205, trim);
  const cW = lerp(250, 215, trim);
  const gap = lerp(0, 10, cut);
  const bX0 = base + 250 + gap;
  const cX0 = bX0 + 260 + gap;
  const bX1 = base + a.w + 10 + cW + 10;
  const cX1 = base + a.w + 10;
  return [
    a,
    { x: lerp(lerp(bX0, base + a.w + 10, trim), bX1, swap), w: bW, color: C.violet, label: "A002 · Demo" },
    { x: lerp(lerp(cX0, base + a.w + 20 + bW, trim), cX1, swap), w: cW, color: C.teal, label: "A003 · Smile" },
  ];
}

export function editorMainKey(g: number) {
  return String(Math.round(g * 60));
}

export function drawEditorMain(x: Ctx, w: number, h: number, g: number) {
  x.fillStyle = C.bg;
  x.fillRect(0, 0, w, h);

  // Title bar
  x.fillStyle = C.panel;
  x.fillRect(0, 0, w, 34);
  for (const [i, c] of ["#ef4444", "#f59e0b", "#22c55e"].entries()) {
    x.fillStyle = c;
    x.beginPath();
    x.arc(16 + i * 16, 17, 5, 0, Math.PI * 2);
    x.fill();
  }
  text(x, "Studio Edit", 70, 17, 13, C.text, 700);
  ["File", "Edit", "Clip", "Sequence", "Colour", "Graphics"].forEach((m, i) => text(x, m, 160 + i * 70, 17, 12, C.dim));
  text(x, "UGC_Hydration_Reel", w - 16, 17, 12, C.dim, 500, "right");

  // Media bin
  x.fillStyle = C.panel;
  x.fillRect(0, 36, 290, 392);
  text(x, "MEDIA", 16, 56, 11, C.dim, 700);
  const imported = [21.2, 21.45, 21.7].map((t) => range(g, t, t + 0.18));
  if (g < 21.15) {
    text(x, "Waiting for footage…", 145, 230, 13, C.dim, 500, "center");
  }
  imported.forEach((p, i) => {
    if (p <= 0) return;
    x.globalAlpha = p;
    const tx = 16 + (i % 2) * 134;
    const ty = 74 + Math.floor(i / 2) * 104;
    footageThumb(x, tx, ty, 124, 70, i, g > 25);
    text(x, `A00${i + 1}.mov`, tx, ty + 84, 11, C.text, 600);
    text(x, `00:0${6 - i}`, tx + 124, ty + 84, 11, C.dim, 500, "right");
    x.globalAlpha = 1;
  });
  if (g >= 21.1 && g < 22.1) {
    const p = range(g, 21.1, 21.95);
    fillRR(x, 16, 380, 258, 34, 8, C.panel2);
    text(x, p < 1 ? "Importing 3 clips…" : "Imported 3 clips", 28, 391, 11, C.text, 600);
    progressBar(x, 28, 402, 234, 5, p);
  }

  // Preview frame (the footage plane covers its inside)
  x.fillStyle = "#000000";
  x.fillRect(PREVIEW.x, PREVIEW.y, PREVIEW.w, PREVIEW.h);
  x.strokeStyle = C.line;
  x.strokeRect(PREVIEW.x - 0.5, PREVIEW.y - 0.5, PREVIEW.w + 1, PREVIEW.h + 1);
  const portrait = range(g, 27.0, 27.6);
  text(x, portrait > 0.5 ? "9:16 · 1080 × 1920" : "16:9 · 3840 × 2160", PREVIEW.x + 8, PREVIEW.y + PREVIEW.h + 18, 11, C.dim);
  const playing = g >= 27.15;
  text(x, playing ? "❚❚" : "▶", PREVIEW.x + PREVIEW.w / 2, PREVIEW.y + PREVIEW.h + 18, 14, C.text, 700, "center");

  // Inspector
  x.fillStyle = C.panel;
  x.fillRect(990, 36, 290, 392);
  const grade = range(g, 24.15, 25.9);
  const captions = range(g, 26.0, 26.9);
  if (g >= 24 && g < 26) {
    text(x, "COLOUR", 1006, 56, 11, C.dim, 700);
    ["Lift", "Gamma", "Gain"].forEach((label, i) => {
      const cx = 1036 + i * 96;
      const cy = 130;
      const ring = x.createConicGradient(0, cx, cy);
      ["#ef4444", "#f59e0b", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7", "#ef4444"].forEach((c, k) => ring.addColorStop(k / 6, c));
      x.beginPath();
      x.arc(cx, cy, 36, 0, Math.PI * 2);
      x.strokeStyle = ring;
      x.lineWidth = 6;
      x.stroke();
      x.fillStyle = "#0d1016";
      x.beginPath();
      x.arc(cx, cy, 32, 0, Math.PI * 2);
      x.fill();
      const ang = [-2.4, 0.6, -0.4][i];
      const r = [8, 6, 14][i] * easeInOut(grade);
      x.fillStyle = "#ffffff";
      x.beginPath();
      x.arc(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 4, 0, Math.PI * 2);
      x.fill();
      text(x, label, cx, cy + 50, 11, C.dim, 600, "center");
    });
    [["Contrast", 0.5 + 0.18 * grade], ["Saturation", 0.5 + 0.22 * grade], ["Temperature", 0.5 + 0.12 * grade]].forEach(([label, v], i) => {
      const y = 228 + i * 40;
      text(x, label as string, 1006, y, 11, C.text, 500);
      progressBar(x, 1006, y + 12, 250, 4, v as number);
    });
    text(x, grade > 0.98 ? "Look applied ✓" : "Grading…", 1006, 360, 12, grade > 0.98 ? C.green : C.dim, 600);
  } else if (g >= 26 && g < 27.6) {
    text(x, "TEXT", 1006, 56, 11, C.dim, 700);
    fillRR(x, 1006, 74, 258, 34, 8, C.panel2);
    text(x, "Captions · Bold Pop", 1018, 91, 12, C.text, 600);
    ["#ffffff", "#facc15", "#3b82f6", "#ec4899"].forEach((c, i) => fillRR(x, 1006 + i * 34, 124, 26, 26, 6, c));
    text(x, "Animate in: Pop", 1006, 176, 12, C.text, 500);
    progressBar(x, 1006, 196, 250, 4, captions);
    text(x, "Motion graphics", 1006, 236, 12, C.text, 500);
    fillRR(x, 1006, 252, 120, 68, 8, "#26304a");
    text(x, "Badge", 1066, 286, 12, C.text, 600, "center");
    fillRR(x, 1136, 252, 120, 68, 8, "#3a2440");
    text(x, "Swipe", 1196, 286, 12, C.text, 600, "center");
  } else if (g >= 27.6) {
    text(x, "EXPORT", 1006, 56, 11, C.dim, 700);
    [["Format", "H.264 · MP4"], ["Size", "1080 × 1920"], ["Frame rate", "30 fps"], ["Platform", "Reels / Shorts"]].forEach(([k, v], i) => {
      text(x, k, 1006, 90 + i * 34, 12, C.dim);
      text(x, v, 1264, 90 + i * 34, 12, C.text, 600, "right");
    });
  } else {
    text(x, "CLIP", 1006, 56, 11, C.dim, 700);
    if (g >= 21.3) {
      [["Name", "A001.mov"], ["Duration", "00:00:06"], ["Resolution", "3840 × 2160"], ["Speed", "100%"]].forEach(([k, v], i) => {
        text(x, k, 1006, 90 + i * 34, 12, C.dim);
        text(x, v, 1264, 90 + i * 34, 12, C.text, 600, "right");
      });
    }
  }

  // Timeline
  x.fillStyle = C.panel;
  x.fillRect(0, 440, w, h - 440);
  x.fillStyle = C.panel2;
  x.fillRect(0, 440, w, 22);
  for (let i = 0; i <= 12; i++) {
    const tx = 96 + i * 92;
    x.fillStyle = C.line;
    x.fillRect(tx, 452, 1, 10);
    text(x, `00:${String(i * 2).padStart(2, "0")}`, tx + 4, 451, 10, C.dim);
  }
  const tracks = [["V2", 488], ["V1", 538], ["A1", 594], ["A2", 648]] as const;
  for (const [label, ty] of tracks) {
    x.fillStyle = "#151920";
    x.fillRect(90, ty - 20, w - 100, 40);
    text(x, label, 40, ty, 12, C.dim, 700, "center");
  }
  const clips = timelineClips(g);
  for (const c of clips) {
    fillRR(x, c.x, 520, c.w, 36, 6, c.color);
    if (g > 24.6) fillRR(x, c.x + c.w - 30, 524, 24, 12, 4, "rgba(255,255,255,0.85)");
    if (g > 24.6) text(x, "fx", c.x + c.w - 18, 530, 9, "#111827", 800, "center");
    text(x, c.label, c.x + 8, 538, 11, "#ffffff", 600);
    // Matching audio
    x.fillStyle = "rgba(20,184,166,0.35)";
    rr(x, c.x, 578, c.w, 32, 6);
    x.fill();
    x.strokeStyle = C.teal;
    x.lineWidth = 1;
    x.beginPath();
    for (let k = 0; k < c.w; k += 3) {
      const amp = 4 + 10 * Math.abs(Math.sin((c.x + k) * 0.13) * Math.cos((c.x + k) * 0.031));
      x.moveTo(c.x + k, 594 - amp);
      x.lineTo(c.x + k, 594 + amp);
    }
    x.stroke();
  }
  // Drag from bin to timeline
  if (g >= 22.3 && g < 22.75) {
    const p = easeInOut(range(g, 22.3, 22.7));
    x.globalAlpha = 0.85;
    footageThumb(x, lerp(16, 300, p), lerp(74, 515, p), 124, 70, 0);
    x.globalAlpha = 1;
  }
  if (g >= 23.15 && g < 23.5) {
    for (const cx of [346, 616]) {
      x.strokeStyle = "#ffffff";
      x.setLineDash([4, 3]);
      x.beginPath();
      x.moveTo(cx, 500);
      x.lineTo(cx, 570);
      x.stroke();
      x.setLineDash([]);
    }
  }
  // Captions and graphics on V2, music on A2
  if (captions > 0) {
    const items: Clip[] = [
      { x: 110, w: 220, color: C.amber, label: "STAY HYDRATED" },
      { x: 340, w: 200, color: C.amber, label: "STAY ACTIVE" },
      { x: 552, w: 150, color: C.pink, label: "Badge" },
    ];
    items.forEach((c, i) => {
      const p = range(captions, i * 0.25, i * 0.25 + 0.4);
      if (p <= 0) return;
      x.globalAlpha = p;
      fillRR(x, c.x, 472, c.w * easeOut(p), 32, 6, c.color);
      text(x, c.label, c.x + 8, 488, 11, "#111827", 700);
      x.globalAlpha = 1;
    });
    x.globalAlpha = captions;
    fillRR(x, 96, 632, 720, 32, 6, "rgba(139,92,246,0.55)");
    text(x, "♪ Upbeat_Track_02", 106, 648, 11, "#ffffff", 600);
    x.globalAlpha = 1;
  }
  // Playhead
  const playX = g < 23 ? 96 : g < 27.15 ? lerp(96, 420, range(g, 23, 26.9)) : lerp(96, 780, range(g, 27.15, 28.4));
  x.fillStyle = "#f8fafc";
  x.fillRect(playX, 444, 2, h - 450);
  x.beginPath();
  x.moveTo(playX - 6, 444);
  x.lineTo(playX + 8, 444);
  x.lineTo(playX + 1, 454);
  x.fill();

  // Export status: a compact panel over the timeline, so the playing reel stays visible
  const exportIn = range(g, 27.85, 28.0);
  if (exportIn > 0) {
    const p = easeInOut(range(g, 28.0, 28.75));
    const px = w - 430;
    const py = h - 132;
    x.globalAlpha = exportIn;
    fillRR(x, px, py, 410, 112, 14, "#1f2638");
    x.strokeStyle = p < 1 ? C.accent : C.green;
    x.lineWidth = 2;
    rr(x, px, py, 410, 112, 14);
    x.stroke();
    if (p < 1) {
      text(x, "Exporting reel…", px + 24, py + 30, 19, "#ffffff", 700);
      text(x, "1080 × 1920 · H.264 · 30 fps", px + 24, py + 56, 13, C.dim, 500);
      progressBar(x, px + 24, py + 80, 300, 10, p);
      text(x, `${Math.round(p * 100)}%`, px + 386, py + 85, 16, "#ffffff", 700, "right");
    } else {
      check(x, px + 44, py + 56, 22);
      text(x, "Export complete", px + 80, py + 42, 21, "#ffffff", 700);
      text(x, "Ready to post · 00:18 · 24 MB", px + 80, py + 72, 13, C.dim, 500);
    }
    x.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------------------
// Secondary monitor and laptop
// ---------------------------------------------------------------------------

export function editorSideKey(g: number) {
  return String(Math.round(g * 20));
}

export function drawEditorSide(x: Ctx, w: number, h: number, g: number) {
  x.fillStyle = C.bg;
  x.fillRect(0, 0, w, h);
  x.fillStyle = C.panel;
  x.fillRect(0, 0, w, 40);
  const mode = g < 24 ? "library" : g < 26 ? "scopes" : g < 27.6 ? "graphics" : "formats";
  text(x, { library: "Project library", scopes: "Scopes", graphics: "Graphics templates", formats: "Social formats" }[mode], 20, 20, 16, C.text, 700);
  if (mode === "library") {
    for (let i = 0; i < 6; i++) {
      const tx = 24 + (i % 3) * 328;
      const ty = 64 + Math.floor(i / 3) * 250;
      const fresh = i < 3 && g >= 21.2;
      if (fresh) footageThumb(x, tx, ty, 300, 170, i, false);
      else fillRR(x, tx, ty, 300, 170, 10, i % 2 ? "#232a38" : "#1e2532");
      text(x, fresh ? `A00${i + 1}.mov · New` : `Archive_${i + 1}`, tx, ty + 194, 15, fresh ? C.text : C.dim, 600);
    }
  } else if (mode === "scopes") {
    const p = range(g, 24.15, 25.9);
    fillRR(x, 24, 60, 470, 480, 12, "#0b0e13");
    text(x, "Waveform", 40, 80, 13, C.dim, 600);
    x.fillStyle = "rgba(34,197,94,0.55)";
    for (let i = 0; i < 440; i += 2) {
      const base = 0.45 + 0.25 * Math.sin(i * 0.05) * (1 + p * 0.4);
      for (let k = 0; k < 4; k++) x.fillRect(40 + i, 100 + 420 * (1 - clamp01(base + (k - 1.5) * 0.06 * (1 + p))), 2, 2);
    }
    fillRR(x, 516, 60, 484, 480, 12, "#0b0e13");
    text(x, "Vectorscope", 532, 80, 13, C.dim, 600);
    x.strokeStyle = "rgba(255,255,255,0.18)";
    x.beginPath();
    x.arc(758, 310, 190, 0, Math.PI * 2);
    x.stroke();
    x.fillStyle = "rgba(245,158,11,0.5)";
    x.beginPath();
    x.ellipse(758 + 30 * p, 310 - 40 * p, 34 + 30 * p, 18 + 10 * p, -0.7, 0, Math.PI * 2);
    x.fill();
  } else if (mode === "graphics") {
    ["Bold Pop", "Clean Lower Third", "Swipe Badge", "Kinetic Title"].forEach((label, i) => {
      const tx = 24 + (i % 2) * 492;
      const ty = 64 + Math.floor(i / 2) * 250;
      fillRR(x, tx, ty, 470, 210, 12, ["#2a2140", "#1f2a3d", "#3a2232", "#1d3330"][i]);
      text(x, label.toUpperCase(), tx + 235, ty + 105, 30, ["#facc15", "#ffffff", "#f472b6", "#5eead4"][i], 800, "center");
    });
  } else {
    [["Reels", "9:16"], ["Shorts", "9:16"], ["Stories", "9:16"]].forEach(([label, ratio], i) => {
      const tx = 60 + i * 320;
      fillRR(x, tx, 70, 220, 390, 22, "#202838");
      footageThumb(x, tx + 12, 82, 196, 330, 1, true);
      text(x, `${label} · ${ratio}`, tx + 110, 490, 16, C.text, 600, "center");
      if (g > 28.75) check(x, tx + 196, 92, 14);
    });
  }
}

export function laptopKey(g: number) {
  return String(Math.round(g * 30));
}

export function drawLaptop(x: Ctx, w: number, h: number, g: number) {
  x.fillStyle = "#f5f7fb";
  x.fillRect(0, 0, w, h);
  x.fillStyle = "#e7ecf4";
  x.fillRect(0, 0, w, 36);
  text(x, "Shared drive · Prova Studio", 18, 18, 14, "#334155", 700);
  const receiving = range(g, 19.6, 20.9);
  if (g < 19.5) {
    text(x, "Today", 24, 66, 13, "#64748b", 600);
    ["Brief_Hydration_UGC.pdf", "Shot_list.xlsx", "Brand_colours.png"].forEach((f, i) => {
      fillRR(x, 24, 84 + i * 56, w - 48, 44, 8, "#ffffff");
      text(x, f, 44, 106 + i * 56, 14, "#1e293b", 500);
    });
    return;
  }
  text(x, receiving < 1 ? "Receiving footage from Shoot…" : "Footage received", 24, 66, 15, "#0f172a", 700);
  ["A001.mov", "A002.mov", "A003.mov"].forEach((f, i) => {
    const p = clamp01(range(receiving, i * 0.25, i * 0.25 + 0.5));
    fillRR(x, 24, 88 + i * 70, w - 48, 58, 10, "#ffffff");
    footageThumb(x, 34, 96 + i * 70, 72, 42, i);
    text(x, f, 120, 106 + i * 70, 14, "#1e293b", 600);
    if (p < 1) progressBar(x, 120, 124 + i * 70, w - 220, 6, p);
    else {
      text(x, "4K · 00:06", 120, 127 + i * 70, 12, "#64748b", 500);
      check(x, w - 52, 117 + i * 70, 11);
    }
  });
}

// ---------------------------------------------------------------------------
// Animated captions and motion graphics over the footage preview
// ---------------------------------------------------------------------------

export function captionsKey(g: number) {
  return String(Math.round(g * 80));
}

export function drawCaptions(x: Ctx, w: number, h: number, g: number, portrait: boolean) {
  x.clearRect(0, 0, w, h);
  const p = range(g, 26.0, 26.9);
  if (p <= 0) return;
  const words = [["STAY", "HYDRATED"], ["STAY", "ACTIVE"]];
  const size = portrait ? w * 0.15 : h * 0.13;
  const cy = portrait ? h * 0.68 : h * 0.74;
  words.forEach((line, li) => {
    line.forEach((word, wi) => {
      const k = li * 2 + wi;
      const wp = easeOut(range(p, k * 0.18, k * 0.18 + 0.3));
      if (wp <= 0) return;
      x.save();
      const lineY = cy + li * size * 1.08;
      const wx = portrait ? w / 2 : w / 2;
      const label = line.join(" ");
      x.font = `900 italic ${size}px ${FONT}`;
      const full = x.measureText(label).width;
      const before = wi === 0 ? 0 : x.measureText(`${line[0]} `).width;
      const ww = x.measureText(word).width;
      const px = wx - full / 2 + before + ww / 2;
      x.translate(px, lineY);
      x.scale(0.6 + 0.4 * wp, 0.6 + 0.4 * wp);
      x.globalAlpha = wp;
      if (wi === 1) {
        x.fillStyle = li === 0 ? "#2563eb" : "#f5b301";
        rr(x, -ww / 2 - size * 0.12, -size * 0.58, ww + size * 0.24, size * 1.12, size * 0.16);
        x.fill();
      }
      x.lineWidth = size * 0.12;
      x.strokeStyle = "rgba(0,0,0,0.55)";
      x.textAlign = "center";
      x.textBaseline = "middle";
      if (wi === 0) x.strokeText(word, 0, 0);
      x.fillStyle = "#ffffff";
      x.fillText(word, 0, 0);
      x.restore();
    });
  });
  // Motion-graphics badge
  const b = easeOut(range(p, 0.55, 0.95));
  if (b > 0) {
    const r = (portrait ? w : h) * 0.11 * b;
    const bx = w - r * 1.6;
    const by = portrait ? h * 0.16 : h * 0.2;
    x.save();
    x.globalAlpha = b;
    x.fillStyle = "#ec4899";
    x.beginPath();
    x.arc(bx, by, r, 0, Math.PI * 2);
    x.fill();
    x.strokeStyle = "rgba(255,255,255,0.9)";
    x.lineWidth = r * 0.08;
    x.beginPath();
    x.arc(bx, by, r * 1.18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * b);
    x.stroke();
    text(x, "NEW", bx, by, r * 0.55, "#ffffff", 900, "center");
    x.restore();
  }
  // Final reel: "Ready to post" stamp once the export completes
  const ready = easeOut(range(g, 28.75, 28.95));
  if (portrait && ready > 0) {
    x.save();
    x.globalAlpha = ready;
    const bw = w * 0.74;
    const bh = w * 0.15;
    const bx = (w - bw) / 2;
    const by = h * 0.08;
    fillRR(x, bx, by, bw, bh, bh / 2, "rgba(15,23,42,0.82)");
    check(x, bx + bh * 0.55, by + bh / 2, bh * 0.3);
    text(x, "Ready to post", bx + bh * 1.0, by + bh / 2, bh * 0.36, "#ffffff", 800);
    x.restore();
  }
}
