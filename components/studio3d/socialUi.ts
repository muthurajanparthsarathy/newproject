import { footageThumb } from "./editorUi";
import { clamp01, easeInOut, easeOut, lerp, range, smooth } from "./math";
import {
  type Ctx, FONT, PLATFORM_NAMES, type Platform, type Reaction, REACTION_COLOR, box, card, check, compact, outline, pill, platformIcon,
  progress, reactionGlyph, text, wrap,
} from "./uiKit";

/**
 * Scene 4 screens: the social media manager's phone (receive → select → share → publish →
 * engage), the floating post cards, the content-performance dashboard and the campaign card
 * that travels on to the marketing desk. Pure functions of the story position `g`.
 * Every figure on these screens is an illustrative example, never a real result.
 */

/** Phone canvas size (matches the 0.066 × 0.138 m screen). */
export const PHONE = { w: 324, h: 678 } as const;
const PLATFORMS: Platform[] = ["instagram", "facebook", "youtube"];

/** Screen taps: `u`, `v` in −1…1 across the phone screen (v up). One source for the finger and the UI. */
export const PHONE_TAPS = [
  { at: 42.55, u: -0.45, v: 0.25, what: "select poster" },
  { at: 42.8, u: 0.45, v: 0.25, what: "select reel" },
  { at: 43.05, u: 0, v: -0.78, what: "next" },
  { at: 43.42, u: 0.62, v: -0.08, what: "platform 1" },
  { at: 43.64, u: 0.62, v: -0.26, what: "platform 2" },
  { at: 43.86, u: 0.62, v: -0.44, what: "platform 3" },
  { at: 44.2, u: 0, v: -0.8, what: "publish" },
  { at: 46.75, u: 0.55, v: -0.62, what: "reply" },
] as const;
const tapAt = (what: (typeof PHONE_TAPS)[number]["what"]) => PHONE_TAPS.find((t) => t.what === what)!.at;
const px = (u: number) => ((u + 1) / 2) * PHONE.w;
const py = (v: number) => ((1 - v) / 2) * PHONE.h;

type FingerKey = [g: number, u: number, v: number, lift: number];
const FINGER: FingerKey[] = [[42.3, -0.25, -0.55, 0.05]];
for (const t of PHONE_TAPS) {
  FINGER.push([t.at - 0.09, t.u, t.v, 0.024], [t.at, t.u, t.v, 0], [t.at + 0.07, t.u, t.v, 0.024]);
}

/** Where the manager's tapping fingertip is over the phone, and how engaged the tapping hand is (0…1). */
export function fingerAt(g: number) {
  const active = Math.max(
    Math.min(range(g, 42.25, 42.45), 1 - range(g, 44.32, 44.55)),
    Math.min(range(g, 46.5, 46.62), 1 - range(g, 46.84, 47.0)),
  );
  let i = 0;
  while (i < FINGER.length - 2 && g > FINGER[i + 1][0]) i++;
  const a = FINGER[i];
  const b = FINGER[i + 1];
  const t = smooth(clamp01((g - a[0]) / (b[0] - a[0])));
  return { u: lerp(a[1], b[1], t), v: lerp(a[2], b[2], t), lift: lerp(a[3], b[3], t), active: smooth(active) };
}

export function phoneKey(g: number) {
  return String(Math.round(g * 60));
}

/** The blue-bottle reel as a thumbnail: the shoot's footage illustration with the edit's captions. */
function reelThumb(x: Ctx, rx: number, ry: number, w: number, h: number) {
  footageThumb(x, rx, ry, w, h, 1, true);
  x.save();
  x.font = `900 italic ${w * 0.15}px ${FONT}`;
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.lineWidth = w * 0.03;
  x.strokeStyle = "rgba(0,0,0,0.5)";
  x.strokeText("STAY", rx + w / 2, ry + h * 0.7);
  x.fillStyle = "#ffffff";
  x.fillText("STAY", rx + w / 2, ry + h * 0.7);
  box(x, rx + w * 0.12, ry + h * 0.76, w * 0.76, w * 0.17, w * 0.03, "#2563eb");
  text(x, "HYDRATED", rx + w / 2, ry + h * 0.76 + w * 0.085, w * 0.13, "#ffffff", 900, "center");
  // Play glyph
  x.fillStyle = "rgba(255,255,255,0.9)";
  x.beginPath();
  x.moveTo(rx + w * 0.44, ry + h * 0.36);
  x.lineTo(rx + w * 0.6, ry + h * 0.42);
  x.lineTo(rx + w * 0.44, ry + h * 0.48);
  x.fill();
  x.restore();
}

function posterThumb(x: Ctx, poster: CanvasImageSource, rx: number, ry: number, w: number, h: number, r = 8) {
  x.save();
  x.beginPath();
  x.roundRect(rx, ry, w, h, r);
  x.clip();
  x.drawImage(poster, rx, ry, w, h);
  x.restore();
}

function statusBar(x: Ctx, w: number, dark = false) {
  const c = dark ? "#ffffff" : "#0f172a";
  text(x, "9:41", 22, 20, 13, c, 700);
  box(x, w - 46, 13, 24, 12, 3, c);
  box(x, w - 21, 16, 3, 6, 1, c);
  box(x, w - 72, 14, 18, 10, 2, c);
}

function appHeader(x: Ctx, w: number, title: string, sub?: string) {
  text(x, title, 20, 56, 20, "#0f172a", 800);
  if (sub) text(x, sub, 20, 80, 12, "#64748b", 600);
  x.fillStyle = "#e2e8f0";
  x.fillRect(0, 98, w, 1);
}

function selectDot(x: Ctx, cx: number, cy: number, on: number) {
  x.beginPath();
  x.arc(cx, cy, 13, 0, Math.PI * 2);
  x.fillStyle = on > 0.5 ? "#2563eb" : "rgba(255,255,255,0.85)";
  x.fill();
  x.strokeStyle = on > 0.5 ? "#ffffff" : "rgba(15,23,42,0.35)";
  x.lineWidth = 2.5;
  x.stroke();
  if (on > 0.5) check(x, cx, cy, 10, "#2563eb");
}

function button(x: Ctx, label: string, cx: number, cy: number, w: number, h: number, pressed: boolean, color = "#2563eb") {
  const s = pressed ? 0.95 : 1;
  box(x, cx - (w * s) / 2, cy - (h * s) / 2, w * s, h * s, (h * s) / 2, pressed ? "#1d4ed8" : color);
  text(x, label, cx, cy + 1, 16, "#ffffff", 800, "center");
}

/** A tap ripple where the fingertip touched, for a moment after each tap. */
function ripples(x: Ctx, g: number) {
  for (const t of PHONE_TAPS) {
    const k = range(g, t.at, t.at + 0.12);
    if (k <= 0 || k >= 1) continue;
    x.beginPath();
    x.arc(px(t.u), py(t.v), 10 + 26 * k, 0, Math.PI * 2);
    x.fillStyle = `rgba(37,99,235,${0.28 * (1 - k)})`;
    x.fill();
  }
}

export function drawPhone(x: Ctx, w: number, h: number, g: number, poster: CanvasImageSource) {
  x.fillStyle = "#ffffff";
  x.fillRect(0, 0, w, h);
  statusBar(x, w);

  if (g < 41.5) {
    feedScreen(x, w, h, poster);
    // "Final assets ready" notification slides down from the top
    const n = easeOut(range(g, 40.95, 41.2));
    if (n > 0) {
      const y = lerp(-80, 34, n);
      box(x, 10, y, w - 20, 70, 16, "rgba(15,23,42,0.92)");
      box(x, 22, y + 13, 44, 44, 10, "#2563eb");
      posterThumb(x, poster, 28, y + 16, 32, 38, 4);
      text(x, "Design team", 78, y + 24, 12, "#93c5fd", 700);
      text(x, "Final poster + reel ready ✓", 78, y + 46, 13, "#ffffff", 700);
    }
  } else if (g < tapAt("next") + 0.04) {
    // Gallery of the new assets: poster and reel, selected one by one
    appHeader(x, w, "New post", "Final assets · from Design");
    const posterOn = range(g, tapAt("select poster"), tapAt("select poster") + 0.02);
    const reelOn = range(g, tapAt("select reel"), tapAt("select reel") + 0.02);
    const cy = py(0.25);
    const tw = 128;
    const th = 160;
    posterThumb(x, poster, px(-0.45) - tw / 2, cy - th / 2, tw, th);
    reelThumb(x, px(0.45) - 46, cy - 82, 92, 164);
    if (posterOn > 0.5) outline(x, px(-0.45) - tw / 2 - 3, cy - th / 2 - 3, tw + 6, th + 6, 10, "#2563eb", 4);
    if (reelOn > 0.5) outline(x, px(0.45) - 49, cy - 85, 98, 170, 10, "#2563eb", 4);
    selectDot(x, px(-0.45) + tw / 2 - 18, cy - th / 2 + 18, posterOn);
    selectDot(x, px(0.45) + 46 - 18, cy - 82 + 18, reelOn);
    text(x, "Poster 4:5", px(-0.45), cy + th / 2 + 18, 12, "#334155", 700, "center");
    text(x, "Reel 9:16 · 0:15", px(0.45), cy + th / 2 + 18, 12, "#334155", 700, "center");
    const picked = (posterOn > 0.5 ? 1 : 0) + (reelOn > 0.5 ? 1 : 0);
    text(x, picked ? `${picked} selected` : "Tap to select", w / 2, py(-0.45), 14, picked ? "#2563eb" : "#64748b", 700, "center");
    const nextPressed = g > tapAt("next") - 0.01 && g < tapAt("next") + 0.05;
    button(x, "Next", w / 2, py(-0.78), w - 60, 50, nextPressed, picked ? "#2563eb" : "#94a3b8");
  } else if (g < 44.6) {
    // Compose: caption, platforms and Publish
    appHeader(x, w, "Share", "Stay Hydrated campaign");
    posterThumb(x, poster, 18, 112, 72, 90, 6);
    reelThumb(x, 96, 112, 51, 90);
    const caption = "Stay hydrated. Stay active. Your everyday bottle. #StayHydrated";
    const typed = caption.slice(0, Math.floor(range(g, 43.1, 43.36) * caption.length));
    wrap(x, typed || "Write a caption…", 158, 116, w - 172, 13, typed ? "#0f172a" : "#94a3b8", 500, 1.35);
    x.fillStyle = "#e2e8f0";
    x.fillRect(16, 222, w - 32, 1);
    text(x, "Share to", 20, 300, 13, "#64748b", 700);
    PLATFORMS.forEach((p, i) => {
      const tap = [tapAt("platform 1"), tapAt("platform 2"), tapAt("platform 3")][i];
      const on = easeInOut(range(g, tap, tap + 0.05));
      const cy = py([-0.08, -0.26, -0.44][i]);
      platformIcon(x, 38, cy, 30, p);
      text(x, PLATFORM_NAMES[p], 64, cy, 15, "#0f172a", 700);
      // Toggle switch
      const tx = px(0.62);
      box(x, tx - 22, cy - 13, 44, 26, 13, on > 0.5 ? "#2563eb" : "#cbd5e1");
      x.beginPath();
      x.arc(tx + lerp(-9, 9, on), cy, 10, 0, Math.PI * 2);
      x.fillStyle = "#ffffff";
      x.fill();
    });
    text(x, "When", 20, py(-0.6), 13, "#64748b", 700);
    pill(x, "Post now", w - 20, py(-0.6), 12, "#1d4ed8", "#dbeafe", "right");
    const pressed = g > tapAt("publish") - 0.02 && g < tapAt("publish") + 0.06;
    button(x, "Publish", w / 2, py(-0.8), w - 60, 50, pressed);
    // Publishing progress
    const sending = range(g, 44.26, 44.58);
    if (g > 44.26) {
      x.fillStyle = "rgba(255,255,255,0.86)";
      x.fillRect(0, 0, w, h);
      box(x, 30, h / 2 - 60, w - 60, 120, 18, "#ffffff");
      outline(x, 30, h / 2 - 60, w - 60, 120, 18, "#e2e8f0", 2);
      text(x, "Publishing to 3 platforms…", w / 2, h / 2 - 20, 14, "#0f172a", 700, "center");
      progress(x, 54, h / 2 + 14, w - 108, 10, sending);
    }
  } else if (g < 45.35) {
    // Published
    const pop = easeOut(range(g, 44.6, 44.78));
    check(x, w / 2, 230, 34 + 10 * pop);
    text(x, "Published", w / 2, 300, 24, "#0f172a", 800, "center");
    text(x, "Live on 3 platforms", w / 2, 330, 14, "#16a34a", 700, "center");
    PLATFORMS.forEach((p, i) => platformIcon(x, w / 2 + (i - 1) * 54, 384, 34, p));
    posterThumb(x, poster, w / 2 - 60, 430, 120, 150, 10);
  } else {
    insightsScreen(x, w, h, g, poster);
  }
  ripples(x, g);
}

function feedScreen(x: Ctx, w: number, h: number, poster: CanvasImageSource) {
  text(x, "yourbrand", 20, 56, 20, "#0f172a", 800);
  ["#f97316", "#2563eb", "#22c55e", "#a855f7", "#facc15"].forEach((c, i) => {
    x.strokeStyle = c;
    x.lineWidth = 4;
    x.beginPath();
    x.arc(42 + i * 60, 108, 22, 0, Math.PI * 2);
    x.stroke();
    x.fillStyle = "#e2e8f0";
    x.beginPath();
    x.arc(42 + i * 60, 108, 16, 0, Math.PI * 2);
    x.fill();
  });
  const tiles = ["#dbeafe", "#bfdbfe", "#e0f2fe", "#fef3c7", "#ede9fe", "#dcfce7", "#fee2e2", "#e0e7ff", "#cffafe", "#dbeafe", "#fef9c3", "#e0f2fe"];
  tiles.forEach((c, i) => {
    const tx = 4 + (i % 3) * 106;
    const ty = 146 + Math.floor(i / 3) * 128;
    box(x, tx, ty, 102, 124, 2, c);
  });
  void poster;
  box(x, 18, h - 58, w - 36, 42, 21, "#2563eb");
  text(x, "Scheduled: 3 posts today", w / 2, h - 37, 14, "#ffffff", 700, "center");
}

/** Live post with growing (illustrative) reactions, a comment and her reply. */
function insightsScreen(x: Ctx, w: number, h: number, g: number, poster: CanvasImageSource) {
  appHeader(x, w, "Your post", "Live · Stay Hydrated");
  posterThumb(x, poster, 20, 112, w - 40, (w - 40) * 1.0, 10);
  const grow = easeOut(range(g, 45.35, 48.6));
  const counts: [Reaction, number][] = [["like", 1248 * grow], ["comment", 842 * grow], ["share", 216 * grow]];
  counts.forEach(([kind, n], i) => {
    const cx = 34 + i * 92;
    reactionGlyph(x, cx, 420, 26, kind, REACTION_COLOR[kind]);
    text(x, compact(n), cx + 18, 421, 15, "#0f172a", 800);
  });
  // A comment arrives; she replies
  const comment = easeOut(range(g, 46.2, 46.4));
  if (comment > 0) {
    x.globalAlpha = comment;
    box(x, 16, 456, w - 32, 76, 14, "#f1f5f9");
    x.fillStyle = "#f59e0b";
    x.beginPath();
    x.arc(42, 482, 13, 0, Math.PI * 2);
    x.fill();
    text(x, "Priya", 64, 476, 13, "#0f172a", 800);
    text(x, "Love this colour! Where can I get it?", 64, 498, 12, "#334155", 500);
    const replyPressed = g > tapAt("reply") - 0.02 && g < tapAt("reply") + 0.06;
    pill(x, "Reply", px(0.55) + 26, py(-0.62), 12, "#ffffff", replyPressed ? "#1d4ed8" : "#2563eb", "right");
    x.globalAlpha = 1;
  }
  const reply = easeOut(range(g, 46.88, 47.05));
  if (reply > 0) {
    x.globalAlpha = reply;
    box(x, 70, 576, w - 86, 54, 14, "#2563eb");
    text(x, "Thank you! It's in our shop now.", 84, 603, 12, "#ffffff", 600);
    x.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------------------
// Floating post cards (4.3): the same post laid out for three platforms
// ---------------------------------------------------------------------------

export function postCountsKey(g: number) {
  return String(Math.round(easeOut(range(g, 45.4, 48.0)) * 120));
}

function postHeader(x: Ctx, w: number, platform: Platform, dark = false) {
  x.fillStyle = "#2563eb";
  x.beginPath();
  x.arc(36, 36, 16, 0, Math.PI * 2);
  x.fill();
  text(x, "yourbrand", 60, 30, 15, dark ? "#ffffff" : "#0f172a", 800);
  text(x, "Just now", 60, 48, 11, dark ? "#cbd5e1" : "#64748b", 600);
  platformIcon(x, w - 36, 36, 30, platform);
}

/** Square feed post (Instagram-style layout). */
export function drawFeedPost(x: Ctx, w: number, h: number, g: number, poster: CanvasImageSource) {
  card(x, w, h, 24);
  postHeader(x, w, "instagram");
  posterThumb(x, poster, 14, 66, w - 28, (w - 28) * 1.25, 6);
  const k = easeOut(range(g, 45.4, 48.0));
  const y = 66 + (w - 28) * 1.25 + 30;
  (["like", "comment", "share"] as Reaction[]).forEach((r, i) => reactionGlyph(x, 32 + i * 40, y, 28, r, i === 0 && k > 0.05 ? REACTION_COLOR.like : "#0f172a"));
  text(x, `${compact(1248 * k)} likes`, 18, y + 32, 14, "#0f172a", 800);
}

/** Vertical reel post (short-video layout): the footage itself is a 3D plane under this overlay. */
export function drawReelOverlay(x: Ctx, w: number, h: number, g: number) {
  x.clearRect(0, 0, w, h);
  x.strokeStyle = "rgba(255,255,255,0.9)";
  x.lineWidth = 6;
  x.beginPath();
  x.roundRect(3, 3, w - 6, h - 6, 22);
  x.stroke();
  const shade = x.createLinearGradient(0, h * 0.62, 0, h);
  shade.addColorStop(0, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(0,0,0,0.55)");
  x.fillStyle = shade;
  x.fillRect(6, h * 0.62, w - 12, h * 0.38 - 6);
  platformIcon(x, w - 32, 34, 28, "youtube");
  const k = easeOut(range(g, 45.4, 48.0));
  (["like", "comment", "share"] as Reaction[]).forEach((r, i) => {
    const cy = h * 0.5 + i * 58;
    reactionGlyph(x, w - 30, cy, 30, r, i === 0 && k > 0.05 ? "#f87171" : "#ffffff");
    text(x, compact([2300, 410, 180][i] * k), w - 30, cy + 26, 12, "#ffffff", 700, "center");
  });
  text(x, "@yourbrand", 16, h - 52, 14, "#ffffff", 800);
  text(x, "Stay hydrated, stay active", 16, h - 28, 12, "#e2e8f0", 600);
}

/** Wide post (Facebook-style layout). */
export function drawWidePost(x: Ctx, w: number, h: number, g: number, poster: CanvasImageSource) {
  card(x, w, h, 24);
  postHeader(x, w, "facebook");
  text(x, "New: your everyday bottle. Stay hydrated, stay active.", 18, 80, 13, "#334155", 500);
  const iy = 98;
  const ih = h - iy - 64;
  const bg = x.createLinearGradient(0, iy, w, iy + ih);
  bg.addColorStop(0, "#1d4ed8");
  bg.addColorStop(1, "#38bdf8");
  box(x, 14, iy, w - 28, ih, 6, bg);
  posterThumb(x, poster, w / 2 - (ih * 0.8) / 2, iy, ih * 0.8, ih, 0);
  const k = easeOut(range(g, 45.4, 48.0));
  reactionGlyph(x, 30, h - 34, 24, "like", REACTION_COLOR.like);
  text(x, compact(312 * k), 48, h - 33, 13, "#334155", 700);
  text(x, `${compact(48 * k)} comments · ${compact(21 * k)} shares`, w - 18, h - 33, 12, "#64748b", 600, "right");
}

/** Like / comment / share bubbles that pop out of the cards in small groups. */
export function drawReactionBadge(x: Ctx, w: number, h: number, kind: Reaction) {
  x.clearRect(0, 0, w, h);
  x.fillStyle = REACTION_COLOR[kind];
  x.beginPath();
  x.arc(w / 2, h / 2, w / 2 - 3, 0, Math.PI * 2);
  x.fill();
  x.strokeStyle = "#ffffff";
  x.lineWidth = 4;
  x.stroke();
  reactionGlyph(x, w / 2, h / 2 + 2, w * 0.56, kind);
}

// ---------------------------------------------------------------------------
// 4.1 preview label, 4.2 success badge, 4.4 dashboard, transition card
// ---------------------------------------------------------------------------

export function drawPreviewLabel(x: Ctx, w: number, h: number) {
  x.clearRect(0, 0, w, h);
  box(x, 2, 2, w - 4, h - 4, (h - 4) / 2, "rgba(15,23,42,0.86)");
  check(x, h / 2 + 4, h / 2, h * 0.26);
  text(x, "Final assets · from Design", h + 2, h / 2 + 1, h * 0.34, "#ffffff", 700);
}

export function drawSuccessBadge(x: Ctx, w: number, h: number) {
  x.clearRect(0, 0, w, h);
  box(x, 4, 4, w - 8, h - 8, (h - 8) / 2, "#16a34a");
  check(x, h / 2 + 4, h / 2, h * 0.28, "#15803d");
  text(x, "Published to 3 platforms", h + 4, h / 2 + 1, h * 0.32, "#ffffff", 800);
}

const TREND = [14, 19, 17, 26, 31, 38, 47];

export function dashboardKey(g: number) {
  return String(Math.round(range(g, 48.2, 49.5) * 90));
}

/** Content performance: an illustrative engagement trend and three counters, clearly labelled as examples. */
export function drawPerformanceDashboard(x: Ctx, w: number, h: number, g: number) {
  card(x, w, h, 26);
  text(x, "Content performance", 28, 40, 24, "#0f172a", 800);
  text(x, "Stay Hydrated campaign · first week", 28, 68, 14, "#64748b", 600);
  pill(x, "Illustrative example", w - 26, 40, 13, "#92400e", "#fef3c7", "right");

  // Engagement trend rising point by point
  const p = easeInOut(range(g, 48.35, 49.35));
  const cx = 28;
  const cy = 92;
  const cw = w - 56;
  const ch = h - 92 - 118;
  x.strokeStyle = "#e2e8f0";
  x.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    x.beginPath();
    x.moveTo(cx, cy + (ch * i) / 3);
    x.lineTo(cx + cw, cy + (ch * i) / 3);
    x.stroke();
  }
  text(x, "Engagement", cx, cy + 10, 12, "#64748b", 700);
  const pts = TREND.map((v, i) => [cx + (cw * i) / (TREND.length - 1), cy + ch - (v / 52) * ch] as const);
  const n = p * (pts.length - 1);
  const shown: [number, number][] = [];
  for (let i = 0; i < pts.length; i++) {
    if (i <= n) shown.push([pts[i][0], pts[i][1]]);
    else {
      const a = pts[i - 1];
      const t = n - (i - 1);
      if (t > 0) shown.push([lerp(a[0], pts[i][0], t), lerp(a[1], pts[i][1], t)]);
      break;
    }
  }
  if (shown.length > 1) {
    const fill = x.createLinearGradient(0, cy, 0, cy + ch);
    fill.addColorStop(0, "rgba(37,99,235,0.35)");
    fill.addColorStop(1, "rgba(37,99,235,0.02)");
    x.beginPath();
    x.moveTo(shown[0][0], cy + ch);
    shown.forEach(([sx, sy]) => x.lineTo(sx, sy));
    x.lineTo(shown[shown.length - 1][0], cy + ch);
    x.fillStyle = fill;
    x.fill();
    x.beginPath();
    shown.forEach(([sx, sy], i) => (i ? x.lineTo(sx, sy) : x.moveTo(sx, sy)));
    x.strokeStyle = "#2563eb";
    x.lineWidth = 4;
    x.lineJoin = "round";
    x.stroke();
    const [ex, ey] = shown[shown.length - 1];
    x.beginPath();
    x.arc(ex, ey, 7, 0, Math.PI * 2);
    x.fillStyle = "#ffffff";
    x.fill();
    x.strokeStyle = "#2563eb";
    x.lineWidth = 3;
    x.stroke();
  }

  // Counters
  const tiles: [Reaction, string, number][] = [["like", "Likes", 1248], ["comment", "Comments", 842], ["share", "Shares", 216]];
  const tw = (w - 56 - 24) / 3;
  tiles.forEach(([kind, label, value], i) => {
    const k = easeOut(range(g, 48.5 + i * 0.12, 49.3 + i * 0.12));
    const tx = 28 + i * (tw + 12);
    const ty = h - 104;
    box(x, tx, ty, tw, 80, 16, "#f1f5f9");
    x.globalAlpha = 0.25 + 0.75 * k;
    reactionGlyph(x, tx + 26, ty + 40, 28, kind, REACTION_COLOR[kind]);
    text(x, compact(value * k), tx + 50, ty + 32, 24, "#0f172a", 800);
    text(x, label, tx + 50, ty + 58, 12, "#64748b", 600);
    x.globalAlpha = 1;
  });
}

/** The campaign post that travels from the social corner to the advertising dashboard. */
export function drawCampaignCard(x: Ctx, w: number, h: number, poster: CanvasImageSource) {
  card(x, w, h, 22);
  posterThumb(x, poster, 16, 16, (h - 32) * 0.8, h - 32, 8);
  const tx = 16 + (h - 32) * 0.8 + 16;
  text(x, "CAMPAIGN POST", tx, 34, 12, "#2563eb", 800);
  text(x, "Stay Hydrated", tx, 64, 22, "#0f172a", 800);
  text(x, "Blue bottle · Poster + reel", tx, 92, 13, "#64748b", 600);
  box(x, tx, h - 62, w - tx - 18, 40, 20, "#2563eb");
  text(x, "Send to Ads  →", tx + (w - tx - 18) / 2, h - 41, 14, "#ffffff", 800, "center");
}
