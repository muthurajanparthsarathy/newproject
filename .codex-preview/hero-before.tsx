"use client";

import Image from "next/image";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight, Check, Lock, MousePointer2, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import { services, stats } from "@/lib/content";
import { HERO_SLIDES } from "@/lib/hero-slides";

function slide(id: string) {
  const found = HERO_SLIDES.find((s) => s.id === id);
  if (!found) throw new Error(`Missing hero slide "${id}"`);
  return found;
}
const WEB = slide("web");
const MARKETING = slide("marketing");
const SOFTWARE = slide("software");
const PHOTO = slide("photo");

/** The artwork is drawn on a fixed artboard and scaled to fit, so it composes the same at every width. */
const ART_W = 600;
const ART_H = 540;
const EASE = [0.22, 1, 0.36, 1] as const;
const CARD =
  "rounded-2xl border border-white/80 bg-white/90 shadow-[0_24px_60px_-24px_rgb(15_23_42_/_0.35)] ring-1 ring-slate-900/5 backdrop-blur-xl";

const AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
];

type Parallax = {
  /** Pointer position over the hero, -1 → 1 on each axis (springy) */
  px: MotionValue<number>;
  py: MotionValue<number>;
  /** 0 while the hero fills the screen → 1 once it has scrolled away */
  progress: MotionValue<number>;
  /** 1 on the two-column (lg+) layout, 0 when the artwork is stacked under the copy */
  desktop: MotionValue<number>;
  still: boolean;
};
const ParallaxContext = createContext<Parallax | null>(null);
function useParallax() {
  const value = useContext(ParallaxContext);
  if (!value) throw new Error("useParallax must be used inside <Hero>");
  return value;
}

export function Hero() {
  const reduceMotion = useReducedMotion();
  // Remount when the preference resolves: motion transforms capture `still` once.
  return <HeroContent key={String(!!reduceMotion)} still={!!reduceMotion} />;
}

function HeroContent({ still }: { still: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const progress = useTransform(scrollYProgress, (p) => (still ? 0 : p));
  const px = useSpring(0, { stiffness: 60, damping: 18 });
  const py = useSpring(0, { stiffness: 60, damping: 18 });
  const desktop = useMotionValue(0);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => desktop.set(query.matches ? 1 : 0);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [desktop]);

  // Side by side, the copy drifts down a little slower than the page and fades as the hero leaves.
  // Stacked, it stays put so the artwork rising beneath it can't run into it.
  const copyY = useTransform(() => desktop.get() * progress.get() * 90);
  const copyOpacity = useTransform(() => 1 - desktop.get() * progress.get() * 1.1);
  const gridY = useTransform(progress, (p) => p * 60);
  const glowAX = useTransform(() => px.get() * -28);
  const glowAY = useTransform(() => py.get() * -20 - progress.get() * 160);
  const glowBX = useTransform(() => px.get() * 22);
  const glowBY = useTransform(() => py.get() * 16 + progress.get() * 120);

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || still) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    py.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  };
  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <ParallaxContext.Provider value={{ px, py, progress, desktop, still }}>
      <section
        ref={sectionRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="relative isolate overflow-hidden pb-14 lg:pb-20"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white/60 to-transparent" />
          <motion.div
            style={{ y: gridY }}
            className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_75%_60%_at_50%_35%,black,transparent)]"
          />
          <motion.div
            style={{ x: glowAX, y: glowAY }}
            className="absolute -right-40 -top-48 h-[620px] w-[620px] rounded-full bg-brand-400/25 blur-3xl"
          />
          <motion.div
            style={{ x: glowBX, y: glowBY }}
            className="absolute -left-48 top-1/3 h-[480px] w-[480px] rounded-full bg-sky-300/25 blur-3xl"
          />
        </div>

        <Container>
          {/* Side by side, the copy and artwork fill exactly the first screen (below the navbar), centred. */}
          <div className="grid items-center gap-14 pt-28 sm:pt-32 lg:min-h-[100svh] lg:grid-cols-12 lg:gap-10 lg:pb-8 lg:pt-[88px]">
            <motion.div style={{ y: copyY, opacity: copyOpacity }} className="lg:col-span-7">
              <FadeUp delay={0}>
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white/70 py-1 pl-1 pr-4 text-xs font-semibold text-brand-700 shadow-soft backdrop-blur">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-brand text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  Proven Digital Growth
                  <span className="h-3 w-px bg-brand-200" />
                  <span className="font-medium text-muted-foreground">Coimbatore</span>
                </span>
              </FadeUp>

              <FadeUp delay={0.08}>
                {/* On laptops the size follows screen height too, keeping it to ~3 lines with the buttons above the fold. */}
                <h1 className="mt-6 text-balance font-display text-[40px] font-bold leading-[1.04] tracking-tight text-foreground sm:text-[54px] lg:mt-5 lg:text-[length:clamp(2.5rem,7.4vh,4rem)]">
                  Websites, marketing &amp; software that <span className="text-gradient">grow your</span>{" "}
                  <span className="relative inline-block whitespace-nowrap">
                    <span className="text-gradient">business</span>
                    <Swoosh />
                  </span>
                  .
                </h1>
              </FadeUp>

              <FadeUp delay={0.16}>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mt-5">
                  One Coimbatore team for website development, digital marketing, custom software and
                  photography — so your brand looks sharp, ranks higher and sells more.
                </p>
              </FadeUp>

              <FadeUp delay={0.24}>
                <div className="mt-8 flex flex-wrap items-center gap-3 lg:mt-7">
                  <Button href="/contact" size="lg">
                    Start your project
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button href="/portfolio" variant="outline" size="lg">
                    See our work
                  </Button>
                </div>
              </FadeUp>

              <FadeUp delay={0.32}>
                <div className="mt-10 flex items-center gap-4 lg:mt-8">
                  <div className="flex -space-x-3">
                    {AVATARS.map((src) => (
                      <div key={src} className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm">
                        <Image src={src} alt="Happy client" fill sizes="40px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">Loved by 120+ founders &amp; marketers</div>
                  </div>
                </div>
              </FadeUp>
            </motion.div>

            <div className="lg:col-span-5">
              <HeroArt />
            </div>
          </div>

          <FadeUp delay={0.4}>
            <dl className="mt-16 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-soft ring-1 ring-slate-900/5 backdrop-blur md:grid-cols-4 lg:mt-6">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={cn(
                    "flex flex-col-reverse items-center gap-1 px-4 py-6 text-center",
                    i % 2 === 1 && "border-l border-slate-200/70",
                    i >= 2 && "border-t border-slate-200/70 md:border-t-0",
                    i === 2 && "md:border-l"
                  )}
                >
                  <dt className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</dt>
                  <dd className="font-display text-3xl font-bold text-foreground sm:text-4xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </FadeUp>
        </Container>
      </section>
    </ParallaxContext.Provider>
  );
}

function FadeUp({ delay, children }: { delay: number; children: ReactNode }) {
  const { still } = useParallax();
  return (
    <motion.div
      initial={still ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Swoosh() {
  const { still } = useParallax();
  // Drawn by wiping a clip across it: `pathLength` can't be used with a non-scaling stroke
  // (the dash maths runs in screen space, so it only ever covered part of the word).
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 200 16"
      preserveAspectRatio="none"
      className="absolute -bottom-2 left-0 h-3 w-full overflow-visible"
      initial={still ? false : { clipPath: "inset(-50% 100% -50% 0)" }}
      animate={{ clipPath: "inset(-50% 0% -50% 0)" }}
      transition={{ duration: 0.9, delay: 0.9, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="hero-swoosh" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <path
        d="M3 12 C 50 4, 140 3, 197 8"
        fill="none"
        stroke="url(#hero-swoosh)"
        strokeWidth={4}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </motion.svg>
  );
}

/**
 * The right-hand artwork: a website being built, surrounded by cards for the other services.
 * Every piece sits at its own depth, so it shifts with the mouse and scroll at its own pace.
 */
function HeroArt() {
  const parallax = useParallax();
  const { px, py, progress, desktop, still } = parallax;
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const rotateY = useTransform(() => px.get() * 6);
  const rotateX = useTransform(() => py.get() * -5);
  // When stacked under the copy, layers only start rising once the artwork reaches the top
  // of the screen; following the whole hero would push them up into the copy above.
  const { scrollYProgress: exit } = useScroll({ target: frameRef, offset: ["start start", "end start"] });
  const layerProgress = useTransform(() => {
    const p = progress.get();
    const e = exit.get();
    return still ? 0 : desktop.get() ? p : e;
  });

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / ART_W));
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);

  // Side by side the artwork is also capped by screen height, so it never runs past the fold.
  return (
    <div
      ref={frameRef}
      role="img"
      aria-label="A website, ad campaign, conversion chart and photo shoot built by Prova Media"
      className="relative mx-auto w-full max-w-[600px] lg:max-w-[min(600px,calc((100svh_-_150px)*1.11))]"
      style={{ aspectRatio: `${ART_W} / ${ART_H}` }}
    >
      {scale > 0 && (
        <div
          aria-hidden
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: ART_W, height: ART_H, transform: `scale(${scale})` }}
        >
          <ParallaxContext.Provider value={{ ...parallax, progress: layerProgress }}>
            <motion.div className="relative h-full w-full" style={{ rotateX, rotateY, transformPerspective: 1400 }}>
              {/* Cards sit on the browser's edges, never over its main content. */}
              <Layer depth={0.25} delay={0} style={{ left: 50, top: 30, width: 500, height: 500 }}>
                <Stage />
              </Layer>
              <Layer depth={0.55} delay={0.15} float={4} style={{ left: 65, top: 100 }}>
                <BrowserMock />
              </Layer>
              <Layer depth={0.9} delay={0.45} float={6} style={{ left: 0, top: 36 }}>
                <SoftwareChip />
              </Layer>
              <Layer depth={1.15} delay={0.35} float={8} style={{ left: 390, top: 0 }}>
                <CampaignCard />
              </Layer>
              <Layer depth={1.4} delay={0.55} float={7} style={{ left: 0, top: 368 }}>
                <ConversionCard />
              </Layer>
              <Layer depth={1.75} delay={0.65} float={9} style={{ left: 430, top: 356 }}>
                <ShootCard />
              </Layer>
            </motion.div>
          </ParallaxContext.Provider>
        </div>
      )}
    </div>
  );
}

/** Places a piece on the artboard at a parallax depth (0 = far, 2 = close), then brings it in. */
function Layer({
  depth,
  delay,
  float = 0,
  style,
  children,
}: {
  depth: number;
  delay: number;
  /** Idle bob height in px; 0 for none */
  float?: number;
  style: CSSProperties;
  children: ReactNode;
}) {
  const { px, py, progress, still } = useParallax();
  const x = useTransform(() => px.get() * depth * 16);
  const y = useTransform(() => py.get() * depth * 12 - progress.get() * depth * 150);

  return (
    <motion.div className="absolute" style={{ ...style, x, y }}>
      <motion.div
        className="h-full w-full"
        initial={still ? false : { opacity: 0, y: 28, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        <motion.div
          className="h-full w-full"
          animate={still || !float ? undefined : { y: [0, -float, 0] }}
          transition={{ duration: 5 + depth * 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** Soft brand glow and two faint rings the artwork stands on. */
function Stage() {
  const { still } = useParallax();
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-[14%] rounded-full bg-gradient-to-br from-brand-300/45 to-sky-200/40 blur-3xl" />
      <div className="absolute inset-0 rounded-full border border-brand-200/70" />
      <div
        className={cn("absolute inset-[15%] rounded-full border border-dashed border-brand-300/60", !still && "animate-spin")}
        style={{ animationDuration: "60s" }}
      />
    </div>
  );
}

function BrowserMock() {
  const { still } = useParallax();
  const loop = { duration: 5, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" as const, delay: 1.6 };
  const tiles = services.slice(0, 3);

  return (
    <div className={cn(CARD, "overflow-hidden")} style={{ width: 470, height: 340 }}>
      <div className="flex h-9 items-center gap-1.5 border-b border-slate-100 bg-slate-50/90 px-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <div className="mx-auto flex h-5 w-52 items-center justify-center gap-1.5 rounded-md bg-white text-[10px] font-medium text-slate-400 ring-1 ring-slate-200/80">
          <Lock className="h-2.5 w-2.5" />
          yourbrand.com
        </div>
        <span className="w-[42px]" />
      </div>

      <div className="relative h-[304px] bg-white">
        {/* Mini navigation */}
        <div className="absolute inset-x-5 top-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-4 w-4 rounded-md bg-gradient-brand" />
            <span className="h-2 w-12 rounded-full bg-slate-800/80" />
          </div>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-8 rounded-full bg-slate-200" />
            <span className="h-1.5 w-8 rounded-full bg-slate-200" />
            <span className="h-1.5 w-8 rounded-full bg-slate-200" />
            <span className="h-5 w-14 rounded-full bg-brand-600/90" />
          </div>
        </div>

        {/* Mini hero copy */}
        <div className="absolute left-5 top-14 w-[210px]">
          <span className="block h-4 w-20 rounded-full bg-brand-50 ring-1 ring-brand-100" />
          <span className="mt-3 block h-3.5 w-[190px] rounded bg-slate-800/85" />
          <span className="mt-2 block h-3.5 w-[150px] rounded bg-gradient-brand" />
          <span className="mt-3 block h-1.5 w-[180px] rounded-full bg-slate-200" />
          <span className="mt-1.5 block h-1.5 w-[150px] rounded-full bg-slate-200" />
        </div>
        <div className="absolute left-5 top-[156px] flex items-center gap-2">
          <motion.span
            className="relative block h-6 w-20 rounded-full bg-gradient-brand shadow-[0_8px_20px_-8px_rgb(37_99_235_/_0.8)]"
            animate={still ? undefined : { scale: [1, 1, 0.92, 1, 1] }}
            transition={{ ...loop, times: [0, 0.36, 0.42, 0.5, 1] }}
          >
            <motion.span
              className="absolute inset-0 rounded-full ring-4 ring-brand-400"
              initial={{ opacity: 0 }}
              animate={still ? undefined : { opacity: [0, 0, 0.7, 0, 0], scale: [1, 1, 1, 1.6, 1.6] }}
              transition={{ ...loop, times: [0, 0.38, 0.42, 0.6, 1] }}
            />
          </motion.span>
          <span className="block h-6 w-16 rounded-full ring-1 ring-slate-200" />
        </div>

        {/* Mini hero visual */}
        <div className="absolute right-5 top-14 h-[136px] w-[200px] overflow-hidden rounded-xl bg-gradient-to-br from-brand-500 to-sky-400">
          <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20" />
          <span className="absolute left-4 top-4 h-2 w-16 rounded-full bg-white/80" />
          <span className="absolute left-4 top-8 h-1.5 w-10 rounded-full bg-white/50" />
          <div className="absolute inset-x-4 bottom-4 flex h-16 items-end gap-2">
            {[40, 62, 48, 78, 66, 92].map((h, i) => (
              <motion.span
                key={i}
                className="flex-1 origin-bottom rounded-t bg-white/75"
                style={{ height: `${h}%` }}
                initial={still ? false : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.6, delay: 0.9 + i * 0.07, ease: EASE }}
              />
            ))}
          </div>
        </div>

        {/* Service tiles */}
        <div className="absolute inset-x-5 bottom-5 grid grid-cols-3 gap-3">
          {tiles.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.slug} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br text-white", service.accent)}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="mt-2.5 block h-1.5 w-16 rounded-full bg-slate-700/70" />
                <span className="mt-1.5 block h-1.5 w-20 rounded-full bg-slate-200" />
              </div>
            );
          })}
        </div>

        {/* A cursor that wanders over and clicks the call to action */}
        <motion.div
          className="absolute left-0 top-0 text-slate-900 drop-shadow-[0_4px_6px_rgb(15_23_42_/_0.3)]"
          initial={{ x: 330, y: 250 }}
          animate={still ? undefined : { x: [330, 62, 62, 330], y: [250, 164, 164, 250] }}
          transition={{ ...loop, times: [0, 0.36, 0.55, 1] }}
        >
          <MousePointer2 className="h-5 w-5 fill-slate-900 stroke-white" />
        </motion.div>
      </div>
    </div>
  );
}

function SoftwareChip() {
  const Icon = SOFTWARE.icon;
  return (
    <div className={cn(CARD, "flex items-center gap-3 rounded-full py-2 pl-2 pr-4")}>
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-white", SOFTWARE.accent)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="leading-tight">
        <div className="text-[13px] font-semibold text-foreground">{SOFTWARE.metricLabel}</div>
        <div className="text-[11px] text-muted-foreground">in {SOFTWARE.metric.replace(" d", " days")}</div>
      </div>
      <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
        <Check className="h-3 w-3" />
      </span>
    </div>
  );
}

function CampaignCard() {
  const { still } = useParallax();
  const Icon = MARKETING.icon;
  const bars = [34, 48, 40, 62, 55, 74, 68, 96];
  return (
    <div className={cn(CARD, "w-[210px] p-4")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-white", MARKETING.accent)}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold text-foreground">Ad campaigns</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          <span className="relative flex h-1.5 w-1.5">
            {!still && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400" />}
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-3xl font-bold text-foreground">{MARKETING.metric}</span>
        <span className="text-[11px] text-muted-foreground">{MARKETING.metricLabel}</span>
      </div>
      <div className="mt-3 flex h-16 items-end gap-1.5">
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className={cn("flex-1 origin-bottom rounded-t-[4px]", i >= bars.length - 2 ? "bg-gradient-to-t from-brand-600 to-sky-400" : "bg-brand-100")}
            style={{ height: `${h}%` }}
            initial={still ? false : { scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.6, delay: 1 + i * 0.06, ease: EASE }}
          />
        ))}
      </div>
    </div>
  );
}

function ConversionCard() {
  const { still } = useParallax();
  const Icon = WEB.icon;
  const line = "M2 46 C 22 44, 32 37, 50 39 S 84 29, 104 31 S 144 17, 164 19 S 194 8, 214 5";
  return (
    <div className={cn(CARD, "w-[262px] p-4")}>
      <div className="flex items-center gap-2">
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-white", WEB.accent)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-semibold text-foreground">Website conversions</span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-3xl font-bold text-gradient">{WEB.metric}</span>
        <span className="text-[11px] text-muted-foreground">{WEB.metricLabel}</span>
      </div>
      <svg viewBox="0 0 216 56" className="mt-2 h-12 w-full overflow-visible">
        <defs>
          <linearGradient id="hero-spark-line" x1="0" x2="1">
            <stop offset="0" stopColor="#2563eb" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient id="hero-spark-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={`${line} L214 56 L2 56 Z`}
          fill="url(#hero-spark-fill)"
          initial={still ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="url(#hero-spark-line)"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={still ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 1.1, ease: "easeInOut" }}
        />
        <circle cx="214" cy="5" r="4" fill="#0ea5e9" stroke="white" strokeWidth={2} />
      </svg>
    </div>
  );
}

function ShootCard() {
  const { still } = useParallax();
  const Icon = PHOTO.icon;
  return (
    <div className={cn(CARD, "w-[180px] p-2")}>
      <div className="relative h-[116px] overflow-hidden rounded-xl">
        <Image src={PHOTO.image} alt="" fill sizes="180px" className="object-cover" />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-900/55 px-2 py-0.5 text-[9px] font-semibold tracking-widest text-white backdrop-blur">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-red-500"
            animate={still ? undefined : { opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          />
          REC
        </span>
      </div>
      <div className="flex items-center gap-2 px-1.5 pb-1 pt-2.5">
        <span className={cn("flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br text-white", PHOTO.accent)}>
          <Icon className="h-3 w-3" />
        </span>
        <div className="leading-tight">
          <div className="text-[12px] font-semibold text-foreground">{PHOTO.metric} cinematic</div>
          <div className="text-[10px] text-muted-foreground">{PHOTO.tag}</div>
        </div>
      </div>
    </div>
  );
}
