import * as THREE from "three";
import { SEO_THETA, ringPoint } from "./environment";
import { Kit, buildDesk, buildOfficeChair } from "./props";
import { CanvasScreen, uiMaterial } from "./screens";
import { box, text, check, type Ctx } from "./uiKit";
import { range } from "./math";

/** Illustrative SEO workflow: page checks, search preview, then example reporting. */
export class SeoScene {
  readonly group = new THREE.Group();
  readonly desk;
  private readonly main = new CanvasScreen(1280, 720);
  private readonly side = new CanvasScreen(1024, 576);
  private readonly laptop = new CanvasScreen(640, 400);

  constructor(kit: Kit) {
    this.desk = buildDesk(kit);
    this.desk.group.position.copy(ringPoint(SEO_THETA, 8.75)).setY(0.08);
    this.desk.group.rotation.y = SEO_THETA - Math.PI;
    const chair = buildOfficeChair(kit);
    chair.position.copy(ringPoint(SEO_THETA, 8.08)).setY(0.08);
    chair.rotation.y = SEO_THETA - Math.PI;
    this.group.add(this.desk.group, chair);
    this.desk.main.screen.material = uiMaterial(this.main.texture);
    this.desk.side.screen.material = uiMaterial(this.side.texture);
    this.desk.laptopScreen.material = uiMaterial(this.laptop.texture);
    this.update(70);
  }

  update(g: number) {
    const step = Math.floor(Math.min(80, Math.max(70, g)) * 8);
    this.main.draw(String(step), (x, w, h) => {
      x.fillStyle = "#111827"; x.fillRect(0, 0, w, h);
      text(x, "Search visibility", 48, 52, 30, "#ffffff", 800);
      text(x, "EXAMPLE PROJECT", w - 48, 52, 17, "#93c5fd", 700, "right");
      const rows = ["Page title and description", "Clear headings and useful content", "Internal links and navigation", "Image descriptions", "Sitemap and indexing review"];
      rows.forEach((label, i) => {
        const y = 140 + i * 82;
        box(x, 38, y - 27, w - 76, 66, 12, "#1f2937");
        text(x, label, 70, y + 5, 24, "#e5e7eb", 600);
        const done = g >= 71 + i * 0.8;
        if (done) check(x, w - 90, y + 5, 17);
        else text(x, "Review", w - 70, y + 5, 19, "#9ca3af", 500, "right");
      });
      text(x, g >= 75 ? "Page updates ready for review" : "Reviewing the website, one page at a time", 48, h - 45, 23, "#93c5fd", 600);
    });
    this.side.draw(String(step), (x, w, h) => this.drawReport(x, w, h, g));
    this.laptop.draw("search-preview", (x, w, h) => {
      x.fillStyle = "#ffffff"; x.fillRect(0, 0, w, h);
      text(x, "Search preview · example", 28, 38, 24, "#0f172a", 700);
      box(x, 24, 75, w - 48, 52, 25, "#f1f5f9");
      text(x, "reusable everyday water bottle", 44, 101, 20, "#475569");
      text(x, "yourbrand.com / bottles", 28, 170, 18, "#475569");
      text(x, "Stay Hydrated | Everyday Bottles", 28, 212, 25, "#1d4ed8", 600);
      text(x, "Find a bottle for your everyday routine.", 28, 255, 19, "#475569");
      text(x, "A preview, not a guaranteed search position.", 28, h - 38, 16, "#64748b");
    });
  }

  private drawReport(x: Ctx, w: number, h: number, g: number) {
    x.fillStyle = "#f8fafc"; x.fillRect(0, 0, w, h);
    text(x, "Example search performance", 35, 44, 29, "#0f172a", 800);
    text(x, "Illustrative data · not client results", 35, 84, 19, "#64748b");
    const p = range(g, 76, 79);
    [["Impressions", Math.round(1200 * p)], ["Clicks", Math.round(84 * p)]].forEach(([label, value], i) => {
      box(x, 35 + i * 470, 120, 440, 105, 16, "#dbeafe");
      text(x, String(label), 60 + i * 470, 149, 21, "#475569", 600);
      text(x, String(value), 60 + i * 470, 194, 35, "#1d4ed8", 800);
    });
    x.strokeStyle = "#cbd5e1"; x.lineWidth = 2;
    x.beginPath(); x.moveTo(60, 270); x.lineTo(60, 460); x.lineTo(w - 50, 460); x.stroke();
    x.strokeStyle = "#2563eb"; x.lineWidth = 5; x.beginPath();
    for (let i = 0; i <= Math.floor(p * 40); i++) {
      const t = i / 40;
      const px = 60 + t * (w - 110), py = 435 - t * 140 - Math.sin(t * 12) * 14;
      if (i === 0) x.moveTo(px, py); else x.lineTo(px, py);
    }
    x.stroke();
    text(x, "Week 1", 60, 492, 17, "#64748b");
    text(x, "Week 4", w - 50, 492, 17, "#64748b", 500, "right");
    text(x, "Measure, learn and improve.", 35, h - 35, 23, "#0f172a", 700);
  }

  dispose() { this.main.dispose(); this.side.dispose(); this.laptop.dispose(); }
}
