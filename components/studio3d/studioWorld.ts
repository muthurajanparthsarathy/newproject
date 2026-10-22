import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CameraPath } from "./cameraPath";
import { CharacterPortrait } from "./characterPortrait";
import { CinematographerAct, DesignerAct, EditorAct, PRESENTER_SEAT, PresenterAct, TABLE_SPOT } from "./choreography";
import { ARTBOARD, designMainKey, drawDesignMain } from "./designUi";
import { SeoScene } from "./seoScene";
import { MarketingScene } from "./marketingScene";
import { PosterArt, PosterView, ProductShot, buildBadge, buildFloatingCards, composeFinalPoster } from "./poster";
import {
  PREVIEW, REC_START, REC_STOP, cameraMonitorKey, captionsKey, drawCameraMonitor, drawCaptions,
  drawEditorMain, drawEditorSide, drawLaptop, editorMainKey, editorSideKey, laptopKey,
} from "./editorUi";
import { DESIGN_THETA, SEO_THETA, SOCIAL_THETA, ZONES, buildEnvironment, ringOut, ringPoint } from "./environment";
import { Humanoid } from "./humanoid";
import { easeInOut, easeOut, lerp, range } from "./math";
import {
  Kit, buildBottle, buildDesignDesk, buildDesk, buildFilmRig, buildHeadphones, buildOfficeChair, buildSideTable, buildSocialStation,
  buildSoftbox, buildStool, buildStylus, type DesignDesk, type DeskSet, type FilmRig,
} from "./props";
import { CanvasScreen, FootageFeed, SCREEN_LAYER, gradingMaterial, onScreenLayer, uiMaterial } from "./screens";
import { SocialScene } from "./socialScene";
import { TransferFx } from "./transfer";

export type Quality = { lowPower: boolean };

const ROYAL_BLUE = "#1f47d6";
const TROUSERS = "#2a313c";
const JEANS = "#3d5a8a";

/**
 * Builds the connected studio and advances everything from one story position.
 * Visible people are animated image rigs. Hidden rigs retain the existing prop
 * anchors, so equipment and screen choreography continue unchanged.
 */
export class StudioWorld {
  private readonly kit = new Kit();
  private readonly added: THREE.Object3D[] = [];
  private readonly path = new CameraPath();
  private readonly feed: FootageFeed;
  private readonly cine: CinematographerAct;
  private readonly presenter: PresenterAct;
  private readonly editor: EditorAct;
  private readonly rig: FilmRig;
  private readonly desk: DeskSet;
  private readonly transfer: TransferFx;
  private readonly characters: Humanoid[];
  private readonly portraits: CharacterPortrait[] = [];
  private readonly envMap: THREE.Texture;
  private readonly screens: {
    monitorOverlay: CanvasScreen;
    main: CanvasScreen;
    side: CanvasScreen;
    laptop: CanvasScreen;
    captionsWide: CanvasScreen;
    captionsTall: CanvasScreen;
  };
  private readonly preview: THREE.Mesh;
  private readonly previewMat: THREE.ShaderMaterial;
  private readonly phoneMat: THREE.ShaderMaterial;
  private readonly captionsWide: THREE.Mesh;
  private readonly captionsTall: THREE.Mesh;
  // Scene 3 — design
  private readonly designDesk: DesignDesk;
  private readonly designer: DesignerAct;
  // Scenes 4–5 (and the scene 6 developer, already at work)
  private readonly social: SocialScene;
  private readonly marketing: MarketingScene;
  private readonly seo: SeoScene;
  private readonly designScreen: CanvasScreen;
  private readonly productShot: ProductShot;
  private readonly posterArts: PosterArt[];
  private readonly posterViews: PosterView[] = [];
  private readonly monitorPoster: PosterView;
  private readonly card: { group: THREE.Group; view: PosterView; glow: THREE.Mesh; badge: THREE.Mesh };
  private readonly alts: { group: THREE.Group; view: PosterView; side: number; backing: THREE.Mesh }[] = [];
  private readonly floaters: { mesh: THREE.Mesh; offset: THREE.Vector3; phase: number }[] = [];
  private readonly designFrame: { monitor: THREE.Vector3; out: THREE.Vector3; right: THREE.Vector3; cardEnd: THREE.Vector3; cardExit: THREE.Vector3 };
  private readonly extraDisposables: { dispose(): void }[] = [];
  private readonly camPos = new THREE.Vector3();
  private readonly camLook = new THREE.Vector3();
  private frame = 0;

  constructor(gl: THREE.WebGLRenderer, readonly scene: THREE.Scene, private readonly quality: Quality) {
    const { kit } = this;
    const put = (...objects: THREE.Object3D[]) => {
      this.added.push(...objects);
      scene.add(...objects);
    };
    scene.background = new THREE.Color("#edf2f8");
    scene.fog = new THREE.Fog("#edf2f8", 18, 42);
    const pmrem = new THREE.PMREMGenerator(gl);
    this.envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    scene.environment = this.envMap;
    scene.environmentIntensity = 0.32;

    const env = buildEnvironment(kit, quality.lowPower);
    put(env.group, ...env.lights);

    // Shoot zone
    this.rig = buildFilmRig(kit);
    this.rig.group.position.set(0.05, 0, 0.35);
    put(this.rig.group);
    const presenterHead = new THREE.Vector3(ZONES.presenter.x, 1.3, ZONES.presenter.z);
    const key = buildSoftbox(kit, new THREE.Vector3(-1.45, 0, -0.75), presenterHead);
    const fill = buildSoftbox(kit, new THREE.Vector3(1.75, 0, -0.55), presenterHead, "#fff8ef");
    fill.light.intensity = 14;
    put(key.group, key.light, key.light.target, fill.group, fill.light, fill.light.target);
    const stool = buildStool(kit);
    stool.position.set(PRESENTER_SEAT.x, PRESENTER_SEAT.y, PRESENTER_SEAT.z);
    const table = buildSideTable(kit);
    table.position.copy(TABLE_SPOT);
    table.scale.set(0.78, 1, 0.78);
    const bottle = buildBottle(kit);
    bottle.visible = false; // Visible bottle is part of the presenter's gripping hand.
    put(stool, table, bottle);

    // Edit zone
    this.desk = buildDesk(kit);
    this.desk.group.position.set(7.1, 0.08, -1.75);
    const chair = buildOfficeChair(kit);
    chair.position.set(7.0, 0.08, -1.0);
    const headphones = buildHeadphones(kit);
    headphones.visible = false; // Headset is fitted into the visible editor artwork.
    put(this.desk.group, chair, headphones);

    // Hidden choreography anchors; the visible characters are static image cutouts.
    const cinematographer = new Humanoid({
      scale: 1, build: "male", skin: "#a8704a", hair: "curly", hairColor: "#16110d", beard: "full", watch: true,
      shirt: ROYAL_BLUE, emblem: true, pants: TROUSERS, shoes: "#f4f5f7", seed: 7,
    });
    const presenter = new Humanoid({
      scale: 0.93, build: "female", skin: "#e2b38f", hair: "long", hairColor: "#4a2c1c", shirt: "#f7f4ee",
      pants: "#4b6c9c", shoes: "#f4f5f7", lips: "#b5524e", iris: "#4a2a18", seed: 19,
    });
    const editor = new Humanoid({
      scale: 0.99, build: "male", skin: "#b27a52", hair: "quiff", hairColor: "#15110e", beard: "chin", glasses: true,
      shirt: ROYAL_BLUE, emblem: true, pants: TROUSERS, shoes: "#f4f5f7", seed: 31,
    });
    const designerLook = new Humanoid({
      scale: 0.98, build: "male", skin: "#bd8660", hair: "short", hairColor: "#0b0806", beard: "stubble", glasses: true,
      glassesStyle: "round", shirt: ROYAL_BLUE, emblem: true, pants: TROUSERS, shoes: "#f4f5f7", seed: 53,
    });
    // Scene 4: long dark wavy hair, blue tee and jeans (storyboard / reference identity)
    const socialManager = new Humanoid({
      scale: 0.94, build: "female", skin: "#c99272", hair: "curlyLong", hairColor: "#1d130d", shirt: ROYAL_BLUE, emblem: true,
      pants: JEANS, shoes: "#f4f5f7", lips: "#a94b48", iris: "#3b2417", seed: 61,
    });
    // Scene 5: dark hair in a high ponytail, blue tee
    const marketer = new Humanoid({
      scale: 0.93, build: "female", skin: "#b07650", hair: "ponytail", hairColor: "#120c08", shirt: ROYAL_BLUE, emblem: true,
      pants: TROUSERS, shoes: "#f4f5f7", lips: "#9c4a45", iris: "#2e1c12", seed: 73,
    });
    // Scene 6 (prepared): web & app developer, already typing at his desk
    const developer = new Humanoid({
      scale: 1, build: "male", skin: "#8d5a3b", hair: "short", hairColor: "#0e0a08", shirt: ROYAL_BLUE, emblem: true,
      pants: TROUSERS, shoes: "#f4f5f7", seed: 89,
    });
    this.characters = [cinematographer, presenter, editor, designerLook, socialManager, marketer, developer];
    put(cinematographer.root, presenter.root, editor.root, designerLook.root, socialManager.root, marketer.root, developer.root);
    this.cine = new CinematographerAct(cinematographer, this.rig);
    this.presenter = new PresenterAct(presenter, bottle, () => this.rig.anchors.lensFront.getWorldPosition(new THREE.Vector3()), () =>
      cinematographer.joints.head.localToWorld(new THREE.Vector3(0, 0.12, 0)),
    );
    this.editor = new EditorAct(editor, this.desk, headphones);

    // Footage: rendered live from the cinema camera's lens
    this.feed = quality.lowPower ? new FootageFeed(448, 280, false) : new FootageFeed(768, 480, true);
    this.rig.monitorScreen.material = new THREE.MeshBasicMaterial({ map: this.feed.texture });
    this.screens = {
      monitorOverlay: new CanvasScreen(512, 320),
      main: new CanvasScreen(1280, 720),
      side: new CanvasScreen(1024, 576),
      laptop: new CanvasScreen(640, 400),
      captionsWide: new CanvasScreen(640, 360),
      captionsTall: new CanvasScreen(270, 480),
    };
    this.rig.monitorOverlay.material = uiMaterial(this.screens.monitorOverlay.texture, true);
    this.desk.main.screen.material = uiMaterial(this.screens.main.texture);
    this.desk.side.screen.material = uiMaterial(this.screens.side.texture);
    this.desk.laptopScreen.material = uiMaterial(this.screens.laptop.texture);

    // Footage preview, captions and the vertical reel live inside the main monitor's preview frame
    const sw = 0.74;
    const sh = 0.416;
    const px = (PREVIEW.x + PREVIEW.w / 2) / 1280 - 0.5;
    const py = 0.5 - (PREVIEW.y + PREVIEW.h / 2) / 720;
    const pw = (PREVIEW.w / 1280) * sw;
    const ph = (PREVIEW.h / 720) * sh;
    this.previewMat = gradingMaterial(this.feed.texture);
    this.preview = kit.mesh(new THREE.PlaneGeometry(1, 1), this.previewMat, this.desk.main.body, px * sw, py * sh, 0.0012, false);
    this.preview.scale.set(pw, ph, 1);
    this.captionsWide = kit.mesh(new THREE.PlaneGeometry(pw, ph), uiMaterial(this.screens.captionsWide.texture, true), this.desk.main.body, px * sw, py * sh, 0.0018, false);
    this.captionsTall = kit.mesh(new THREE.PlaneGeometry(ph * (9 / 16), ph), uiMaterial(this.screens.captionsTall.texture, true), this.desk.main.body, px * sw, py * sh, 0.0018, false);
    // A phone on the desk plays the finished vertical reel (same footage, grade and captions)
    const phone = new THREE.Group();
    phone.position.set(-0.45, 0.7625, 0.1);
    phone.rotation.set(-0.3, 0.3, 0);
    this.desk.group.add(phone);
    kit.box(0.06, 0.02, 0.05, 0.004, kit.m.darkMetal, phone, 0, 0.01, -0.02);
    kit.box(0.08, 0.16, 0.009, 0.007, kit.m.black, phone, 0, 0.095, 0);
    this.phoneMat = gradingMaterial(this.feed.texture);
    this.phoneMat.uniforms.grade.value = 1;
    this.phoneMat.uniforms.crop.value.set(0.5 - (9 / 16) / 1.6 / 2, 0, (9 / 16) / 1.6, 1);
    const phoneScreen = kit.mesh(new THREE.PlaneGeometry(0.07, 0.1244), this.phoneMat, phone, 0, 0.095, 0.0052, false);
    const phoneCaptions = kit.mesh(new THREE.PlaneGeometry(0.07, 0.1244), uiMaterial(this.screens.captionsTall.texture, true), phone, 0, 0.095, 0.0057, false);

    // ---- Scene 3: design workstation, further round the ring to the right of the edit desk ----
    const designOut = ringOut(DESIGN_THETA);
    const designRight = new THREE.Vector3(-designOut.z, 0, designOut.x); // the designer's right-hand side
    this.designDesk = buildDesignDesk(kit);
    this.designDesk.group.position.copy(ringPoint(DESIGN_THETA, 8.75)).setY(0.08);
    this.designDesk.group.rotation.y = DESIGN_THETA - Math.PI;
    const designChair = buildOfficeChair(kit);
    designChair.position.copy(ringPoint(DESIGN_THETA, 8.08)).setY(0.08);
    designChair.rotation.y = DESIGN_THETA - Math.PI;
    const stylus = buildStylus(kit);
    put(this.designDesk.group, designChair, stylus);
    this.designDesk.group.updateMatrixWorld(true);
    this.designScreen = new CanvasScreen(1280, 720);
    this.designDesk.monitor.screen.material = uiMaterial(this.designScreen.texture);
    this.designDesk.tabletScreen.material = kit.track(new THREE.MeshBasicMaterial({ color: "#151922", toneMapped: false }));

    // The poster's product is the very same 3D bottle, rendered once as a cut-out
    this.productShot = new ProductShot(kit, this.envMap);
    this.productShot.render(gl);
    this.posterArts = [new PosterArt("main"), new PosterArt("altA"), new PosterArt("altB")];
    const [mainArt, altArtA, altArtB] = this.posterArts;
    const view = (art: PosterArt, width: number) => {
      const v = new PosterView(art, this.productShot.texture, width);
      this.posterViews.push(v);
      return v;
    };
    // On the design monitor, exactly over the artboard the design app draws
    const artW = (ARTBOARD.w / 1280) * 0.74;
    this.monitorPoster = view(mainArt, artW);
    this.monitorPoster.group.position.set(((ARTBOARD.x + ARTBOARD.w / 2) / 1280 - 0.5) * 0.74, (0.5 - (ARTBOARD.y + ARTBOARD.h / 2) / 720) * 0.416, 0.0012);
    this.designDesk.monitor.body.add(this.monitorPoster.group);
    // Mirrored on the pen display, under the stylus
    const tabletPoster = view(mainArt, 0.152);
    tabletPoster.group.position.set(-0.02, 0, 0.0015);
    this.designDesk.tablet.add(tabletPoster.group);

    // The finished poster that rises from the monitor, with a glow and an approval badge
    const cardGroup = new THREE.Group();
    const cardView = view(mainArt, artW);
    kit.mesh(new THREE.PlaneGeometry(artW + 0.012, artW * 1.25 + 0.012), kit.track(new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false })), cardGroup, 0, 0, -0.0008, false);
    // Soft halo: a feathered rounded-rectangle texture rather than a hard-edged plane
    const halo = document.createElement("canvas");
    halo.width = 256;
    halo.height = 300;
    const hx = halo.getContext("2d")!;
    // alphaMap reads the green channel, so the falloff is drawn as white on black, not as canvas alpha
    hx.fillStyle = "#000000";
    hx.fillRect(0, 0, halo.width, halo.height);
    hx.filter = "blur(18px)";
    hx.fillStyle = "#ffffff";
    hx.beginPath();
    hx.roundRect(48, 48, 160, 204, 18);
    hx.fill();
    const haloTex = kit.track(new THREE.CanvasTexture(halo));
    const glow = kit.mesh(
      new THREE.PlaneGeometry(artW * 1.6, artW * 1.25 * 1.47),
      kit.track(new THREE.MeshBasicMaterial({ color: "#3b82f6", alphaMap: haloTex, transparent: true, opacity: 0, toneMapped: false, depthWrite: false })),
      cardGroup, 0, 0, -0.0016, false,
    );
    const badge = buildBadge();
    badge.position.set(artW * 0.3, artW * 0.66, 0.003);
    cardGroup.add(cardView.group, badge);
    cardGroup.visible = false;
    this.card = { group: cardGroup, view: cardView, glow, badge };
    this.extraDisposables.push(badge.geometry, badge.material as THREE.Material, (badge.material as THREE.MeshBasicMaterial).map!);
    put(cardGroup);

    // Two alternative layouts beside the monitor
    for (const [art, side] of [[altArtA, -1], [altArtB, 1]] as const) {
      const group = new THREE.Group();
      const v = view(art, 0.2);
      const backing = kit.mesh(new THREE.PlaneGeometry(0.212, 0.262), kit.track(new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false, transparent: true })), group, 0, 0, -0.0008, false);
      group.add(v.group);
      group.visible = false;
      this.alts.push({ group, view: v, side, backing });
      put(group);
    }
    // Floating design-tool cards (offsets: right, up, towards the viewer)
    const floatOffsets = [new THREE.Vector3(-0.36, 0.38, 0.05), new THREE.Vector3(0.42, 0.36, 0.08), new THREE.Vector3(0.84, 0.12, 0.28)];
    buildFloatingCards().forEach((mesh, i) => {
      mesh.visible = false;
      this.floaters.push({ mesh, offset: floatOffsets[i], phase: i * 1.7 });
      this.extraDisposables.push(mesh.geometry, mesh.material as THREE.Material, (mesh.material as THREE.MeshBasicMaterial).map!);
      put(mesh);
    });

    const monitorCenter = this.designDesk.anchors.monitorCenter.getWorldPosition(new THREE.Vector3());
    const cardEnd = monitorCenter.clone().add(new THREE.Vector3(0, 0.33, 0)).addScaledVector(designOut, -0.28);
    // Once approved, the card glides along the wall towards the social corner (scene 4 carries it into the feed)
    this.designFrame = {
      monitor: monitorCenter,
      out: designOut,
      right: designRight,
      cardEnd,
      cardExit: cardEnd.clone().addScaledVector(designRight, 0.36).addScaledVector(designOut, 0.12).add(new THREE.Vector3(0, -0.06, 0)),
    };
    this.designer = new DesignerAct(
      designerLook, this.designDesk, stylus,
      { altLeft: () => this.alts[0].group.position, altRight: () => this.alts[1].group.position, card: () => this.designFrame.cardEnd },
      ringPoint(DESIGN_THETA, 8.03), DESIGN_THETA,
    );

    // ---- Scenes 4–5: social media corner and marketing desk (plus the web desk for scene 6) ----
    // Every flat copy of the campaign (phone, posts, ads, website) uses the approved poster, bottle included
    const finalPoster = composeFinalPoster(gl, this.productShot, gl.toneMappingExposure);
    this.marketing = new MarketingScene(kit, marketer, developer, finalPoster, () => this.social.campaignAt);
    put(this.marketing.group);
    const station = buildSocialStation(kit);
    station.group.position.copy(ZONES.social).setY(0.08);
    station.group.rotation.y = SOCIAL_THETA - Math.PI;
    put(station.group, station.phone);
    this.social = new SocialScene(station, socialManager, finalPoster, this.feed.texture, this.designFrame.cardExit, this.marketing.adsScreen);
    put(this.social.group);

    this.seo = new SeoScene(kit);
    put(this.seo.group);
    const seoPortrait = new CharacterPortrait("seo", "/hero/characters/muthurajan-working.png", ringPoint(SEO_THETA, 8.03).setY(0.08), 1.42, SEO_THETA);
    seoPortrait.attachWorkstation(this.seo.desk.mouse, this.seo.desk.anchors.keyLeft);
    this.portraits.push(seoPortrait);
    put(seoPortrait.sprite);

    // Every visible person uses the same detailed artwork. Hidden rigs only drive
    // equipment; visible hands have their own phone/keyboard/mouse attachments.
    const people = [
      [cinematographer, "cinematographer", "surya-standing", 1.82],
      [presenter, "presenter", "surya-bottle", 1.42],
      [editor, "editor", "surya-headset", 1.42],
      [designerLook, "designer", "muthurajan-drawing", 1.42],
      [socialManager, "social", "surya-phone", 1.42],
      [marketer, "marketing", "muthurajan-working", 1.42],
      [developer, "developer", "muthurajan-working", 1.42],
    ] as const;
    for (const [rig, role, image, height] of people) {
      rig.root.visible = false;
      const portrait = new CharacterPortrait(role, `/hero/characters/${image}.png`, rig.root.position.clone(), height, rig.root.rotation.y);
      if (role === "designer") portrait.attachDrawing(this.designDesk.tablet, this.designDesk.anchors.keyLeft, stylus);
      if (role === "social") portrait.attachPhone((station.phoneScreen.material as THREE.MeshBasicMaterial).map!, station.phone);
      if (role === "marketing") portrait.attachWorkstation(this.marketing.desk.mouse, this.marketing.desk.anchors.keyLeft);
      if (role === "developer") portrait.attachWorkstation(this.marketing.developer.desk.mouse, this.marketing.developer.desk.anchors.keyLeft);
      this.portraits.push(portrait);
      put(portrait.sprite);
    }

    for (const m of [
      this.rig.monitorScreen, this.rig.monitorOverlay, this.desk.main.screen, this.desk.side.screen, this.desk.laptopScreen,
      this.preview, this.captionsWide, this.captionsTall, phoneScreen, phoneCaptions,
    ]) {
      onScreenLayer(m);
    }

    scene.updateMatrixWorld(true);
    // Only sizeable props cast shadows: tiny parts (keys, rings, buttons) cost a draw call each
    // in the shadow pass for no visible benefit. Characters keep their own shadow settings.
    const characterRoots = new Set<THREE.Object3D>(this.characters.map((c) => c.root));
    const bounds = new THREE.Sphere();
    const scale = new THREE.Vector3();
    for (const root of this.added) {
      if (characterRoots.has(root)) continue;
      root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh || !mesh.castShadow) return;
        if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
        bounds.copy(mesh.geometry.boundingSphere!);
        mesh.castShadow = bounds.radius * mesh.getWorldScale(scale).x > 0.12;
      });
    }

    this.transfer = new TransferFx(
      this.rig.anchors.monitorCenter.getWorldPosition(new THREE.Vector3()),
      this.desk.anchors.mainScreen.getWorldPosition(new THREE.Vector3()),
      this.feed.texture,
    );
    put(this.transfer.group);
  }

  /** Presenter "time" the footage shows: live while recording, then the recorded take. */
  private footageMoment(g: number, time: number) {
    if (g < REC_STOP) return g;
    if (g < 16.6) return REC_STOP - 0.05;
    if (g < 18.2) return lerp(REC_START + 0.15, REC_STOP - 0.1, range(g, 16.6, 17.9));
    return REC_START + 0.2 + ((time * 0.45) % (REC_STOP - REC_START - 0.4));
  }

  get ready() {
    return this.portraits.every((portrait) => portrait.ready);
  }

  update(g: number, time: number, gl: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, size: { width: number; height: number }) {
    this.frame++;
    const { rig, scene } = this;

    // 1. Props and characters
    this.cine.driveRig(g);
    scene.updateMatrixWorld();
    this.presenter.apply(g, time);
    this.cine.apply(g, time, this.presenter.headPosition());
    this.editor.apply(g, time);
    this.designer.apply(g, time);
    this.social.apply(g, time);
    this.marketing.apply(g, time);
    for (const portrait of this.portraits) portrait.update(g, time);

    // 2. Footage: render the take the screens should show (only while those screens are in shot,
    // including the finished reel in scene 4)
    const feedVisible = (g > 8.6 && g < 30.6) || SocialScene.footageNeeded(g);
    if (feedVisible && (!this.quality.lowPower || this.frame % 2 === 0)) {
      const moment = this.footageMoment(g, time);
      const replay = Math.abs(moment - g) > 1e-3;
      if (replay) this.presenter.apply(moment, time);
      const lensFront = rig.anchors.lensFront.getWorldPosition(new THREE.Vector3());
      const lensBack = rig.anchors.lensBack.getWorldPosition(new THREE.Vector3());
      this.feed.camera.position.copy(lensFront);
      this.feed.camera.lookAt(lensFront.clone().add(lensFront.clone().sub(lensBack)));
      this.feed.camera.updateMatrixWorld();
      scene.updateMatrixWorld();
      this.feed.render(gl, scene);
      if (replay) this.presenter.apply(g, time);
    }

    // 3. Screens
    const s = this.screens;
    s.monitorOverlay.draw(cameraMonitorKey(g, time), (x, w, h) => drawCameraMonitor(x, w, h, g, time));
    s.main.draw(editorMainKey(g), (x, w, h) => drawEditorMain(x, w, h, g));
    s.side.draw(editorSideKey(g), (x, w, h) => drawEditorSide(x, w, h, g));
    s.laptop.draw(laptopKey(g), (x, w, h) => drawLaptop(x, w, h, g));
    const portrait = easeInOut(range(g, 27.0, 27.6));
    s.captionsWide.draw(captionsKey(g), (x, w, h) => drawCaptions(x, w, h, g, false));
    s.captionsTall.draw(captionsKey(g), (x, w, h) => drawCaptions(x, w, h, g, true));
    this.updatePreview(g, portrait);

    this.transfer.update(g, time, camera);

    // 4. Camera (placed before the design cards so they can face it)
    this.placeCamera(g, camera, size);
    camera.updateMatrixWorld();
    for (const portrait of this.portraits) portrait.syncPhoneAnchor(camera);
    this.updateDesign(g, time, camera);
    this.social.update(g, time, camera);
    this.marketing.update(g, time, camera);
    this.seo.update(g);
    for (const portrait of this.portraits) portrait.syncWorkstation(camera);
  }

  /** Scene 3: design app, poster build-up, alternative layouts, floating tools and the rising final card. */
  private updateDesign(g: number, time: number, camera: THREE.PerspectiveCamera) {
    // Before the scene the workstation simply holds its opening state (no redraws while scrolling scenes 1–2)
    const gd = Math.max(g, 28.9);
    this.designScreen.draw(designMainKey(gd), (x, w, h) => drawDesignMain(x, w, h, gd));
    for (const art of this.posterArts) art.update(gd);
    for (const v of this.posterViews) v.update(gd);
    const { monitor, out, right, cardEnd, cardExit } = this.designFrame;
    const up = new THREE.Vector3(0, 1, 0);

    // The finished poster rises out of the monitor as a card, glows, is approved, then heads for social
    const rise = easeInOut(range(g, 37.2, 38.3));
    const leave = easeInOut(range(g, 39.45, 40));
    const card = this.card;
    card.group.visible = rise > 0;
    if (g > 40) {
      // Scene 4 carries the approved poster on into the social media manager's content preview
      this.social.driveDesignCard(card, g, time, camera);
    } else if (card.group.visible) {
      const from = this.monitorPoster.group;
      const p0 = from.getWorldPosition(new THREE.Vector3());
      const q0 = from.getWorldQuaternion(new THREE.Quaternion());
      card.group.position.lerpVectors(p0, cardEnd, rise).lerp(cardExit, leave);
      card.group.quaternion.copy(q0).slerp(q0.clone().slerp(camera.quaternion, 0.55), rise).slerp(camera.quaternion, leave);
      card.group.scale.setScalar(lerp(1, 1.45, rise) * (1 - 0.35 * leave));
      (card.glow.material as THREE.MeshBasicMaterial).opacity = 0.75 * range(g, 37.9, 38.6) * (1 - 0.4 * leave) * (0.85 + 0.15 * Math.sin(time * 2.5));
      const approved = easeOut(range(g, 38.95, 39.15));
      card.badge.visible = approved > 0;
      card.badge.scale.setScalar(Math.max(0.001, approved));
    }

    // Alternative layouts appear, the main one is chosen, then they recede
    const appear = easeOut(range(g, 35.0, 35.8));
    const dim = range(g, 36.55, 36.75);
    const back = easeInOut(range(g, 37.2, 38.2));
    for (const alt of this.alts) {
      alt.group.visible = appear > 0 && leave < 1;
      if (!alt.group.visible) continue;
      alt.group.position.copy(monitor)
        .addScaledVector(right, 0.62 * alt.side)
        .addScaledVector(out, -0.18 + 0.3 * back)
        .addScaledVector(up, 0.06 + Math.sin(time * 1.2 + alt.side) * 0.008);
      alt.group.quaternion.copy(camera.quaternion);
      alt.group.scale.setScalar((0.6 + 0.4 * appear) * (1 - 0.15 * back));
      const o = appear * (1 - 0.4 * dim) * (1 - 0.45 * back) * (1 - leave);
      alt.view.opacity = o;
      (alt.backing.material as THREE.MeshBasicMaterial).opacity = o;
    }

    // Floating tool cards during the layout work
    const float = easeOut(range(g, 34.2, 35.0)) * (1 - 0.75 * back) * (1 - leave);
    for (const f of this.floaters) {
      f.mesh.visible = float > 0.01;
      if (!f.mesh.visible) continue;
      f.mesh.position.copy(monitor)
        .addScaledVector(right, f.offset.x)
        .addScaledVector(up, f.offset.y + Math.sin(time * 1.4 + f.phase) * 0.012)
        .addScaledVector(out, -f.offset.z);
      f.mesh.quaternion.copy(camera.quaternion);
      f.mesh.scale.setScalar(0.6 + 0.4 * float);
      (f.mesh.material as THREE.MeshBasicMaterial).opacity = float;
    }
  }

  private updatePreview(g: number, portrait: number) {
    const u = this.previewMat.uniforms;
    u.presence.value = range(g, 21.25, 21.6);
    // Grade: comparison wipe across the frame, then the finished look
    const grading = range(g, 24.2, 25.6);
    u.grade.value = range(g, 25.5, 25.8);
    u.wipe.value = g > 24.2 && g < 25.6 ? easeInOut(grading) : -1;
    // 16:10 footage → 16:9 frame, then a centred 9:16 vertical reel
    const wide = { x: 0, y: 0.053, w: 1, h: 0.894 };
    const tallW = (9 / 16) / 1.6;
    const tall = { x: 0.5 - tallW / 2, y: 0, w: tallW, h: 1 };
    u.crop.value.set(lerp(wide.x, tall.x, portrait), lerp(wide.y, tall.y, portrait), lerp(wide.w, tall.w, portrait), lerp(wide.h, tall.h, portrait));
    const pw = (PREVIEW.w / 1280) * 0.74;
    const ph = (PREVIEW.h / 720) * 0.416;
    this.preview.scale.set(lerp(pw, ph * (9 / 16), portrait), ph, 1);
    (this.captionsWide.material as THREE.MeshBasicMaterial).opacity = 1 - portrait;
    (this.captionsTall.material as THREE.MeshBasicMaterial).opacity = portrait;
    this.captionsWide.visible = portrait < 1;
    this.captionsTall.visible = portrait > 0;
    this.phoneMat.uniforms.presence.value = range(g, 27.2, 27.5);
  }

  /** Spline camera, adapted for portrait screens and shifted to leave room for the text column. */
  private placeCamera(g: number, camera: THREE.PerspectiveCamera, size: { width: number; height: number }) {
    const aspect = size.width / Math.max(1, size.height);
    let fov = this.path.sample(g, this.camPos, this.camLook);
    if (aspect < 1) {
      // Keep roughly 55% of the desktop framing's width on tall screens: widen, then pull back.
      const wantTanH = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * 1.78 * 0.55;
      const portraitFov = Math.min(64, THREE.MathUtils.radToDeg(2 * Math.atan(wantTanH / aspect)));
      const reach = wantTanH / (Math.tan(THREE.MathUtils.degToRad(portraitFov / 2)) * aspect);
      this.camPos.sub(this.camLook).multiplyScalar(Math.max(1, reach)).add(this.camLook);
      const dist = this.camPos.distanceTo(this.camLook);
      this.camLook.y -= dist * 0.09; // lift the subject above the bottom text panel
      fov = portraitFov;
    }
    camera.position.copy(this.camPos);
    camera.lookAt(this.camLook);
    // The mobile overview pulls back farther; keep the studio inside the fog's
    // clear range instead of fading the entire team out at the final frame.
    if (this.scene.fog instanceof THREE.Fog) {
      const overview = easeInOut(range(g, 80, 83));
      const distance = camera.position.distanceTo(this.camLook);
      this.scene.fog.near = lerp(18, Math.max(18, distance + 8), overview);
      this.scene.fog.far = lerp(42, Math.max(42, distance + 45), overview);
    }
    camera.fov = fov;
    camera.aspect = aspect;
    camera.filmGauge = 35;
    // Desktop: shift the image so subjects sit right of centre, clear of the headline column.
    camera.filmOffset = aspect > 1.15 ? -0.12 * 35 * 2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * aspect : 0;
    camera.layers.enable(SCREEN_LAYER);
    camera.updateProjectionMatrix();
  }

  dispose() {
    this.scene.remove(...this.added);
    this.scene.environment = null;
    this.scene.background = null;
    this.scene.fog = null;
    this.kit.dispose();
    this.feed.dispose();
    this.transfer.dispose();
    for (const c of this.characters) c.dispose();
    for (const portrait of this.portraits) portrait.dispose();
    for (const s of Object.values(this.screens)) s.dispose();
    this.previewMat.dispose();
    this.phoneMat.dispose();
    this.designScreen.dispose();
    this.productShot.dispose();
    this.social.dispose();
    this.marketing.dispose();
    this.seo.dispose();
    for (const a of this.posterArts) a.dispose();
    for (const v of this.posterViews) v.dispose();
    for (const d of this.extraDisposables) d.dispose();
    this.envMap.dispose();
  }
}
