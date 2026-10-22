import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mulberry32 } from "./math";

/**
 * PROXY CHARACTER RIG — a procedurally built, jointed stand-in for the final characters.
 * It has a real joint hierarchy (hips → spine → chest → neck → head, arms, legs, fingers),
 * two-bone arm IK and simple facial controls, so all choreography is written against named
 * joints and world-space targets. Final Blender/GLB characters can replace the meshes by
 * mapping their skeleton onto the same joint names (see docs/3d-studio-hero.md).
 */

export type Side = "L" | "R";

export type Appearance = {
  /** 1 = 1.79 m adult male */
  scale: number;
  build: "male" | "female";
  skin: string;
  hair: "curly" | "curlyLong" | "quiff" | "short" | "long" | "ponytail";
  hairColor: string;
  beard?: "full" | "chin" | "stubble";
  glasses?: boolean;
  /** Frame shape when `glasses` is set (default thin rectangular) */
  glassesStyle?: "rect" | "round";
  watch?: boolean;
  shirt: string;
  /** Small abstract white chest emblem (the team T-shirt mark) */
  emblem?: boolean;
  pants: string;
  shoes: string;
  lips?: string;
  iris?: string;
  seed: number;
};

type JointName =
  | "hips" | "spine" | "chest" | "neck" | "head"
  | "shoulderL" | "shoulderR" | "upperArmL" | "upperArmR" | "forearmL" | "forearmR"
  | "handL" | "handR" | "fingersL" | "fingersR" | "thumbL" | "thumbR"
  | "thighL" | "thighR" | "shinL" | "shinR" | "footL" | "footR";

export type ArmGoal = {
  /** Wrist target in world space */
  target: THREE.Vector3;
  /** A world point the elbow bends towards */
  pole: THREE.Vector3;
  /** World direction the palm should face */
  palm: THREE.Vector3;
  /** 0 = open hand, 1 = fist / firm grip */
  curl: number;
  /** Wrist bend in radians (positive bends the hand back) */
  wrist?: number;
  /** "grip" wraps the thumb, "up" is a thumbs-up, "rest" is relaxed */
  thumb?: "grip" | "up" | "rest";
};

const HIPS_Y = 0.94;
const UPPER = 0.285;
const FORE = 0.255;

let emblemTexture: THREE.CanvasTexture | null = null;
function emblem() {
  if (emblemTexture) return emblemTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  x.fillStyle = "#ffffff";
  x.translate(32, 32);
  x.rotate(Math.PI / 4);
  for (const [dx, dy] of [[-11, -11], [3, -11], [-11, 3], [3, 3]]) x.fillRect(dx, dy, 8, 8);
  emblemTexture = new THREE.CanvasTexture(c);
  emblemTexture.colorSpace = THREE.SRGBColorSpace;
  return emblemTexture;
}

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _qp = new THREE.Quaternion();

export class Humanoid {
  readonly root = new THREE.Group();
  readonly joints = {} as Record<JointName, THREE.Object3D>;
  private readonly look: Appearance;
  private readonly lids: THREE.Object3D[] = [];
  private mouth!: THREE.Mesh;
  private mouthOpen!: THREE.Mesh;
  private readonly brows: THREE.Mesh[] = [];
  private readonly disposables: { dispose(): void }[] = [];
  private readonly mats: Record<string, THREE.MeshStandardMaterial> = {};

  constructor(look: Appearance) {
    this.look = look;
    this.root.scale.setScalar(look.scale);
    this.build();
  }

  // ---------- construction ----------

  private mat(key: string, color: string, roughness = 0.8, extra: THREE.MeshStandardMaterialParameters = {}) {
    if (!this.mats[key]) {
      this.mats[key] = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
      this.disposables.push(this.mats[key]);
    }
    return this.mats[key];
  }

  private mesh(geo: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0, shadow = true) {
    this.disposables.push(geo);
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    m.castShadow = shadow;
    m.receiveShadow = shadow;
    parent.add(m);
    return m;
  }

  private joint(name: JointName, parent: THREE.Object3D, x: number, y: number, z: number) {
    const j = new THREE.Group();
    j.name = name;
    j.position.set(x, y, z);
    parent.add(j);
    this.joints[name] = j;
    return j;
  }

  private build() {
    const L = this.look;
    const female = L.build === "female";
    const skin = this.mat("skin", L.skin, 0.55);
    const shirt = this.mat("shirt", L.shirt, 0.88);
    const pants = this.mat("pants", L.pants, 0.9);
    const shoe = this.mat("shoe", L.shoes, 0.6);
    const sole = this.mat("sole", "#d9dde3", 0.7);

    const hips = this.joint("hips", this.root, 0, HIPS_Y, 0);
    const spine = this.joint("spine", hips, 0, 0.08, 0);
    const chest = this.joint("chest", spine, 0, 0.2, 0);
    const neck = this.joint("neck", chest, 0, 0.25, 0);
    const head = this.joint("head", neck, 0, 0.075, 0);
    neck.rotation.order = "YXZ";
    head.rotation.order = "YXZ";

    // Torso
    this.mesh(new RoundedBoxGeometry(female ? 0.32 : 0.3, 0.17, 0.2, 4, 0.07), pants, hips, 0, -0.01, 0);
    const waist = female ? 0.9 : 1;
    const abdomen = this.mesh(
      new THREE.LatheGeometry(
        [[0.148, -0.09], [0.152, 0], [0.15, 0.1], [0.155, 0.2], [0.16, 0.25]].map(([r, y]) => new THREE.Vector2(r * waist, y)),
        28,
      ),
      shirt, spine, 0, 0, 0,
    );
    abdomen.scale.z = 0.66;
    const chestMesh = this.mesh(
      new THREE.LatheGeometry(
        [[0.158, -0.03], [0.168, 0.06], [0.178, 0.14], [0.172, 0.2], [0.15, 0.235], [0.1, 0.258], [0.052, 0.266]].map(
          ([r, y]) => new THREE.Vector2(r * (female ? 0.9 : 1), y),
        ),
        28,
      ),
      shirt, chest, 0, 0, 0,
    );
    chestMesh.scale.z = 0.64;
    if (female) {
      for (const s of [-1, 1]) this.mesh(new THREE.SphereGeometry(0.05, 16, 12), shirt, chest, s * 0.056, 0.12, 0.07).scale.set(1, 0.9, 0.72);
    }
    const shoulderX = female ? 0.148 : 0.165;
    for (const s of [-1, 1]) this.mesh(new THREE.SphereGeometry(0.062, 16, 12), shirt, chest, s * shoulderX, 0.2, 0);
    const collar = this.mesh(new THREE.TorusGeometry(0.052, 0.011, 8, 24), shirt, chest, 0, 0.258, 0.004);
    collar.rotation.x = Math.PI / 2;
    if (L.emblem) {
      const e = this.mesh(
        new THREE.PlaneGeometry(0.038, 0.038),
        new THREE.MeshStandardMaterial({ map: emblem(), transparent: true, roughness: 0.7 }),
        chest, 0.075, 0.155, 0.1135, false,
      );
      this.disposables.push(e.material as THREE.Material);
    }
    this.mesh(new THREE.CylinderGeometry(0.044, 0.05, 0.12, 16), skin, neck, 0, 0.04, 0);

    // Arms
    for (const side of ["L", "R"] as const) {
      const s = side === "L" ? 1 : -1;
      const shoulder = this.joint(`shoulder${side}`, chest, s * shoulderX, 0.205, 0);
      const upper = this.joint(`upperArm${side}`, shoulder, s * 0.03, -0.005, 0);
      this.mesh(new THREE.CylinderGeometry(0.063, 0.057, 0.15, 18), shirt, upper, 0, -0.06, 0);
      this.mesh(new THREE.CapsuleGeometry(female ? 0.035 : 0.039, UPPER - 0.078, 6, 14), skin, upper, 0, -UPPER / 2, 0);
      const fore = this.joint(`forearm${side}`, upper, 0, -UPPER, 0);
      this.mesh(new THREE.SphereGeometry(female ? 0.035 : 0.039, 14, 12), skin, fore); // elbow fill
      this.mesh(new THREE.CapsuleGeometry(female ? 0.031 : 0.035, FORE - 0.07, 6, 14), skin, fore, 0, -FORE / 2, 0);
      if (L.watch && side === "L") {
        const band = this.mat("watch", "#14171c", 0.5);
        this.mesh(new THREE.CylinderGeometry(0.039, 0.039, 0.024, 16), band, fore, 0, -FORE + 0.045, 0);
        this.mesh(new RoundedBoxGeometry(0.03, 0.036, 0.012, 2, 0.004), band, fore, 0, -FORE + 0.045, -0.04);
      }
      const hand = this.joint(`hand${side}`, fore, 0, -FORE, 0);
      this.mesh(new RoundedBoxGeometry(0.078, 0.085, 0.03, 3, 0.012), skin, hand, 0, -0.042, 0);
      const fingers = this.joint(`fingers${side}`, hand, 0, -0.08, 0.002);
      this.mesh(new RoundedBoxGeometry(0.074, 0.078, 0.024, 3, 0.011), skin, fingers, 0, -0.035, 0);
      const thumb = this.joint(`thumb${side}`, hand, s * 0.04, -0.02, 0.01);
      this.mesh(new THREE.CapsuleGeometry(0.0135, 0.032, 4, 10), skin, thumb, 0, -0.026, 0);
    }

    // Legs
    for (const side of ["L", "R"] as const) {
      const s = side === "L" ? 1 : -1;
      const thigh = this.joint(`thigh${side}`, hips, s * 0.088, -0.03, 0);
      this.mesh(new THREE.CapsuleGeometry(0.074, 0.43 - 0.148, 6, 16), pants, thigh, 0, -0.215, 0);
      const shin = this.joint(`shin${side}`, thigh, 0, -0.43, 0);
      this.mesh(new THREE.SphereGeometry(0.068, 16, 12), pants, shin); // knee fill
      this.mesh(new THREE.CapsuleGeometry(0.058, 0.42 - 0.116, 6, 16), pants, shin, 0, -0.21, 0);
      const foot = this.joint(`foot${side}`, shin, 0, -0.42, 0);
      this.mesh(new RoundedBoxGeometry(0.105, 0.09, 0.27, 3, 0.035), shoe, foot, 0, -0.03, 0.06);
      this.mesh(new RoundedBoxGeometry(0.11, 0.024, 0.278, 2, 0.01), sole, foot, 0, -0.068, 0.06);
    }

    this.buildHead(head);
  }

  private buildHead(head: THREE.Object3D) {
    const L = this.look;
    const female = L.build === "female";
    const skin = this.mat("skin", L.skin, 0.55);
    const hair = this.mat("hair", L.hairColor, 0.85);
    const cy = 0.11;

    const skull = this.mesh(new THREE.SphereGeometry(0.118, 36, 28), skin, head, 0, cy, 0);
    skull.scale.set(female ? 0.96 : 1, 1.1, 1.04);
    const jaw = this.mesh(new THREE.SphereGeometry(0.098, 28, 20), skin, head, 0, 0.056, 0.018);
    jaw.scale.set(female ? 0.92 : 1, 0.82, 1);
    for (const s of [-1, 1]) {
      const ear = this.mesh(new THREE.SphereGeometry(0.028, 12, 10), skin, head, s * 0.117, 0.1, -0.006);
      ear.scale.set(0.42, 1, 0.72);
    }
    const nose = this.mesh(new THREE.SphereGeometry(female ? 0.016 : 0.019, 14, 12), skin, head, 0, 0.086, 0.12);
    nose.scale.set(0.85, 0.95, 1.15);

    // Eyes with blinking lids
    const white = this.mat("eyeWhite", "#f7f5f2", 0.3);
    const iris = this.mat("iris", L.iris ?? "#3b2417", 0.3);
    const dark = this.mat("pupil", "#0d0b0a", 0.25);
    const shine = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    this.disposables.push(shine);
    for (const s of [-1, 1]) {
      const eye = new THREE.Group();
      eye.position.set(s * 0.042, 0.118, 0.098);
      head.add(eye);
      this.mesh(new THREE.SphereGeometry(0.021, 18, 14), white, eye, 0, 0, 0, false);
      this.mesh(new THREE.SphereGeometry(0.0125, 14, 12), iris, eye, 0, 0, 0.0115, false);
      this.mesh(new THREE.SphereGeometry(0.0066, 10, 8), dark, eye, 0, 0, 0.0175, false);
      this.mesh(new THREE.SphereGeometry(0.0034, 8, 6), shine, eye, 0.004, 0.005, 0.0205, false);
      const lid = new THREE.Group();
      eye.add(lid);
      this.mesh(new THREE.SphereGeometry(0.0228, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), skin, lid, 0, 0, 0, false);
      if (female) {
        const lash = this.mesh(new RoundedBoxGeometry(0.04, 0.004, 0.006, 1, 0.002), dark, lid, 0, 0.0005, 0.02, false);
        lash.rotation.x = 0.2;
      }
      this.lids.push(lid);
      const brow = this.mesh(new RoundedBoxGeometry(0.042, 0.0095, 0.012, 2, 0.004), hair, head, s * 0.045, 0.158, 0.108, false);
      brow.rotation.z = -s * 0.08;
      this.brows.push(brow);
    }

    // Mouth: a smile arc plus a small opening for silent "speaking"
    const mouthZ = L.beard === "full" ? 0.126 : 0.108;
    const lipColor = L.lips ?? "#6e2b26";
    this.mouth = this.mesh(new THREE.TorusGeometry(0.024, female ? 0.0058 : 0.0048, 8, 20, Math.PI), this.mat("lips", lipColor, 0.5), head, 0, 0.05, mouthZ, false);
    this.mouth.rotation.z = Math.PI;
    this.mouthOpen = this.mesh(new THREE.SphereGeometry(0.015, 14, 10), this.mat("mouthIn", "#3a1414", 0.6), head, 0, 0.046, mouthZ - 0.006, false);
    this.mouthOpen.scale.set(1.3, 0.01, 0.5);

    // Facial hair
    if (L.beard === "full") {
      const beard = this.mesh(
        new THREE.SphereGeometry(0.106, 30, 20, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58),
        hair, head, 0, 0.066, 0.016,
      );
      beard.scale.set(1.04, 1.02, 1.08);
      const moustache = this.mesh(new THREE.CapsuleGeometry(0.0085, 0.04, 4, 8), hair, head, 0, 0.066, mouthZ + 0.004, false);
      moustache.rotation.z = Math.PI / 2;
    } else if (L.beard === "stubble") {
      const shadowMat = new THREE.MeshStandardMaterial({ color: L.hairColor, roughness: 1, transparent: true, opacity: 0.32, depthWrite: false });
      this.disposables.push(shadowMat);
      const stubble = this.mesh(
        new THREE.SphereGeometry(0.1, 28, 18, 0, Math.PI * 2, Math.PI * 0.48, Math.PI * 0.5),
        shadowMat, head, 0, 0.064, 0.018, false,
      );
      stubble.scale.set(1.0, 0.98, 1.03);
    } else if (L.beard === "chin") {
      const chin = this.mesh(new THREE.SphereGeometry(0.028, 16, 12), hair, head, 0, 0.012, 0.096, false);
      chin.scale.set(1, 0.75, 0.7);
      const moustache = this.mesh(new THREE.CapsuleGeometry(0.0045, 0.036, 4, 8), hair, head, 0, 0.068, 0.114, false);
      moustache.rotation.z = Math.PI / 2;
    }

    // Hair
    const cap = (tilt: number, length: number, scale = 1.03) => {
      const g = new THREE.Group();
      g.position.set(0, cy, 0);
      g.rotation.x = tilt;
      head.add(g);
      const m = this.mesh(new THREE.SphereGeometry(0.121, 32, 18, 0, Math.PI * 2, 0, length), hair, g);
      m.scale.set(scale, 1.09 * scale, 1.05 * scale);
      return g;
    };
    if (L.hair === "curly" || L.hair === "curlyLong") {
      const long = L.hair === "curlyLong";
      cap(-0.42, 1.62, 1.0);
      const rand = mulberry32(L.seed);
      const geo = new THREE.SphereGeometry(1, 10, 8);
      this.disposables.push(geo);
      const count = long ? 300 : 190;
      const curls = new THREE.InstancedMesh(geo, hair, count);
      curls.castShadow = true;
      const dummy = new THREE.Object3D();
      let n = 0;
      while (n < count) {
        const u = rand() * 2 - 1;
        const phi = rand() * Math.PI * 2;
        const r = Math.sqrt(1 - u * u);
        const d = _v1.set(r * Math.cos(phi), u, r * Math.sin(phi));
        // Long curls fall to the shoulders at the back and sides
        const lowest = long ? (d.z < 0.2 ? -0.95 : -0.35) : -0.08;
        if (d.y < lowest) continue;
        if (d.z > 0.45 && d.y < 0.5) continue; // keep the face and forehead clear
        if (!long && Math.abs(d.x) > 0.75 && d.y < 0.25) continue; // and the ears
        const size = (long ? 0.036 : 0.032) + rand() * (long ? 0.02 : 0.016) + (d.y > 0.7 ? 0.008 : 0);
        const drop = long && d.y < 0 ? d.y * 0.14 : 0;
        const spread = long && d.y < 0 ? 1.18 : 1;
        dummy.position.set(d.x * 0.124 * spread, cy + d.y * 0.142 + 0.012 + drop, d.z * 0.128 * spread);
        dummy.scale.setScalar(size);
        dummy.updateMatrix();
        curls.setMatrixAt(n++, dummy.matrix);
      }
      head.add(curls);
    } else if (L.hair === "short") {
      // Neat short cut with a soft side parting
      cap(-0.55, 1.6, 1.035);
      const top = this.mesh(new THREE.SphereGeometry(0.085, 20, 14), hair, head, -0.005, 0.222, 0.0);
      top.scale.set(1.3, 0.5, 1.2);
      const part = this.mesh(new THREE.SphereGeometry(0.05, 16, 12), hair, head, 0.028, 0.212, 0.082);
      part.scale.set(1.55, 0.55, 1);
      part.rotation.z = -0.28;
    } else if (L.hair === "ponytail") {
      // Hair pulled back into a high ponytail, with a soft side-swept fringe
      cap(-0.5, 1.66, 1.035);
      const fringe = this.mesh(new THREE.SphereGeometry(0.06, 18, 12), hair, head, 0.03, 0.214, 0.08);
      fringe.scale.set(1.5, 0.55, 1);
      fringe.rotation.z = -0.25;
      for (const s of [-1, 1]) {
        const side = this.mesh(new THREE.SphereGeometry(0.05, 14, 10), hair, head, s * 0.1, 0.12, -0.02);
        side.scale.set(0.5, 1.15, 1.05);
      }
      const tie = this.mesh(new THREE.TorusGeometry(0.022, 0.009, 8, 18), this.mat("hairTie", "#1f47d6", 0.6), head, 0, 0.19, -0.118);
      tie.rotation.x = 1.0;
      const tail = this.mesh(new THREE.CapsuleGeometry(0.036, 0.2, 6, 12), hair, head, 0, 0.055, -0.17);
      tail.rotation.x = 0.32;
      tail.scale.set(1.15, 1, 0.8);
      const tip = this.mesh(new THREE.SphereGeometry(0.03, 12, 10), hair, head, 0, -0.07, -0.205);
      tip.scale.set(1.1, 1.4, 0.8);
    } else if (L.hair === "quiff") {
      cap(-0.5, 1.65, 1.02);
      const quiff = this.mesh(new THREE.SphereGeometry(0.075, 20, 14), hair, head, 0, 0.232, 0.03);
      quiff.scale.set(1.28, 0.72, 1.22);
      quiff.rotation.x = -0.25;
      const lift = this.mesh(new THREE.SphereGeometry(0.05, 16, 12), hair, head, 0, 0.246, 0.086);
      lift.scale.set(1.45, 0.82, 1);
    } else {
      cap(-0.62, 1.7, 1.035);
      const fringe = this.mesh(new THREE.SphereGeometry(0.06, 18, 12), hair, head, -0.032, 0.212, 0.078);
      fringe.scale.set(1.55, 0.6, 1);
      fringe.rotation.z = 0.22;
      const back = this.mesh(new THREE.CapsuleGeometry(0.104, 0.22, 8, 18), hair, head, 0, -0.005, -0.058);
      back.scale.set(1.12, 1, 0.62);
      for (const s of [-1, 1]) {
        const strand = this.mesh(new THREE.CapsuleGeometry(0.04, 0.2, 6, 12), hair, head, s * 0.104, -0.02, 0.02);
        strand.rotation.z = s * 0.08;
        strand.rotation.x = -0.1;
        const wave = this.mesh(new THREE.SphereGeometry(0.045, 12, 10), hair, head, s * 0.112, -0.135, 0.03);
        wave.scale.set(1, 0.8, 0.8);
      }
    }

    if (L.glasses && L.glassesStyle === "round") {
      // Round tortoiseshell frames
      const frame = this.mat("glasses", "#3b2a1e", 0.4);
      const lens = new THREE.MeshStandardMaterial({ color: "#dbeafe", transparent: true, opacity: 0.16, roughness: 0.05 });
      this.disposables.push(lens);
      for (const s of [-1, 1]) {
        const rim = this.mesh(new THREE.TorusGeometry(0.025, 0.0032, 8, 28), frame, head, s * 0.045, 0.118, 0.128, false);
        rim.scale.set(1, 0.92, 1);
        this.mesh(new THREE.CircleGeometry(0.024, 24), lens, head, s * 0.045, 0.118, 0.1275, false);
        const temple = this.mesh(new THREE.BoxGeometry(0.0035, 0.0035, 0.12), frame, head, s * 0.074, 0.122, 0.07, false);
        temple.rotation.y = s * 0.28;
      }
      this.mesh(new THREE.BoxGeometry(0.022, 0.0035, 0.004), frame, head, 0, 0.125, 0.13, false);
    } else if (L.glasses) {
      const metal = this.mat("glasses", "#2b3038", 0.35, { metalness: 0.6 });
      const lens = new THREE.MeshStandardMaterial({ color: "#dbeafe", transparent: true, opacity: 0.16, roughness: 0.05 });
      this.disposables.push(lens);
      for (const s of [-1, 1]) {
        const f = new THREE.Group();
        f.position.set(s * 0.045, 0.118, 0.128);
        head.add(f);
        this.mesh(new THREE.BoxGeometry(0.054, 0.0035, 0.004), metal, f, 0, 0.018, 0, false);
        this.mesh(new THREE.BoxGeometry(0.054, 0.0035, 0.004), metal, f, 0, -0.018, 0, false);
        this.mesh(new THREE.BoxGeometry(0.0035, 0.036, 0.004), metal, f, -0.027, 0, 0, false);
        this.mesh(new THREE.BoxGeometry(0.0035, 0.036, 0.004), metal, f, 0.027, 0, 0, false);
        this.mesh(new THREE.PlaneGeometry(0.052, 0.034), lens, f, 0, 0, 0, false);
        const temple = this.mesh(new THREE.BoxGeometry(0.003, 0.003, 0.12), metal, head, s * 0.074, 0.122, 0.07, false);
        temple.rotation.y = s * 0.28;
      }
      this.mesh(new THREE.BoxGeometry(0.02, 0.003, 0.004), metal, head, 0, 0.124, 0.13, false);
    }
  }

  // ---------- posing ----------

  /** Clears last frame's pose; call before applying a new one. */
  resetPose() {
    for (const j of Object.values(this.joints)) j.quaternion.identity();
    this.joints.hips.position.set(0, HIPS_Y, 0);
  }

  /** Lean (x), twist (y) and side bend (z), shared between the spine and chest. */
  setTorso(lean: number, twist = 0, side = 0) {
    this.joints.spine.rotation.set(lean * 0.45, twist * 0.4, side * 0.5);
    this.joints.chest.rotation.set(lean * 0.55, twist * 0.6, side * 0.5);
  }

  /** Hip and knee flexion; sitting is roughly (1.5, 1.5). Feet stay level. */
  setLegs(hipFlex: number, kneeFlex: number, spread = 0.06, side?: Side) {
    for (const s of ["L", "R"] as const) {
      if (side && side !== s) continue;
      const sign = s === "L" ? 1 : -1;
      this.joints[`thigh${s}`].rotation.set(-hipFlex, 0, sign * spread);
      this.joints[`shin${s}`].rotation.set(kneeFlex, 0, 0);
      this.joints[`foot${s}`].rotation.set(hipFlex - kneeFlex, 0, -sign * spread);
    }
  }

  /** Small idle overlay: breathing through the chest and shoulders. */
  breathe(time: number, amount = 1) {
    const b = Math.sin(time * 1.6) * amount;
    this.joints.chest.rotation.x -= b * 0.012;
    this.joints.shoulderL.rotation.z += b * 0.01;
    this.joints.shoulderR.rotation.z -= b * 0.01;
  }

  /** Turns the neck and head towards a world point (clamped to a comfortable range). */
  lookAt(target: THREE.Vector3, weight = 1) {
    this.root.updateMatrixWorld(true);
    const head = this.joints.head;
    const eye = head.localToWorld(_v1.set(0, 0.118, 0.05));
    const dir = _v2.copy(target).sub(eye);
    this.joints.chest.getWorldQuaternion(_q).invert();
    dir.applyQuaternion(_q);
    const yaw = THREE.MathUtils.clamp(Math.atan2(dir.x, dir.z), -1.15, 1.15) * weight;
    const pitch = THREE.MathUtils.clamp(-Math.atan2(dir.y, Math.hypot(dir.x, dir.z)), -0.55, 0.65) * weight;
    this.joints.neck.rotation.set(pitch * 0.35, yaw * 0.35, 0);
    head.rotation.set(pitch * 0.65, yaw * 0.65, 0);
  }

  /** Points `bone` (whose length runs along local −Y) along `dir`, with local +Z towards `hint`. */
  private aimBone(bone: THREE.Object3D, dir: THREE.Vector3, hint: THREE.Vector3) {
    _y.copy(dir).normalize().negate();
    _z.copy(hint).addScaledVector(_y, -hint.dot(_y));
    if (_z.lengthSq() < 1e-6) _z.set(0, 0, 1).addScaledVector(_y, -_y.z);
    _z.normalize();
    _x.crossVectors(_y, _z);
    _m.makeBasis(_x, _y, _z);
    _q.setFromRotationMatrix(_m);
    bone.parent!.getWorldQuaternion(_qp).invert();
    bone.quaternion.copy(_qp.multiply(_q));
    bone.updateMatrixWorld(true);
  }

  /** Two-bone IK: places the wrist on `goal.target` with the elbow bending towards `goal.pole`. */
  solveArm(side: Side, goal: ArmGoal) {
    const scale = this.root.scale.x;
    const a = UPPER * scale;
    const b = FORE * scale;
    const upper = this.joints[`upperArm${side}`];
    const fore = this.joints[`forearm${side}`];
    upper.parent!.updateMatrixWorld(true);
    const S = upper.getWorldPosition(_v1);
    const toT = _v2.copy(goal.target).sub(S);
    const dist = THREE.MathUtils.clamp(toT.length(), Math.abs(a - b) + 1e-3, a + b - 1e-3);
    const u = toT.normalize();
    const along = (a * a - b * b + dist * dist) / (2 * dist);
    const h = Math.sqrt(Math.max(a * a - along * along, 0));
    const pole = _v3.copy(goal.pole).sub(S);
    pole.addScaledVector(u, -pole.dot(u));
    if (pole.lengthSq() < 1e-6) pole.set(0, -1, 0);
    pole.normalize();
    const elbow = new THREE.Vector3().copy(S).addScaledVector(u, along).addScaledVector(pole, h);
    const wrist = new THREE.Vector3().copy(S).addScaledVector(u, dist);
    this.aimBone(upper, elbow.clone().sub(S), pole);
    this.aimBone(fore, wrist.clone().sub(elbow), goal.palm);
    const s = side === "L" ? 1 : -1;
    this.joints[`hand${side}`].rotation.set(goal.wrist ?? 0, 0, 0);
    this.joints[`fingers${side}`].rotation.set(-goal.curl * 1.45, 0, 0);
    const thumb = this.joints[`thumb${side}`];
    if (goal.thumb === "up") thumb.rotation.set(0.2, 0, s * 1.75);
    else if (goal.thumb === "grip") thumb.rotation.set(-0.85, 0, s * 0.35);
    else thumb.rotation.set(-0.25, 0, s * 0.45);
    this.joints[`hand${side}`].updateMatrixWorld(true);
  }

  /** World position of a point on this character (in its root's local space). */
  localPoint(x: number, y: number, z: number, out = new THREE.Vector3()) {
    return this.root.localToWorld(out.set(x, y, z));
  }

  /** Blink (0 open … 1 closed), smile (0 … 1), mouth opening (0 … 1) and brow raise (0 … 1). */
  setFace(blink: number, smile: number, open = 0, brow = 0) {
    for (const lid of this.lids) lid.rotation.x = THREE.MathUtils.lerp(-0.38, 1.55, blink);
    this.mouth.scale.set(0.9 + smile * 0.3, 0.6 + smile * 0.55, 1);
    this.mouthOpen.scale.y = 0.01 + open * 0.5;
    for (const b of this.brows) b.position.y = 0.158 + brow * 0.008;
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
  }
}

/** Natural blink: brief and slightly irregular, driven by wall-clock time (an idle loop). */
export function blinkAt(time: number, seed: number) {
  const period = 3.4 + (seed % 7) * 0.23;
  const t = (time + seed * 0.37) % period;
  return t < 0.13 ? Math.sin((t / 0.13) * Math.PI) : 0;
}
