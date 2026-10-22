import * as THREE from "three";
import { Kit, buildLedStand, buildPlant } from "./props";

const WALL_CENTER = new THREE.Vector3(3.2, 0, 6.6);
const WALL_RADIUS = 10;

/**
 * The studio is a ring: work zones sit along the curved wall, facing it, with the camera
 * travelling inside. `theta` is the angle around the wall's centre (π = straight back).
 */
export function ringPoint(theta: number, radius: number) {
  return new THREE.Vector3(WALL_CENTER.x + Math.sin(theta) * radius, 0, WALL_CENTER.z + Math.cos(theta) * radius);
}
/** Unit direction from the ring centre towards the wall at `theta` (what a person at that zone faces). */
export function ringOut(theta: number) {
  return new THREE.Vector3(Math.sin(theta), 0, Math.cos(theta));
}

/** Design, social, marketing and web zones, further round the ring to the right of the edit desk. */
export const DESIGN_THETA = 2.2286;
export const SOCIAL_THETA = 1.75;
export const MARKETING_THETA = 1.25;
/** Website & app development (scene 6): the developer is already at work here during scene 5. */
export const WEB_THETA = 0.78;
export const SEO_THETA = 0.28;

/**
 * World point in a ring zone's own frame: `x` towards the left of someone at the zone facing
 * the wall (`facing = 1`) or facing into the room (`facing = -1`), `y` up from the floor and
 * `z` the way they face. Used to block cameras, props and floating UI around a character.
 */
export function zonePoint(theta: number, radius: number, facing: 1 | -1, x: number, y: number, z: number, out = new THREE.Vector3()) {
  const o = ringPoint(theta, radius);
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  // left = facing · (cos θ, 0, −sin θ); forward = facing · (sin θ, 0, cos θ)
  return out.set(o.x + facing * (x * c + z * s), y, o.z + facing * (-x * s + z * c));
}

/** Positions of the connected work zones (metres). */
export const ZONES = {
  shoot: new THREE.Vector3(0, 0, 0),
  presenter: new THREE.Vector3(0.25, 0, -1.75),
  edit: new THREE.Vector3(7.1, 0, -1.15),
  design: ringPoint(DESIGN_THETA, 8.4),
  social: ringPoint(SOCIAL_THETA, 8.2),
  marketing: ringPoint(MARKETING_THETA, 8.4),
  web: ringPoint(WEB_THETA, 8.4),
} as const;

// The wall wraps round to the right, behind the design, social, marketing and web zones.
const WALL_END = Math.PI - 1.62 + 2.64;
const WALL_START = -0.05;
const WALL_LENGTH = WALL_END - WALL_START;

/** Where the curved studio wall is at a given x (its z coordinate). */
export function wallZ(x: number) {
  const dx = x - WALL_CENTER.x;
  return WALL_CENTER.z - Math.sqrt(WALL_RADIUS * WALL_RADIUS - dx * dx);
}
/** Rotation (around Y) that faces a flat panel on the wall back into the room. */
export function wallYaw(x: number) {
  return Math.atan2(WALL_CENTER.x - x, WALL_CENTER.z - wallZ(x));
}

/**
 * One connected studio: white floor and architectural platforms with soft blue
 * light strips, a curved cyclorama wall, daylight windows by the edit desk,
 * a glass partition between the zones, plants and warm pendant lamps.
 */
export function buildEnvironment(kit: Kit, lowPower: boolean) {
  const { m } = kit;
  const group = new THREE.Group();
  const lights: THREE.Light[] = [];

  const floorMat = kit.std("#eef2f7", 0.38);
  const floor = kit.mesh(new THREE.PlaneGeometry(70, 50), floorMat, group, 3, 0, 4, false);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;

  const platformMat = kit.std("#fbfcfe", 0.42);
  const strip = kit.track(new THREE.MeshBasicMaterial({ color: "#5b95ff" }));

  // Shoot podium with rug and a light ring
  const podium = kit.mesh(new THREE.CylinderGeometry(1.36, 1.39, 0.08, 72), platformMat, group, ZONES.presenter.x, 0.04, ZONES.presenter.z);
  podium.castShadow = false;
  const ring = kit.mesh(new THREE.TorusGeometry(1.375, 0.009, 8, 96), strip, group, ZONES.presenter.x, 0.078, ZONES.presenter.z, false);
  ring.rotation.x = Math.PI / 2;
  const rug = kit.mesh(new THREE.CircleGeometry(0.95, 64), kit.std("#e4e7ec", 0.95), group, ZONES.presenter.x, 0.0815, ZONES.presenter.z, false);
  rug.rotation.x = -Math.PI / 2;

  // Edit platform with a front light strip
  const platform = kit.box(4.2, 0.08, 3.0, 0.03, platformMat, group, ZONES.edit.x, 0.04, ZONES.edit.z);
  platform.castShadow = false;
  kit.mesh(new THREE.BoxGeometry(4.1, 0.012, 0.012), strip, group, ZONES.edit.x, 0.07, ZONES.edit.z + 1.505, false);

  // Long low step linking the zones, so they read as one space
  const step = kit.box(4.6, 0.04, 0.9, 0.015, platformMat, group, 3.0, 0.02, -2.75);
  step.castShadow = false;

  // Design platform (rotated to face the wall) and the social media podium
  const designPlatform = new THREE.Group();
  designPlatform.position.copy(ZONES.design);
  designPlatform.rotation.y = DESIGN_THETA - Math.PI;
  group.add(designPlatform);
  kit.box(3.0, 0.08, 2.6, 0.03, platformMat, designPlatform, 0, 0.04, 0).castShadow = false;
  kit.mesh(new THREE.BoxGeometry(2.9, 0.012, 0.012), strip, designPlatform, 0, 0.07, 1.305, false);
  const socialPodium = kit.mesh(new THREE.CylinderGeometry(1.05, 1.08, 0.08, 64), platformMat, group, ZONES.social.x, 0.04, ZONES.social.z);
  socialPodium.castShadow = false;
  const socialRing = kit.mesh(new THREE.TorusGeometry(1.065, 0.009, 8, 80), strip, group, ZONES.social.x, 0.078, ZONES.social.z, false);
  socialRing.rotation.x = Math.PI / 2;

  // Marketing and web/app platforms, built like the design platform (scenes 5 and 6)
  for (const theta of [MARKETING_THETA, WEB_THETA]) {
    const p = new THREE.Group();
    p.position.copy(ringPoint(theta, 8.4));
    p.rotation.y = theta - Math.PI;
    group.add(p);
    kit.box(3.0, 0.08, 2.6, 0.03, platformMat, p, 0, 0.04, 0).castShadow = false;
    kit.mesh(new THREE.BoxGeometry(2.9, 0.012, 0.012), strip, p, 0, 0.07, 1.305, false);
  }

  // Low storage unit between the social corner and the marketing desk: the camera skims past it
  // in the social → marketing transition, so the move reads as travelling through one studio.
  const unit = new THREE.Group();
  unit.position.copy(ringPoint(1.5, 7.55));
  unit.rotation.y = 1.5 - Math.PI; // long side along the ring, doors facing into the room
  group.add(unit);
  kit.box(1.2, 0.72, 0.36, 0.02, m.white, unit, 0, 0.36, 0);
  kit.box(1.22, 0.03, 0.38, 0.01, m.lightWood, unit, 0, 0.735, 0);
  for (const x of [-0.3, 0.3]) kit.box(0.56, 0.3, 0.005, 0, kit.std("#e3e9f1", 0.5), unit, x, 0.36, 0.181);
  kit.box(0.08, 0.2, 0.15, 0.01, kit.std("#2563eb", 0.6), unit, -0.45, 0.85, 0);
  kit.box(0.06, 0.17, 0.14, 0.01, kit.std("#dbe7f7", 0.6), unit, -0.37, 0.835, 0);
  kit.mesh(new THREE.SphereGeometry(0.05, 20, 14), m.white, unit, -0.1, 0.8, 0.03);
  const unitPlant = buildPlant(kit, 47, "bush", 0.5);
  unitPlant.scale.setScalar(0.7);
  unitPlant.position.set(0.36, 0.75, 0);
  unit.add(unitPlant);

  // Framed growth print on the wall behind the marketing desk
  const print = new THREE.Group();
  print.position.copy(ringPoint(MARKETING_THETA - 0.16, 9.93)).setY(2.0);
  print.rotation.y = MARKETING_THETA - 0.16 - Math.PI;
  group.add(print);
  kit.box(0.92, 0.62, 0.03, 0.008, m.white, print, 0, 0, -0.015);
  const art = document.createElement("canvas");
  art.width = 368;
  art.height = 240;
  const ax = art.getContext("2d")!;
  ax.fillStyle = "#eef4ff";
  ax.fillRect(0, 0, 368, 240);
  ["#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"].forEach((c, i) => {
    ax.fillStyle = c;
    ax.fillRect(48 + i * 58, 196 - (i + 1) * 30, 40, (i + 1) * 30);
  });
  ax.strokeStyle = "#f5b301";
  ax.lineWidth = 6;
  ax.beginPath();
  ax.moveTo(40, 170);
  ax.bezierCurveTo(140, 160, 220, 110, 330, 40);
  ax.stroke();
  const artTex = kit.track(new THREE.CanvasTexture(art));
  artTex.colorSpace = THREE.SRGBColorSpace;
  kit.mesh(new THREE.PlaneGeometry(0.86, 0.56), kit.track(new THREE.MeshBasicMaterial({ map: artTex, toneMapped: false })), print, 0, 0, 0.002, false);

  // Curved cyclorama wall with a blue light line at its base
  const wallMat = kit.std("#e6ecf4", 0.92);
  wallMat.side = THREE.BackSide;
  const wall = kit.mesh(
    new THREE.CylinderGeometry(WALL_RADIUS, WALL_RADIUS, 4.6, 150, 1, true, WALL_START, WALL_LENGTH),
    wallMat, group, WALL_CENTER.x, 2.3, WALL_CENTER.z, false,
  );
  wall.receiveShadow = true;
  // A soft skirting shade where the wall meets the floor, so the curve reads as a wall
  const skirt = kit.std("#d7dfea", 0.95);
  skirt.side = THREE.BackSide;
  kit.mesh(new THREE.CylinderGeometry(WALL_RADIUS - 0.01, WALL_RADIUS - 0.01, 0.16, 150, 1, true, WALL_START, WALL_LENGTH), skirt, group, WALL_CENTER.x, 0.08, WALL_CENTER.z, false);

  // Daylight windows on the edit side of the wall
  const daylight = kit.track(new THREE.MeshBasicMaterial({ color: "#eaf3ff" }));
  for (let x = 8.7; x <= 11.2; x += 0.85) {
    const pane = kit.mesh(new THREE.PlaneGeometry(0.78, 3.0), daylight, group, x, 1.85, wallZ(x) + 0.03, false);
    pane.rotation.y = wallYaw(x);
    const mullion = kit.box(0.05, 3.1, 0.05, 0, m.offWhite, group, x + 0.41, 1.85, wallZ(x + 0.41) + 0.05);
    mullion.rotation.y = wallYaw(x);
  }

  // The daylight band continues round behind the social corner (scene 4)
  for (let theta = 1.98; theta > 1.45; theta -= 0.095) {
    const pane = kit.mesh(new THREE.PlaneGeometry(0.78, 3.0), daylight, group, 0, 1.85, 0, false);
    pane.position.copy(ringPoint(theta, 9.97)).setY(1.85);
    pane.rotation.y = theta - Math.PI;
    const mullion = kit.box(0.05, 3.1, 0.05, 0, m.offWhite, group);
    mullion.position.copy(ringPoint(theta - 0.0475, 9.95)).setY(1.85);
    mullion.rotation.y = theta - Math.PI;
  }

  // Glass partition between the zones
  const partition = new THREE.Group();
  partition.position.set(3.65, 0, -2.25);
  partition.rotation.y = 0.12;
  group.add(partition);
  // Slim aluminium frame and a frosted band so it reads as architectural glass
  const alu = kit.std("#c9d2de", 0.35, 0.7);
  kit.mesh(new THREE.BoxGeometry(0.015, 2.3, 1.8), m.glass, partition, 0, 1.15 + 0.04, 0, false);
  const frost = kit.track(new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.9, transparent: true, opacity: 0.45, depthWrite: false }));
  kit.mesh(new THREE.BoxGeometry(0.017, 0.16, 1.8), frost, partition, 0, 1.1, 0, false);
  kit.box(0.025, 0.025, 1.82, 0, alu, partition, 0, 2.34, 0);
  kit.box(0.03, 0.04, 1.82, 0, alu, partition, 0, 0.04, 0);
  kit.box(0.025, 2.3, 0.025, 0, alu, partition, 0, 1.19, 0.9);
  kit.box(0.025, 2.3, 0.025, 0, alu, partition, 0, 1.19, -0.9);

  // Framed Prova Media sign behind the editor (kept out of the client's UGC footage)
  const signX = 6.75;
  const sign = new THREE.Group();
  sign.position.set(signX, 2.05, wallZ(signX) + 0.06);
  sign.rotation.y = wallYaw(signX);
  group.add(sign);
  kit.box(1.04, 1.04, 0.04, 0.01, m.white, sign, 0, 0, -0.02);
  const logoMat = kit.track(new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true }));
  kit.mesh(new THREE.PlaneGeometry(0.96, 0.96), logoMat, sign, 0, 0, 0.002, false);
  new THREE.TextureLoader().load("/logo.png", (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    logoMat.map = kit.track(tex);
    logoMat.needsUpdate = true;
  });

  // Floating shelf with a few objects behind the presenter's right
  const shelfX = -1.55;
  const shelf = new THREE.Group();
  shelf.position.set(shelfX, 1.55, wallZ(shelfX) + 0.14);
  shelf.rotation.y = wallYaw(shelfX);
  group.add(shelf);
  kit.box(1.1, 0.03, 0.22, 0.008, m.lightWood, shelf);
  kit.box(0.09, 0.22, 0.16, 0.01, kit.std("#2563eb", 0.6), shelf, -0.38, 0.125, 0);
  kit.box(0.06, 0.18, 0.15, 0.01, kit.std("#dbe7f7", 0.6), shelf, -0.3, 0.105, 0);
  kit.mesh(new THREE.SphereGeometry(0.06, 20, 14), m.white, shelf, 0.05, 0.075, 0);
  kit.mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.12, 18), m.pot, shelf, 0.35, 0.075, 0);

  // Plants
  const plants: [number, number, "tall" | "bush", number, number][] = [
    [-2.55, -2.3, "tall", 1.75, 3],
    [1.9, -2.85, "bush", 0.95, 5],
    [-0.9, -3.05, "bush", 0.75, 7],
    [9.25, -1.45, "tall", 1.85, 11],
    [4.85, -2.55, "bush", 0.9, 13],
    [3.95, 2.55, "tall", 1.55, 17],
    // Design and social zones
    [ringPoint(2.02, 9.3).x, ringPoint(2.02, 9.3).z, "bush", 1.0, 23], // low, so it never blocks the scene 4 reveal
    [ringPoint(2.42, 9.2).x, ringPoint(2.42, 9.2).z, "bush", 0.85, 41],
    [ringPoint(1.52, 9.2).x, ringPoint(1.52, 9.2).z, "bush", 0.95, 43],
    // Marketing and web zones
    [ringPoint(1.08, 9.55).x, ringPoint(1.08, 9.55).z, "tall", 1.8, 53],
    [ringPoint(0.55, 9.2).x, ringPoint(0.55, 9.2).z, "bush", 0.9, 59],
  ];
  for (const [x, z, kind, h, seed] of plants) {
    const p = buildPlant(kit, seed, kind, h);
    p.position.set(x, 0, z);
    group.add(p);
  }

  // Foreground light stand that the camera passes on its way to the edit desk
  const led = buildLedStand(kit);
  led.position.set(3.45, 0, 2.1);
  group.add(led);

  // Warm pendant lamps over the edit desk
  const shade = kit.std("#1d2128", 0.5, 0.3);
  shade.side = THREE.DoubleSide;
  const bulb = kit.track(new THREE.MeshBasicMaterial({ color: "#ffe2b0" }));
  for (const x of [6.65, 7.55]) {
    kit.rod(new THREE.Vector3(x, 4.6, -1.7), new THREE.Vector3(x, 2.42, -1.7), 0.004, m.black, group);
    kit.mesh(new THREE.SphereGeometry(0.14, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), shade, group, x, 2.28, -1.7);
    kit.mesh(new THREE.SphereGeometry(0.04, 12, 10), bulb, group, x, 2.27, -1.7, false);
  }
  const pendant = new THREE.PointLight("#ffd9a3", lowPower ? 5 : 7, 6, 2);
  pendant.position.set(7.1, 2.15, -1.7);
  lights.push(pendant);

  // Daylight + sky fill
  const hemi = new THREE.HemisphereLight("#eaf2ff", "#efe4d6", 0.62);
  lights.push(hemi);
  const sun = new THREE.DirectionalLight("#f2f7ff", 2.4);
  sun.position.set(13, 9, 5);
  sun.target.position.set(5.5, 0, 0.6);
  if (!lowPower) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 8;
    sun.shadow.camera.bottom = -8;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 40;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
  }
  lights.push(sun);
  group.add(sun.target);

  // The sun can't reach the inside of the wall round the social, marketing and web zones, so a soft,
  // shadowless daylight fill from the middle of the room lights them (its cone stops short of scenes 1–3)
  const fill = new THREE.SpotLight("#f3f7ff", lowPower ? 26 : 30, 16, 0.72, 0.65, 1);
  fill.position.set(4.6, 5.2, 8.4);
  fill.target.position.copy(ringPoint(1.25, 9.4)).setY(0.9);
  lights.push(fill);
  group.add(fill.target);

  return { group, lights };
}
