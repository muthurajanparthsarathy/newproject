import * as THREE from "three";
import { easeInOut, range } from "./math";
import { onScreenLayer } from "./screens";

const CARDS = 4;
const PARTICLES = 240;

/**
 * Media transfer: small clip cards showing the real footage fly from the camera monitor
 * to the editor's screen, trailed by blue particles. Fully driven by story position.
 */
export class TransferFx {
  readonly group = new THREE.Group();
  private readonly curve: THREE.CatmullRomCurve3;
  private readonly cards: THREE.Group[] = [];
  private readonly points: THREE.Points;
  private readonly positions: Float32Array;
  private readonly colors: Float32Array;
  private readonly offsets: Float32Array;
  private readonly disposables: { dispose(): void }[] = [];

  constructor(from: THREE.Vector3, to: THREE.Vector3, footage: THREE.Texture) {
    this.curve = new THREE.CatmullRomCurve3(
      [from, new THREE.Vector3(0.9, 1.78, 0.95), new THREE.Vector3(2.7, 1.98, 1.05), new THREE.Vector3(4.7, 1.78, 0.25), new THREE.Vector3(6.2, 1.45, -1.15), to],
      false,
      "centripetal",
    );

    const mask = document.createElement("canvas");
    mask.width = 128;
    mask.height = 80;
    const mx = mask.getContext("2d")!;
    mx.fillStyle = "#ffffff";
    mx.beginPath();
    mx.roundRect(4, 4, 120, 72, 10);
    mx.fill();
    const alpha = new THREE.CanvasTexture(mask);
    const cardGeo = new THREE.PlaneGeometry(0.2, 0.125);
    const glowGeo = new THREE.PlaneGeometry(0.235, 0.16);
    const cardMat = new THREE.MeshBasicMaterial({ map: footage, alphaMap: alpha, transparent: true, depthWrite: false });
    // Solid brand-blue frame (additive glow would wash out to white on the light studio)
    const glowMat = new THREE.MeshBasicMaterial({ color: "#2563eb", alphaMap: alpha, transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false });
    this.disposables.push(alpha, cardGeo, glowGeo, cardMat, glowMat);
    for (let i = 0; i < CARDS; i++) {
      const card = new THREE.Group();
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.z = -0.002;
      card.add(glow, new THREE.Mesh(cardGeo, cardMat));
      card.visible = false;
      this.cards.push(card);
      this.group.add(card);
    }

    this.positions = new Float32Array(PARTICLES * 3);
    this.colors = new Float32Array(PARTICLES * 4);
    this.offsets = new Float32Array(PARTICLES * 4);
    for (let i = 0; i < PARTICLES; i++) {
      this.offsets[i * 4] = i / PARTICLES;
      this.offsets[i * 4 + 1] = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      this.offsets[i * 4 + 2] = (Math.sin(i * 78.233) * 12345.678) % 1;
      this.offsets[i * 4 + 3] = (Math.sin(i * 39.425) * 24634.6345) % 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(this.colors, 4));
    const dot = document.createElement("canvas");
    dot.width = dot.height = 32;
    const dx = dot.getContext("2d")!;
    const grad = dx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.55, "rgba(255,255,255,0.85)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    dx.fillStyle = grad;
    dx.fillRect(0, 0, 32, 32);
    const dotTex = new THREE.CanvasTexture(dot);
    const mat = new THREE.PointsMaterial({ size: 0.03, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, sizeAttenuation: true, toneMapped: false });
    this.disposables.push(geo, mat, dotTex);
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.group.add(this.points);
    onScreenLayer(this.group);
  }

  update(g: number, time: number, camera: THREE.Camera) {
    const active = g > 18.4 && g < 21.4;
    this.group.visible = active;
    if (!active) return;
    let lead = 0;
    this.cards.forEach((card, i) => {
      const p = range(g, 18.55 + i * 0.22, 20.6 + i * 0.22);
      card.visible = p > 0 && p < 1;
      if (!card.visible) return;
      lead = Math.max(lead, p);
      const e = easeInOut(p);
      this.curve.getPointAt(e, card.position);
      card.position.y += Math.sin(time * 2 + i) * 0.01;
      card.quaternion.copy(camera.quaternion);
      const grow = Math.min(1, p / 0.12);
      const shrink = p > 0.86 ? 1 - (p - 0.86) / 0.14 : 1;
      card.scale.setScalar(0.35 + 0.65 * grow * shrink);
    });
    const tail = 0.38;
    const color = new THREE.Color("#2f6df0");
    const point = new THREE.Vector3();
    for (let i = 0; i < PARTICLES; i++) {
      const u = this.offsets[i * 4] * lead;
      const behind = lead - u;
      const alpha = lead > 0 && lead < 1 ? Math.max(0, 1 - behind / tail) * (0.4 + 0.6 * Math.abs(this.offsets[i * 4 + 1])) : 0;
      this.curve.getPointAt(easeInOut(Math.min(u, 1)), point);
      const wobble = 0.06 * (1 - alpha * 0.5);
      this.positions[i * 3] = point.x + this.offsets[i * 4 + 1] * wobble + Math.sin(time * 3 + i) * 0.01;
      this.positions[i * 3 + 1] = point.y + this.offsets[i * 4 + 2] * wobble;
      this.positions[i * 3 + 2] = point.z + this.offsets[i * 4 + 3] * wobble;
      this.colors[i * 4] = color.r;
      this.colors[i * 4 + 1] = color.g;
      this.colors[i * 4 + 2] = color.b;
      this.colors[i * 4 + 3] = alpha;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
  }
}
