import * as THREE from "three";
import { penAt } from "./designPen";

const smooth = (a: number, b: number, n: number) => THREE.MathUtils.smoothstep(n, a, b);

/** Image-based 2.5D rig: weighted head, torso and hand motion, planted feet. */
export class CharacterPortrait {
  readonly sprite = new THREE.Group();
  private readonly body: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private readonly textures: THREE.Texture[] = [];
  private readonly facing: THREE.Vector3;
  private readonly towardCamera = new THREE.Vector3();
  private readonly screenRight = new THREE.Vector3();
  private readonly point = new THREE.Vector3();
  private readonly sourceUV: Float32Array;
  private phoneScreen?: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  private phoneAnchor?: THREE.Object3D;
  private drawing?: { tablet: THREE.Object3D; keys: THREE.Object3D };
  private workstation?: { mouse: THREE.Object3D; keys: THREE.Object3D };
  private handUV = [[0, 0], [0, 0]];
  private readonly inverseView = new THREE.Quaternion();
  private readonly target = new THREE.Vector3();
  private readonly cameraLocal = new THREE.Vector3();
  private readonly localUp = new THREE.Vector3();
  private deskSurface = 0;
  private loaded = 0;
  private disposed = false;
  private error: Error | null = null;
  private time = 0;
  private story = 0;
  private rear = false;
  private mirror = false;
  private aspect = 2 / 3;
  private readonly phase: number;

  constructor(private readonly role: string, src: string, position: THREE.Vector3, private readonly height: number, yaw: number) {
    this.phase = [...role].reduce((sum, c) => sum + c.charCodeAt(0), 0) * 0.13;
    this.facing = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    this.sprite.name = `team-portrait-${role}`;
    this.sprite.position.copy(position);
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 48);
    this.sourceUV = new Float32Array(geometry.attributes.uv.array);
    const material = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.5, depthWrite: true, toneMapped: false, side: THREE.DoubleSide });
    this.body = new THREE.Mesh(geometry, material);
    this.body.name = `${role}-animated-cutout`;
    this.body.frustumCulled = false;
    this.body.visible = false;
    this.sprite.add(this.body);
    const loader = new THREE.TextureLoader();
    for (const path of [src, src.replace(/\.png$/, "-back.png")]) {
      const texture = loader.load(path, (texture) => {
        if (this.disposed) { texture.dispose(); return; }
        this.loaded++;
        this.body.visible = this.loaded === 2;
      }, undefined, () => { this.error = new Error(`Unable to load studio character: ${path}`); });
      texture.colorSpace = THREE.SRGBColorSpace;
      this.textures.push(texture);
    }
    material.map = this.textures[0];
    this.body.onBeforeRender = (_renderer, _scene, camera) => this.prepare(camera);
  }

  /** Phone and gripping hand are one image. Live UI follows the same deformation. */
  attachPhone(texture: THREE.Texture, anchor: THREE.Object3D) {
    this.phoneAnchor = anchor;
    anchor.visible = false;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(12), 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute([0, 1, 1, 1, 0, 0, 1, 0], 2));
    geo.setIndex([0, 2, 1, 2, 3, 1]);
    this.phoneScreen = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, side: THREE.DoubleSide }));
    this.phoneScreen.name = "held-phone-live-screen";
    this.phoneScreen.frustumCulled = false;
    this.phoneScreen.renderOrder = 1;
    this.phoneScreen.visible = false;
    this.sprite.add(this.phoneScreen);
  }

  update(story: number, time: number) {
    this.story = story;
    this.time = time;
  }

  attachWorkstation(mouse: THREE.Object3D, keys: THREE.Object3D) {
    this.workstation = { mouse, keys };
    keys.parent!.scale.x = 0.8;
  }

  attachDrawing(tablet: THREE.Object3D, keys: THREE.Object3D, stylus: THREE.Object3D) {
    this.drawing = { tablet, keys };
    stylus.visible = false; // The visible pen belongs to the gripping hand artwork.
    tablet.rotation.x = -Math.PI / 2;
    tablet.position.y -= 0.02;
    const stand = tablet.userData.stand as THREE.Object3D | undefined;
    if (stand) stand.visible = false;
  }

  /** Shared skinning for the artwork, phone screen and content-transfer anchor. */
  private deform(u: number, v: number, out: THREE.Vector3, drawingMotion = true) {
    const t = this.time + this.phase;
    const upper = smooth(0.33, 0.62, v);
    let x = u + Math.sin(t * 0.65) * 0.006 * upper;
    let y = v + Math.sin(t * 1.65) * 0.004 * upper;
    const head = smooth(0.72, 0.83, v) * (1 - smooth(0.62, 0.72, u));
    const angle = Math.sin(t * 0.9) * 0.035 * head;
    const dx = u - 0.45;
    const dy = v - 0.75;
    x += dx * (Math.cos(angle) - 1) - dy * Math.sin(angle);
    y += dx * Math.sin(angle) + dy * (Math.cos(angle) - 1);
    if (this.role === "presenter") {
      // One rigid transform for the bottle and enclosing fingers; blend only
      // across the upper arm, so the product cannot drift out of the grip.
      const hold = smooth(0.52, 0.73, u) * smooth(0.51, 0.60, v);
      const gesture = Math.sin(t * 1.15) * 0.055 * hold;
      const armX = u - 0.64;
      const armY = v - 0.57;
      x += armX * (Math.cos(gesture) - 1) - armY * Math.sin(gesture);
      y += armX * Math.sin(gesture) + armY * (Math.cos(gesture) - 1);
      x += Math.sin(t * 0.85) * 0.009 * hold;
      y += Math.sin(t * 1.15) * 0.012 * hold;
    } else if (this.role === "social") {
      const hold = smooth(0.52, 0.69, u) * smooth(0.48, 0.59, v) * (1 - smooth(0.81, 0.88, v));
      x += Math.sin(t * 1.1) * 0.008 * hold;
      y += Math.sin(t * 1.1 + 0.5) * 0.009 * hold;
      const tap = this.story >= 42 && this.story <= 45.2 ? Math.max(0, Math.sin(t * 4.5)) : 0;
      const finger = Math.exp(-((u - 0.65) ** 2 / 0.003 + (v - 0.66) ** 2 / 0.003));
      x += tap * 0.006 * finger;
      y += tap * 0.003 * finger;
    } else if (this.drawing && drawingMotion) {
      const grip = smooth(0.48, 0.65, u) * smooth(0.45, 0.52, v) * (1 - smooth(0.65, 0.72, v));
      const active = this.story >= 30.5 && this.story < 38.4 ? 1 : 0;
      const pen = penAt(this.story);
      x += (pen.x * 0.025 + Math.sin(t * 2.8) * 0.003 * pen.down) * grip * active;
      y += (pen.y * 0.012 + Math.cos(t * 3.4) * 0.002 * pen.down) * grip * active;
    } else if (!this.workstation && !this.drawing) {
      const hands = Math.exp(-((u - 0.64) ** 2 / 0.025 + (v - 0.48) ** 2 / 0.006));
      x += Math.sin(t * 2.3) * 0.005 * hands;
      y += Math.sin(t * 2.3 + 0.6) * 0.004 * hands;
    }
    if ((this.role === "developer" || this.role === "seo")) {
      const typingU = this.rear ? 0.74 : 0.89;
      const typingV = this.rear ? 0.625 : 0.565;
      const fingers = Math.exp(-((u - typingU) ** 2 / 0.006 + (v - typingV) ** 2 / 0.0015));
      y += Math.max(0, Math.sin(t * 7)) * 0.003 * fingers;
    }
    // Working artwork has arms extended to the right; its seated body is at 35%.
    const origin = this.workstation || this.drawing ? 0.35 : 0.5;
    return out.set((this.mirror ? origin - x : x - origin) * this.height * this.aspect, y * this.height, 0);
  }

  /** Preserve the drawn arm silhouette; only give it depth above the desktop. */
  private prepareHands() {
    const station = this.workstation || this.drawing;
    if (!station) return;
    this.handUV = this.rear ? [[0.91, 0.595], [0.74, 0.625]] : [[0.71, 0.535], [0.89, 0.565]];
    this.inverseView.copy(this.sprite.quaternion).invert();
    this.localUp.set(0, 1, 0).applyQuaternion(this.inverseView);
    station.keys.getWorldPosition(this.target);
    this.deskSurface = this.target.y - 0.03;
  }

  private restOnDesk(point: THREE.Vector3, surface: number, weight = 1) {
    const y = this.sprite.position.y + point.dot(this.localUp);
    const cameraY = this.sprite.position.y + this.cameraLocal.dot(this.localUp);
    if (Math.abs(y - cameraY) < 0.01) return;
    const distance = (surface - cameraY) / (y - cameraY);
    if (distance <= 0 || distance > 3) return;
    // Move along the view ray: screen-space arm proportions remain unchanged.
    point.lerp(this.target.copy(point).sub(this.cameraLocal).multiplyScalar(distance).add(this.cameraLocal), weight);
  }

  /** Place the input devices under the natural hands, without pulling the arms. */
  syncWorkstation(camera: THREE.Camera) {
    if ((!this.workstation && !this.drawing) || this.loaded !== 2) return;
    this.prepare(camera);
    if (this.drawing) {
      // Center the display under the nib in the undeformed pose. The small
      // drawing motion then travels over its surface without moving the tablet.
      const nib = this.rear ? [0.958, 0.578] : [0.742, 0.509];
      this.deform(nib[0], nib[1], this.point, false);
      this.restOnDesk(this.point, this.deskSurface + 0.016);
      this.point.applyQuaternion(this.sprite.quaternion).add(this.sprite.position);
      const tablet = this.drawing.tablet;
      tablet.parent!.worldToLocal(this.point);
      tablet.position.x = this.point.x;
      tablet.position.z = this.point.z;
      tablet.updateMatrixWorld(true);
      const otherHand = this.rear ? [0.74, 0.625] : [0.89, 0.565];
      this.deform(otherHand[0], otherHand[1], this.point, false);
      this.restOnDesk(this.point, this.deskSurface + 0.027);
      this.point.applyQuaternion(this.sprite.quaternion).add(this.sprite.position);
      const keyboard = this.drawing.keys.parent!;
      keyboard.parent!.worldToLocal(this.point);
      keyboard.position.x = this.point.x;
      keyboard.position.z = this.point.z;
      keyboard.scale.x = 0.8;
      keyboard.updateMatrixWorld(true);
      return;
    }
    if (!this.workstation) return;
    const keyboard = this.workstation.keys.parent!;
    for (let i = 0; i < 2; i++) {
      this.deform(this.handUV[i][0], this.handUV[i][1], this.point);
      this.restOnDesk(this.point, this.deskSurface + 0.027);
      this.point.applyQuaternion(this.sprite.quaternion).add(this.sprite.position);
      const object = i === 0 ? this.workstation.mouse : keyboard;
      const local = object.parent!.worldToLocal(this.point);
      // Keep the equipment on its original desktop height.
      object.position.x = local.x;
      object.position.z = local.z;
      object.updateMatrixWorld(true);
      const pad = object.userData.pad as THREE.Object3D | undefined;
      if (pad) {
        pad.position.x = object.position.x;
        pad.position.z = object.position.z;
        pad.updateMatrixWorld(true);
      }
    }
  }

  prepare(camera: THREE.Camera) {
    if (this.loaded !== 2) return;
    camera.getWorldPosition(this.towardCamera).sub(this.sprite.position).setY(0);
    this.rear = this.facing.dot(this.towardCamera) < 0;
    this.screenRight.setFromMatrixColumn(camera.matrixWorld, 0);
    this.mirror = this.facing.dot(this.screenRight) < 0;
    const texture = this.textures[this.rear ? 1 : 0];
    const image = texture.image as HTMLImageElement;
    this.aspect = image.width / image.height;
    this.body.material.map = texture;
    this.sprite.quaternion.copy(camera.quaternion);
    camera.getWorldPosition(this.cameraLocal).sub(this.sprite.position).applyQuaternion(this.inverseView.copy(this.sprite.quaternion).invert());
    this.prepareHands();
    const positions = this.body.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i++) {
      this.deform(this.sourceUV[i * 2], this.sourceUV[i * 2 + 1], this.point);
      if (this.workstation || this.drawing) {
        const u = this.sourceUV[i * 2];
        const v = this.sourceUV[i * 2 + 1];
        const arm = smooth(0.44, 0.58, u) * smooth(0.46, 0.53, v) * (1 - smooth(0.67, 0.73, v));
        this.restOnDesk(this.point, this.deskSurface + (this.drawing ? 0.024 : 0.035), arm);
      }
      positions.setXYZ(i, this.point.x, this.point.y, this.point.z);
    }
    positions.needsUpdate = true;
    if (this.phoneScreen) {
      this.phoneScreen.visible = !this.rear;
      // Source screen inset: below notch, within bezel, clear of the fingertip.
      const corners = [[738, 331], [794, 336], [716, 477], [769, 483]];
      const screenPositions = this.phoneScreen.geometry.attributes.position as THREE.BufferAttribute;
      const screenUV = this.phoneScreen.geometry.attributes.uv as THREE.BufferAttribute;
      corners.forEach(([x, y], i) => {
        this.deform(x / 1024, 1 - y / 1536, this.point);
        screenPositions.setXYZ(i, this.point.x, this.point.y, 0.001);
        // Mirroring the person must not reverse the live interface's text.
        const u = i % 2;
        screenUV.setXY(i, this.mirror ? 1 - u : u, i < 2 ? 1 : 0);
      });
      screenPositions.needsUpdate = true;
      screenUV.needsUpdate = true;
    }
    this.sprite.updateMatrixWorld(true);
  }

  /** Call after main camera placement and before the social transfer effects. */
  syncPhoneAnchor(camera: THREE.Camera) {
    if (!this.phoneAnchor || this.loaded !== 2) return;
    this.prepare(camera);
    this.deform(755 / 1024, 1 - 407 / 1536, this.point);
    this.phoneAnchor.position.copy(this.sprite.localToWorld(this.point));
    this.phoneAnchor.quaternion.copy(this.sprite.quaternion);
    this.phoneAnchor.updateMatrixWorld(true);
  }

  get ready() {
    if (this.error) throw this.error;
    return this.loaded === 2;
  }

  dispose() {
    this.disposed = true;
    this.sprite.removeFromParent();
    this.body.geometry.dispose();
    this.body.material.dispose();
    this.phoneScreen?.geometry.dispose();
    this.phoneScreen?.material.dispose();
    for (const texture of this.textures) texture.dispose();
  }
}
