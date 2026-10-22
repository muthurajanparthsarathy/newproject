"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { StudioWorld } from "./studioWorld";
import type { StoryClock } from "./timeline";

type Props = {
  clock: StoryClock;
  lowPower: boolean;
  /** Pauses rendering while the section is off screen */
  active: boolean;
  onReady: () => void;
  onContextLost: () => void;
};

function Studio({ clock, lowPower, onReady }: Pick<Props, "clock" | "lowPower" | "onReady">) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const setDpr = useThree((s) => s.setDpr);
  const worldRef = useRef<StudioWorld | null>(null);
  const ready = useRef(false);
  const perf = useRef({ time: 0, frames: 0, downgraded: false });

  useEffect(() => {
    const w = new StudioWorld(gl, scene, { lowPower });
    worldRef.current = w;
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __studioWorld: w });
    return () => {
      w.dispose();
      worldRef.current = null;
    };
  }, [gl, scene, lowPower]);

  useFrame((state, delta) => {
    const world = worldRef.current;
    if (!world) return;
    world.update(clock.current, state.clock.elapsedTime, state.gl, state.camera as THREE.PerspectiveCamera, state.size);
    if (!ready.current && world.ready) {
      ready.current = true;
      onReady();
    }
    // Adaptive quality: if the first seconds run slower than ~40 fps, drop the pixel ratio.
    const p = perf.current;
    if (!p.downgraded && p.time < 3) {
      p.time += delta;
      p.frames++;
      if (p.time > 2 && p.frames / p.time < 40) {
        p.downgraded = true;
        setDpr(1);
      }
    }
  });

  return null;
}

export default function StudioCanvas({ clock, lowPower, active, onReady, onContextLost }: Props) {
  return (
    <Canvas
      dpr={lowPower ? [1, 1.25] : [1, 1.75]}
      shadows={lowPower ? false : "percentage"}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: !lowPower, powerPreference: "high-performance" }}
      camera={{ fov: 42, near: 0.05, far: 80, position: [-5.6, 4.1, 13.2] }}
      onCreated={({ gl, camera }) => {
        if (process.env.NODE_ENV !== "production") {
          Object.assign(window, { __studioGl: gl, __studioCamera: camera });
        }
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.98;
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost();
        });
      }}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <Studio clock={clock} lowPower={lowPower} onReady={onReady} />
    </Canvas>
  );
}
