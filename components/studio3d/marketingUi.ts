import { clamp01, easeInOut, easeOut, lerp, range, smooth } from "./math";
import { type Ctx, FONT, PLATFORM_NAMES, type Platform, box, card, check, compact, outline, pill, platformIcon, progress, text } from "./uiKit";

/**
 * Scene 5 screens: the advertising dashboard (campaign draft → setup → launch → analytics
 * → audience), the analytics monitor, the floating analytics panel, the metric cards and the
 * audience map. Pure functions of `g`. All figures are illustrative demonstrations of the
 * service, never promised or real client results.
 */

const C = { bg: "#0f1420", panel: "#161d2b", panel2: "#1e2738", line: "#2a3447", text: "#dbe3ef", dim: "#8592a8", accent: "#3b82f6", green: "#22c55e" };
const PLATFORMS: Platform[] = ["facebook", "instagram", "youtube"];

/** Clicks on the main ads monitor (1280 × 720 canvas). One source for the cursor, the mouse and the hand. */
export const ADS_CLICKS = [
  { at: 51.7, x: 1060, y: 618, what: "setup" },
  { at: 52.3, x: 830, y: 150, what: "objective" },
  { at: 52.95, x: 520, y: 312, what: "chip fitness" },
  { at: 53.18, x: 722, y: 312, what: "chip age" },
  { at: 53.4, x: 942, y: 312, what: "chip city" },
  { at: 53.68, x: 588, y: 408, what: "feed" },
  { at: 53.84, x: 808, y: 408, what: "stories" },
  { at: 54.0, x: 1028, y: 408, what: "reels" },
  { at: 54.72, x: 1060, y: 618, what: "launch" },
  { at: 55.12, x: 1018, y: 30, what: "analytics tab" },
  { at: 58.12, x: 1140, y: 30, what: "audience tab" },
] as const;
type ClickName = (typeof ADS_CLICKS)[number]["what"];
const clickAt = (what: ClickName) => ADS_CLICKS.find((c) => c.what === what)!.at;
/** Example budget slider drag (mouse held down). */
const DRAG = { from: 54.2, to: 54.48, x0: 572, x1: 812, y: 520 } as const;

type CursorKey = [g: number, x: number, y: number];
const CURSOR: CursorKey[] = [[50, 700, 470], [51.35, 700, 470]];
for (const c of ADS_CLICKS) {
  if (c.what === "launch") CURSOR.push([DRAG.from - 0.06, DRAG.x0, DRAG.y], [DRAG.from, DRAG.x0, DRAG.y], [DRAG.to, DRAG.x1, DRAG.y], [DRAG.to + 0.06, DRAG.x1, DRAG.y]);
  CURSOR.push([c.at - 0.08, c.x, c.y], [c.at + 0.06, c.x, c.y]);
  if (c.what === "objective") CURSOR.push([52.42, 640, 254], [52.8, 640, 254]); // into the search field while typing
}
CURSOR.push([55.6, 760, 420], [57.9, 760, 420], [58.4, 900, 470], [60, 900, 470]);
CURSOR.sort((a, b) => a[0] - b[0]);

/** Cursor position on the ads monitor and whether the mouse button is down. */
export function cursorAt(g: number) {
  let i = 0;
  while (i < CURSOR.length - 2 && g > CURSOR[i + 1][0]) i++;
  const a = CURSOR[i];
  const b = CURSOR[i + 1];
  const t = smooth(clamp01((g - a[0]) / (b[0] - a[0])));
  const down = ADS_CLICKS.some((c) => Math.abs(g - c.at) < 0.03) || (g > DRAG.from && g < DRAG.to);
  return { x: lerp(a[1], b[1], t), y: lerp(a[2], b[2], t), down };
}

/** The specialist types the audience keyword while the cursor rests in the search field. */
export const TYPING = { from: 52.45, to: 52.84 } as const;

export function adsMainKey(g: number) {
  return String(Math.round(Math.min(Math.max(g, 49.8), 60) * 70));
}

function posterAt(x: Ctx, poster: CanvasImageSource, px: number, py: number, w: number, h: number, r = 8) {
  x.save();
  x.beginPath();
  x.roundRect(px, py, w, h, r);
  x.clip();
  x.drawImage(poster, px, py, w, h);
  x.restore();
}

function cursor(x: Ctx, cx: number, cy: number, down: boolean) {
  x.save();
  x.translate(cx, cy);
  x.scale(down ? 0.88 : 1, down ? 0.88 : 1);
  x.beginPath();
  x.moveTo(0, 0);
  x.lineTo(0, 30);
  x.lineTo(8, 23);
  x.lineTo(14, 36);
  x.lineTo(20, 33);
  x.lineTo(14, 21);
  x.lineTo(24, 21);
  x.closePath();
  x.fillStyle = "#ffffff";
  x.fill();
  x.strokeStyle = "#0f172a";
  x.lineWidth = 2;
  x.stroke();
  x.restore();
  if (down) {
    x.beginPath();
    x.arc(cx, cy, 18, 0, Math.PI * 2);
    x.fillStyle = "rgba(59,130,246,0.35)";
    x.fill();
  }
}

function tabs(x: Ctx, active: number) {
  ["Setup", "Analytics", "Audience"].forEach((t, i) => {
    const cx = [902, 1018, 1140][i];
    if (i === active) box(x, cx - 52, 12, 104, 36, 18, C.accent);
    text(x, t, cx, 31, 15, i === active ? "#ffffff" : C.dim, 700, "center");
  });
}

/** Phone-feed mock of the ad: the very same poster from the design desk. */
function adPreview(x: Ctx, poster: CanvasImageSource, px: number, py: number, w: number, label = "Ad preview") {
  text(x, label.toUpperCase(), px, py - 14, 12, C.dim, 700);
  box(x, px, py, w, w * 1.62, 22, "#ffffff");
  x.fillStyle = "#2563eb";
  x.beginPath();
  x.arc(px + 28, py + 30, 13, 0, Math.PI * 2);
  x.fill();
  text(x, "yourbrand", px + 50, py + 24, 14, "#0f172a", 800);
  text(x, "Sponsored", px + 50, py + 42, 11, "#64748b", 600);
  posterAt(x, poster, px + 12, py + 60, w - 24, (w - 24) * 1.25, 6);
  const by = py + 60 + (w - 24) * 1.25 + 14;
  box(x, px + 12, by, w - 24, 38, 8, "#eff6ff");
  text(x, "Shop now", px + 24, by + 19, 14, "#1d4ed8", 800);
  text(x, "›", px + w - 28, by + 18, 22, "#1d4ed8", 700, "center");
}

export function drawAdsMain(x: Ctx, w: number, h: number, g: number, poster: CanvasImageSource) {
  x.fillStyle = C.bg;
  x.fillRect(0, 0, w, h);
  x.fillStyle = C.panel;
  x.fillRect(0, 0, w, 60);
  box(x, 20, 16, 28, 28, 8, C.accent);
  text(x, "Ads Manager", 60, 31, 18, "#ffffff", 800);
  const arrived = g >= 50.8;
  text(x, arrived ? "Campaign · Stay Hydrated" : "All campaigns", 210, 31, 14, C.dim, 600);
  const view = g < 51.75 ? 0 : g < clickAt("analytics tab") ? 1 : g < clickAt("audience tab") ? 2 : 3;
  tabs(x, view <= 1 ? 0 : view - 1);

  if (!arrived) campaignsList(x, w, g);
  else if (view === 0) campaignDraft(x, w, h, g, poster);
  else if (view === 1) campaignSetup(x, w, h, g, poster);
  else if (view === 2) analyticsView(x, w, h, g);
  else audienceView(x, w, h, g);

  const c = cursorAt(g);
  if (g > 50.85) cursor(x, c.x, c.y, c.down);
}

function campaignsList(x: Ctx, w: number, g: number) {
  text(x, "CAMPAIGNS", 40, 96, 13, C.dim, 700);
  const rows: [string, string, string][] = [["Festive offer", "Completed", C.dim], ["Brand awareness", "Paused", "#f59e0b"], ["Store launch", "Completed", C.dim]];
  rows.forEach(([name, status, color], i) => {
    const y = 120 + i * 70;
    box(x, 40, y, w - 80, 58, 12, C.panel);
    box(x, 58, y + 13, 32, 32, 8, C.panel2);
    text(x, name, 106, y + 29, 16, C.text, 600);
    text(x, status, w - 70, y + 29, 14, color, 700, "right");
  });
  // Empty slot waiting for the new creative from the social team
  const y = 340;
  x.setLineDash([10, 8]);
  outline(x, 40, y, w - 80, 120, 16, "rgba(59,130,246,0.7)", 3);
  x.setLineDash([]);
  const pulse = 0.6 + 0.4 * Math.sin(g * 40);
  text(x, "New campaign", w / 2, y + 46, 22, "#ffffff", 800, "center");
  text(x, "Waiting for creative from Social…", w / 2, y + 80, 15, `rgba(147,197,253,${pulse.toFixed(2)})`, 600, "center");
}

function campaignDraft(x: Ctx, w: number, h: number, g: number, poster: CanvasImageSource) {
  const landed = easeOut(range(g, 50.8, 51.1));
  x.globalAlpha = landed;
  adPreview(x, poster, 40, 96, 330);
  text(x, "Ad Campaign", 420, 112, 30, "#ffffff", 800);
  pill(x, "Draft", 650, 112, 13, "#fde68a", "rgba(245,158,11,0.2)");
  text(x, "Stay Hydrated · Blue bottle", 420, 150, 16, C.dim, 600);
  text(x, "PLATFORMS", 420, 206, 13, C.dim, 700);
  PLATFORMS.forEach((p, i) => {
    const tx = 420 + i * 200;
    box(x, tx, 224, 184, 96, 16, C.panel);
    platformIcon(x, tx + 40, 272, 44, p);
    text(x, PLATFORM_NAMES[p], tx + 72, 272, 16, C.text, 700);
  });
  text(x, "AUDIENCE", 420, 372, 13, C.dim, 700);
  box(x, 420, 390, 580, 50, 12, C.panel);
  text(x, "Not set yet", 440, 415, 15, C.dim, 600);
  text(x, "OBJECTIVE", 420, 474, 13, C.dim, 700);
  box(x, 420, 492, 580, 50, 12, C.panel);
  text(x, "Not set yet", 440, 517, 15, C.dim, 600);
  const pressed = Math.abs(g - clickAt("setup")) < 0.04;
  box(x, 900, 588, 320, 60, 30, pressed ? "#1d4ed8" : C.accent);
  text(x, "Set up campaign", 1060, 619, 18, "#ffffff", 800, "center");
  x.globalAlpha = 1;
}

function section(x: Ctx, n: number, label: string, y: number, done: boolean) {
  x.beginPath();
  x.arc(434, y, 14, 0, Math.PI * 2);
  x.fillStyle = done ? C.green : C.panel2;
  x.fill();
  text(x, done ? "✓" : String(n), 434, y + 1, 14, "#ffffff", 800, "center");
  text(x, label, 458, y, 15, C.text, 700);
}

function campaignSetup(x: Ctx, w: number, h: number, g: number, poster: CanvasImageSource) {
  adPreview(x, poster, 40, 96, 330, "Your ad");
  text(x, "Create Campaign", 420, 84, 22, "#ffffff", 800);

  // 1. Objective
  const objective = g >= clickAt("objective");
  section(x, 1, "Objective", 118, objective);
  ["Awareness", "Website visits", "Enquiries"].forEach((label, i) => {
    const bx = 420 + i * 280;
    const on = objective && i === 1;
    box(x, bx, 134, 262, 36, 10, on ? "rgba(59,130,246,0.25)" : C.panel);
    if (on) outline(x, bx, 134, 262, 36, 10, C.accent, 2);
    text(x, label, bx + 131, 152, 14, on ? "#ffffff" : C.text, on ? 800 : 600, "center");
  });

  // 2. Audience: keyword typed, then segment chips chosen
  const chips: [string, ClickName, number][] = [["Fitness & sports", "chip fitness", 200], ["Ages 18–35", "chip age", 164], ["Coimbatore + 25 km", "chip city", 236]];
  const audienceDone = g >= clickAt("chip city");
  section(x, 2, "Audience", 206, audienceDone);
  box(x, 420, 228, 440, 46, 10, C.panel);
  const typed = "fitness".slice(0, Math.floor(range(g, TYPING.from, TYPING.to) * 7));
  text(x, typed || "Search interests", 440, 252, 15, typed ? "#ffffff" : C.dim, 600);
  if (g > TYPING.from && g < TYPING.to + 0.15) box(x, 440 + x.measureText(typed).width + 3, 240, 2, 24, 1, "#ffffff");
  let cx = 420;
  chips.forEach(([label, click, cw]) => {
    const visible = range(g, TYPING.to - 0.1, TYPING.to + 0.05);
    const on = g >= clickAt(click);
    x.globalAlpha = visible;
    box(x, cx, 292, cw, 40, 20, on ? C.accent : C.panel2);
    text(x, (on ? "✓ " : "+ ") + label, cx + cw / 2, 313, 14, "#ffffff", 700, "center");
    x.globalAlpha = 1;
    cx += cw + 22;
  });

  // 3. Placements
  const placementsDone = g >= clickAt("reels");
  section(x, 3, "Placements", 356, placementsDone);
  (["Feed", "Stories", "Reels"] as const).forEach((label, i) => {
    const bx = 420 + i * 220;
    const on = easeInOut(range(g, clickAt(["feed", "stories", "reels"][i] as ClickName), clickAt(["feed", "stories", "reels"][i] as ClickName) + 0.05));
    box(x, bx, 380, 200, 56, 12, C.panel);
    text(x, label, bx + 20, 408, 16, C.text, 700);
    box(x, bx + 146, 394, 44, 26, 13, on > 0.5 ? C.accent : "#334155");
    x.beginPath();
    x.arc(bx + 168 + lerp(-9, 9, on), 407, 10, 0, Math.PI * 2);
    x.fillStyle = "#ffffff";
    x.fill();
  });

  // 4. Example budget (illustrative only)
  const budget = easeInOut(range(g, DRAG.from, DRAG.to));
  section(x, 4, "Budget", 470, g >= DRAG.to);
  pill(x, "Example only", 560, 470, 12, "#fde68a", "rgba(245,158,11,0.18)");
  box(x, DRAG.x0 - 140, 514, 520, 10, 5, "#334155");
  const hx = lerp(DRAG.x0, DRAG.x1, budget);
  box(x, DRAG.x0 - 140, 514, hx - (DRAG.x0 - 140), 10, 5, C.accent);
  x.beginPath();
  x.arc(hx, DRAG.y, 15, 0, Math.PI * 2);
  x.fillStyle = "#ffffff";
  x.fill();
  text(x, `₹${Math.round(lerp(200, 500, budget) / 50) * 50} / day`, 1000, 519, 18, "#ffffff", 800);

  // Launch
  const launched = g >= clickAt("launch") + 0.03;
  const pressed = Math.abs(g - clickAt("launch")) < 0.04;
  box(x, 900, 588, 320, 60, 30, launched ? "#16a34a" : pressed ? "#1d4ed8" : C.accent);
  text(x, launched ? "Campaign launched ✓" : "Launch campaign", 1060, 619, 18, "#ffffff", 800, "center");
  if (launched) {
    const t = easeOut(range(g, clickAt("launch") + 0.03, clickAt("launch") + 0.2));
    x.globalAlpha = t;
    box(x, 420, 590, 440, 56, 14, "rgba(34,197,94,0.15)");
    check(x, 448, 618, 14);
    text(x, "Live on 3 platforms · Learning phase", 474, 619, 15, "#86efac", 700);
    x.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------------------
// Analytics (shared by the monitor view and the floating panel)
// ---------------------------------------------------------------------------

const SERIES = [4, 6, 5, 9, 12, 11, 16, 19, 18, 24, 27, 31, 35, 41];

/** Draws the illustrative campaign chart into a rect; `p` (0…1) is how much of the line has been revealed. */
function campaignChart(x: Ctx, cx: number, cy: number, cw: number, ch: number, p: number, dark: boolean) {
  const grid = dark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const label = dark ? C.dim : "#64748b";
  x.strokeStyle = grid;
  x.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    x.beginPath();
    x.moveTo(cx, cy + (ch * i) / 4);
    x.lineTo(cx + cw, cy + (ch * i) / 4);
    x.stroke();
  }
  text(x, "Day 1", cx, cy + ch + 18, 12, label, 600);
  text(x, "Day 14", cx + cw, cy + ch + 18, 12, label, 600, "right");
  const max = 44;
  const pts = SERIES.map((v, i) => [cx + (cw * i) / (SERIES.length - 1), cy + ch - (v / max) * ch] as const);
  const n = p * (pts.length - 1);
  const shown: [number, number][] = [];
  for (let i = 0; i < pts.length; i++) {
    if (i <= n) shown.push([pts[i][0], pts[i][1]]);
    else {
      const t = n - (i - 1);
      if (t > 0) shown.push([lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)]);
      break;
    }
  }
  if (shown.length < 2) return;
  const fill = x.createLinearGradient(0, cy, 0, cy + ch);
  fill.addColorStop(0, "rgba(59,130,246,0.45)");
  fill.addColorStop(1, "rgba(59,130,246,0.02)");
  x.beginPath();
  x.moveTo(shown[0][0], cy + ch);
  shown.forEach(([sx, sy]) => x.lineTo(sx, sy));
  x.lineTo(shown[shown.length - 1][0], cy + ch);
  x.fillStyle = fill;
  x.fill();
  x.beginPath();
  shown.forEach(([sx, sy], i) => (i ? x.lineTo(sx, sy) : x.moveTo(sx, sy)));
  x.strokeStyle = "#3b82f6";
  x.lineWidth = 5;
  x.lineJoin = "round";
  x.lineCap = "round";
  x.stroke();
  const [ex, ey] = shown[shown.length - 1];
  x.beginPath();
  x.arc(ex, ey, 9, 0, Math.PI * 2);
  x.fillStyle = "#ffffff";
  x.fill();
  x.strokeStyle = "#3b82f6";
  x.lineWidth = 4;
  x.stroke();
}

const chartProgress = (g: number) => easeInOut(range(g, 55.85, 57.2));

function analyticsView(x: Ctx, w: number, h: number, g: number) {
  text(x, "Campaign analytics", 40, 100, 26, "#ffffff", 800);
  pill(x, "Live", 330, 100, 13, "#86efac", "rgba(34,197,94,0.18)");
  pill(x, "Illustrative demo data", w - 40, 100, 13, "#fde68a", "rgba(245,158,11,0.18)", "right");
  box(x, 40, 136, w - 80, 380, 18, C.panel);
  campaignChart(x, 80, 176, w - 160, 290, chartProgress(g), true);
  METRICS.forEach((m, i) => {
    const k = metricProgress(g, i);
    const bx = 40 + i * ((w - 80 + 20) / 3);
    const bw = (w - 80 - 40) / 3;
    box(x, bx, 540, bw, 130, 18, C.panel);
    text(x, m.label, bx + 24, 576, 15, C.dim, 700);
    text(x, m.format(m.value * k), bx + 24, 626, 38, "#ffffff", 800);
  });
}

function audienceView(x: Ctx, w: number, h: number, g: number) {
  text(x, "Audience reach", 40, 100, 26, "#ffffff", 800);
  pill(x, "Example segments", w - 40, 100, 13, "#fde68a", "rgba(245,158,11,0.18)", "right");
  x.save();
  x.translate(40, 136);
  drawMapBody(x, w - 80, h - 176, g, true);
  x.restore();
}

export const METRICS = [
  { label: "Impressions", value: 48200, format: (n: number) => compact(n), icon: "eye" },
  { label: "Website visits", value: 3150, format: (n: number) => compact(n), icon: "cursor" },
  { label: "Enquiries", value: 126, format: (n: number) => String(Math.round(n)), icon: "chat" },
] as const;
export const metricProgress = (g: number, i: number) => easeOut(range(g, 55.75 + i * 0.3, 56.9 + i * 0.3));

export function analyticsPanelKey(g: number) {
  return String(Math.round(chartProgress(g) * 120));
}

/** Floating analytics panel (5.3), light card for legibility against the studio. */
export function drawAnalyticsPanel(x: Ctx, w: number, h: number, g: number) {
  card(x, w, h, 30);
  text(x, "Campaign analytics", 36, 50, 30, "#0f172a", 800);
  text(x, "Stay Hydrated · last 14 days", 36, 84, 16, "#64748b", 600);
  pill(x, "Illustrative demo data", w - 34, 50, 15, "#92400e", "#fef3c7", "right");
  box(x, 36, 110, w - 72, h - 150, 18, "#f8fafc");
  text(x, "Website visits", 60, 136, 14, "#64748b", 700);
  campaignChart(x, 60, 160, w - 120, h - 240, chartProgress(g), false);
}

export function metricKey(g: number, i: number) {
  return String(Math.round(metricProgress(g, i) * 60));
}

export function drawMetricCard(x: Ctx, w: number, h: number, g: number, i: number) {
  const m = METRICS[i];
  card(x, w, h, 24);
  const k = metricProgress(g, i);
  x.fillStyle = "#dbeafe";
  x.beginPath();
  x.arc(48, h / 2, 26, 0, Math.PI * 2);
  x.fill();
  x.strokeStyle = "#2563eb";
  x.fillStyle = "#2563eb";
  x.lineWidth = 4;
  if (m.icon === "eye") {
    x.beginPath();
    x.ellipse(48, h / 2, 15, 9, 0, 0, Math.PI * 2);
    x.stroke();
    x.beginPath();
    x.arc(48, h / 2, 4.5, 0, Math.PI * 2);
    x.fill();
  } else if (m.icon === "cursor") {
    x.beginPath();
    x.moveTo(42, h / 2 - 14);
    x.lineTo(42, h / 2 + 10);
    x.lineTo(48, h / 2 + 4);
    x.lineTo(53, h / 2 + 14);
    x.lineTo(57, h / 2 + 12);
    x.lineTo(52, h / 2 + 2);
    x.lineTo(60, h / 2 + 1);
    x.closePath();
    x.fill();
  } else {
    x.beginPath();
    x.ellipse(48, h / 2 - 2, 15, 11, 0, 0, Math.PI * 2);
    x.fill();
    x.beginPath();
    x.moveTo(40, h / 2 + 6);
    x.lineTo(36, h / 2 + 16);
    x.lineTo(47, h / 2 + 9);
    x.fill();
  }
  text(x, m.label, 90, h / 2 - 22, 17, "#64748b", 700);
  text(x, m.format(m.value * k), 90, h / 2 + 14, 38, "#0f172a", 800);
  text(x, "example", w - 22, h / 2 - 22, 12, "#b45309", 700, "right");
}

// ---------------------------------------------------------------------------
// Audience map (5.4)
// ---------------------------------------------------------------------------

/** Continents as soft ellipses on a 0…1 canvas: an abstract dot map, not a geographic chart. */
const LAND: [number, number, number, number][] = [
  [0.2, 0.32, 0.11, 0.14], [0.26, 0.47, 0.035, 0.06], [0.31, 0.68, 0.055, 0.16], [0.36, 0.14, 0.04, 0.04],
  [0.5, 0.27, 0.055, 0.07], [0.52, 0.57, 0.07, 0.15], [0.7, 0.29, 0.16, 0.13], [0.665, 0.46, 0.03, 0.07],
  [0.78, 0.52, 0.04, 0.045], [0.85, 0.72, 0.06, 0.05],
];
const HUB = [0.664, 0.525] as const; // Coimbatore
const MARKERS: [number, number, number][] = [
  // [x, y, size]: nearby cities first, then wider segments
  [0.682, 0.5, 1], [0.657, 0.508, 1], [0.652, 0.535, 0.9], [0.646, 0.46, 1], [0.668, 0.4, 1],
  [0.6, 0.42, 0.8], [0.764, 0.565, 0.8], [0.48, 0.245, 0.7], [0.83, 0.34, 0.7], [0.22, 0.33, 0.7],
];
const mapProgress = (g: number) => range(g, 58.35, 59.5);

export function mapKey(g: number) {
  return String(Math.round(mapProgress(g) * 90));
}

/** The static dot map, drawn once per size and reused on every redraw. */
const mapLayers = new Map<string, HTMLCanvasElement>();
function mapLayer(w: number, h: number, onMonitor: boolean) {
  const key = `${w}x${h}${onMonitor ? "m" : ""}`;
  let layer = mapLayers.get(key);
  if (layer) return layer;
  layer = document.createElement("canvas");
  layer.width = w;
  layer.height = h;
  const x = layer.getContext("2d")!;
  box(x, 0, 0, w, h, 20, onMonitor ? C.panel : "#0f1d3d");
  const step = Math.max(9, w / 70);
  x.fillStyle = "rgba(147,197,253,0.42)";
  for (let gy = step; gy < h - step / 2; gy += step) {
    for (let gx = step; gx < w - step / 2; gx += step) {
      const u = gx / w;
      const v = gy / h;
      if (!LAND.some(([cx, cy, rx, ry]) => ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 < 1)) continue;
      x.beginPath();
      x.arc(gx, gy, step * 0.24, 0, Math.PI * 2);
      x.fill();
    }
  }
  mapLayers.set(key, layer);
  return layer;
}

function drawMapBody(x: Ctx, w: number, h: number, g: number, onMonitor: boolean) {
  x.drawImage(mapLayer(w, h, onMonitor), 0, 0);
  const p = mapProgress(g);
  const hx = HUB[0] * w;
  const hy = HUB[1] * h;
  // Reach rings expanding from the business
  for (let i = 0; i < 3; i++) {
    const r = easeOut(clamp01(p * 1.6 - i * 0.25)) * w * (0.05 + i * 0.07);
    if (r <= 0) continue;
    x.beginPath();
    x.arc(hx, hy, r, 0, Math.PI * 2);
    x.strokeStyle = `rgba(96,165,250,${0.55 - i * 0.14})`;
    x.lineWidth = 2;
    x.stroke();
  }
  MARKERS.forEach(([mx, my, size], i) => {
    const k = easeOut(clamp01(p * MARKERS.length * 0.75 - i * 0.6));
    if (k <= 0) return;
    const ex = mx * w;
    const ey = my * h;
    // Connection arc
    const midx = (hx + ex) / 2;
    const midy = (hy + ey) / 2 - Math.hypot(ex - hx, ey - hy) * 0.3;
    x.beginPath();
    x.moveTo(hx, hy);
    const t = k;
    x.quadraticCurveTo(lerp(hx, midx, t), lerp(hy, midy, t), lerp(hx, ex, t), lerp(hy, ey, t));
    x.strokeStyle = "rgba(250,204,21,0.75)";
    x.lineWidth = 2;
    x.stroke();
    // Pin
    const s = w * 0.012 * size * k;
    x.fillStyle = "#facc15";
    x.beginPath();
    x.arc(ex, ey - s, s, Math.PI, 0);
    x.lineTo(ex, ey + s * 0.6);
    x.closePath();
    x.fill();
    x.fillStyle = "#0f1d3d";
    x.beginPath();
    x.arc(ex, ey - s, s * 0.4, 0, Math.PI * 2);
    x.fill();
  });
  // The business itself
  x.fillStyle = "#3b82f6";
  x.beginPath();
  x.arc(hx, hy, w * 0.012, 0, Math.PI * 2);
  x.fill();
  x.strokeStyle = "#ffffff";
  x.lineWidth = 3;
  x.stroke();
}

/** Floating audience map (5.4). */
export function drawAudienceMap(x: Ctx, w: number, h: number, g: number) {
  x.clearRect(0, 0, w, h);
  box(x, 3, 3, w - 6, h - 6, 28, "#0f1d3d");
  x.save();
  x.translate(20, 76);
  drawMapBody(x, w - 40, h - 140, g, false);
  x.restore();
  text(x, "Audience reach", 32, 42, 26, "#ffffff", 800);
  pill(x, "Example segments", w - 30, 42, 14, "#0f1d3d", "#fde68a", "right");
  const segments = ["Fitness & sports", "Ages 18–35", "Coimbatore + 25 km"];
  let sx = 32;
  segments.forEach((s, i) => {
    const k = range(mapProgress(g), 0.15 + i * 0.2, 0.3 + i * 0.2);
    x.globalAlpha = 0.3 + 0.7 * k;
    x.font = `700 15px ${FONT}`;
    const sw = x.measureText(s).width + 30;
    box(x, sx, h - 50, sw, 32, 16, k > 0.5 ? "#2563eb" : "rgba(255,255,255,0.12)");
    text(x, s, sx + sw / 2, h - 34, 15, "#ffffff", 700, "center");
    sx += sw + 12;
    x.globalAlpha = 1;
  });
}

export function drawVisitBadge(x: Ctx, w: number, h: number) {
  x.clearRect(0, 0, w, h);
  box(x, 3, 3, w - 6, h - 6, (h - 6) / 2, "#ffffff");
  outline(x, 3, 3, w - 6, h - 6, (h - 6) / 2, "#2563eb", 3);
  x.fillStyle = "#2563eb";
  x.beginPath();
  x.arc(h / 2 + 2, h / 2, h * 0.3, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = "#ffffff";
  x.beginPath();
  const c = h / 2 + 2;
  x.moveTo(c - 5, h / 2 - 11);
  x.lineTo(c - 5, h / 2 + 8);
  x.lineTo(c, h / 2 + 3);
  x.lineTo(c + 4, h / 2 + 11);
  x.lineTo(c + 7, h / 2 + 9);
  x.lineTo(c + 3, h / 2 + 1);
  x.lineTo(c + 9, h / 2 + 1);
  x.closePath();
  x.fill();
  text(x, "Website visit", h + 6, h / 2 + 1, h * 0.34, "#0f172a", 800);
}

// ---------------------------------------------------------------------------
// Analytics monitor beside the campaign screen
// ---------------------------------------------------------------------------

export function adsSideKey(g: number) {
  return g < 54.75 ? "draft" : `live${Math.round(range(g, 54.75, 58) * 20)}`;
}

export function drawAdsSide(x: Ctx, w: number, h: number, g: number) {
  x.fillStyle = C.bg;
  x.fillRect(0, 0, w, h);
  text(x, "Audience insights", 30, 40, 24, "#ffffff", 800);
  const live = g >= 54.75;
  pill(x, live ? "Live" : "Draft", w - 30, 40, 14, live ? "#86efac" : "#fde68a", live ? "rgba(34,197,94,0.18)" : "rgba(245,158,11,0.18)", "right");
  text(x, "AGE (EXAMPLE)", 30, 96, 13, C.dim, 700);
  [0.35, 0.8, 0.62, 0.38, 0.2].forEach((v, i) => {
    const bx = 30 + i * 86;
    box(x, bx, 120 + (1 - v) * 220, 60, v * 220, 8, i === 1 ? C.accent : "#334155");
    text(x, ["13–17", "18–24", "25–34", "35–44", "45+"][i], bx + 30, 362, 13, C.dim, 600, "center");
  });
  text(x, "INTERESTS", 500, 96, 13, C.dim, 700);
  ["Fitness", "Outdoor", "Wellness", "Sports"].forEach((s, i) => {
    text(x, s, 500, 136 + i * 54, 15, C.text, 600);
    progress(x, 640, 130 + i * 54, 340, 12, [0.82, 0.64, 0.52, 0.44][i], i === 0 ? C.accent : "#475569", "#1e293b");
  });
  if (live) {
    text(x, "Campaign status: learning", 30, 430, 16, "#86efac", 700);
    progress(x, 30, 456, w - 60, 12, range(g, 54.75, 58), C.green, "#1e293b");
  } else {
    text(x, "Campaign not launched yet", 30, 430, 16, C.dim, 600);
  }
}
