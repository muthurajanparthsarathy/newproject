import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mulberry32 } from "./math";

/** Owns shared materials and everything that needs disposing. */
export class Kit {
  private readonly items: { dispose(): void }[] = [];
  readonly m = {
    black: this.std("#1b1f25", 0.45, 0.15),
    rubber: this.std("#24282f", 0.85),
    darkMetal: this.std("#30363f", 0.35, 0.6),
    metal: this.std("#a3acb8", 0.28, 0.85),
    white: this.std("#f5f7fa", 0.45),
    offWhite: this.std("#eef2f7", 0.6),
    wood: this.std("#c99a6c", 0.55),
    lightWood: this.std("#dcc1a0", 0.6),
    fabric: this.std("#2a2f37", 0.95),
    glass: new THREE.MeshStandardMaterial({ color: "#cfe3ff", roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.16, depthWrite: false }),
    lensGlass: this.std("#16243b", 0.08, 0.9),
    red: new THREE.MeshStandardMaterial({ color: "#e11d48", emissive: "#ff2d55", emissiveIntensity: 0.25, roughness: 0.4 }),
    blueGlow: new THREE.MeshBasicMaterial({ color: "#4f8dff" }),
    screenOff: this.std("#0b0f16", 0.25, 0.3),
    pot: this.std("#f1efe9", 0.6),
    soil: this.std("#3b2d22", 1),
    leaf: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.65, side: THREE.DoubleSide }),
    bottle: new THREE.MeshStandardMaterial({ color: "#2f6fe0", roughness: 0.32, metalness: 0.35 }),
    bottleCap: this.std("#e8ecf2", 0.3, 0.6),
  };

  constructor() {
    this.items.push(this.m.glass, this.m.red, this.m.blueGlow, this.m.leaf, this.m.bottle);
  }

  std(color: string, roughness = 0.6, metalness = 0) {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    this.items.push(m);
    return m;
  }

  track<T extends { dispose(): void }>(item: T) {
    this.items.push(item);
    return item;
  }

  mesh(geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0, shadow = true) {
    this.items.push(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  box(w: number, h: number, d: number, r: number, mat: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) {
    return this.mesh(r > 0 ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
  }

  /** A cylinder spanning two points in `parent`'s space. */
  rod(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, parent: THREE.Object3D, rBottom = r) {
    const len = a.distanceTo(b);
    const m = this.mesh(new THREE.CylinderGeometry(r, rBottom, len, 10), mat, parent);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    return m;
  }

  anchor(parent: THREE.Object3D, x: number, y: number, z: number, name: string) {
    const o = new THREE.Object3D();
    o.name = name;
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  }

  dispose() {
    for (const i of this.items) i.dispose();
  }
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------
// Shoot zone
// ---------------------------------------------------------------------------

export type FilmRig = ReturnType<typeof buildFilmRig>;

/** Cinema camera on a fluid-head tripod, with a field monitor facing the operator. */
export function buildFilmRig(kit: Kit) {
  const { m } = kit;
  const group = new THREE.Group();
  const headY = 1.12;

  // Tripod: one leg towards the subject, two behind so the operator stands between them
  for (const az of [Math.PI, Math.PI / 3, -Math.PI / 3]) {
    const top = V(Math.sin(az) * 0.06, headY - 0.1, Math.cos(az) * 0.06);
    const mid = V(Math.sin(az) * 0.27, 0.55, Math.cos(az) * 0.27);
    const foot = V(Math.sin(az) * 0.5, 0.025, Math.cos(az) * 0.5);
    kit.rod(top, mid, 0.017, m.black, group);
    kit.rod(mid, foot, 0.012, m.darkMetal, group);
    kit.mesh(new THREE.SphereGeometry(0.022, 10, 8), m.rubber, group, foot.x, 0.02, foot.z);
    kit.mesh(new THREE.TorusGeometry(0.02, 0.006, 6, 12), m.rubber, group, mid.x, mid.y, mid.z).rotation.x = Math.PI / 2;
  }
  kit.mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.06, 18), m.black, group, 0, headY - 0.1, 0);
  kit.mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 12), m.metal, group, 0, headY - 0.04, 0);

  const pan = new THREE.Group();
  pan.position.y = headY;
  group.add(pan);
  kit.mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.05, 20), m.black, pan, 0, 0.01, 0);
  const tilt = new THREE.Group();
  tilt.position.y = 0.045;
  pan.add(tilt);

  // Camera body, handle, eyepiece
  kit.box(0.13, 0.14, 0.22, 0.018, m.black, tilt, 0, 0.1, -0.01);
  kit.box(0.03, 0.026, 0.17, 0.008, m.rubber, tilt, 0, 0.205, -0.01);
  kit.box(0.014, 0.03, 0.014, 0.003, m.black, tilt, 0, 0.183, 0.06);
  kit.box(0.014, 0.03, 0.014, 0.003, m.black, tilt, 0, 0.183, -0.08);
  kit.box(0.05, 0.045, 0.07, 0.012, m.rubber, tilt, -0.045, 0.155, 0.12);
  kit.box(0.09, 0.055, 0.004, 0, m.screenOff, tilt, 0.0, 0.09, 0.1);

  // Lens with a turning focus ring and matte box
  const lens = kit.mesh(new THREE.CylinderGeometry(0.046, 0.05, 0.17, 24), m.black, tilt, 0, 0.1, -0.205);
  lens.rotation.x = Math.PI / 2;
  const focusRing = new THREE.Group();
  focusRing.position.set(0, 0.1, -0.165);
  tilt.add(focusRing);
  const ring = kit.mesh(new THREE.CylinderGeometry(0.054, 0.054, 0.032, 28), m.darkMetal, focusRing);
  ring.rotation.x = Math.PI / 2;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    kit.box(0.006, 0.006, 0.03, 0, m.metal, focusRing, Math.cos(a) * 0.056, Math.sin(a) * 0.056, 0);
  }
  const glass = kit.mesh(new THREE.CircleGeometry(0.041, 28), m.lensGlass, tilt, 0, 0.1, -0.291, false);
  glass.rotation.y = Math.PI;
  const matteMat = kit.std("#1b1f25", 0.6);
  matteMat.side = THREE.DoubleSide;
  const matte = kit.mesh(new THREE.CylinderGeometry(0.105, 0.068, 0.09, 4, 1, true), matteMat, tilt, 0, 0.1, -0.335);
  matte.rotation.set(-Math.PI / 2, Math.PI / 4, 0);

  const tally = kit.mesh(new THREE.SphereGeometry(0.008, 10, 8), m.red, tilt, 0.035, 0.172, -0.115, false);
  const recordButton = kit.mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.007, 14), m.red, tilt, 0.068, 0.075, 0.035, false);
  recordButton.rotation.z = Math.PI / 2;

  // Pan bar towards the operator's right hand
  const barStart = V(0.03, 0.02, 0.07);
  const barEnd = V(0.2, -0.11, 0.43);
  kit.rod(barStart, barEnd, 0.011, m.metal, tilt);
  const gripStart = barStart.clone().lerp(barEnd, 0.68);
  kit.rod(gripStart, barEnd, 0.018, m.rubber, tilt);

  // Field monitor on an articulated arm, angled to the operator
  kit.rod(V(-0.06, 0.17, 0.0), V(-0.17, 0.235, 0.04), 0.008, m.darkMetal, tilt);
  const monitor = new THREE.Group();
  monitor.position.set(-0.21, 0.26, 0.06);
  monitor.rotation.set(-0.08, 0.16, 0);
  tilt.add(monitor);
  kit.box(0.36, 0.235, 0.028, 0.012, m.black, monitor);
  const monitorScreen = kit.mesh(new THREE.PlaneGeometry(0.33, 0.206), m.screenOff, monitor, 0, 0, 0.0146, false);
  const monitorOverlay = kit.mesh(new THREE.PlaneGeometry(0.33, 0.206), m.screenOff, monitor, 0, 0, 0.0151, false);

  return {
    group,
    pan,
    tilt,
    focusRing,
    tally,
    recordButton,
    monitor,
    monitorScreen,
    monitorOverlay,
    anchors: {
      panGrip: kit.anchor(tilt, gripStart.x * 0.5 + barEnd.x * 0.5, (gripStart.y + barEnd.y) / 2, (gripStart.z + barEnd.z) / 2, "panGrip"),
      handle: kit.anchor(tilt, 0, 0.225, -0.03, "handle"),
      focusRing: kit.anchor(tilt, -0.065, 0.1, -0.165, "focusRing"),
      lensFront: kit.anchor(tilt, 0, 0.1, -0.36, "lensFront"),
      lensBack: kit.anchor(tilt, 0, 0.1, -0.1, "lensBack"),
      recordButton: kit.anchor(tilt, 0.09, 0.075, 0.035, "recordButton"),
      monitorCenter: kit.anchor(monitor, 0, 0, 0.02, "monitorCenter"),
      monitorTouch: kit.anchor(monitor, 0.075, -0.05, 0.035, "monitorTouch"),
      monitorButton: kit.anchor(monitor, 0.11, -0.072, 0.035, "monitorButton"),
    },
  };
}

/** Softbox on a stand; returns the group and the spotlight it carries. */
export function buildSoftbox(kit: Kit, at: THREE.Vector3, aim: THREE.Vector3, color = "#fff1dc") {
  const { m } = kit;
  const group = new THREE.Group();
  group.position.copy(at);
  for (const az of [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3]) {
    kit.rod(V(0, 0.32, 0), V(Math.sin(az) * 0.32, 0.02, Math.cos(az) * 0.32), 0.009, m.black, group);
  }
  kit.rod(V(0, 0.02, 0), V(0, 1.86, 0), 0.014, m.black, group);
  kit.mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 10), m.darkMetal, group, 0, 1.0, 0);

  const head = new THREE.Group();
  head.position.set(0, 1.86, 0);
  group.add(head);
  // Face the head's +Z at the target (the group is only translated, so local = world rotation).
  const worldHead = at.clone().add(head.position);
  head.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(aim, worldHead, new THREE.Vector3(0, 1, 0)));
  const cone = kit.mesh(new THREE.CylinderGeometry(0.42, 0.12, 0.42, 4, 1, true), m.black, head, 0, 0, 0.12);
  cone.rotation.set(Math.PI / 2, Math.PI / 4, 0);
  const inner = kit.std("#f2efe9", 0.9);
  inner.side = THREE.BackSide;
  const coneInner = new THREE.Mesh(cone.geometry, inner);
  coneInner.scale.setScalar(0.985);
  cone.add(coneInner);
  const diffuserMat = kit.track(new THREE.MeshBasicMaterial({ color }));
  const diffuser = kit.mesh(new THREE.PlaneGeometry(0.58, 0.58), diffuserMat, head, 0, 0, 0.335, false);
  kit.box(0.09, 0.09, 0.12, 0.02, m.black, head, 0, 0, -0.12);

  const light = new THREE.SpotLight(color, 26, 9, 0.75, 0.85, 2);
  light.position.copy(at).add(new THREE.Vector3(0, 1.86, 0));
  light.target.position.copy(aim);
  return { group, light, diffuser };
}

export function buildStool(kit: Kit) {
  const { m } = kit;
  const group = new THREE.Group();
  kit.mesh(new THREE.CylinderGeometry(0.2, 0.19, 0.05, 32), m.lightWood, group, 0, 0.6, 0);
  for (const az of [0.6, 2.2, 3.8, 5.4]) {
    kit.rod(V(Math.sin(az) * 0.13, 0.58, Math.cos(az) * 0.13), V(Math.sin(az) * 0.21, 0.01, Math.cos(az) * 0.21), 0.011, m.black, group);
  }
  kit.mesh(new THREE.TorusGeometry(0.17, 0.008, 8, 32), m.black, group, 0, 0.28, 0).rotation.x = Math.PI / 2;
  return group;
}

export function buildSideTable(kit: Kit) {
  const { m } = kit;
  const group = new THREE.Group();
  kit.mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.026, 36), m.white, group, 0, 0.56, 0);
  kit.mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.55, 12), m.metal, group, 0, 0.28, 0);
  kit.mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.02, 32), m.white, group, 0, 0.01, 0);
  return group;
}

/** A fictional, unbranded blue water bottle. Origin is at its centre of grip. */
export function buildBottle(kit: Kit) {
  const { m } = kit;
  const group = new THREE.Group();
  const profile = [
    [0, -0.115], [0.033, -0.115], [0.036, -0.105], [0.036, 0.055], [0.031, 0.08], [0.017, 0.092], [0.017, 0.1],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  kit.mesh(new THREE.LatheGeometry(profile, 32), m.bottle, group);
  kit.mesh(new THREE.CylinderGeometry(0.0375, 0.0375, 0.03, 32), m.bottleCap, group, 0, -0.02, 0);
  kit.mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.032, 20), m.bottleCap, group, 0, 0.116, 0);
  return group;
}

// ---------------------------------------------------------------------------
// Edit zone
// ---------------------------------------------------------------------------

/** Desk monitor on a stand. `body` holds the screen plane (facing +Z). */
export function buildMonitor(kit: Kit, parent: THREE.Object3D, w: number, h: number, x: number, top: number, z: number, yaw: number, height: number) {
  const { m } = kit;
  const g = new THREE.Group();
  g.position.set(x, top, z);
  g.rotation.y = yaw;
  parent.add(g);
  kit.box(0.26, 0.012, 0.18, 0.006, m.darkMetal, g, 0, 0.006, 0);
  kit.box(0.04, height - 0.05, 0.025, 0.008, m.darkMetal, g, 0, (height - 0.05) / 2, -0.04);
  const body = new THREE.Group();
  body.position.set(0, height, -0.02);
  body.rotation.x = -0.06;
  g.add(body);
  kit.box(w + 0.04, h + 0.04, 0.032, 0.012, m.black, body, 0, 0, -0.016);
  const screen = kit.mesh(new THREE.PlaneGeometry(w, h), m.screenOff, body, 0, 0, 0.0005, false);
  return { group: g, body, screen };
}

let keyTexture: THREE.CanvasTexture | null = null;
/** Keyboard with a printed key grid. */
export function buildKeyboard(kit: Kit, parent: THREE.Object3D, x: number, top: number, z: number) {
  if (!keyTexture) {
    const keyCanvas = document.createElement("canvas");
    keyCanvas.width = 512;
    keyCanvas.height = 160;
    const kx = keyCanvas.getContext("2d")!;
    kx.fillStyle = "#1a1d23";
    kx.fillRect(0, 0, 512, 160);
    kx.fillStyle = "#3a404b";
    for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) kx.fillRect(8 + c * 35.5, 8 + r * 29.5, 31, 25);
    kx.fillRect(140, 126, 220, 25);
    keyTexture = new THREE.CanvasTexture(keyCanvas);
    keyTexture.colorSpace = THREE.SRGBColorSpace;
  }
  const keyboard = new THREE.Group();
  keyboard.position.set(x, top, z);
  parent.add(keyboard);
  kit.box(0.44, 0.018, 0.145, 0.006, kit.m.black, keyboard, 0, 0.009, 0);
  const keys = kit.mesh(new THREE.PlaneGeometry(0.42, 0.125), kit.track(new THREE.MeshStandardMaterial({ map: keyTexture, roughness: 0.7 })), keyboard, 0, 0.0185, 0, false);
  keys.rotation.x = -Math.PI / 2;
  return keyboard;
}

export type DeskSet = ReturnType<typeof buildDesk>;

/** Editing desk with two monitors, laptop, keyboard, mouse, mug and a plant. Origin at floor level. */
export function buildDesk(kit: Kit) {
  const { m } = kit;
  const group = new THREE.Group();
  const top = 0.7625;
  kit.box(1.9, 0.045, 0.82, 0.012, m.wood, group, 0, top - 0.0225, 0);
  for (const s of [-1, 1]) {
    const x = s * 0.85;
    kit.box(0.05, 0.72, 0.05, 0.006, m.black, group, x, 0.36, -0.33);
    kit.box(0.05, 0.72, 0.05, 0.006, m.black, group, x, 0.36, 0.33);
    kit.box(0.05, 0.05, 0.7, 0.006, m.black, group, x, 0.03, 0);
    kit.box(0.05, 0.05, 0.7, 0.006, m.black, group, x, 0.69, 0);
  }

  const main = buildMonitor(kit, group, 0.74, 0.416, -0.12, top, -0.24, 0, 0.42);
  const side = buildMonitor(kit, group, 0.56, 0.315, 0.68, top, -0.16, -0.5, 0.37);

  // Laptop
  const laptop = new THREE.Group();
  laptop.position.set(-0.76, top, 0.04);
  laptop.rotation.y = 0.52;
  group.add(laptop);
  kit.box(0.33, 0.016, 0.23, 0.008, m.metal, laptop, 0, 0.008, 0);
  kit.box(0.3, 0.002, 0.1, 0, m.darkMetal, laptop, 0, 0.0165, -0.03);
  const lid = new THREE.Group();
  lid.position.set(0, 0.016, -0.115);
  lid.rotation.x = -0.32;
  laptop.add(lid);
  kit.box(0.33, 0.21, 0.01, 0.006, m.metal, lid, 0, 0.105, -0.005);
  const laptopScreen = kit.mesh(new THREE.PlaneGeometry(0.3, 0.188), m.screenOff, lid, 0, 0.108, 0.0006, false);

  const keyboard = buildKeyboard(kit, group, -0.1, top, 0.2);

  // Mouse on its pad (the mouse group is moved by the choreography)
  const mousePad = kit.box(0.27, 0.003, 0.22, 0.002, m.fabric, group, 0.3, top + 0.0015, 0.2);
  const mouse = new THREE.Group();
  mouse.position.set(0.3, top + 0.003, 0.2);
  mouse.userData.pad = mousePad;
  group.add(mouse);
  const shell = kit.mesh(new THREE.SphereGeometry(0.04, 20, 14), m.black, mouse, 0, 0.012, 0);
  shell.scale.set(0.78, 0.45, 1.3);

  // Mug and a small plant
  kit.mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.1, 24), m.white, group, 0.52, top + 0.05, 0.14);
  kit.mesh(new THREE.TorusGeometry(0.026, 0.007, 8, 16), m.white, group, 0.565, top + 0.055, 0.14).rotation.y = Math.PI / 2;
  kit.mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.004, 20), kit.std("#3b2416", 0.3), group, 0.52, top + 0.093, 0.14, false);
  const plant = buildPlant(kit, 21, "bush", 0.32);
  plant.position.set(0.86, top, -0.27);
  plant.scale.setScalar(0.55);
  group.add(plant);

  return {
    group,
    main,
    side,
    laptopScreen,
    keyboard,
    mouse,
    anchors: {
      keyLeft: kit.anchor(keyboard, -0.1, 0.03, 0.01, "keyLeft"),
      keyRight: kit.anchor(keyboard, 0.08, 0.03, 0.01, "keyRight"),
      mouseBase: kit.anchor(group, 0.3, top + 0.003, 0.2, "mouseBase"),
      laptop: kit.anchor(laptop, 0, 0.12, -0.12, "laptop"),
      mainScreen: kit.anchor(main.body, 0, 0, 0.01, "mainScreen"),
      sideScreen: kit.anchor(side.body, 0, 0, 0.01, "sideScreen"),
    },
  };
}

export function buildOfficeChair(kit: Kit) {
  const { m } = kit;
  const group = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    kit.rod(V(0, 0.09, 0), V(Math.sin(a) * 0.3, 0.06, Math.cos(a) * 0.3), 0.016, m.black, group);
    kit.mesh(new THREE.SphereGeometry(0.028, 10, 8), m.rubber, group, Math.sin(a) * 0.3, 0.03, Math.cos(a) * 0.3);
  }
  kit.mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.34, 12), m.darkMetal, group, 0, 0.26, 0);
  kit.box(0.5, 0.08, 0.48, 0.035, m.fabric, group, 0, 0.46, 0);
  const back = kit.box(0.46, 0.52, 0.06, 0.04, m.fabric, group, 0, 0.88, 0.25);
  back.rotation.x = 0.12;
  kit.rod(V(0, 0.48, 0.22), V(0, 0.65, 0.25), 0.02, m.black, group);
  for (const s of [-1, 1]) {
    kit.rod(V(s * 0.24, 0.47, 0.1), V(s * 0.25, 0.66, 0.08), 0.014, m.black, group);
    kit.box(0.06, 0.03, 0.26, 0.012, m.black, group, s * 0.25, 0.67, 0.04);
  }
  return group;
}

/** Over-ear headphones. Origin at the top of the band; cups hang along −Y at ±x. */
export function buildHeadphones(kit: Kit) {
  const { m } = kit;
  const group = new THREE.Group();
  const band = kit.mesh(new THREE.TorusGeometry(0.1, 0.011, 8, 28, Math.PI), m.black, group, 0, -0.1, 0);
  band.rotation.z = 0;
  for (const s of [-1, 1]) {
    const cup = kit.mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.034, 22), m.black, group, s * 0.104, -0.1, 0);
    cup.rotation.z = Math.PI / 2;
    const pad = kit.mesh(new THREE.TorusGeometry(0.034, 0.012, 8, 20), m.fabric, group, s * 0.088, -0.1, 0);
    pad.rotation.y = Math.PI / 2;
  }
  return group;
}

/** Potted plant with instanced leaves. `kind` is "tall" (fiddle-leaf style) or "bush". */
export function buildPlant(kit: Kit, seed: number, kind: "tall" | "bush", height: number) {
  const { m } = kit;
  const rand = mulberry32(seed);
  const group = new THREE.Group();
  const potH = kind === "tall" ? 0.38 : 0.26;
  const potR = kind === "tall" ? 0.2 : 0.17;
  kit.mesh(new THREE.CylinderGeometry(potR, potR * 0.78, potH, 28), m.pot, group, 0, potH / 2, 0);
  kit.mesh(new THREE.CylinderGeometry(potR * 0.94, potR * 0.94, 0.02, 24), m.soil, group, 0, potH - 0.015, 0, false);

  const leafGeo = new THREE.SphereGeometry(1, 12, 6);
  kit.track(leafGeo);
  const count = kind === "tall" ? 34 : 46;
  const leaves = new THREE.InstancedMesh(leafGeo, m.leaf, count);
  leaves.castShadow = true;
  const dummy = new THREE.Object3D();
  const greens = ["#3f7f4c", "#4f9a59", "#2f6b3f", "#5aa864", "#3a7547"].map((c) => new THREE.Color(c));
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const y = potH + (kind === "tall" ? 0.15 + t * (height - potH - 0.15) : 0.03 + rand() * (height - potH));
    const az = i * 2.4 + rand() * 0.6;
    const spread = kind === "tall" ? 0.07 + rand() * 0.18 : 0.04 + rand() * potR * 1.3;
    dummy.position.set(Math.sin(az) * spread, y, Math.cos(az) * spread);
    dummy.rotation.set(0.5 + rand() * 0.5, az, rand() * 0.6 - 0.3);
    const s = kind === "tall" ? 0.09 + rand() * 0.05 : 0.06 + rand() * 0.04;
    dummy.scale.set(s * 0.75, s * 0.12, s * 1.25);
    dummy.updateMatrix();
    leaves.setMatrixAt(i, dummy.matrix);
    leaves.setColorAt(i, greens[i % greens.length]);
  }
  group.add(leaves);
  if (kind === "tall") kit.rod(V(0, potH, 0), V(0.02, height * 0.92, -0.01), 0.012, kit.std("#5b4632", 0.9), group);
  return group;
}

/** Tall foreground light stand with a small LED panel (bridges the shoot-to-edit move). */
export function buildLedStand(kit: Kit) {
  const { m } = kit;
  const group = new THREE.Group();
  for (const az of [0.4, 2.5, 4.6]) kit.rod(V(0, 0.4, 0), V(Math.sin(az) * 0.36, 0.02, Math.cos(az) * 0.36), 0.01, m.black, group);
  kit.rod(V(0, 0.02, 0), V(0, 1.86, 0), 0.016, m.black, group);
  kit.mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.08, 12), m.darkMetal, group, 0, 1.1, 0);
  // Yoke and an LED panel facing the camera path, with barn doors, so it reads as a light
  const panel = new THREE.Group();
  panel.position.set(0, 1.98, 0);
  panel.rotation.set(-0.22, 0.35, 0);
  group.add(panel);
  kit.rod(V(-0.25, -0.12, -0.03), V(-0.25, 0.0, -0.03), 0.01, m.black, panel);
  kit.rod(V(0.25, -0.12, -0.03), V(0.25, 0.0, -0.03), 0.01, m.black, panel);
  kit.rod(V(-0.25, -0.12, -0.03), V(0.25, -0.12, -0.03), 0.01, m.black, panel);
  kit.box(0.46, 0.32, 0.05, 0.012, m.black, panel);
  const led = kit.track(new THREE.MeshBasicMaterial({ color: "#fff6e8" }));
  kit.mesh(new THREE.PlaneGeometry(0.42, 0.28), led, panel, 0, 0, 0.026, false);
  for (const [w, h, x, y, rx, ry] of [[0.44, 0.1, 0, 0.21, -0.6, 0], [0.44, 0.1, 0, -0.21, 0.6, 0], [0.1, 0.3, -0.28, 0, 0, 0.6], [0.1, 0.3, 0.28, 0, 0, -0.6]] as const) {
    const door = kit.box(w, h, 0.006, 0, m.black, panel, x, y, 0.06);
    door.rotation.set(rx, ry, 0);
  }
  return group;
}

// ---------------------------------------------------------------------------
// Design zone (scene 3)
// ---------------------------------------------------------------------------

export type DesignDesk = ReturnType<typeof buildDesignDesk>;

/**
 * Graphic-design workstation: monitor, a tilted pen display (screen in its local XY plane,
 * facing +Z), keyboard, colour swatch cards, mug and plant. Origin at floor level; the
 * designer sits on the +Z side facing −Z, like the edit desk.
 */
export function buildDesignDesk(kit: Kit) {
  const { m } = kit;
  const group = new THREE.Group();
  const top = 0.7625;
  kit.box(1.8, 0.045, 0.82, 0.012, m.white, group, 0, top - 0.0225, 0);
  for (const s of [-1, 1]) {
    const x = s * 0.8;
    kit.box(0.05, 0.72, 0.05, 0.006, m.metal, group, x, 0.36, -0.33);
    kit.box(0.05, 0.72, 0.05, 0.006, m.metal, group, x, 0.36, 0.33);
    kit.box(0.05, 0.05, 0.7, 0.006, m.metal, group, x, 0.69, 0);
  }
  const monitor = buildMonitor(kit, group, 0.74, 0.416, 0.05, top, -0.24, 0, 0.42);

  // Pen display on a low stand, tilted towards the designer
  const tablet = new THREE.Group();
  tablet.position.set(0.0, top + 0.035, 0.2);
  tablet.rotation.x = -Math.PI / 2 + 0.36;
  group.add(tablet);
  kit.box(0.4, 0.27, 0.016, 0.01, m.black, tablet, 0, 0, -0.008);
  const tabletScreen = kit.mesh(new THREE.PlaneGeometry(0.34, 0.2125), m.screenOff, tablet, -0.02, 0, 0.0005, false);
  tablet.userData.stand = kit.box(0.3, 0.03, 0.06, 0.008, m.darkMetal, group, 0, top + 0.015, 0.13);

  const keyboard = buildKeyboard(kit, group, -0.52, top, 0.2);
  keyboard.rotation.y = 0.18;

  // Printed colour swatches, a mug and a plant
  ["#1d4ed8", "#38bdf8", "#facc15"].forEach((c, i) => {
    const card = kit.box(0.07, 0.003, 0.1, 0, kit.std(c, 0.7), group, 0.42 + i * 0.05, top + 0.002 + i * 0.003, 0.18 + i * 0.02);
    card.rotation.y = -0.3 + i * 0.25;
  });
  kit.mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.1, 24), m.white, group, -0.72, top + 0.05, -0.05);
  kit.mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.004, 20), kit.std("#3b2416", 0.3), group, -0.72, top + 0.093, -0.05, false);
  const plant = buildPlant(kit, 29, "bush", 0.32);
  plant.position.set(0.74, top, -0.27);
  plant.scale.setScalar(0.55);
  group.add(plant);

  return {
    group,
    monitor,
    tablet,
    tabletScreen,
    keyboard,
    anchors: {
      keyLeft: kit.anchor(keyboard, -0.06, 0.03, 0.01, "keyLeft"),
      handRest: kit.anchor(group, 0.3, top + 0.02, 0.28, "handRest"),
      stylusRest: kit.anchor(tablet, 0.185, -0.02, 0.012, "stylusRest"),
      monitorCenter: kit.anchor(monitor.body, 0, 0, 0.01, "monitorCenter"),
      tabletCenter: kit.anchor(tablet, -0.02, 0, 0.01, "tabletCenter"),
    },
  };
}

/** Stylus with its tip at the origin and the barrel along +Y. */
export function buildStylus(kit: Kit) {
  const { m } = kit;
  const group = new THREE.Group();
  kit.mesh(new THREE.ConeGeometry(0.0062, 0.018, 14), m.darkMetal, group, 0, 0.009, 0, false).rotation.x = Math.PI;
  kit.mesh(new THREE.CylinderGeometry(0.0068, 0.0064, 0.15, 14), kit.std("#e3e8ef", 0.3, 0.4), group, 0, 0.093, 0, false);
  kit.mesh(new THREE.CylinderGeometry(0.0071, 0.0071, 0.014, 14), kit.std("#2563eb", 0.4), group, 0, 0.06, 0, false);
  return group;
}

// ---------------------------------------------------------------------------
// Social media corner (prepared for scene 4)
// ---------------------------------------------------------------------------

export type SocialStation = ReturnType<typeof buildSocialStation>;

/** Stool, small round table with a laptop, a plant and the manager's phone. Origin at floor level; the manager faces +Z. */
export function buildSocialStation(kit: Kit) {
  const { m } = kit;
  const group = new THREE.Group();
  const stool = buildStool(kit);
  group.add(stool);
  const table = buildSideTable(kit);
  table.position.set(0.05, 0, 0.62);
  table.scale.set(1.15, 1.18, 1.15);
  group.add(table);
  // Laptop on the table, open towards the manager
  const laptop = new THREE.Group();
  laptop.position.set(0.1, 0.68, 0.7);
  laptop.rotation.y = Math.PI + 0.25;
  group.add(laptop);
  kit.box(0.3, 0.014, 0.21, 0.007, m.metal, laptop, 0, 0.007, 0);
  const lid = new THREE.Group();
  lid.position.set(0, 0.014, -0.105);
  lid.rotation.x = -0.3;
  laptop.add(lid);
  kit.box(0.3, 0.19, 0.008, 0.006, m.metal, lid, 0, 0.095, -0.004);
  const laptopScreen = kit.mesh(new THREE.PlaneGeometry(0.27, 0.17), m.screenOff, lid, 0, 0.098, 0.0006, false);
  // (No ring light: from every scene 4 camera it sat edge-on in the sightline to her face.)
  // Phone (posed in her hands by the choreography)
  const phone = new THREE.Group();
  kit.box(0.075, 0.155, 0.009, 0.007, m.black, phone);
  const phoneScreen = kit.mesh(new THREE.PlaneGeometry(0.066, 0.138), m.screenOff, phone, 0, 0, 0.0052, false);
  const plant = buildPlant(kit, 37, "tall", 1.35);
  plant.position.set(-0.75, 0, -0.45);
  group.add(plant);
  return { group, phone, phoneScreen, laptopScreen };
}

// ---------------------------------------------------------------------------
// Marketing zone (scene 5)
// ---------------------------------------------------------------------------

export type MarketingDesk = ReturnType<typeof buildMarketingDesk>;

/**
 * Advertising workstation: a large campaign monitor, an analytics monitor on the left,
 * keyboard, mouse (moved by the choreography), mug and a small plant. Origin at floor
 * level; the specialist sits on the +Z side facing −Z, like the edit and design desks.
 */
export function buildMarketingDesk(kit: Kit) {
  const { m } = kit;
  const group = new THREE.Group();
  const top = 0.7625;
  kit.box(2.0, 0.045, 0.84, 0.012, m.lightWood, group, 0, top - 0.0225, 0);
  for (const s of [-1, 1]) {
    const x = s * 0.9;
    kit.box(0.05, 0.72, 0.05, 0.006, m.black, group, x, 0.36, -0.34);
    kit.box(0.05, 0.72, 0.05, 0.006, m.black, group, x, 0.36, 0.34);
    kit.box(0.05, 0.05, 0.72, 0.006, m.black, group, x, 0.69, 0);
  }
  const main = buildMonitor(kit, group, 0.96, 0.54, 0.02, top, -0.25, 0, 0.47);
  // In desk space +X is the specialist's right, so the analytics screen sits on her left
  const side = buildMonitor(kit, group, 0.5, 0.28, -0.8, top, -0.14, 0.5, 0.38);
  const keyboard = buildKeyboard(kit, group, -0.04, top, 0.2);

  const mousePad = kit.box(0.27, 0.003, 0.22, 0.002, m.fabric, group, 0.36, top + 0.0015, 0.2);
  const mouse = new THREE.Group();
  mouse.position.set(0.36, top + 0.003, 0.2);
  mouse.userData.pad = mousePad;
  group.add(mouse);
  const shell = kit.mesh(new THREE.SphereGeometry(0.04, 20, 14), m.white, mouse, 0, 0.012, 0);
  shell.scale.set(0.78, 0.45, 1.3);

  kit.mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.1, 24), kit.std("#2563eb", 0.45), group, -0.52, top + 0.05, 0.16);
  kit.mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.004, 20), kit.std("#3b2416", 0.3), group, -0.52, top + 0.093, 0.16, false);
  // A notepad with a pen
  kit.box(0.15, 0.006, 0.21, 0.003, m.white, group, 0.66, top + 0.003, 0.16).rotation.y = -0.2;
  kit.rod(V(0.62, top + 0.01, 0.1), V(0.7, top + 0.01, 0.24), 0.004, m.black, group);
  const plant = buildPlant(kit, 67, "bush", 0.32);
  plant.position.set(0.82, top, -0.26);
  plant.scale.setScalar(0.55);
  group.add(plant);

  return {
    group,
    main,
    side,
    keyboard,
    mouse,
    anchors: {
      keyLeft: kit.anchor(keyboard, -0.1, 0.03, 0.01, "keyLeft"),
      keyRight: kit.anchor(keyboard, 0.08, 0.03, 0.01, "keyRight"),
      mouseBase: kit.anchor(group, 0.36, top + 0.003, 0.2, "mouseBase"),
      mainScreen: kit.anchor(main.body, 0, 0, 0.01, "mainScreen"),
      sideScreen: kit.anchor(side.body, 0, 0, 0.01, "sideScreen"),
    },
  };
}
