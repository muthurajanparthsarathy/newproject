import * as THREE from "three";
import { SocialManagerAct } from "./choreography";
import { drawSocialLaptop } from "./designUi";
import { drawCaptions } from "./editorUi";
import { SOCIAL_THETA, zonePoint } from "./environment";
import type { Humanoid } from "./humanoid";
import { clamp01, easeInOut, easeOut, lerp, range } from "./math";
import type { SocialStation } from "./props";
import { CanvasScreen, SCREEN_LAYER, gradingMaterial, uiMaterial } from "./screens";
import {
  PHONE, dashboardKey, drawCampaignCard, drawFeedPost, drawPerformanceDashboard, drawPhone, drawPreviewLabel, drawReactionBadge,
  drawReelOverlay, drawSuccessBadge, drawWidePost, phoneKey, postCountsKey,
} from "./socialUi";
import type { Reaction } from "./uiKit";

/** A point in the social manager's frame (x her left, y up from the floor, z the way she faces). */
const S = (x: number, y: number, z: number) => zonePoint(SOCIAL_THETA, 8.2, -1, x, y, z);

/** Where things float around her (chosen so nothing covers her face from the scene 4 cameras). */
const SPOT = {
  previewPoster: S(0.3, 1.6, 0.5),
  previewReel: S(0.5, 1.56, 0.4),
  previewLabel: S(0.38, 1.84, 0.46),
  posts: [S(0.36, 1.74, 0.42), S(0.8, 1.5, 0.3), S(0.52, 1.2, 0.72)],
  dashboard: S(0.86, 1.46, 0.5),
  /** The 4.2 close-up camera side: the phone is angled slightly towards it */
  show: S(-0.66, 1.45, 0.92),
};

type Billboard = { mesh: THREE.Object3D; mats: THREE.MeshBasicMaterial[] };
type Draw = (x: CanvasRenderingContext2D, w: number, h: number, g: number) => void;
type FloatingCard = { group: THREE.Group; mats: THREE.MeshBasicMaterial[]; screen?: CanvasScreen; draw?: Draw };

/** The design card from scene 3, which scene 4 carries into the content preview. */
export type DesignCard = { group: THREE.Group; glow: THREE.Mesh; badge: THREE.Mesh };

/**
 * Scene 4 — social media handling (40–50): the manager receives the poster and reel,
 * publishes them from her phone, engagement arrives on floating post cards, an
 * illustrative performance dashboard appears and a campaign card leaves for marketing.
 */
export class SocialScene {
  readonly group = new THREE.Group();
  readonly act: SocialManagerAct;
  private readonly phoneScreen = new CanvasScreen(PHONE.w, PHONE.h);
  private readonly laptopScreen = new CanvasScreen(640, 400);
  private readonly reelMat: THREE.ShaderMaterial;
  private readonly reel: THREE.Group;
  private readonly label: Billboard;
  private readonly success: Billboard;
  private readonly posts: FloatingCard[] = [];
  private readonly reactions: { mesh: THREE.Mesh; post: number; offset: number; phase: number }[] = [];
  private readonly dashboard: { group: THREE.Group; mat: THREE.MeshBasicMaterial; screen: CanvasScreen };
  private readonly campaign: { group: THREE.Group; mat: THREE.MeshBasicMaterial };
  private readonly cardCurve: THREE.CatmullRomCurve3;
  private readonly campaignCurve: THREE.CatmullRomCurve3;
  private readonly disposables: { dispose(): void }[] = [];
  private readonly reelCaptions: THREE.CanvasTexture;
  private readonly tmp = new THREE.Vector3();
  /** Current world position of the travelling campaign card (the marketer watches it arrive). */
  readonly campaignAt = new THREE.Vector3();
  private readonly arrivingAt = SPOT.previewPoster.clone();

  constructor(
    private readonly station: SocialStation,
    manager: Humanoid,
    private readonly poster: HTMLCanvasElement,
    footage: THREE.Texture,
    cardStart: THREE.Vector3,
    private readonly adsScreen: THREE.Object3D,
  ) {
    this.act = new SocialManagerAct(manager, station.phone, zonePoint(SOCIAL_THETA, 8.2, -1, 0, 0, 0), SOCIAL_THETA - Math.PI, {
      arriving: () => this.arrivingAt,
      posts: SPOT.posts,
      dashboard: SPOT.dashboard,
      campaign: () => this.campaignAt,
      show: SPOT.show,
    });
    station.phoneScreen.material = uiMaterial(this.phoneScreen.texture);
    station.laptopScreen.material = uiMaterial(this.laptopScreen.texture);
    this.laptopScreen.draw("static", drawSocialLaptop);

    // The finished reel: the same footage, graded and cropped 9:16, with the edit's captions
    this.reelMat = gradingMaterial(footage);
    this.reelMat.uniforms.grade.value = 1;
    this.reelMat.uniforms.presence.value = 1;
    this.reelMat.uniforms.crop.value.set(0.5 - 9 / 16 / 1.6 / 2, 0, 9 / 16 / 1.6, 1);
    const captions = document.createElement("canvas");
    captions.width = 270;
    captions.height = 480;
    drawCaptions(captions.getContext("2d")!, 270, 480, 28, true);
    this.reelCaptions = new THREE.CanvasTexture(captions);
    this.reelCaptions.colorSpace = THREE.SRGBColorSpace;
    this.disposables.push(this.reelMat, this.reelCaptions, this.phoneScreen, this.laptopScreen);
    this.reel = this.reelCard(0.14).group;
    this.group.add(this.reel);

    this.label = this.billboard(420, 72, 0.3, drawPreviewLabel);
    this.success = this.billboard(520, 96, 0.22, drawSuccessBadge);

    // Floating post cards: feed, reel and wide layouts
    const feed = this.canvasCard(360, 552, 0.24, (x, w, h, g) => drawFeedPost(x, w, h, g, poster));
    const reel = this.reelCard(0.17, true);
    const wide = this.canvasCard(480, 400, 0.3, (x, w, h, g) => drawWidePost(x, w, h, g, poster));
    this.posts.push(feed, reel, wide);
    for (const p of this.posts) this.group.add(p.group);

    // Reaction bubbles, five per card, in small staggered groups
    const kinds: Reaction[] = ["like", "comment", "share"];
    const textures = kinds.map((k) => {
      const c = document.createElement("canvas");
      c.width = c.height = 96;
      drawReactionBadge(c.getContext("2d")!, 96, 96, k);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    });
    const bubbleGeo = new THREE.PlaneGeometry(0.045, 0.045);
    this.disposables.push(bubbleGeo, ...textures);
    for (let i = 0; i < 15; i++) {
      const mat = new THREE.MeshBasicMaterial({ map: textures[i % 3], transparent: true, depthWrite: false, toneMapped: false });
      this.disposables.push(mat);
      const mesh = new THREE.Mesh(bubbleGeo, mat);
      mesh.visible = false;
      this.reactions.push({ mesh, post: Math.floor(i / 5), offset: ((i * 37) % 11) / 10 - 0.5, phase: (i % 5 < 3 ? 0 : 0.5) + (i % 5) * 0.07 });
      this.group.add(mesh);
    }

    // Content-performance dashboard and the campaign card
    const dash = this.canvasCard(640, 400, 0.52);
    this.dashboard = { group: dash.group, mat: dash.mats[0], screen: dash.screen };
    this.group.add(dash.group);
    const camp = this.canvasCard(360, 220, 0.26);
    camp.screen.draw("static", (x, w, h) => drawCampaignCard(x, w, h, poster));
    this.campaign = { group: camp.group, mat: camp.mats[0] };
    this.group.add(camp.group);

    // Paths: design desk → over her head → preview; dashboard → across the studio → ads monitor
    this.cardCurve = new THREE.CatmullRomCurve3([cardStart.clone(), S(-2.2, 1.78, 0.78), S(-0.7, 1.9, 0.72), S(0.05, 1.78, 0.6), SPOT.previewPoster], false, "centripetal");
    adsScreen.updateMatrixWorld(true);
    const adsAt = adsScreen.getWorldPosition(new THREE.Vector3());
    const adsNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(adsScreen.getWorldQuaternion(new THREE.Quaternion()));
    this.campaignCurve = new THREE.CatmullRomCurve3(
      [S(0.9, 1.52, 0.68), S(1.9, 1.62, 1.0), S(3.0, 1.55, 0.86), adsAt.clone().addScaledVector(adsNormal, 0.35).add(new THREE.Vector3(0, 0.05, 0)), adsAt.clone().addScaledVector(adsNormal, 0.03)],
      false,
      "centripetal",
    );
    this.campaignAt.copy(this.campaignCurve.getPoint(0));

    this.group.traverse((o) => o.layers.set(SCREEN_LAYER));
  }

  // ---------- builders ----------

  private canvasCard(w: number, h: number, width: number, draw?: Draw) {
    const screen = new CanvasScreen(w, h);
    const mat = new THREE.MeshBasicMaterial({ map: screen.texture, transparent: true, depthWrite: false, toneMapped: false });
    const geo = new THREE.PlaneGeometry(width, (width * h) / w);
    this.disposables.push(screen, mat, geo);
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geo, mat));
    group.visible = false;
    return { group, mats: [mat], screen, draw };
  }

  private billboard(w: number, h: number, width: number, draw: (x: CanvasRenderingContext2D, w: number, h: number) => void): Billboard {
    const card = this.canvasCard(w, h, width);
    card.screen.draw("static", draw);
    this.group.add(card.group);
    return { mesh: card.group, mats: card.mats };
  }

  /** A vertical reel: footage plane, captions (or post overlay) on top and a white rim behind. */
  private reelCard(width: number, asPost = false): FloatingCard {
    const height = width * (16 / 9);
    const group = new THREE.Group();
    const geo = new THREE.PlaneGeometry(width, height);
    const rimGeo = new THREE.PlaneGeometry(width * 1.06, height * 1.035);
    const rimMat = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, depthWrite: false, toneMapped: false });
    const footageMesh = new THREE.Mesh(geo, this.reelMat);
    footageMesh.position.z = 0.0006;
    let overlayMat: THREE.MeshBasicMaterial;
    let screen: CanvasScreen | undefined;
    if (asPost) {
      screen = new CanvasScreen(270, 480);
      overlayMat = new THREE.MeshBasicMaterial({ map: screen.texture, transparent: true, depthWrite: false, toneMapped: false });
      this.disposables.push(screen);
    } else {
      overlayMat = new THREE.MeshBasicMaterial({ map: this.reelCaptions, transparent: true, depthWrite: false, toneMapped: false });
    }
    const overlay = new THREE.Mesh(geo, overlayMat);
    overlay.position.z = 0.0012;
    group.add(new THREE.Mesh(rimGeo, rimMat), footageMesh, overlay);
    group.visible = false;
    this.disposables.push(geo, rimGeo, rimMat, overlayMat);
    return { group, mats: [rimMat, overlayMat], screen, draw: asPost ? drawReelOverlay : undefined };
  }

  // ---------- per frame ----------

  /** Story window during which the reel's footage must be rendered. */
  static footageNeeded(g: number) {
    return (g > 39.9 && g < 42.0) || (g > 45.1 && g < 48.4);
  }

  apply(g: number, time: number) {
    this.updateCampaignPosition(g);
    this.act.apply(g, time);
  }

  private updateCampaignPosition(g: number) {
    const p = range(g, 49.55, 50.85);
    this.campaignCurve.getPointAt(easeInOut(p), this.campaignAt);
  }

  /** Carries the approved design card from scene 3 into the content preview, then into her phone. */
  driveDesignCard(card: DesignCard, g: number, time: number, camera: THREE.Camera) {
    const travel = easeInOut(range(g, 40, 41.0));
    const dive = easeInOut(range(g, 41.45, 41.9));
    card.group.visible = dive < 1;
    if (!card.group.visible) return;
    this.cardCurve.getPointAt(travel, card.group.position);
    card.group.position.y += Math.sin(time * 1.6) * 0.006 * travel * (1 - dive);
    const phone = this.station.phone.getWorldPosition(this.tmp);
    card.group.position.lerp(phone, dive);
    card.group.quaternion.copy(camera.quaternion);
    card.group.scale.setScalar(lerp(0.9425, 1.2, travel) * lerp(1, 0.1, dive));
    (card.glow.material as THREE.MeshBasicMaterial).opacity = 0.45 * (1 - range(g, 40, 40.5)) * (0.85 + 0.15 * Math.sin(time * 2.5));
    const badge = 1 - range(g, 40.35, 40.6);
    card.badge.visible = badge > 0;
    card.badge.scale.setScalar(Math.max(0.001, badge));
    this.arrivingAt.copy(card.group.position);
  }

  update(g: number, time: number, camera: THREE.PerspectiveCamera) {
    const gs = Math.min(Math.max(g, 39.9), 50.6);
    this.phoneScreen.draw(phoneKey(gs), (x, w, h) => drawPhone(x, w, h, gs, this.poster));
    const phone = this.station.phone.getWorldPosition(new THREE.Vector3());
    const q = camera.quaternion;

    // 4.1 — the reel travels beside the poster card into the preview, then into her phone
    {
      const appear = easeOut(range(g, 40.0, 40.3));
      const travel = easeInOut(range(g, 40.05, 41.05));
      const dive = easeInOut(range(g, 41.5, 41.95));
      this.reel.visible = appear > 0 && dive < 1;
      if (this.reel.visible) {
        this.cardCurve.getPointAt(travel, this.reel.position);
        const toEnd = SPOT.previewReel.clone().sub(SPOT.previewPoster);
        this.reel.position.addScaledVector(toEnd, easeInOut(range(g, 40.4, 41.05))).add(new THREE.Vector3(0, -0.04 * (1 - travel), 0));
        this.reel.position.y += Math.sin(time * 1.5 + 1) * 0.006;
        this.reel.position.lerp(phone, dive);
        this.reel.quaternion.copy(q);
        this.reel.scale.setScalar(Math.max(0.001, appear * lerp(1, 0.15, dive)));
      }
      const label = easeOut(range(g, 40.95, 41.15)) * (1 - range(g, 41.42, 41.55));
      this.label.mesh.visible = label > 0;
      if (label > 0) {
        this.label.mesh.position.copy(SPOT.previewLabel);
        this.label.mesh.quaternion.copy(q);
        this.label.mesh.scale.setScalar(0.85 + 0.15 * label);
        for (const m of this.label.mats) m.opacity = label;
      }
    }

    // 4.2 — success badge after Publish
    {
      const s = easeOut(range(g, 44.62, 44.8)) * (1 - range(g, 45.2, 45.4));
      this.success.mesh.visible = s > 0;
      if (s > 0) {
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
        this.success.mesh.position.copy(phone).addScaledVector(right, 0.13).add(new THREE.Vector3(0, 0.1 + 0.02 * s, 0));
        this.success.mesh.quaternion.copy(q);
        this.success.mesh.scale.setScalar(0.6 + 0.4 * s);
        for (const m of this.success.mats) m.opacity = s;
      }
    }

    // 4.3 — the post expands out of the phone into three platform layouts
    const counts = postCountsKey(g);
    this.posts.forEach((p, i) => {
      const out = easeOut(range(g, 45.2 + i * 0.22, 45.7 + i * 0.22));
      const leave = easeInOut(range(g, 47.95 + i * 0.05, 48.35 + i * 0.05));
      p.group.visible = out > 0 && leave < 1;
      if (!p.group.visible) return;
      if (p.screen && p.draw) p.screen.draw(counts, (x, w, h) => p.draw!(x, w, h, g));
      p.group.position.lerpVectors(phone, SPOT.posts[i], out).lerp(SPOT.dashboard, leave);
      p.group.position.y += Math.sin(time * 1.3 + i * 2) * 0.008 * out;
      p.group.quaternion.copy(q);
      p.group.scale.setScalar(Math.max(0.001, lerp(0.15, 1, out) * lerp(1, 0.3, leave)));
      for (const m of p.mats) m.opacity = Math.min(1, out * 1.5) * (1 - leave);
    });
    const bubbles = range(g, 45.7, 46.0) * (1 - range(g, 47.8, 48.05));
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    const side = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    for (const r of this.reactions) {
      const post = this.posts[r.post];
      r.mesh.visible = bubbles > 0 && post.group.visible;
      if (!r.mesh.visible) continue;
      const t = (time * 0.55 + r.phase + r.post * 0.21) % 1;
      const pop = Math.min(1, t / 0.12) * (1 - range(t, 0.6, 1));
      r.mesh.position.copy(post.group.position).addScaledVector(side, r.offset * 0.22).addScaledVector(up, 0.08 + t * 0.2);
      r.mesh.quaternion.copy(q);
      r.mesh.scale.setScalar(Math.max(0.001, pop * bubbles));
      (r.mesh.material as THREE.MeshBasicMaterial).opacity = clamp01(pop * 1.4) * bubbles;
    }

    // 4.4 — illustrative performance dashboard
    {
      const d = this.dashboard;
      const show = easeOut(range(g, 48.15, 48.6)) * (1 - range(g, 50.5, 50.9));
      d.group.visible = show > 0;
      if (show > 0) {
        d.screen.draw(dashboardKey(g), (x, w, h) => drawPerformanceDashboard(x, w, h, g));
        d.group.position.copy(SPOT.dashboard);
        d.group.position.y += Math.sin(time * 1.1) * 0.006;
        d.group.quaternion.copy(q);
        d.group.scale.setScalar(0.6 + 0.4 * show);
        d.mat.opacity = show;
      }
    }

    // Transition — the campaign card leaves the dashboard and is absorbed by the ads monitor
    {
      const c = this.campaign;
      const appear = easeOut(range(g, 49.3, 49.55));
      const land = easeInOut(range(g, 50.62, 50.88));
      c.group.visible = appear > 0 && land < 1;
      if (c.group.visible) {
        c.group.position.copy(this.campaignAt);
        c.group.position.y += Math.sin(time * 1.4) * 0.006 * (1 - land);
        const screenQ = this.adsScreen.getWorldQuaternion(new THREE.Quaternion());
        c.group.quaternion.copy(q).slerp(screenQ, easeInOut(range(g, 50.4, 50.75)));
        c.group.scale.setScalar(Math.max(0.001, appear * lerp(1, 0.4, land)));
        c.mat.opacity = appear * (1 - land);
      }
    }
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
  }
}
