import * as THREE from "three";
import { MARKETING_THETA, SEO_THETA, SOCIAL_THETA, WEB_THETA, zonePoint } from "./environment";
import { monotoneCubic } from "./math";

type Key = {
  g: number;
  pos: [number, number, number];
  look: [number, number, number];
  /** Vertical field of view in degrees */
  fov: number;
};

type P = [number, number, number];
/** Scene 4 blocking in the social manager's frame: x her left, y up from the floor, z the way she faces. */
const S = (x: number, y: number, z: number): P => zonePoint(SOCIAL_THETA, 8.2, -1, x, y, z).toArray();
/** Scene 5 blocking in the marketing specialist's frame: x her left, y up, z towards her desk and the wall. */
const M = (x: number, y: number, z: number): P => zonePoint(MARKETING_THETA, 8.03, 1, x, y, z).toArray();
/** Scene 6 handoff in the developer's frame. */
const W = (x: number, y: number, z: number): P => zonePoint(WEB_THETA, 8.03, 1, x, y, z).toArray();

const Q = (x: number, y: number, z: number): P => zonePoint(SEO_THETA, 8.03, 1, x, y, z).toArray();

/**
 * One continuous camera through the studio. Positions follow the brief's blocking
 * coordinates, refined so the lens never passes through people or equipment and the
 * subject stays clear of the text column. Look targets have their own spline, so the
 * camera turns towards each subject smoothly instead of snapping.
 */
export const CAMERA_KEYS: Key[] = [
  { g: 0, pos: [-4.3, 3.7, 10.2], look: [2.6, 0.95, -1.3], fov: 44 },
  { g: 4, pos: [-3.7, 2.95, 8.6], look: [1.4, 1.0, -1.0], fov: 43 },
  // F01 wide dolly forward
  { g: 8, pos: [-3, 2.3, 7], look: [0.05, 1.05, -0.7], fov: 42 },
  { g: 9, pos: [-2.55, 2.08, 5.6], look: [0.08, 1.12, -0.35], fov: 41 },
  // F02 side tracking on the tripod adjustment
  { g: 10, pos: [-2, 1.9, 4.5], look: [0.1, 1.18, 0.25], fov: 40 },
  // F03 three-quarter orbit to the cameraman
  { g: 12, pos: [-1, 1.7, 3.6], look: [0.05, 1.3, 0.45], fov: 38 },
  // F04 over his left shoulder and above the field monitor, onto the presenter
  { g: 14, pos: [-0.45, 1.97, 2.55], look: [0.22, 1.3, -1.7], fov: 36 },
  // F05 push in to the recording monitor
  { g: 16, pos: [-0.66, 1.72, 1.78], look: [-0.17, 1.46, 0.42], fov: 33 },
  // F06 playback close-up
  { g: 18, pos: [-0.52, 1.64, 1.36], look: [-0.17, 1.46, 0.42], fov: 31 },
  // F07 hold, then exit sideways along the transfer
  { g: 18.6, pos: [-0.4, 1.62, 1.42], look: [-0.12, 1.45, 0.4], fov: 32 },
  { g: 19.2, pos: [1.0, 1.72, 2.0], look: [1.8, 1.4, -0.4], fov: 36 },
  // F08 rightward tracking past the foreground light stand
  { g: 20, pos: [3.2, 1.82, 2.95], look: [5.4, 1.3, -1.0], fov: 40 },
  // F09 three-quarter approach to the editing station
  { g: 21, pos: [5, 2.0, 5], look: [7.0, 1.12, -1.4], fov: 40 },
  // F10 dolly towards the editor
  { g: 23, pos: [5.9, 1.76, 1.6], look: [6.95, 1.12, -1.55], fov: 38 },
  // F11 over-the-shoulder zoom (from his left, so his head stays clear of the screen)
  { g: 24, pos: [6.3, 1.66, 0.2], look: [6.95, 1.2, -1.95], fov: 32 },
  // F12 monitor close-up
  { g: 26, pos: [6.2, 1.62, -0.5], look: [6.98, 1.22, -2.0], fov: 26 },
  // F13 subtle pan across the screen
  { g: 27, pos: [6.25, 1.6, -0.55], look: [7.2, 1.2, -2.0], fov: 26 },
  // F14 gentle pull back to the editor, the finished reel and the export
  { g: 28, pos: [6.35, 1.7, 0.5], look: [7.0, 1.16, -1.9], fov: 31 },
  { g: 29, pos: [6.3, 1.78, 1.5], look: [7.05, 1.14, -1.8], fov: 34 },
  // Scene 3 — 3.1 pull back from the edit monitor, track right, three-quarter on the designer
  { g: 30, pos: [7.35, 1.92, 2.45], look: [9.4, 1.2, 0.75], fov: 36 },
  { g: 31, pos: [8.79, 1.6, 0.13], look: [10.05, 1.15, 1.3], fov: 36 },
  // 3.2 round behind him to his right shoulder: monitor, pen display and his hand in view
  { g: 32, pos: [8.86, 1.85, 2.67], look: [10.12, 1.1, 1.28], fov: 32 },
  { g: 33, pos: [9.56, 1.68, 2.9], look: [10.15, 1.1, 1.26], fov: 30 },
  { g: 34, pos: [9.68, 1.62, 2.72], look: [10.16, 1.08, 1.25], fov: 27 },
  // 3.3 gentle ~25° orbit and pull back to reveal the floating tools and alternative layouts
  { g: 35.5, pos: [9.85, 1.64, 2.99], look: [10.2, 1.12, 1.2], fov: 31 },
  { g: 37, pos: [9.72, 1.76, 3.47], look: [10.2, 1.2, 1.2], fov: 34 },
  // 3.4 push in on the finished poster as it rises, hold, then start turning towards social
  { g: 38.3, pos: [9.51, 1.6, 2.23], look: [10.14, 1.56, 1.3], fov: 30 },
  { g: 39.3, pos: [9.53, 1.6, 2.28], look: [10.14, 1.55, 1.3], fov: 30 },
  { g: 40, pos: [9.58, 1.62, 2.36], look: [10.24, 1.52, 1.36], fov: 31 },
  // Scene 4 — 4.1 pull back from the poster and curve round to the social corner, following the card;
  // the manager is revealed in three-quarter from her right
  { g: 40.3, pos: S(-2.95, 1.68, 1.8), look: S(-3.55, 1.6, 0.35), fov: 33 },
  { g: 40.6, pos: S(-2.6, 1.66, 2.3), look: S(-1.2, 1.55, 0.45), fov: 34 },
  { g: 41.2, pos: S(-1.6, 1.6, 2.45), look: S(0, 1.38, 0.3), fov: 34 },
  { g: 42, pos: S(-0.85, 1.48, 1.9), look: S(0, 1.18, 0.25), fov: 31 },
  // 4.2 closer: her face, phone and tapping hand, tilted to read the screen
  { g: 42.8, pos: S(-0.75, 1.47, 1.1), look: S(-0.12, 1.24, 0.2), fov: 31 },
  { g: 43.6, pos: S(-0.66, 1.45, 0.92), look: S(-0.13, 1.23, 0.21), fov: 30 },
  { g: 44.4, pos: S(-0.62, 1.43, 0.86), look: S(-0.13, 1.22, 0.21), fov: 29 },
  // 4.3 pull back and orbit gently round to her front as the post cards spread out
  { g: 45, pos: S(-0.8, 1.45, 0.95), look: S(-0.05, 1.22, 0.3), fov: 31 },
  { g: 46, pos: S(-0.35, 1.62, 1.8), look: S(0.2, 1.42, 0.3), fov: 37 },
  { g: 47, pos: S(0.25, 1.66, 2.0), look: S(0.3, 1.42, 0.25), fov: 38 },
  // 4.4 slide right and push in on the performance dashboard; the marketing desk appears beyond
  { g: 48, pos: S(0.5, 1.62, 2.1), look: S(0.5, 1.42, 0.3), fov: 39 },
  { g: 49, pos: S(0.55, 1.6, 2.2), look: S(0.55, 1.4, 0.38), fov: 40 },
  { g: 49.6, pos: S(0.72, 1.54, 1.62), look: S(0.92, 1.45, 0.5), fov: 33 },
  // Transition: track with the campaign card across the studio, skimming the storage unit
  { g: 50.2, pos: S(1.55, 1.58, 1.72), look: S(3.1, 1.36, 0.6), fov: 35 },
  // Scene 5 — 5.1 the card lands as the camera swings behind her chair to a three-quarter from her
  // right: the specialist in the foreground, the large ads dashboard to the right of the headline
  { g: 51, pos: M(0.6, 1.62, -1.6), look: M(0.05, 1.25, 0.7), fov: 37 },
  { g: 52, pos: M(-0.85, 1.58, -1.25), look: M(0.2, 1.26, 0.8), fov: 36 },
  // 5.2 over her right shoulder (mouse hand and monitor in view), then push towards the campaign set-up
  { g: 52.9, pos: M(-0.62, 1.62, -0.85), look: M(0.02, 1.16, 0.75), fov: 34 },
  { g: 53.8, pos: M(-0.5, 1.52, -0.55), look: M(0.06, 1.22, 0.9), fov: 31 },
  { g: 54.7, pos: M(-0.4, 1.46, -0.3), look: M(0.1, 1.27, 0.98), fov: 28 },
  // 5.3 arc out round her right side: she faces the floating analytics panel in profile, slight dolly in
  { g: 55.4, pos: M(-1.0, 1.5, -0.45), look: M(-0.1, 1.36, 0.6), fov: 32 },
  { g: 56.4, pos: M(-1.95, 1.5, 0.1), look: M(-0.2, 1.42, 0.38), fov: 36 },
  { g: 57.6, pos: M(-1.7, 1.48, 0.18), look: M(-0.2, 1.43, 0.42), fov: 34 },
  // 5.4 pull back to a wider three-quarter with the audience map, then follow the website visits round
  // to the web & app desk, where the developer is already at work (scene 6 starts here)
  { g: 58.5, pos: M(-2.2, 1.56, 0.05), look: M(-0.35, 1.45, 0.55), fov: 37 },
  { g: 59.3, pos: M(-2.4, 1.66, -0.35), look: M(-0.6, 1.45, 0.55), fov: 38 },
  { g: 60, pos: W(2.1, 1.72, -2.3), look: W(0.1, 1.2, 0.35), fov: 38 },
  { g: 62, pos: W(1.6, 1.65, -1.8), look: W(0.05, 1.18, 0.45), fov: 38 },
  { g: 64, pos: W(1.25, 1.65, -1.35), look: W(0.02, 1.17, 0.5), fov: 38 },
  { g: 66, pos: W(1.5, 1.72, -1.65), look: W(0.0, 1.16, 0.5), fov: 39 },
  { g: 68, pos: W(1.9, 1.78, -2.1), look: W(0.05, 1.18, 0.45), fov: 39 },
  { g: 70, pos: W(2.15, 1.8, -2.4), look: W(0.1, 1.16, 0.4), fov: 40 },
  { g: 71, pos: Q(2.1, 1.72, -2.3), look: Q(0.1, 1.2, 0.35), fov: 38 },
  { g: 73, pos: Q(1.6, 1.68, -1.8), look: Q(0.05, 1.18, 0.45), fov: 38 },
  { g: 75, pos: Q(1.25, 1.65, -1.35), look: Q(0.02, 1.17, 0.5), fov: 38 },
  { g: 77, pos: Q(1.6, 1.72, -1.85), look: Q(0.05, 1.18, 0.45), fov: 39 },
  { g: 80, pos: Q(2.1, 1.8, -2.4), look: Q(0.1, 1.16, 0.4), fov: 40 },
  { g: 82, pos: [-2, 7, 10], look: [6, 0.8, 5], fov: 65 },
  { g: 84, pos: [-7, 12, 14], look: [5, 0.7, 5], fov: 65 },
  { g: 86, pos: [-8, 13, 15], look: [5, 0.7, 5], fov: 65 },
];

export class CameraPath {
  private readonly pos: THREE.CatmullRomCurve3;
  private readonly look: THREE.CatmullRomCurve3;
  private readonly param: (g: number) => number;
  private readonly fov: (g: number) => number;

  constructor(keys: Key[] = CAMERA_KEYS) {
    const n = keys.length;
    this.pos = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.pos)), false, "centripetal");
    this.look = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.look)), false, "centripetal");
    const times = keys.map((k) => k.g);
    // Curve parameter hits key i exactly at its story position, with continuous speed between keys.
    this.param = monotoneCubic(times, keys.map((_, i) => i / (n - 1)));
    this.fov = monotoneCubic(times, keys.map((k) => k.fov));
  }

  /** Writes the camera position and look target for story position `g`; returns the vertical FOV. */
  sample(g: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
    const s = Math.min(1, Math.max(0, this.param(g)));
    this.pos.getPoint(s, outPos);
    this.look.getPoint(s, outLook);
    return this.fov(g);
  }
}
