"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, MessageCircle, Sparkles, X } from "lucide-react";
import { Container } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink, cn } from "@/lib/utils";
import { ONE_TEAM_SCENES, type OneTeamArt, type OneTeamEffect, type OneTeamLayer, type OneTeamScene } from "@/lib/one-team-scenes";
import styles from "./one-team-island.module.css";

const SCENES = ONE_TEAM_SCENES;
const COUNT = SCENES.length;
const ART_LAYERS = SCENES.flatMap((s) => s.art?.layers ?? []);
const STEP = 360 / COUNT;
const TILT = 72;
const TILT_COS = Math.cos((TILT * Math.PI) / 180);
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const toRad = (deg: number) => (deg * Math.PI) / 180;
const pad = (n: number) => String(n).padStart(2, "0");
type Geometry = { w: number; h: number; cx: number; cy: number; rx: number; ry: number; disc: number };
function measure(w: number, h: number): Geometry {
  const disc = Math.min(w * 0.84, h * 1.45, 680);
  const rx = disc / 2;
  return { w, h, cx: w / 2, cy: h * 0.7, rx, ry: rx * TILT_COS, disc };
}

export function OneTeamIsland() {
  const trackRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const angle = useMotionValue(0);
  const geo = useMotionValue<Geometry>(measure(0, 0));
  const tilt = useSpring(0, { stiffness: 60, damping: 18 });
  const [measured, setMeasured] = useState(false);
  const [active, setActive] = useState(0);
  const [warm, setWarm] = useState(false);
  const activeRef = useRef(0);
  const suppressClick = useRef(false);
  const scene = SCENES[active];

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    const panel = panelRef.current;
    if (!stage || !track || !panel) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = parseFloat(getComputedStyle(panel).top) || 0;
      const range = Math.max(1, track.offsetHeight - panel.offsetHeight);
      const progress = clamp((top - track.getBoundingClientRect().top) / range, 0, 1);
      const position = clamp(progress * COUNT - 0.5, 0, COUNT - 1);
      angle.set((reduceMotion ? Math.round(position) : position) * STEP);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const ro = new ResizeObserver(() => {
      geo.set(measure(stage.clientWidth, stage.clientHeight));
      setMeasured(true);
      schedule();
    });
    ro.observe(stage);
    ro.observe(track);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setWarm(true); observer.disconnect(); }
    }, { rootMargin: "500px" });
    observer.observe(track);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      ro.disconnect(); observer.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [angle, geo, reduceMotion]);

  useMotionValueEvent(angle, "change", (value) => {
    const next = clamp(Math.round(value / STEP), 0, COUNT - 1);
    if (next !== activeRef.current) { activeRef.current = next; setActive(next); }
  });

  const select = useCallback((index: number) => {
    const track = trackRef.current;
    const panel = panelRef.current;
    if (!track || !panel) return;
    const target = clamp(index, 0, COUNT - 1);
    const inset = parseFloat(getComputedStyle(panel).top) || 0;
    const start = window.scrollY + track.getBoundingClientRect().top - inset;
    const range = track.offsetHeight - panel.offsetHeight;
    // Match the selected step's scroll position, so the next wheel/touch scroll continues from it.
    window.scrollTo({ top: start + ((target + 0.5) / COUNT) * range, behavior: "instant" });
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault(); select(activeRef.current + (e.key === "ArrowRight" ? 1 : -1));
    }
  };

  return (
    <section id="one-team" ref={trackRef} className={styles.track} style={{ height: `calc(100svh + ${COUNT * 65}svh)` }} aria-label="One team, from shoot to SEO">
      <div ref={panelRef} className={styles.panel}>
        <Container className={styles.content}>
          <header className={styles.heading}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600 sm:text-xs">One team · Shoot to SEO</p>
              <h2 className="mt-2 text-xl font-bold leading-tight sm:text-3xl">From the first shot <span className="text-gradient">to your next customer.</span></h2>
            </div>
            <a href="#services" className="shrink-0 text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-brand-600">Skip process</a>
          </header>
          <div className={styles.body}>
            <div ref={stageRef} role="group" aria-label="Process illustration. Scroll to explore, or use left and right arrow keys." tabIndex={0} onKeyDown={onKeyDown}
              onPointerMove={(e) => { if (e.pointerType === "mouse" && !reduceMotion) { const rect = e.currentTarget.getBoundingClientRect(); tilt.set(((e.clientX - rect.left) / rect.width - 0.5) * 2); } }}
              onPointerLeave={() => tilt.set(0)} className={styles.stage}>
              {measured && <>
                <Island angle={angle} geo={geo} />
                {SCENES.map((s, i) => <OrbitBadge key={s.id} scene={s} index={i} angle={angle} geo={geo} suppressClick={suppressClick} onSelect={select} />)}
                <SceneAnchor geo={geo} front={!!scene.art}>
                  <AnimatePresence initial={false}>
                    <motion.div key={scene.id} className="absolute bottom-0 left-0 origin-bottom -translate-x-1/2"
                      initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -12 }} transition={{ duration: reduceMotion ? 0 : 0.25 }}>
                      <SceneArt scene={scene} index={active} still={!!reduceMotion} geo={geo} angle={angle} tilt={tilt} />
                    </motion.div>
                  </AnimatePresence>
                </SceneAnchor>
              </>}
              {warm && <div aria-hidden className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
                {ART_LAYERS.map((l) => <Image key={l.src} src={l.src} alt="" width={l.width} height={l.height} sizes={layerSizes(l)} loading="eager" />)}
              </div>}
            </div>
            <div className={styles.caption} aria-live="polite" aria-atomic="true">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">{pad(active + 1)} / {pad(COUNT)} · {scene.label}</p>
              <h3 className="mt-2 text-xl font-bold sm:text-2xl lg:text-3xl">{scene.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground lg:mt-4 lg:text-base">{scene.description}</p>
              {scene.href && <Link href={scene.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">{scene.hrefLabel}<ArrowUpRight className="h-4 w-4" /></Link>}
              {scene.cta && <div className="mt-3"><Button href={buildWhatsAppLink("Hi Prova Media! I'd like one team to handle my shoot, ads, website and SEO.")} external variant="whatsapp"><MessageCircle className="h-4 w-4" />Let&rsquo;s talk</Button></div>}
            </div>
          </div>
          <nav aria-label="Process steps" className={styles.navigation}>
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><ArrowDown aria-hidden className="h-3.5 w-3.5" />Scroll to explore · up to go back</span>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Previous step" disabled={active === 0} onClick={() => select(active - 1)} className="rounded-full border border-slate-200 bg-white p-2 disabled:opacity-30"><ArrowLeft className="h-3.5 w-3.5" /></button>
                <button type="button" aria-label="Next step" disabled={active === COUNT - 1} onClick={() => select(active + 1)} className="rounded-full border border-slate-200 bg-white p-2 disabled:opacity-30"><ArrowRight className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </nav>
          <ol className="sr-only">{SCENES.map((s) => <li key={s.id}>{s.label}: {s.title} {s.description}</li>)}</ol>
        </Container>
      </div>
    </section>
  );
}
function Island({
  angle,
  geo,
}: {
  angle: MotionValue<number>;
  geo: MotionValue<Geometry>;
}) {
  const size = useTransform(() => geo.get().disc);
  const x = useTransform(() => geo.get().cx - geo.get().disc / 2);
  const y = useTransform(() => geo.get().cy - geo.get().disc / 2);
  const edgeY = useTransform(() => geo.get().cy - geo.get().disc / 2 + 14);
  const shadowY = useTransform(() => geo.get().cy - geo.get().disc / 2 + 40);

  return (
    <>
      {/* Soft shadow on the "ground" below the floating island */}
      <motion.div
        aria-hidden
        className="absolute left-0 top-0 rounded-full bg-slate-900/15 blur-2xl"
        style={{ x, y: shadowY, width: size, height: size, rotateX: TILT, scale: 0.85 }}
      />
      {/* Island thickness */}
      <motion.div
        aria-hidden
        className="absolute left-0 top-0 rounded-full bg-gradient-to-b from-brand-300 to-brand-500"
        style={{ x, y: edgeY, width: size, height: size, rotateX: TILT }}
      />
      {/* Island top — this is what turns */}
      <motion.div
        aria-hidden
        className="absolute left-0 top-0 rounded-full"
        style={{
          x,
          y,
          width: size,
          height: size,
          rotateX: TILT,
          rotateZ: angle,
          background:
            "radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f7ff 38%, #dceaff 68%, #bcd6ff 100%)",
          boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.8)",
        }}
      >
        <div className="absolute inset-[18%] rounded-full border-2 border-dashed border-brand-200" />
        <div className="absolute inset-[34%] rounded-full border border-brand-200/80" />
        <div className="absolute inset-[44%] rounded-full bg-white shadow-[0_0_0_10px_rgba(191,219,254,0.45)]" />
        {/* Rim dots */}
        {Array.from({ length: 48 }, (_, i) => {
          const t = toRad((i / 48) * 360);
          return (
            <span
              key={i}
              className="absolute h-[1.2%] w-[1.2%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-300"
              style={{
                left: `${50 + Math.sin(t) * 48}%`,
                top: `${50 + Math.cos(t) * 48}%`,
              }}
            />
          );
        })}
        {/* A pad under every scene's spot on the rim */}
        {SCENES.map((s, i) => {
          const t = toRad(i * STEP);
          return (
            <span
              key={s.id}
              className={cn(
                "absolute h-[4.5%] w-[4.5%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br opacity-50",
                s.accent
              )}
              style={{
                left: `${50 + Math.sin(t) * 43}%`,
                top: `${50 + Math.cos(t) * 43}%`,
              }}
            />
          );
        })}
      </motion.div>
    </>
  );
}

function OrbitBadge({
  scene,
  index,
  angle,
  geo,
  suppressClick,
  onSelect,
}: {
  scene: OneTeamScene;
  index: number;
  angle: MotionValue<number>;
  geo: MotionValue<Geometry>;
  suppressClick: RefObject<boolean>;
  onSelect: (index: number) => void;
}) {
  // Angle of this scene relative to the front of the island.
  const theta = () => toRad(index * STEP - angle.get());
  const x = useTransform(() => geo.get().cx + Math.sin(theta()) * geo.get().rx * 0.86);
  const y = useTransform(() => geo.get().cy + Math.cos(theta()) * geo.get().ry * 0.86);
  const depth = useTransform(() => Math.cos(theta()));
  const scale = useTransform(depth, (d) => 0.62 + 0.38 * ((d + 1) / 2));
  // Fade out as it reaches the front, where the big scene takes over.
  const opacity = useTransform(depth, (d) => {
    const base = 0.35 + 0.65 * ((d + 1) / 2);
    return d > 0.8 ? base * Math.max(0, (0.95 - d) / 0.15) : base;
  });
  const zIndex = useTransform(depth, (d) => (d < 0 ? 1 : 20));
  const Icon = scene.icon;

  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ x, y, scale, opacity, zIndex, transformOrigin: "0 0" }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={() => {
          if (!suppressClick.current) onSelect(index);
        }}
        className="flex -translate-x-1/2 -translate-y-full items-center gap-1.5 whitespace-nowrap rounded-full border border-white bg-white/90 py-1 pl-1 pr-3 text-xs font-semibold text-foreground shadow-[0_10px_24px_-10px_rgb(15_23_42_/_0.35)] backdrop-blur"
      >
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br text-white",
            scene.accent
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        {scene.label}
      </button>
    </motion.div>
  );
}

function SceneAnchor({
  geo,
  front,
  children,
}: {
  geo: MotionValue<Geometry>;
  /** Draw above the orbit badges (people would otherwise be covered) */
  front: boolean;
  children: ReactNode;
}) {
  const x = useTransform(() => geo.get().cx);
  const y = useTransform(() => geo.get().cy + geo.get().ry * 0.2);
  return (
    <motion.div
      className={cn(
        "pointer-events-none absolute left-0 top-0",
        front ? "z-30" : "z-10"
      )}
      style={{ x, y }}
    >
      {children}
    </motion.div>
  );
}

function SceneArt({
  scene,
  index,
  still,
  geo,
  angle,
  tilt,
}: {
  scene: OneTeamScene;
  index: number;
  still: boolean;
  geo: MotionValue<Geometry>;
  angle: MotionValue<number>;
  tilt: MotionValue<number>;
}) {
  // How far the island has turned away from this scene: 0 when it faces front,
  // ±1 at the hand-over to a neighbour. Measured per scene, so the outgoing art
  // keeps sliding the same way while it fades instead of snapping back.
  const drift = useTransform(() => (still ? 0 : clamp((angle.get() / STEP - index) * 2, -1.5, 1.5)));

  if (scene.art) {
    return <LayeredArt art={scene.art} still={still} geo={geo} drift={drift} tilt={tilt} />;
  }

  return <FlatArt scene={scene} still={still} drift={drift} tilt={tilt} />;
}

/** Scenes drawn in code (no cut-outs) get the same sideways parallax and swing. */
function FlatArt({
  scene,
  still,
  drift,
  tilt,
}: {
  scene: OneTeamScene;
  still: boolean;
  drift: MotionValue<number>;
  tilt: MotionValue<number>;
}) {
  const x = useParallax(drift, tilt, 0.6);
  const rotateY = useTransform(() => drift.get() * -8 + tilt.get() * 3);

  return (
    <motion.div style={{ x, rotateY, transformPerspective: 1200 }}>
      {scene.kind === "before" ? <BeforeArt scene={scene} /> : <IconArt scene={scene} still={still} />}
    </motion.div>
  );
}

function IconArt({ scene, still }: { scene: OneTeamScene; still: boolean }) {
  const Icon = scene.icon;
  const [first, second] = scene.chips;

  return (
    <div className="relative pb-3">
      <div
        aria-hidden
        className="absolute bottom-0 left-1/2 h-5 w-3/4 -translate-x-1/2 rounded-full bg-slate-900/25 blur-md"
      />
      <div
        className={cn(
          "relative flex h-[116px] w-[150px] items-center justify-center overflow-hidden rounded-[22px] sm:rounded-[28px] bg-gradient-to-br shadow-[0_30px_60px_-20px_rgb(15_23_42_/_0.45)] sm:h-[190px] sm:w-[250px] md:h-[210px] md:w-[280px]",
          scene.accent
        )}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/25 blur-2xl" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/40 backdrop-blur sm:h-24 sm:w-24 sm:rounded-3xl">
          <Icon className="h-7 w-7 text-white sm:h-12 sm:w-12" strokeWidth={1.6} />
        </div>
        <span className="absolute bottom-2.5 left-3 text-[10px] font-semibold uppercase sm:bottom-3 sm:left-4 sm:text-[11px] tracking-[0.2em] text-white/85">
          {scene.label}
        </span>
      </div>
      {first ? <FloatingChip chip={first} className="-left-6 top-3 sm:-left-8 sm:top-5" still={still} /> : null}
      {second ? (
        <FloatingChip chip={second} className="-right-6 bottom-8 sm:-right-8 sm:bottom-12" still={still} delay={0.8} />
      ) : null}
    </div>
  );
}

/** next/image `sizes` for a layer, shared with the preloader so it hits the cache. */
function layerSizes(layer: OneTeamLayer) {
  return `(max-width: 640px) ${Math.round(layer.size * 0.98)}vw, ${Math.round(layer.size * 7.5)}px`;
}

/** Sideways parallax offset for something at `depth`. */
function useParallax(drift: MotionValue<number>, tilt: MotionValue<number>, depth: number) {
  return useTransform(() => -(drift.get() * 30 + tilt.get() * 12) * depth);
}

/**
 * A scene built from cut-out layers on an artboard. While the island turns,
 * each layer slides by its own depth and the artboard swings a little, which
 * gives the 2.5D feel; at rest the people breathe and small effects play.
 */
function LayeredArt({
  art,
  still,
  geo,
  drift,
  tilt,
}: {
  art: OneTeamArt;
  still: boolean;
  geo: MotionValue<Geometry>;
  drift: MotionValue<number>;
  tilt: MotionValue<number>;
}) {
  const width = useTransform(() => {
    const g = geo.get();
    return Math.min(g.w * 0.98, g.disc * 1.1, g.h * 0.8 * art.aspect);
  });
  // Stand the artwork on the front half of the island.
  const lift = useTransform(() => geo.get().ry * 0.3);
  const rotateY = useTransform(() => drift.get() * -10 + tilt.get() * 3);

  return (
    <motion.div
      className="relative"
      style={{ width, aspectRatio: art.aspect, y: lift, rotateY, transformPerspective: 1200 }}
    >
      {art.layers.map((layer, i) => (
        <ArtLayer
          key={layer.src}
          layer={layer}
          index={i}
          still={still}
          drift={drift}
          tilt={tilt}
        />
      ))}
      {art.effects?.map((effect, i) => (
        <ArtEffect key={i} effect={effect} still={still} drift={drift} tilt={tilt} />
      ))}
    </motion.div>
  );
}

function ArtLayer({
  layer,
  index,
  still,
  drift,
  tilt,
}: {
  layer: OneTeamLayer;
  index: number;
  still: boolean;
  drift: MotionValue<number>;
  tilt: MotionValue<number>;
}) {
  const x = useParallax(drift, tilt, layer.depth);
  return (
    <motion.div
      className="absolute"
      style={{ left: `${layer.left}%`, bottom: `${layer.bottom}%`, width: `${layer.size}%`, x }}
    >
      {/* Breathing: a tiny stretch from the feet up */}
      <motion.div
        className="origin-bottom"
        animate={still ? undefined : { scaleY: [1, 1.008, 1] }}
        transition={{ duration: 3.6 + index * 0.9, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src={layer.src}
          alt={layer.alt}
          width={layer.width}
          height={layer.height}
          sizes={layerSizes(layer)}
          draggable={false}
          className="h-auto w-full select-none"
        />
      </motion.div>
    </motion.div>
  );
}

function ArtEffect({
  effect,
  still,
  drift,
  tilt,
}: {
  effect: OneTeamEffect;
  still: boolean;
  drift: MotionValue<number>;
  tilt: MotionValue<number>;
}) {
  const x = useParallax(drift, tilt, effect.depth);
  const loop = (duration: number) => ({ duration, repeat: Infinity, ease: "easeInOut" as const });

  if (effect.type === "glow") {
    const size = effect.size ?? 12;
    const rgb = effect.rgb ?? "255,236,200";
    return (
      <motion.div
        aria-hidden
        className="absolute"
        style={{ left: `${effect.left - size / 2}%`, top: `${effect.top}%`, width: `${size}%`, x }}
      >
        <motion.span
          className="block aspect-[1.6] -translate-y-1/2 rounded-full mix-blend-screen"
          style={{
            background: `radial-gradient(closest-side, rgba(${rgb},0.9), rgba(${rgb},0.35) 55%, transparent)`,
          }}
          animate={still ? { opacity: 0.7 } : { opacity: [0.45, 0.95, 0.45] }}
          transition={loop(2.8)}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      aria-hidden
      className="absolute"
      style={{ left: `${effect.left}%`, top: `${effect.top}%`, x }}
    >
      {effect.type === "rec" ? (
        <motion.span
          className="block h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-[0_0_8px_2px_rgb(239_68_68_/_0.7)]"
          animate={still ? undefined : { opacity: [1, 0.15, 1] }}
          transition={loop(1.1)}
        />
      ) : (
        <motion.span
          className="block -translate-x-1/2 -translate-y-1/2 text-amber-300 drop-shadow-[0_0_6px_rgb(253_230_138_/_0.9)]"
          animate={
            still ? undefined : { opacity: [0.2, 1, 0.2], scale: [0.6, 1.1, 0.6], rotate: [0, 20, 0] }
          }
          transition={loop(2.2)}
        >
          <Sparkles className="h-4 w-4" />
        </motion.span>
      )}
    </motion.div>
  );
}

function FloatingChip({
  chip,
  className,
  still,
  delay = 0,
}: {
  chip: OneTeamScene["chips"][number];
  className: string;
  still: boolean;
  delay?: number;
}) {
  const Icon = chip.icon;
  return (
    <motion.span
      className={cn(
        "absolute inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:py-1.5 sm:text-xs text-foreground shadow-[0_12px_28px_-12px_rgb(15_23_42_/_0.45)]",
        className
      )}
      animate={still ? undefined : { y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <Icon className="h-3.5 w-3.5 text-brand-600" />
      {chip.text}
    </motion.span>
  );
}

function BeforeArt({ scene }: { scene: OneTeamScene }) {
  return (
    <div className="relative flex items-end gap-1.5 pb-3 sm:gap-3">
      <span className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-600 ring-1 ring-rose-200">
        3 vendors · 3 invoices · 3 follow-ups
      </span>
      {scene.chips.map((vendor, i) => {
        const Icon = vendor.icon;
        return (
          <div key={vendor.text} className="flex items-end gap-1.5 sm:gap-3">
            {i > 0 ? (
              <span className="mb-10 flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                <X className="h-3.5 w-3.5" />
              </span>
            ) : null}
            <div
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl bg-white px-2.5 py-3 shadow-[0_18px_40px_-18px_rgb(15_23_42_/_0.45)] ring-1 ring-slate-200 sm:px-4",
                i === 1 && "-translate-y-5"
              )}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 sm:h-12 sm:w-12">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              <span className="whitespace-nowrap text-[11px] font-semibold text-slate-600">
                {vendor.text}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}


