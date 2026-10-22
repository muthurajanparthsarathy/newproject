import * as THREE from "three";

/** Layer for screens and effects: the main camera sees it, the in-world film camera does not. */
export const SCREEN_LAYER = 1;

/**
 * The footage. A second camera sits at the cinema camera's lens and renders the presenter
 * into a texture, so the field monitor, the transfer cards and the editor's screens all
 * show the same subject, bottle, clothing and lighting — genuinely the same footage.
 */
export class FootageFeed {
  readonly target: THREE.WebGLRenderTarget;
  readonly camera: THREE.PerspectiveCamera;

  constructor(width: number, height: number, highQuality: boolean) {
    this.target = new THREE.WebGLRenderTarget(width, height, {
      type: highQuality ? THREE.HalfFloatType : THREE.UnsignedByteType,
      samples: highQuality ? 4 : 0,
    });
    this.camera = new THREE.PerspectiveCamera(26, width / height, 0.05, 30);
    this.camera.layers.set(0);
  }

  get texture() {
    return this.target.texture;
  }

  render(gl: THREE.WebGLRenderer, scene: THREE.Scene) {
    const previous = gl.getRenderTarget();
    const autoShadows = gl.shadowMap.autoUpdate;
    gl.shadowMap.autoUpdate = false; // reuse this frame's shadow maps
    gl.setRenderTarget(this.target);
    gl.clear();
    gl.render(scene, this.camera);
    gl.setRenderTarget(previous);
    gl.shadowMap.autoUpdate = autoShadows;
  }

  dispose() {
    this.target.dispose();
  }
}

/**
 * Footage preview with a colour grade: a flat, desaturated "log" look before grading,
 * a split-screen comparison wipe while grading, and the finished warm, contrasty look.
 * `crop` (x, y, w, h in UV) reframes the 16:10 footage to 16:9 or a 9:16 vertical reel.
 */
export function gradingMaterial(map: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: map },
      grade: { value: 0 },
      wipe: { value: -1 },
      crop: { value: new THREE.Vector4(0, 0.05, 1, 0.9) },
      presence: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      uniform float grade;
      uniform float wipe;
      uniform vec4 crop;
      uniform float presence;
      varying vec2 vUv;
      vec3 saturate3(vec3 c, float s) {
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        return mix(vec3(l), c, s);
      }
      void main() {
        vec2 uv = crop.xy + vUv * crop.zw;
        vec3 c = texture2D(map, uv).rgb;
        // Ungraded "log" look: flat, grey and slightly green
        vec3 raw = saturate3(c, 0.4) * 0.62 + 0.1;
        raw *= vec3(0.95, 1.03, 0.97);
        // Graded: richer colour, contrast and warm highlights
        vec3 graded = saturate3(c, 1.35);
        graded = (graded - 0.18) * 1.2 + 0.18;
        graded *= vec3(1.1, 1.0, 0.88);
        float useGrade = wipe < 0.0 ? grade : step(vUv.x, wipe);
        vec3 col = mix(raw, max(graded, 0.0), useGrade);
        float vig = smoothstep(0.9, 0.35, distance(vUv, vec2(0.5)));
        col *= mix(1.0, 0.78 + 0.22 * vig, useGrade);
        if (wipe >= 0.0) {
          float line = 1.0 - smoothstep(0.003, 0.007, abs(vUv.x - wipe));
          col = mix(col, vec3(1.0), line);
        }
        gl_FragColor = vec4(col * presence, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

/** A canvas-backed screen texture that only redraws when its state key changes. */
export class CanvasScreen {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly texture: THREE.CanvasTexture;
  private key = "";

  constructor(readonly width: number, readonly height: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d")!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;
  }

  draw(key: string, paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
    if (key === this.key) return;
    this.key = key;
    paint(this.ctx, this.width, this.height);
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
  }
}

/** Unlit material for UI screens (exact colours, no tone mapping). */
export function uiMaterial(map: THREE.Texture, transparent = false) {
  return new THREE.MeshBasicMaterial({ map, transparent, toneMapped: false });
}

export function onScreenLayer(object: THREE.Object3D) {
  object.traverse((o) => o.layers.set(SCREEN_LAYER));
}
