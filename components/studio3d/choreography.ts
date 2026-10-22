import * as THREE from "three";
import { blinkAt, type ArmGoal, type Humanoid, type Side } from "./humanoid";
import { easeInOut, keySegment, lerp, range, sampleNumber, type Keys } from "./math";
import { REC_START, REC_STOP } from "./editorUi";
import { penAt } from "./designPen";
import { TYPING, cursorAt } from "./marketingUi";
import type { DesignDesk, DeskSet, FilmRig, MarketingDesk } from "./props";
import { fingerAt } from "./socialUi";

/**
 * Character performances. Each act is a pure function of the story position `g`
 * (plus wall-clock `time` for idle loops such as breathing and blinking), so every
 * beat is reproducible when scrolling backwards or landing mid-story.
 */

type HandKey = {
  at: number;
  to: THREE.Vector3;
  palm: THREE.Vector3;
  curl: number;
  thumb?: ArmGoal["thumb"];
  wrist?: number;
  /** Treat `to` as the grasp point and pull the wrist back to it (default true) */
  grasp?: boolean;
};

const UP = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);
const wp = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3());

function blendPoint(g: number, keys: Keys<THREE.Vector3>) {
  const [i, t] = keySegment(g, keys);
  return keys[i][1].clone().lerp(keys[Math.min(i + 1, keys.length - 1)][1], t);
}

/** Interpolates hand keys and solves the arm, pulling grasp targets back to the wrist. */
function driveArm(h: Humanoid, side: Side, g: number, keys: HandKey[], pole: THREE.Vector3) {
  const pairs = keys.map((k) => [k.at, k] as const);
  const [i, t] = keySegment(g, pairs);
  const a = keys[i];
  const b = keys[Math.min(i + 1, keys.length - 1)];
  const target = a.to.clone().lerp(b.to, t);
  const graspWeight = lerp(a.grasp === false ? 0 : 1, b.grasp === false ? 0 : 1, t);
  if (graspWeight > 0) {
    const shoulder = wp(h.joints[`upperArm${side}`]);
    const back = shoulder.sub(target).normalize().multiplyScalar(0.062 * h.root.scale.x * graspWeight);
    target.add(back);
  }
  h.solveArm(side, {
    target,
    pole,
    palm: a.palm.clone().lerp(b.palm, t).normalize(),
    curl: lerp(a.curl, b.curl, t),
    wrist: lerp(a.wrist ?? 0, b.wrist ?? 0, t),
    thumb: t < 0.5 ? a.thumb : b.thumb,
  });
}

/** Direction in a character's local frame, expressed in world space. */
function localDir(h: Humanoid, x: number, y: number, z: number) {
  return new THREE.Vector3(x, y, z).applyQuaternion(h.root.quaternion).normalize();
}

// ---------------------------------------------------------------------------
// Character A — cinematographer
// ---------------------------------------------------------------------------

export class CinematographerAct {
  constructor(readonly h: Humanoid, readonly rig: FilmRig) {
    h.root.position.set(0.2, 0, 0.86);
    h.root.rotation.y = Math.PI;
  }

  /** The tripod and camera respond to his hands: aim, focus ring and tally light. */
  driveRig(g: number) {
    const rig = this.rig;
    const follow = g > 12.6 && g < 16.2 ? Math.sin(g * 2.6) * 0.012 : 0;
    rig.pan.rotation.y = sampleNumber(g, [[8, -0.17], [9.3, -0.17], [10.0, -0.09]]) + follow;
    rig.tilt.rotation.x = sampleNumber(g, [[8, -0.07], [9.5, -0.07], [10.1, -0.01]]);
    rig.focusRing.rotation.z = sampleNumber(g, [[10.5, 0], [11.4, 1.3], [12.8, 1.3], [14.2, 1.55], [16, 1.2]]);
    const recording = g >= REC_START && g < REC_STOP;
    (rig.tally.material as THREE.MeshStandardMaterial).emissiveIntensity = recording ? 3 : 0.25;
  }

  apply(g: number, time: number, presenterHead: THREE.Vector3) {
    const { h, rig } = this;
    const A = rig.anchors;
    h.resetPose();
    const lean = sampleNumber(g, [
      [8, 0.04], [9.2, 0.18], [10.3, 0.16], [10.7, 0.24], [11.4, 0.24], [11.65, 0.06], [12.05, 0.06],
      [12.3, 0.17], [16.3, 0.17], [16.6, 0.27], [17.7, 0.27], [18.5, 0.08], [19.2, 0.04],
    ]);
    const twist = sampleNumber(g, [[18.4, 0], [18.9, -0.3], [19.8, -0.3], [20.4, 0]]);
    h.setTorso(lean, twist);
    h.setLegs(0.1, 0.19, 0.11);
    h.joints.hips.position.y -= 0.012;
    h.breathe(time);
    h.root.updateMatrixWorld(true);
    rig.group.updateMatrixWorld(true);

    const cam = wp(A.handle);
    const focus = wp(A.focusRing);
    const mon = wp(A.monitorCenter);
    const rec = wp(A.recordButton);
    const monBtn = wp(A.monitorButton);
    const editDesk = new THREE.Vector3(6.9, 1.25, -1.6);
    h.lookAt(
      blendPoint(g, [
        [8, cam], [9.2, cam], [10.4, focus], [10.9, mon], [11.35, presenterHead], [12.05, presenterHead],
        [12.2, rec], [12.5, mon], [13.4, mon], [13.7, presenterHead], [14.1, mon], [16.0, mon], [16.12, rec],
        [16.4, mon], [18.05, monBtn], [18.6, editDesk], [19.8, editDesk], [20.4, presenterHead],
      ]),
    );
    h.setFace(blinkAt(time, 3), sampleNumber(g, [[8, 0.35], [11.5, 0.35], [11.7, 0.85], [12.1, 0.45], [18.3, 0.45], [18.8, 0.8]]));

    const restR = h.localPoint(-0.25, 0.83, 0.06);
    const restL = h.localPoint(0.25, 0.83, 0.06);
    const inR = localDir(h, 1, 0, 0);
    const inL = localDir(h, -1, 0, 0);
    const grip = wp(A.panGrip);
    const camCenter = rig.tilt.localToWorld(new THREE.Vector3(0, 0.1, -0.01));
    const toCam = (p: THREE.Vector3) => camCenter.clone().sub(p).normalize();
    const recPress = rig.tilt.localToWorld(new THREE.Vector3(0.074, 0.075, 0.035));
    const monNormal = rig.monitor.getWorldDirection(new THREE.Vector3());
    const monFace = monNormal.clone().negate();
    const monBtnPress = monBtn.clone().addScaledVector(monNormal, -0.018);
    const thumbs = h.localPoint(-0.3, 1.36, 0.36);
    const lensAxis = rig.tilt.localToWorld(new THREE.Vector3(0, 0.1, -0.15));

    driveArm(h, "R", g, [
      { at: 8, to: restR, palm: inR, curl: 0.35, grasp: false },
      { at: 9.0, to: restR, palm: inR, curl: 0.35, grasp: false },
      { at: 9.4, to: grip, palm: DOWN, curl: 0.9, thumb: "grip" },
      { at: 11.4, to: grip, palm: DOWN, curl: 0.9, thumb: "grip" },
      { at: 11.68, to: thumbs, palm: inR, curl: 1, thumb: "up", grasp: false },
      { at: 11.95, to: thumbs, palm: inR, curl: 1, thumb: "up", grasp: false },
      { at: 12.15, to: rec, palm: toCam(rec), curl: 0.55 },
      { at: 12.3, to: recPress, palm: toCam(rec), curl: 0.55 },
      { at: 12.45, to: rec, palm: toCam(rec), curl: 0.55 },
      { at: 12.65, to: grip, palm: DOWN, curl: 0.9, thumb: "grip" },
      { at: 16.0, to: grip, palm: DOWN, curl: 0.9, thumb: "grip" },
      { at: 16.12, to: rec, palm: toCam(rec), curl: 0.55 },
      { at: 16.24, to: recPress, palm: toCam(rec), curl: 0.55 },
      { at: 16.36, to: rec, palm: toCam(rec), curl: 0.55 },
      { at: 16.55, to: grip, palm: DOWN, curl: 0.9, thumb: "grip" },
      { at: 18.0, to: grip, palm: DOWN, curl: 0.9, thumb: "grip" },
      { at: 18.12, to: monBtn, palm: monFace, curl: 0.45 },
      { at: 18.24, to: monBtnPress, palm: monFace, curl: 0.45 },
      { at: 18.36, to: monBtn, palm: monFace, curl: 0.45 },
      { at: 18.55, to: grip, palm: DOWN, curl: 0.9, thumb: "grip" },
      { at: 19.3, to: grip, palm: DOWN, curl: 0.9, thumb: "grip" },
      { at: 19.9, to: restR, palm: inR, curl: 0.35, grasp: false },
    ], h.localPoint(-0.6, 0.55, -0.25));

    // Scrub along the bottom-right of the screen so the hand doesn't cover the playback
    const scrub = rig.monitor.localToWorld(new THREE.Vector3(lerp(0.0, 0.13, range(g, 16.6, 17.5)), -0.088, 0.035));
    driveArm(h, "L", g, [
      { at: 8, to: restL, palm: inL, curl: 0.35, grasp: false },
      { at: 9.1, to: restL, palm: inL, curl: 0.35, grasp: false },
      { at: 9.45, to: cam, palm: DOWN, curl: 0.85, thumb: "grip" },
      { at: 10.25, to: cam, palm: DOWN, curl: 0.85, thumb: "grip" },
      { at: 10.55, to: focus, palm: lensAxis.clone().sub(focus).normalize(), curl: 0.75, thumb: "grip" },
      { at: 11.4, to: focus, palm: lensAxis.clone().sub(focus).normalize(), curl: 0.75, thumb: "grip" },
      { at: 11.6, to: cam, palm: DOWN, curl: 0.85, thumb: "grip" },
      { at: 12.6, to: cam, palm: DOWN, curl: 0.85, thumb: "grip" },
      { at: 12.85, to: focus, palm: lensAxis.clone().sub(focus).normalize(), curl: 0.75, thumb: "grip" },
      { at: 16.3, to: focus, palm: lensAxis.clone().sub(focus).normalize(), curl: 0.75, thumb: "grip" },
      { at: 16.6, to: scrub, palm: monFace, curl: 0.4 },
      { at: 17.5, to: scrub, palm: monFace, curl: 0.4 },
      { at: 17.75, to: cam, palm: DOWN, curl: 0.85, thumb: "grip" },
      { at: 19.4, to: cam, palm: DOWN, curl: 0.85, thumb: "grip" },
      { at: 19.95, to: restL, palm: inL, curl: 0.35, grasp: false },
    ], h.localPoint(0.6, 0.85, -0.25));
  }
}

// ---------------------------------------------------------------------------
// Character B — UGC presenter (the filmed creator, not a Prova Media employee)
// ---------------------------------------------------------------------------

export const PRESENTER_SEAT = new THREE.Vector3(0.25, 0.08, -1.82);
export const TABLE_SPOT = new THREE.Vector3(0.74, 0.08, -1.8);

export class PresenterAct {
  private readonly tableBottle = new THREE.Vector3(TABLE_SPOT.x, 0.08 + 0.586 + 0.115, TABLE_SPOT.z);

  constructor(readonly h: Humanoid, readonly bottle: THREE.Object3D, readonly lens: () => THREE.Vector3, readonly operatorHead: () => THREE.Vector3) {
    h.root.position.copy(PRESENTER_SEAT);
  }

  headPosition() {
    return this.h.joints.head.localToWorld(new THREE.Vector3(0, 0.12, 0.02));
  }

  apply(g: number, time: number) {
    const { h } = this;
    h.resetPose();
    h.joints.hips.position.y = (0.755 - PRESENTER_SEAT.y) / h.root.scale.x;
    h.setLegs(1.45, 2.0, 0.1);
    const lean = sampleNumber(g, [[8, -0.03], [9.9, 0.0], [10.25, 0.12], [10.6, 0.03], [12.3, 0.0], [12.6, 0.08], [16, 0.06], [16.6, -0.02]]);
    const twist = sampleNumber(g, [[9.9, 0], [10.25, 0.38], [10.6, 0.1], [11, 0]]);
    const side = sampleNumber(g, [[9.9, 0], [10.25, -0.12], [10.6, 0]]);
    h.setTorso(lean, twist, side);
    h.breathe(time, 0.8);
    h.root.updateMatrixWorld(true);

    const lens = this.lens();
    const talking = g > 12.8 && g < 15.9;
    const nod = talking ? Math.sin(time * 2.3) * 0.025 : 0;
    const bottleNow = this.bottle.position.clone();
    const lookTarget = blendPoint(g, [
      [8, lens], [9.9, lens], [10.1, this.tableBottle], [10.4, bottleNow], [11.6, bottleNow], [11.75, lens],
      [14.3, lens], [14.5, bottleNow], [15.1, bottleNow], [15.3, lens], [17.6, lens], [18.3, this.operatorHead()], [20, this.operatorHead()],
    ]);
    lookTarget.y += nod;
    h.lookAt(lookTarget);
    const smile = sampleNumber(g, [[8, 0.35], [11.6, 0.4], [11.75, 0.9], [12.2, 0.7], [16.5, 0.75], [16.7, 1], [17.6, 0.85]]);
    h.setFace(blinkAt(time, 11), smile, talking ? 0.08 + 0.12 * Math.max(0, Math.sin(time * 6.5)) : 0);

    const local = (x: number, y: number, z: number) => h.localPoint(x, y, z);
    const toRight = localDir(h, -1, 0, 0);
    const toLeft = localDir(h, 1, 0, 0);
    const toCamera = lens.clone().sub(h.root.position).setY(0).normalize();
    const restR = local(-0.12, 0.83, 0.27);
    const restL = local(0.12, 0.83, 0.27);
    const lapR = local(-0.05, 0.93, 0.33);
    const lapL = local(0.05, 0.93, 0.33);
    const showR = local(-0.05, 1.13, 0.45);
    const showHigh = local(0.0, 1.22, 0.47);
    const showSide = local(-0.11, 1.1, 0.44);
    const wave = local(0.27, 1.42, 0.27).addScaledVector(toLeft, g > 16.7 && g < 17.3 ? Math.sin(time * 9) * 0.05 : 0);

    driveArm(h, "R", g, [
      { at: 8, to: restR, palm: DOWN, curl: 0.3, grasp: false },
      { at: 10.85, to: restR, palm: DOWN, curl: 0.3, grasp: false },
      { at: 11.0, to: lapR, palm: toLeft, curl: 0.8, thumb: "grip" },
      { at: 11.6, to: lapR, palm: toLeft, curl: 0.8, thumb: "grip" },
      { at: 12.55, to: showR, palm: toLeft, curl: 0.8, thumb: "grip" },
      { at: 13.9, to: showR, palm: toLeft, curl: 0.8, thumb: "grip" },
      { at: 14.45, to: showHigh, palm: toLeft.clone().lerp(toCamera, 0.45), curl: 0.8, thumb: "grip" },
      { at: 15.3, to: showSide, palm: toLeft.clone().lerp(toCamera, -0.35), curl: 0.8, thumb: "grip" },
      { at: 16.05, to: showR, palm: toLeft, curl: 0.8, thumb: "grip" },
      { at: 16.6, to: lapR, palm: toLeft, curl: 0.8, thumb: "grip" },
      { at: 20, to: lapR, palm: toLeft, curl: 0.8, thumb: "grip" },
    ], local(-0.55, 0.7, -0.1));

    driveArm(h, "L", g, [
      { at: 8, to: restL, palm: DOWN, curl: 0.3, grasp: false },
      { at: 9.95, to: restL, palm: DOWN, curl: 0.3, grasp: false },
      { at: 10.25, to: this.tableBottle, palm: toLeft, curl: 0.8, thumb: "grip" },
      { at: 10.42, to: this.tableBottle, palm: toLeft, curl: 0.8, thumb: "grip" },
      { at: 10.85, to: lapL, palm: toRight, curl: 0.8, thumb: "grip" },
      { at: 11.0, to: lapL, palm: toRight, curl: 0.8, thumb: "grip" },
      { at: 11.3, to: restL, palm: DOWN, curl: 0.3, grasp: false },
      { at: 12.9, to: restL, palm: DOWN, curl: 0.3, grasp: false },
      { at: 13.15, to: local(0.22, 1.0, 0.37), palm: UP, curl: 0.15, grasp: false },
      { at: 13.85, to: local(0.26, 1.06, 0.31), palm: UP.clone().lerp(toRight, 0.4), curl: 0.15, grasp: false },
      { at: 14.25, to: local(0.06, 1.09, 0.46), palm: toRight, curl: 0.5, grasp: false },
      { at: 15.2, to: local(0.06, 1.09, 0.46), palm: toRight, curl: 0.5, grasp: false },
      { at: 15.55, to: restL, palm: DOWN, curl: 0.3, grasp: false },
      { at: 16.5, to: restL, palm: DOWN, curl: 0.3, grasp: false },
      { at: 16.75, to: wave, palm: toCamera, curl: 0.05, grasp: false },
      { at: 17.25, to: wave, palm: toCamera, curl: 0.05, grasp: false },
      { at: 17.5, to: restL, palm: DOWN, curl: 0.3, grasp: false },
      { at: 20, to: restL, palm: DOWN, curl: 0.3, grasp: false },
    ], local(0.55, 0.7, -0.1));

    this.placeBottle(g);
  }

  /** On the table, then in her left hand, then handed to her right hand. */
  private placeBottle(g: number) {
    const b = this.bottle;
    if (g < 10.38) {
      b.position.copy(this.tableBottle);
      b.quaternion.identity();
      return;
    }
    const side: Side = g < 11.0 ? "L" : "R";
    const hand = this.h.joints[`hand${side}`];
    hand.updateMatrixWorld(true);
    b.position.copy(hand.localToWorld(new THREE.Vector3(0, -0.05, 0.048)));
    const s = side === "L" ? 1 : -1;
    const offset = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -s * Math.PI / 2);
    hand.getWorldQuaternion(b.quaternion).multiply(offset);
  }
}

// ---------------------------------------------------------------------------
// Character C — editor
// ---------------------------------------------------------------------------

export class EditorAct {
  private readonly neckPose = { pos: new THREE.Vector3(0, 0.255, -0.07), rot: new THREE.Euler(-1.35, 0, 0) };
  private readonly headPose = { pos: new THREE.Vector3(0, 0.232, -0.005), rot: new THREE.Euler(0, 0, 0) };

  constructor(readonly h: Humanoid, readonly desk: DeskSet, readonly headphones: THREE.Object3D) {
    h.root.position.set(7.0, 0.08, -1.05);
    h.root.rotation.y = Math.PI;
    headphones.scale.setScalar(1.3);
  }

  /** Mouse movement for each editing beat (desk-local offsets). */
  private mouseOffset(g: number, time: number): [number, number] {
    if (g < 21.5) return [0.015 * Math.sin(time * 0.7), 0.012 * Math.sin(time * 1.1)];
    if (g < 22.3) return [0, 0];
    if (g < 22.9) {
      const e = easeInOut(range(g, 22.3, 22.7)) * (1 - range(g, 22.75, 22.9));
      return [-0.09 * e, 0.05 * e];
    }
    if (g < 24) return [0.03 * Math.sin(g * 25), 0.01 * Math.cos(g * 18)];
    if (g < 26) return [0.03 * Math.cos(g * 7), 0.025 * Math.sin(g * 7)];
    return [0.01 * Math.sin(time * 0.6), 0.008 * Math.sin(time * 0.9)];
  }

  apply(g: number, time: number) {
    const { h, desk } = this;
    const [dx, dz] = this.mouseOffset(g, time);
    desk.mouse.position.set(0.3 + dx, 0.7655, 0.2 + dz);
    desk.group.updateMatrixWorld(true);

    h.resetPose();
    h.joints.hips.position.y = 0.57;
    h.setLegs(1.38, 1.42, 0.14);
    const lean = sampleNumber(g, [
      [8, 0.2], [21.5, 0.2], [21.7, 0.12], [22.4, 0.12], [22.7, 0.22], [24.2, 0.28], [26, 0.26], [26.1, 0.22], [28.1, 0.22], [28.6, -0.06],
    ]);
    h.setTorso(lean, sampleNumber(g, [[25.2, 0], [25.4, -0.12], [25.7, -0.12], [25.85, 0]]));
    h.breathe(time);
    h.root.updateMatrixWorld(true);

    const main = wp(desk.anchors.mainScreen);
    const side = wp(desk.anchors.sideScreen);
    const laptop = wp(desk.anchors.laptop);
    const look = blendPoint(g, [
      [8, main], [21.0, main], [21.1, laptop], [21.45, laptop], [21.6, main], [25.2, main], [25.35, side], [25.7, side], [25.85, main], [29, main],
    ]);
    if (g > 28.7) look.y -= Math.sin(range(g, 28.7, 29) * Math.PI) * 0.06;
    h.lookAt(look);
    h.setFace(blinkAt(time, 7), sampleNumber(g, [[8, 0.3], [28.4, 0.3], [28.8, 0.9]]));
    h.root.updateMatrixWorld(true);

    // Headphones: resting around his neck, then put on during F10
    const on = easeInOut(range(g, 21.7, 22.35));
    const neckM = new THREE.Matrix4().compose(this.neckPose.pos, new THREE.Quaternion().setFromEuler(this.neckPose.rot), new THREE.Vector3(1, 1, 1));
    const headM = new THREE.Matrix4().compose(this.headPose.pos, new THREE.Quaternion().setFromEuler(this.headPose.rot), new THREE.Vector3(1, 1, 1));
    neckM.premultiply(h.joints.chest.matrixWorld);
    headM.premultiply(h.joints.head.matrixWorld);
    const pA = new THREE.Vector3(), qA = new THREE.Quaternion(), pB = new THREE.Vector3(), qB = new THREE.Quaternion(), s = new THREE.Vector3();
    neckM.decompose(pA, qA, s);
    headM.decompose(pB, qB, s);
    const lift = Math.sin(on * Math.PI) * 0.06;
    this.headphones.position.copy(pA).lerp(pB, on).add(new THREE.Vector3(0, lift, 0));
    this.headphones.quaternion.copy(qA).slerp(qB, on);
    this.headphones.updateMatrixWorld(true);
    const cupR = this.headphones.localToWorld(new THREE.Vector3(-0.104, -0.1, 0));
    const cupL = this.headphones.localToWorld(new THREE.Vector3(0.104, -0.1, 0));

    const typing = g > 26.0 && g < 27.0;
    const shortcuts = g > 23.0 && g < 24.0;
    const tap = (phase: number) => (typing || (shortcuts && phase === 0) ? 0.012 * Math.max(0, Math.sin(time * 15 + phase)) : 0);
    const mouse = wp(desk.mouse).add(new THREE.Vector3(0, 0.03 - (g > 27.1 && g < 27.22 ? 0.008 : 0), 0.01));
    const keyL = wp(desk.anchors.keyLeft).add(new THREE.Vector3(0, tap(0), 0));
    const keyR = wp(desk.anchors.keyRight).add(new THREE.Vector3(0, tap(1.7), 0));
    const towardHead = (p: THREE.Vector3) => wp(h.joints.head).sub(p).normalize();
    const lapL = h.localPoint(0.14, 0.72, 0.25);

    driveArm(h, "R", g, [
      { at: 8, to: mouse, palm: DOWN, curl: 0.35, grasp: false },
      { at: 21.5, to: mouse, palm: DOWN, curl: 0.35, grasp: false },
      { at: 21.68, to: cupR, palm: towardHead(cupR), curl: 0.6, grasp: false },
      { at: 22.38, to: cupR, palm: towardHead(cupR), curl: 0.6, grasp: false },
      { at: 22.6, to: mouse, palm: DOWN, curl: 0.35, grasp: false },
      { at: 25.95, to: mouse, palm: DOWN, curl: 0.35, grasp: false },
      { at: 26.1, to: keyR, palm: DOWN, curl: 0.25, grasp: false },
      { at: 26.95, to: keyR, palm: DOWN, curl: 0.25, grasp: false },
      { at: 27.1, to: mouse, palm: DOWN, curl: 0.35, grasp: false },
      { at: 29, to: mouse, palm: DOWN, curl: 0.35, grasp: false },
    ], h.localPoint(-0.55, 0.75, -0.2));

    driveArm(h, "L", g, [
      { at: 8, to: keyL, palm: DOWN, curl: 0.25, grasp: false },
      { at: 21.5, to: keyL, palm: DOWN, curl: 0.25, grasp: false },
      { at: 21.68, to: cupL, palm: towardHead(cupL), curl: 0.6, grasp: false },
      { at: 22.38, to: cupL, palm: towardHead(cupL), curl: 0.6, grasp: false },
      { at: 22.6, to: keyL, palm: DOWN, curl: 0.25, grasp: false },
      { at: 28.2, to: keyL, palm: DOWN, curl: 0.25, grasp: false },
      { at: 28.55, to: lapL, palm: localDir(h, -1, -1, 0), curl: 0.4, grasp: false },
      { at: 29, to: lapL, palm: localDir(h, -1, -1, 0), curl: 0.4, grasp: false },
    ], h.localPoint(0.55, 0.75, -0.2));
  }
}

// ---------------------------------------------------------------------------
// Scene 3 — graphic designer
// ---------------------------------------------------------------------------

export type DesignerTargets = {
  /** World positions the designer looks at during review */
  altLeft: () => THREE.Vector3;
  altRight: () => THREE.Vector3;
  card: () => THREE.Vector3;
};

export class DesignerAct {
  private readonly hover = 0.022;

  constructor(
    readonly h: Humanoid,
    readonly desk: DesignDesk,
    readonly stylus: THREE.Object3D,
    readonly targets: DesignerTargets,
    position: THREE.Vector3,
    yaw: number,
  ) {
    h.root.position.copy(position).setY(0.08);
    h.root.rotation.y = yaw;
  }

  /** World point on the pen display's poster (−1…1 across it), lifted along the screen normal. */
  private tabletPoint(x: number, y: number, lift: number) {
    return this.desk.tablet.localToWorld(new THREE.Vector3(-0.02 + x * 0.076, y * 0.095, 0.002 + lift));
  }

  apply(g: number, time: number) {
    const { h, desk } = this;
    h.resetPose();
    h.joints.hips.position.y = 0.57;
    h.setLegs(1.38, 1.42, 0.14);
    const lean = sampleNumber(g, [[29, 0.14], [30.3, 0.2], [31, 0.24], [34, 0.22], [37, 0.16], [38.6, -0.04], [40, -0.04]]);
    h.setTorso(lean, sampleNumber(g, [[36.2, 0], [36.35, 0.12], [36.5, -0.12], [36.7, 0]]));
    h.breathe(time);
    h.root.updateMatrixWorld(true);
    desk.group.updateMatrixWorld(true);

    const pen = penAt(g);
    const monitor = wp(desk.anchors.monitorCenter);
    const tablet = wp(desk.anchors.tabletCenter);
    const stylusRest = wp(desk.anchors.stylusRest);
    const tip = this.tabletPoint(pen.x, pen.y, (1 - pen.down) * this.hover);
    const card = this.targets.card();
    const look = blendPoint(g, [
      [29, monitor], [29.6, monitor], [30.15, stylusRest], [30.6, tablet], [31.8, monitor], [32.2, tablet], [33.3, monitor],
      [33.6, tablet], [34.2, monitor], [36.15, monitor], [36.3, this.targets.altLeft()], [36.48, this.targets.altRight()],
      [36.7, monitor], [37.3, card], [40, card],
    ]);
    if (g > 39.1 && g < 39.6) look.y -= Math.sin(range(g, 39.1, 39.6) * Math.PI) * 0.05;
    h.lookAt(look);
    h.setFace(blinkAt(time, 23), sampleNumber(g, [[29, 0.35], [36.6, 0.45], [37.4, 0.85], [40, 0.9]]), 0, g > 37.3 ? 0.4 : 0);

    // Stylus: resting on the display, then held. The barrel leans back from the tip towards his hand.
    const tabletNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(desk.tablet.getWorldQuaternion(new THREE.Quaternion()));
    const towardHim = localDir(h, 0, 0, -1);
    const hisRight = localDir(h, -1, 0, 0);
    const barrel = tabletNormal.clone().multiplyScalar(0.62).addScaledVector(towardHim, 0.22).addScaledVector(hisRight, 0.68).normalize();
    if (pen.held) {
      this.stylus.position.copy(tip);
      this.stylus.quaternion.setFromUnitVectors(UP, barrel);
    } else {
      this.stylus.position.copy(stylusRest);
      desk.tablet.getWorldQuaternion(this.stylus.quaternion);
    }
    this.stylus.updateMatrixWorld(true);

    // Wrist sits up the barrel so the fingers rest on the pen with the tip showing below them
    const grip = tip.clone().addScaledVector(barrel, 0.12).addScaledVector(towardHim, 0.05);
    const palm = tabletNormal.clone().negate().multiplyScalar(0.6).addScaledVector(localDir(h, 1, 0, 0), 0.6).normalize();
    const rest = wp(desk.anchors.handRest);
    const settled = this.tabletPoint(0.3, -0.38, 0.06).addScaledVector(barrel, 0.1);
    driveArm(h, "R", g, [
      { at: 29, to: rest, palm: DOWN, curl: 0.35, grasp: false },
      { at: 30.15, to: rest, palm: DOWN, curl: 0.35, grasp: false },
      { at: 30.42, to: stylusRest, palm: DOWN, curl: 0.55 },
      { at: 30.55, to: grip, palm, curl: 0.62, thumb: "grip", grasp: false },
      { at: 38.4, to: grip, palm, curl: 0.62, thumb: "grip", grasp: false },
      { at: 38.6, to: settled, palm, curl: 0.62, thumb: "grip", grasp: false },
      { at: 40, to: settled, palm, curl: 0.62, thumb: "grip", grasp: false },
    ], h.localPoint(-0.55, 0.7, -0.2));
    // Once picked up, keep the hand exactly on the moving stylus while drawing
    if (g >= 30.55 && g < 38.4) {
      h.solveArm("R", { target: grip, pole: h.localPoint(-0.55, 0.7, -0.2), palm, curl: 0.62, thumb: "grip" });
    }

    // Left hand on the keyboard, tapping shortcuts while adjusting the layout
    const tapping = g > 33.0 && g < 36.2;
    const keyL = wp(desk.anchors.keyLeft).add(new THREE.Vector3(0, tapping ? 0.012 * Math.max(0, Math.sin(time * 12)) : 0, 0));
    const lap = h.localPoint(0.14, 0.72, 0.25);
    driveArm(h, "L", g, [
      { at: 29, to: keyL, palm: DOWN, curl: 0.25, grasp: false },
      { at: 38.4, to: keyL, palm: DOWN, curl: 0.25, grasp: false },
      { at: 38.8, to: lap, palm: localDir(h, -1, -1, 0), curl: 0.4, grasp: false },
      { at: 40, to: lap, palm: localDir(h, -1, -1, 0), curl: 0.4, grasp: false },
    ], h.localPoint(0.55, 0.7, -0.2));
  }
}


// ---------------------------------------------------------------------------
// Shared helpers for scenes 4–5
// ---------------------------------------------------------------------------

type NumberKeys = Keys<number>;
type PointKeys = Keys<THREE.Vector3>;

/** Wrist target that puts the fingertips (not the wrist) of `side` on `point`: solve once, then pull back along the forearm. */
function touch(h: Humanoid, side: Side, point: THREE.Vector3, pole: THREE.Vector3, palm: THREE.Vector3, curl: number) {
  h.solveArm(side, { target: point, pole, palm, curl, thumb: "rest" });
  const elbow = wp(h.joints[`forearm${side}`]);
  const wrist = wp(h.joints[`hand${side}`]);
  const dir = wrist.sub(elbow).normalize();
  return point.clone().addScaledVector(dir, -0.15 * h.root.scale.x);
}

/** Wrist target that extends the arm from the shoulder towards a world point (for pointing gestures). */
function pointToward(h: Humanoid, side: Side, at: THREE.Vector3, reach = 0.47) {
  const shoulder = wp(h.joints[`upperArm${side}`]);
  return shoulder.clone().addScaledVector(at.clone().sub(shoulder).normalize(), reach * h.root.scale.x);
}

// ---------------------------------------------------------------------------
// Scene 4 — social media manager
// ---------------------------------------------------------------------------

export type SocialTargets = {
  /** The poster and reel floating in as a content preview (4.1) */
  arriving: () => THREE.Vector3;
  /** Rest positions of the three floating post cards (4.3) */
  posts: THREE.Vector3[];
  /** The content-performance dashboard (4.4) */
  dashboard: THREE.Vector3;
  /** The campaign card on its way to the marketing desk */
  campaign: () => THREE.Vector3;
  /** Where the 4.2 close-up camera is: she angles the phone a little towards it */
  show: THREE.Vector3;
};

/** Phone hold positions in her own frame (wrist of the hand holding the phone). */
const HOLD = {
  idle: new THREE.Vector3(-0.08, 0.93, 0.27),
  review: new THREE.Vector3(-0.08, 0.99, 0.29),
  show: new THREE.Vector3(-0.12, 1.02, 0.29),
  check: new THREE.Vector3(-0.09, 0.97, 0.28),
  lap: new THREE.Vector3(-0.11, 0.85, 0.27),
};
const HOLD_KEYS: PointKeys = [
  [40, HOLD.idle], [41.3, HOLD.idle], [41.6, HOLD.review], [42.25, HOLD.review], [42.5, HOLD.show], [44.85, HOLD.show],
  [45.25, HOLD.idle], [46.35, HOLD.idle], [46.55, HOLD.check], [47.15, HOLD.check], [47.35, HOLD.idle], [48.0, HOLD.idle], [48.3, HOLD.lap],
];
const SHOW_KEYS: NumberKeys = [[42.25, 0], [42.5, 0.55], [44.85, 0.55], [45.25, 0]];

export class SocialManagerAct {
  constructor(readonly h: Humanoid, readonly phone: THREE.Object3D, position: THREE.Vector3, yaw: number, readonly targets: SocialTargets) {
    h.root.position.copy(position).setY(0.08);
    h.root.rotation.y = yaw;
  }

  apply(g: number, time: number) {
    const { h, phone, targets } = this;
    h.resetPose();
    h.joints.hips.position.y = (0.755 - 0.08) / h.root.scale.x;
    h.setLegs(1.45, 2.0, 0.1);
    const lean = sampleNumber(g, [[40, 0.08], [42.3, 0.08], [42.5, 0.13], [44.8, 0.13], [45.2, 0.06], [47.3, 0.06], [47.45, -0.03], [47.8, -0.03], [48.1, 0.04]]);
    const twist = sampleNumber(g, [[42.3, 0], [42.5, -0.1], [44.8, -0.1], [45.2, 0], [48.45, 0], [48.75, 0.22], [49.6, 0.22], [49.95, 0.12]]);
    h.setTorso(lean, twist);
    h.breathe(time, 0.8);
    h.root.updateMatrixWorld(true);

    // Right hand holds the phone; the phone rests in the palm, screen towards her (and a little towards the close-up camera)
    const eyes = h.joints.head.localToWorld(new THREE.Vector3(0, 0.118, 0.1));
    const aim = eyes.clone().lerp(targets.show, sampleNumber(g, SHOW_KEYS));
    const holdLocal = blendPoint(g, HOLD_KEYS);
    const hold = h.localPoint(holdLocal.x, holdLocal.y, holdLocal.z);
    const poleR = h.localPoint(-0.5, 0.7, -0.1);
    h.solveArm("R", { target: hold, pole: poleR, palm: aim.clone().sub(hold).normalize(), curl: 0.1, thumb: "rest" });
    // The phone lies flush on the palm, upright (portrait) whatever the forearm's direction
    const handR = h.joints.handR;
    const palmN = new THREE.Vector3(0, 0, 1).applyQuaternion(handR.getWorldQuaternion(new THREE.Quaternion()));
    const phoneUp = UP.clone().addScaledVector(palmN, -palmN.y).normalize();
    const phoneX = phoneUp.clone().cross(palmN);
    phone.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(phoneX, phoneUp, palmN));
    phone.position.copy(handR.localToWorld(new THREE.Vector3(0, -0.062, 0))).addScaledVector(palmN, 0.024);
    phone.updateMatrixWorld(true);
    // Thumb scrolling while browsing and reviewing
    const scrolling = g < 41.25 || (g > 41.65 && g < 42.25) || (g > 45.3 && g < 46.3) || g > 48.3 ? 1 : 0;
    h.joints.thumbR.rotation.x += scrolling * Math.sin(time * 3.2) * 0.35;

    // Head and face
    const phoneAt = wp(phone);
    const [postA, postB, postC] = targets.posts;
    const look = blendPoint(g, [
      [40, phoneAt], [40.55, phoneAt], [40.8, targets.arriving()], [41.35, targets.arriving()], [41.6, phoneAt], [45.25, phoneAt],
      [45.5, postA], [45.85, postB], [46.15, postC], [46.35, phoneAt], [47.25, phoneAt], [47.42, postB], [47.95, postB],
      [48.3, targets.dashboard], [49.55, targets.dashboard], [49.8, targets.campaign()], [50, targets.campaign()],
    ]);
    if (g > 41.6 && g < 42.25) look.y += Math.sin(time * 2.2) * 0.012; // small nods while reviewing
    h.lookAt(look);
    const smile = sampleNumber(g, [[40, 0.5], [41.2, 0.5], [41.45, 0.8], [42.2, 0.65], [44.55, 0.6], [44.7, 1], [45.6, 0.85], [46.9, 0.85], [47.05, 1], [47.8, 1], [48.2, 0.8], [50, 0.85]]);
    const cheer = range(g, 47.3, 47.4) * (1 - range(g, 47.75, 47.9));
    h.setFace(blinkAt(time, 41), smile, 0.22 * cheer, Math.max(0.5 * cheer, 0.3 * range(g, 44.6, 44.7) * (1 - range(g, 45.1, 45.3))));

    // Left hand: supports the phone, taps the screen, opens towards the new posts, a small fist pump, then points at the dashboard
    const poleL = h.localPoint(0.5, 0.7, -0.1);
    const leftShoulder = wp(h.joints.upperArmL);
    const edgeA = phone.localToWorld(new THREE.Vector3(0.04, -0.035, -0.008));
    const edgeB = phone.localToWorld(new THREE.Vector3(-0.04, -0.035, -0.008));
    const leftEdgeIsA = edgeA.distanceTo(leftShoulder) < edgeB.distanceTo(leftShoulder);
    const grip = leftEdgeIsA ? edgeA : edgeB;
    const gripPalm = leftEdgeIsA ? phoneX.clone().negate() : phoneX.clone();
    const lap = h.localPoint(0.12, 0.84, 0.3);
    const fistUp = h.localPoint(0.2, 1.17, 0.26);
    const fistDown = h.localPoint(0.2, 1.09, 0.27);
    const open = h.localPoint(0.3, 1.08, 0.33);
    const openPalm = UP.clone().lerp(localDir(h, 1, 0, 0), 0.3).normalize();
    const point = pointToward(h, "L", targets.dashboard);
    const inward = localDir(h, -1, 0, 0);
    const pointPalm = DOWN.clone().lerp(inward, 0.3).normalize();
    const lapPalm = localDir(h, -1, -1, 0);
    const keys: HandKey[] = [
      { at: 40, to: grip, palm: gripPalm, curl: 0.55, thumb: "grip", grasp: false },
      { at: 45.2, to: grip, palm: gripPalm, curl: 0.55, thumb: "grip", grasp: false },
      { at: 45.45, to: open, palm: openPalm, curl: 0.1, grasp: false },
      { at: 45.8, to: open, palm: openPalm, curl: 0.1, grasp: false },
      { at: 46.05, to: grip, palm: gripPalm, curl: 0.55, thumb: "grip", grasp: false },
      { at: 47.25, to: grip, palm: gripPalm, curl: 0.55, thumb: "grip", grasp: false },
      { at: 47.42, to: fistUp, palm: inward, curl: 1, thumb: "grip", grasp: false },
      { at: 47.56, to: fistDown, palm: inward, curl: 1, thumb: "grip", grasp: false },
      { at: 47.68, to: fistUp, palm: inward, curl: 1, thumb: "grip", grasp: false },
      { at: 47.95, to: lap, palm: lapPalm, curl: 0.4, grasp: false },
      { at: 48.45, to: lap, palm: lapPalm, curl: 0.4, grasp: false },
      { at: 48.75, to: point, palm: pointPalm, curl: 0.15, grasp: false },
      { at: 49.55, to: point, palm: pointPalm, curl: 0.15, grasp: false },
      { at: 49.95, to: lap, palm: lapPalm, curl: 0.4, grasp: false },
    ];
    const finger = fingerAt(g);
    if (finger.active > 0) {
      // Fingertip on the phone screen (the same tap list drives the phone UI)
      const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(phone.quaternion);
      const tip = phone.localToWorld(new THREE.Vector3(finger.u * 0.033, finger.v * 0.069, 0.0055 + finger.lift));
      const palm = normal.clone().negate().lerp(DOWN, 0.25).normalize();
      const tapWrist = touch(h, "L", tip, poleL, palm, 0.12);
      driveArm(h, "L", g, keys, poleL);
      const base = wp(h.joints.handL);
      h.solveArm("L", {
        target: base.lerp(tapWrist, finger.active),
        pole: poleL,
        palm: gripPalm.clone().lerp(palm, finger.active).normalize(),
        curl: lerp(0.55, 0.12, finger.active),
        thumb: finger.active > 0.5 ? "rest" : "grip",
      });
    } else {
      driveArm(h, "L", g, keys, poleL);
    }
  }
}

// ---------------------------------------------------------------------------
// Scene 5 — digital marketing specialist
// ---------------------------------------------------------------------------

export type MarketerTargets = {
  /** The campaign card arriving from the social corner */
  card: () => THREE.Vector3;
  /** Floating analytics panel (5.3) and audience map (5.4) */
  panel: THREE.Vector3;
  map: THREE.Vector3;
};

export class MarketerAct {
  constructor(readonly h: Humanoid, readonly desk: MarketingDesk, position: THREE.Vector3, yaw: number, readonly targets: MarketerTargets) {
    h.root.position.copy(position).setY(0.08);
    h.root.rotation.y = yaw;
  }

  apply(g: number, time: number) {
    const { h, desk, targets } = this;
    // The mouse follows the on-screen cursor (and idles before the campaign arrives)
    const c = cursorAt(g);
    const working = g > 50.85;
    const dx = working ? (c.x / 1280 - 0.5) * 0.14 : 0.012 * Math.sin(time * 0.7);
    const dz = working ? (c.y / 720 - 0.5) * 0.09 : 0.01 * Math.sin(time * 1.1);
    desk.mouse.position.set(0.36 + dx, 0.7655, 0.2 + dz);
    desk.group.updateMatrixWorld(true);

    h.resetPose();
    h.joints.hips.position.y = 0.57;
    h.setLegs(1.38, 1.42, 0.14);
    const lean = sampleNumber(g, [[40, 0.18], [50.55, 0.18], [50.85, 0.12], [51.5, 0.2], [52.2, 0.26], [54.8, 0.26], [55.05, 0.12], [55.6, 0.14], [56.4, 0.1], [57.6, 0.1], [58.2, 0.15]]);
    const twist = sampleNumber(g, [[55.9, 0], [56.3, -0.1], [57.7, -0.1], [58.1, -0.04], [58.5, -0.14], [59.6, -0.14], [60, -0.1]]);
    h.setTorso(lean, twist);
    h.breathe(time);
    h.root.updateMatrixWorld(true);

    const monitor = wp(desk.anchors.mainScreen);
    const side = wp(desk.anchors.sideScreen);
    const keyboard = wp(desk.keyboard);
    const look = blendPoint(g, [
      [40, monitor], [46, monitor], [46.4, side], [47, side], [47.3, monitor], [50.4, monitor], [50.55, targets.card()], [50.8, targets.card()],
      [50.95, monitor], [52.4, monitor], [52.5, keyboard], [52.62, monitor], [55.15, monitor], [55.35, targets.panel], [58.05, targets.panel],
      [58.3, targets.map], [60, targets.map],
    ]);
    if (g > 57.15 && g < 57.55) look.y -= Math.sin(range(g, 57.15, 57.55) * Math.PI) * 0.05; // a small approving nod
    h.lookAt(look);
    const smile = sampleNumber(g, [[40, 0.3], [50.8, 0.35], [51, 0.6], [54.72, 0.45], [54.85, 0.9], [55.4, 0.6], [57.1, 0.6], [57.3, 1], [58, 0.8], [60, 0.75]]);
    const brow = Math.max(0.4 * range(g, 54.75, 54.85) * (1 - range(g, 55.2, 55.4)), 0.5 * range(g, 57.2, 57.3) * (1 - range(g, 57.6, 57.8)));
    h.setFace(blinkAt(time, 47), smile, 0, brow);

    // Right hand on the mouse (clicks press the finger), then pointing at the chart and gesturing across the map
    const mouse = wp(desk.mouse).add(new THREE.Vector3(0, 0.03 - (c.down ? 0.006 : 0), 0.01));
    const click = c.down ? 0.5 : 0.35;
    const poleR = h.localPoint(-0.55, 0.75, -0.2);
    const toMap = targets.map.clone().sub(wp(h.joints.head)).setY(0).normalize();
    const mapRight = new THREE.Vector3(0, 1, 0).cross(toMap).normalize();
    const mapA = pointToward(h, "R", targets.map.clone().addScaledVector(mapRight, 0.22).add(new THREE.Vector3(0, 0.06, 0)), 0.46);
    const mapB = pointToward(h, "R", targets.map.clone().addScaledVector(mapRight, -0.2).add(new THREE.Vector3(0, -0.04, 0)), 0.46);
    const atPanel = pointToward(h, "R", targets.panel, 0.47);
    const flat = DOWN.clone().lerp(localDir(h, 1, 0, 0), 0.3).normalize();
    driveArm(h, "R", g, [
      { at: 40, to: mouse, palm: DOWN, curl: click, grasp: false },
      { at: 56.15, to: mouse, palm: DOWN, curl: click, grasp: false },
      { at: 56.45, to: atPanel, palm: flat, curl: 0.15, grasp: false },
      { at: 57.55, to: atPanel, palm: flat, curl: 0.15, grasp: false },
      { at: 57.9, to: mouse, palm: DOWN, curl: click, grasp: false },
      { at: 58.4, to: mouse, palm: DOWN, curl: click, grasp: false },
      { at: 58.7, to: mapA, palm: flat, curl: 0.15, grasp: false },
      { at: 58.85, to: mapA, palm: flat, curl: 0.15, grasp: false },
      { at: 59.25, to: mapB, palm: flat, curl: 0.15, grasp: false },
      { at: 59.4, to: mapB, palm: flat, curl: 0.15, grasp: false },
      { at: 59.8, to: mouse, palm: DOWN, curl: click, grasp: false },
    ], poleR);

    // Left hand on the keyboard, typing the audience keyword
    const typing = g > TYPING.from && g < TYPING.to;
    const keyL = wp(desk.anchors.keyLeft).add(new THREE.Vector3(0, typing ? 0.012 * Math.max(0, Math.sin(time * 15)) : 0, 0));
    h.solveArm("L", { target: keyL, pole: h.localPoint(0.55, 0.75, -0.2), palm: DOWN, curl: 0.25 });
  }
}

// ---------------------------------------------------------------------------
// Scene 6 preparation — web & app developer, already at work
// ---------------------------------------------------------------------------

export class DeveloperAct {
  constructor(readonly h: Humanoid, readonly desk: DeskSet, position: THREE.Vector3, yaw: number) {
    h.root.position.copy(position).setY(0.08);
    h.root.rotation.y = yaw;
  }

  /** Idle: typing and glancing between the code and the site preview (scene 6 will take over). */
  apply(time: number) {
    const { h, desk } = this;
    h.resetPose();
    h.joints.hips.position.y = 0.57;
    h.setLegs(1.38, 1.42, 0.14);
    h.setTorso(0.2);
    h.breathe(time);
    h.root.updateMatrixWorld(true);
    const glance = Math.sin(time * 0.35) > 0.82;
    h.lookAt(wp(glance ? desk.anchors.sideScreen : desk.anchors.mainScreen));
    h.setFace(blinkAt(time, 59), 0.35);
    const tap = (phase: number) => new THREE.Vector3(0, 0.012 * Math.max(0, Math.sin(time * 13 + phase)), 0);
    h.solveArm("L", { target: wp(desk.anchors.keyLeft).add(tap(0)), pole: h.localPoint(0.55, 0.75, -0.2), palm: DOWN, curl: 0.25 });
    h.solveArm("R", { target: wp(desk.anchors.keyRight).add(tap(1.9)), pole: h.localPoint(-0.55, 0.75, -0.2), palm: DOWN, curl: 0.25 });
  }
}
