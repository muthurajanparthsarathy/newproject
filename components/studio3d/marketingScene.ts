import * as THREE from "three";
import { DeveloperAct, MarketerAct } from "./choreography";
import { MARKETING_THETA, WEB_THETA, ringPoint, zonePoint } from "./environment";
import type { Humanoid } from "./humanoid";
import {
  METRICS, adsMainKey, adsSideKey, analyticsPanelKey, drawAdsMain, drawAdsSide, drawAnalyticsPanel, drawAudienceMap, drawMetricCard,
  drawVisitBadge, mapKey, metricKey,
} from "./marketingUi";
import { easeInOut, easeOut, lerp, range } from "./math";
import { Kit, buildDesk, buildMarketingDesk, buildOfficeChair, type MarketingDesk } from "./props";
import { CanvasScreen, SCREEN_LAYER, uiMaterial } from "./screens";
import { drawCodeEditor, drawDevLaptop, drawWebsitePreview } from "./webUi";

/** A point in the marketing specialist's frame (x her left, y up from the floor, z towards her desk). */
const M = (x: number, y: number, z: number) => zonePoint(MARKETING_THETA, 8.03, 1, x, y, z);

const SPOT = {
  panel: M(-0.3, 1.52, 0.72),
  map: M(-0.45, 1.66, 0.85),
};

type Card = { group: THREE.Group; mat: THREE.MeshBasicMaterial; screen: CanvasScreen };

/**
 * Scene 5 — digital marketing (50–60): campaign setup on the ads dashboard, an
 * illustrative analytics panel, the audience map and website-visit indicators heading to
 * the web & app desk, where the developer (scene 6) is already at work.
 */
export class MarketingScene {
  readonly group = new THREE.Group();
  readonly desk: MarketingDesk;
  readonly act: MarketerAct;
  readonly developer: DeveloperAct;
  private readonly code = new CanvasScreen(1280, 720);
  private readonly mobile = new CanvasScreen(640, 400);
  private readonly main = new CanvasScreen(1280, 720);
  private readonly side = new CanvasScreen(1024, 576);
  private readonly panel: THREE.Group;
  private readonly chart: Card;
  private readonly metrics: Card[] = [];
  private readonly map: Card;
  private readonly visits: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }[] = [];
  private readonly visitCurve: THREE.CatmullRomCurve3;
  private readonly disposables: { dispose(): void }[] = [];

  constructor(kit: Kit, marketer: Humanoid, developer: Humanoid, private readonly poster: HTMLCanvasElement, campaignAt: () => THREE.Vector3) {
    // Advertising workstation, facing the wall like the design desk
    this.desk = buildMarketingDesk(kit);
    this.desk.group.position.copy(ringPoint(MARKETING_THETA, 8.75)).setY(0.08);
    this.desk.group.rotation.y = MARKETING_THETA - Math.PI;
    const chair = buildOfficeChair(kit);
    chair.position.copy(ringPoint(MARKETING_THETA, 8.08)).setY(0.08);
    chair.rotation.y = MARKETING_THETA - Math.PI;
    this.group.add(this.desk.group, chair);
    this.desk.main.screen.material = uiMaterial(this.main.texture);
    this.desk.side.screen.material = uiMaterial(this.side.texture);
    this.desk.group.updateMatrixWorld(true);
    this.act = new MarketerAct(marketer, this.desk, ringPoint(MARKETING_THETA, 8.03), MARKETING_THETA, { card: campaignAt, panel: SPOT.panel, map: SPOT.map });

    // Floating analytics panel with three metric cards that assemble under it
    this.panel = new THREE.Group();
    this.panel.visible = false;
    this.chart = this.card(900, 560, 0.62);
    this.chart.group.position.set(0, 0.06, 0);
    this.panel.add(this.chart.group);
    METRICS.forEach(() => {
      const c = this.card(300, 150, 0.19);
      this.metrics.push(c);
      this.panel.add(c.group);
    });
    this.map = this.card(1024, 560, 0.82);
    this.map.group.visible = false;
    this.group.add(this.panel, this.map.group);

    // Web & app desk (scene 6), already busy
    const devDesk = buildDesk(kit);
    devDesk.group.position.copy(ringPoint(WEB_THETA, 8.75)).setY(0.08);
    devDesk.group.rotation.y = WEB_THETA - Math.PI;
    const devChair = buildOfficeChair(kit);
    devChair.position.copy(ringPoint(WEB_THETA, 8.08)).setY(0.08);
    devChair.rotation.y = WEB_THETA - Math.PI;
    this.group.add(devDesk.group, devChair);
    const code = this.code;
    const site = new CanvasScreen(1024, 576);
    const mobile = this.mobile;
    code.draw("static", (x, w, h) => drawCodeEditor(x, w, h));
    site.draw("static", (x, w, h) => drawWebsitePreview(x, w, h, poster));
    mobile.draw("static", (x, w, h) => drawDevLaptop(x, w, h));
    devDesk.main.screen.material = uiMaterial(code.texture);
    devDesk.side.screen.material = uiMaterial(site.texture);
    devDesk.laptopScreen.material = uiMaterial(mobile.texture);
    this.disposables.push(this.main, this.side, code, site, mobile);
    devDesk.group.updateMatrixWorld(true);
    this.developer = new DeveloperAct(developer, devDesk, ringPoint(WEB_THETA, 8.03), WEB_THETA);

    // Website visits travel from the audience map to the web desk's site preview
    const siteAt = devDesk.anchors.sideScreen.getWorldPosition(new THREE.Vector3());
    const mid = SPOT.map.clone().lerp(siteAt, 0.5).add(new THREE.Vector3(0, 0.45, 0));
    this.visitCurve = new THREE.CatmullRomCurve3([SPOT.map.clone().add(new THREE.Vector3(0, 0.12, 0)), mid, siteAt.clone().add(new THREE.Vector3(0, 0.32, 0))], false, "centripetal");
    const badge = document.createElement("canvas");
    badge.width = 320;
    badge.height = 80;
    drawVisitBadge(badge.getContext("2d")!, 320, 80);
    const badgeTex = new THREE.CanvasTexture(badge);
    badgeTex.colorSpace = THREE.SRGBColorSpace;
    const badgeGeo = new THREE.PlaneGeometry(0.2, 0.05);
    this.disposables.push(badgeTex, badgeGeo);
    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshBasicMaterial({ map: badgeTex, transparent: true, depthWrite: false, toneMapped: false });
      const mesh = new THREE.Mesh(badgeGeo, mat);
      mesh.visible = false;
      this.disposables.push(mat);
      this.visits.push({ mesh, mat });
      this.group.add(mesh);
    }

    for (const o of [this.panel, this.map.group, ...this.visits.map((v) => v.mesh)]) o.traverse((c) => c.layers.set(SCREEN_LAYER));
  }

  private card(w: number, h: number, width: number): Card {
    const screen = new CanvasScreen(w, h);
    const mat = new THREE.MeshBasicMaterial({ map: screen.texture, transparent: true, depthWrite: false, toneMapped: false });
    const geo = new THREE.PlaneGeometry(width, (width * h) / w);
    this.disposables.push(screen, mat, geo);
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geo, mat));
    return { group, mat, screen };
  }

  /** The ads monitor's screen, where the campaign card lands. */
  get adsScreen() {
    return this.desk.main.screen;
  }

  apply(g: number, time: number) {
    this.act.apply(g, time);
    this.developer.apply(time);
  }

  update(g: number, time: number, camera: THREE.PerspectiveCamera) {
    this.code.draw(String(Math.floor(g * 8)), (x, w, h) => drawCodeEditor(x, w, h, g));
    this.mobile.draw(String(Math.floor(g * 8)), (x, w, h) => drawDevLaptop(x, w, h, g));
    this.main.draw(adsMainKey(g), (x, w, h) => drawAdsMain(x, w, h, Math.min(Math.max(g, 49.8), 60), this.poster));
    this.side.draw(adsSideKey(g), (x, w, h) => drawAdsSide(x, w, h, g));
    const q = camera.quaternion;

    // 5.3 — analytics panel rises out of the monitor; metric cards assemble beneath the chart
    const rise = easeInOut(range(g, 55.15, 55.9));
    const leave = easeInOut(range(g, 58.0, 58.45));
    this.panel.visible = rise > 0 && leave < 1;
    if (this.panel.visible) {
      const monitor = this.desk.anchors.mainScreen.getWorldPosition(new THREE.Vector3());
      this.panel.position.lerpVectors(monitor, SPOT.panel, rise).lerp(SPOT.map, leave * 0.4);
      this.panel.position.y += Math.sin(time * 1.1) * 0.006 * rise;
      this.panel.quaternion.copy(q);
      this.panel.scale.setScalar(Math.max(0.001, lerp(0.35, 1, rise) * lerp(1, 0.5, leave)));
      this.chart.screen.draw(analyticsPanelKey(g), (x, w, h) => drawAnalyticsPanel(x, w, h, g));
      this.chart.mat.opacity = Math.min(1, rise * 1.6) * (1 - leave);
      this.metrics.forEach((m, i) => {
        const k = easeOut(range(g, 55.6 + i * 0.25, 56.1 + i * 0.25));
        m.group.visible = k > 0;
        if (!m.group.visible) return;
        m.screen.draw(metricKey(g, i), (x, w, h) => drawMetricCard(x, w, h, g, i));
        const scatter = [new THREE.Vector3(-0.45, -0.32, 0.22), new THREE.Vector3(0.05, -0.5, 0.18), new THREE.Vector3(0.48, -0.3, 0.22)][i];
        const final = new THREE.Vector3((i - 1) * 0.21, -0.235, 0.012);
        m.group.position.lerpVectors(scatter, final, k);
        m.group.scale.setScalar(lerp(0.5, 1, k));
        m.mat.opacity = k * (1 - leave);
      });
    }

    // 5.4 — audience map, then website visits heading for the web desk
    const show = easeOut(range(g, 58.1, 58.6));
    this.map.group.visible = show > 0;
    if (show > 0) {
      this.map.screen.draw(mapKey(g), (x, w, h) => drawAudienceMap(x, w, h, g));
      this.map.group.position.copy(SPOT.map);
      this.map.group.position.y += Math.sin(time * 0.9) * 0.006;
      this.map.group.quaternion.copy(q);
      this.map.group.scale.setScalar(0.55 + 0.45 * show);
      this.map.mat.opacity = show;
    }
    this.visits.forEach((v, i) => {
      const p = range(g, 59.0 + i * 0.2, 59.7 + i * 0.1);
      v.mesh.visible = p > 0 && g < 61.5;
      if (!v.mesh.visible) return;
      this.visitCurve.getPointAt(easeInOut(p), v.mesh.position);
      // Once arrived they stack as small notifications above the developer's site preview
      v.mesh.position.y += p >= 1 ? i * 0.055 : Math.sin(time * 2 + i) * 0.01;
      v.mesh.quaternion.copy(q);
      v.mesh.scale.setScalar(Math.max(0.001, Math.min(1, p * 5) * lerp(1, 0.75, easeInOut(range(p, 0.8, 1)))));
      v.mat.opacity = Math.min(1, p * 4) * (1 - range(g, 60.4, 61.5));
    });
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
  }
}
