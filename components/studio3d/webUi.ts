import { type Ctx, box, text } from "./uiKit";

/**
 * Scene 6 screens: code builds across the timeline, followed by mobile layout review.
 */

const C = { bg: "#0d1117", panel: "#161b22", line: "#30363d", dim: "#7d8590", kw: "#ff7b72", fn: "#d2a8ff", str: "#a5d6ff", tag: "#7ee787", text: "#e6edf3" };

export function drawCodeEditor(x: Ctx, w: number, h: number, g = 70) {
  x.fillStyle = C.bg;
  x.fillRect(0, 0, w, h);
  x.fillStyle = C.panel;
  x.fillRect(0, 0, w, 40);
  x.fillRect(0, 40, 230, h - 40);
  ["#ef4444", "#f59e0b", "#22c55e"].forEach((c, i) => {
    x.fillStyle = c;
    x.beginPath();
    x.arc(18 + i * 18, 20, 6, 0, Math.PI * 2);
    x.fill();
  });
  text(x, "storefront — Hero.tsx", w / 2, 20, 14, C.dim, 600, "center");
  ["app", "  page.tsx", "  layout.tsx", "components", "  Hero.tsx", "  ProductCard.tsx", "  Cart.tsx", "styles", "  globals.css"].forEach((f, i) => {
    if (i === 4) box(x, 8, 58 + i * 30 - 12, 214, 26, 6, "rgba(56,139,253,0.2)");
    text(x, f, 22, 58 + i * 30, 14, i === 4 ? C.text : C.dim, 500);
  });
  const lines: [string, string][][] = [
    [["export function ", C.kw], ["Hero", C.fn], ["() {", C.text]],
    [["  return (", C.text]],
    [["    <section ", C.tag], ["className", C.fn], ["=", C.text], ['"hero"', C.str], [">", C.tag]],
    [["      <h1>", C.tag], ["Stay hydrated. Stay active.", C.text], ["</h1>", C.tag]],
    [["      <p>", C.tag], ["Your everyday bottle.", C.text], ["</p>", C.tag]],
    [["      <ProductImage ", C.tag], ["src", C.fn], ["=", C.text], ['"/bottle.png"', C.str], [" />", C.tag]],
    [["      <Button ", C.tag], ["href", C.fn], ["=", C.text], ['"/shop"', C.str], [">", C.tag], ["Shop now", C.text], ["</Button>", C.tag]],
    [["    </section>", C.tag]],
    [["  );", C.text]],
    [["}", C.text]],
  ];
  const count = g < 60 ? 10 : Math.min(10, Math.max(2, Math.floor(2 + (g - 60) * 2)));
  lines.slice(0, count).forEach((parts, i) => {
    const y = 74 + i * 34;
    text(x, String(i + 1), 270, y, 15, "#484f58", 500, "right");
    let cx = 292;
    for (const [s, c] of parts) {
      text(x, s, cx, y, 17, c, 500);
      cx += x.measureText(s).width;
    }
  });
  box(x, 292, 74 + count * 34 - 12, 2, 24, 1, C.text);
  x.fillStyle = C.panel;
  x.fillRect(230, h - 150, w - 230, 150);
  text(x, "TERMINAL", 250, h - 128, 12, C.dim, 700);
  text(x, g < 64 ? "Building the storefront…" : g < 68 ? "✓ Preview ready · reviewing desktop and mobile" : "✓ Build complete · ready for review", 250, h - 96, 15, C.tag, 500);
}

export function drawWebsitePreview(x: Ctx, w: number, h: number, poster: CanvasImageSource) {
  x.fillStyle = "#ffffff";
  x.fillRect(0, 0, w, h);
  x.fillStyle = "#f1f5f9";
  x.fillRect(0, 0, w, 36);
  box(x, 90, 8, w - 180, 20, 10, "#ffffff");
  text(x, "yourbrand.com", w / 2, 18, 12, "#64748b", 600, "center");
  text(x, "yourbrand", 40, 66, 20, "#0f172a", 800);
  ["Shop", "About", "Contact"].forEach((m, i) => text(x, m, w - 260 + i * 80, 66, 14, "#334155", 600));
  const grad = x.createLinearGradient(0, 96, w, h);
  grad.addColorStop(0, "#1d4ed8");
  grad.addColorStop(1, "#38bdf8");
  box(x, 30, 96, w - 60, h - 220, 18, grad);
  text(x, "Stay hydrated.", 70, 180, 44, "#ffffff", 900);
  text(x, "Stay active.", 70, 232, 44, "#facc15", 900);
  box(x, 70, 284, 150, 44, 22, "#ffffff");
  text(x, "Shop now", 145, 306, 16, "#1d4ed8", 800, "center");
  x.save();
  x.beginPath();
  x.roundRect(w - 330, 110, 250, h - 248, 14);
  x.clip();
  x.drawImage(poster, w - 330, 110, 250, (250 * 640) / 512);
  x.restore();
  [0, 1, 2, 3].forEach((i) => box(x, 30 + i * ((w - 60) / 4), h - 106, (w - 60) / 4 - 16, 82, 12, "#eff6ff"));
}

export function drawDevLaptop(x: Ctx, w: number, h: number, g = 70) {
  x.fillStyle = "#f8fafc";
  x.fillRect(0, 0, w, h);
  text(x, "Mobile preview", 20, 24, 15, "#0f172a", 700);
  for (let i = 0; i < 3; i++) {
    const px = 30 + i * 200;
    box(x, px, 50, 160, 330, 22, "#0f172a");
    box(x, px + 8, 58, 144, 314, 16, ["#dbeafe", "#ffffff", "#eff6ff"][i]);
    box(x, px + 20, 80, 120, 120, 10, "#2563eb");
    box(x, px + 20, 214, 100, 14, 7, "#94a3b8");
    box(x, px + 20, 238, 70, 14, 7, "#cbd5e1");
    if (g >= 65 + i * 0.8) {
      box(x, px + 18, 300, 124, 32, 12, "#dcfce7");
      text(x, "Layout checked", px + 80, 316, 12, "#166534", 700, "center");
    }
  }
}
