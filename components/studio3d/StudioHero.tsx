"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/sections/hero";
import { damp, windowed } from "./math";
import { FRAMES, SCROLL_SVH, storyAt, type StoryClock } from "./timeline";

const StudioCanvas = dynamic(() => import("./StudioCanvas"), { ssr: false });

type Capability = { mode: "3d" | "2d"; lowPower: boolean };
const SERVER_CAPABILITY: Capability = { mode: "3d", lowPower: false };
let capability: Capability | null = null;

/** WebGL support, reduced-motion preference and a rough device-power guess (read once). */
function readCapability(): Capability {
  if (capability) return capability;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let webgl = false;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    webgl = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl = false;
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowPower =
    window.matchMedia("(pointer: coarse)").matches || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  capability = { mode: reduce || !webgl ? "2d" : "3d", lowPower };
  return capability;
}
const noSubscribe = () => () => {};

const beat = (id: string) => FRAMES.find((f) => f.id === id)!;

/** If anything in the 3D studio throws, fall back to the 2D hero instead of breaking the page. */
class StudioBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("3D studio failed, showing the 2D hero instead:", error);
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Scroll-driven 3D studio hero: the page pins while one continuous camera travels from
 * the video shoot through every service desk. Visitors with reduced motion, or without WebGL,
 * get the existing 2D hero instead.
 */
export function StudioHero() {
  const cap = useSyncExternalStore(noSubscribe, readCapability, () => SERVER_CAPABILITY);
  const [failed, setFailed] = useState(false);
  if (cap.mode === "2d" || failed) return <Hero />;
  return <Studio lowPower={cap.lowPower} onFail={() => setFailed(true)} />;
}

function Studio({ lowPower, onFail }: { lowPower: boolean; onFail: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // One mutable clock shared with the canvas; updated every frame outside React rendering.
  const [clock] = useState<StoryClock>(() => ({ target: 0, current: 0 }));
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const panel = panelRef.current;
    if (!section || !panel) return;
    if (process.env.NODE_ENV !== "production") (window as Window & { __studioClock?: StoryClock }).__studioClock = clock;
    const blocks = Array.from(section.querySelectorAll<HTMLElement>("[data-story]")).map((el) => ({
      el,
      from: Number(el.dataset.from),
      to: Number(el.dataset.to),
      fadeIn: Number(el.dataset.in ?? 0.3),
      fadeOut: Number(el.dataset.out ?? 0.3),
    }));
    let raf = 0;
    let last = performance.now();
    let first = true;
    let visible = true;

    const readStory = () => {
      const svh = panel.offsetHeight / 100;
      const scrolled = Math.min(Math.max(-section.getBoundingClientRect().top, 0), section.offsetHeight - panel.offsetHeight);
      return storyAt(scrolled / svh);
    };
    const paint = (g: number) => {
      for (const b of blocks) {
        const a = windowed(g, b.from, b.to, b.fadeIn, b.fadeOut);
        b.el.style.opacity = a.toFixed(3);
        b.el.style.transform = `translate3d(0, ${((1 - a) * 18).toFixed(1)}px, 0)`;
        b.el.style.visibility = a > 0.01 ? "visible" : "hidden";
      }
    };
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      clock.target = readStory();
      clock.current = first ? clock.target : damp(clock.current, clock.target, 6.5, dt);
      first = false;
      paint(clock.current);
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      setActive(visible);
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    observer.observe(section);
    raf = requestAnimationFrame(tick);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [clock]);

  return (
    <section
      ref={sectionRef}
      aria-label="Inside the Prova Media studio"
      className="relative"
      style={{ height: `calc(100svh + ${SCROLL_SVH}svh)` }}
    >
      <div ref={panelRef} className="sticky top-0 h-[100svh] overflow-hidden bg-[#edf2f8]">
        {/* Poster while the 3D studio loads */}
        <div
          aria-hidden
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: ready ? 0 : 1,
            background:
              "radial-gradient(ellipse at 70% 45%, #ffffff 0%, #eef4fb 45%, #e3ecf7 100%)",
          }}
        >
          <div className="absolute left-[62%] top-[58%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-brand-200/40 blur-3xl" />
        </div>

        <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
          <StudioBoundary onFail={onFail}>
            <StudioCanvas
              clock={clock}
              lowPower={lowPower}
              active={active}
              onReady={() => setReady(true)}
              onContextLost={onFail}
            />
          </StudioBoundary>
        </div>

        {/* Legibility scrims: left column on desktop, bottom panel on phones */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-[52%] bg-gradient-to-r from-[#edf2f8]/90 via-[#edf2f8]/55 to-transparent md:block" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-[#edf2f8] via-[#edf2f8]/80 to-transparent md:hidden" />

        <a
          href="#services"
          className="absolute right-5 top-20 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/75 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-soft backdrop-blur transition hover:text-brand-600 md:right-8 md:top-24"
        >
          Skip to services <ArrowDown className="h-3.5 w-3.5" />
        </a>

        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="mx-auto flex h-full max-w-7xl items-end px-5 pb-10 sm:px-8 md:items-center md:pb-0">
            {/* Right padding on phones keeps copy clear of the floating call/WhatsApp buttons */}
            <div className="grid w-full max-w-[470px] pr-16 md:pr-0 [&>*]:[grid-area:1/1]">
              {/* Intro */}
              <div data-story data-from="-1" data-to="7.4" data-in="0.01" data-out="1.3" className="pointer-events-auto self-center">
                <p className="flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.2em] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-600" /> ONE TEAM. EVERY POSSIBILITY.
                </p>
                <h1 className="mt-4 font-display text-[36px] font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
                  One solution<span className="text-brand-600">.</span>
                  <span className="sr-only"> Websites, films, digital marketing and custom software.</span>
                </h1>
                <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
                  Step inside the Prova Media studio — from the first shot to the final cut.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-5">
                  <Button href="/contact" size="lg">
                    Let&rsquo;s build your next <ArrowUpRight className="h-4 w-4" />
                  </Button>
                  <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-brand-600">
                    Explore our work <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Scene 1 — video shoot */}
              <div data-story data-from="8.1" data-to="18.0" data-in="0.5" data-out="0.45" style={{ opacity: 0, visibility: "hidden" }} className="self-center">
                <SceneTag index="01" label="Video Shoot" />
                <h2 className="mt-4 font-display text-[28px] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl">
                  We Shoot Stories That Sell.
                </h2>
                <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
                  Authentic content. Professional production. Made for your audience.
                </p>
                <BeatLines ids={["F02", "F03", "F04", "F05", "F06"]} />
              </div>

              {/* Shoot → edit */}
              <div data-story data-from="18.05" data-to="21.15" data-in="0.3" data-out="0.35" style={{ opacity: 0, visibility: "hidden" }} className="self-center">
                <SceneTag index="→" label="Shoot to Edit" />
                <div className="mt-4 grid [&>*]:[grid-area:1/1]">
                  {["F07", "F08", "F09"].map((id) => {
                    const f = beat(id);
                    return (
                      <h2
                        key={id}
                        data-story
                        data-from={f.from}
                        data-to={id === "F09" ? 21.2 : f.to}
                        data-in="0.2"
                        data-out="0.2"
                        style={{ opacity: 0, visibility: "hidden" }}
                        className="font-display text-[26px] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-[34px]"
                      >
                        {f.text}
                      </h2>
                    );
                  })}
                </div>
                <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
                  The same footage moves straight to our editing station.
                </p>
              </div>

              {/* Scene 2 — video editing */}
              <div data-story data-from="21.15" data-to="29.3" data-in="0.5" data-out="0.35" style={{ opacity: 0, visibility: "hidden" }} className="self-center">
                <SceneTag index="02" label="Video Editing" />
                <h2 className="mt-4 font-display text-[28px] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl">
                  From Raw Footage to Remarkable Content.
                </h2>
                <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
                  Editing, motion graphics, color grading, and captions — handled by one creative team.
                </p>
                <BeatLines ids={["F10", "F11", "F12", "F13", "F14"]} />
              </div>

              {/* Scene 3 — poster & creative design */}
              <div data-story data-from="29.2" data-to="40.35" data-in="0.5" data-out="0.35" style={{ opacity: 0, visibility: "hidden" }} className="self-center">
                <SceneTag index="03" label="Creative Design" />
                <h2 className="mt-4 font-display text-[28px] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl">
                  Creativity That Makes You Stand Out.
                </h2>
                <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
                  Eye-catching posters, branding, and designs that tell your story.
                </p>
                <BeatLines ids={["3.1", "3.2", "3.3", "3.4"]} />
              </div>

              {/* Scene 4 — social media handling */}
              <div data-story data-from="40.25" data-to="50.35" data-in="0.5" data-out="0.35" style={{ opacity: 0, visibility: "hidden" }} className="self-center">
                <SceneTag index="04" label="Social Media" />
                <h2 className="mt-4 font-display text-[28px] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl">
                  We Create. We Post. We Engage.
                </h2>
                <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
                  Professional social media management that keeps your brand connected.
                </p>
                <BeatLines ids={["4.1", "4.2", "4.3", "4.4"]} />
                <IllustrativeNote from={47.9} to={50.35} />
              </div>

              {/* Scene 5 — digital marketing */}
              <div data-story data-from="50.25" data-to="60.25" data-in="0.5" style={{ opacity: 0, visibility: "hidden" }} className="self-center">
                <SceneTag index="05" label="Digital Marketing" />
                <h2 className="mt-4 font-display text-[28px] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl">
                  Reach the Right Audience. Grow Your Business.
                </h2>
                <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
                  Digital campaigns, thoughtful targeting, and data-driven decisions.
                </p>
                <BeatLines ids={["5.1", "5.2", "5.3", "5.4"]} lastStays />
                <IllustrativeNote from={54.9} to={60.25} />
              </div>

              <div data-story data-from="60" data-to="70.3" data-in="0.5" style={{ opacity: 0, visibility: "hidden" }} className="self-center">
                <SceneTag index="06" label="Web & App Development" />
                <h2 className="mt-4 font-display text-[28px] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl">
                  From Your Idea to Everyday Use.
                </h2>
                <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
                  Websites and applications designed for your customers and built for your business.
                </p>
                <BeatLines ids={["6.1", "6.2", "6.3", "6.4"]} lastStays />
              </div>
              <div data-story data-from="70.25" data-to="80.6" data-in="0.5" data-out="0.5" style={{ opacity: 0, visibility: "hidden" }} className="self-center">
                <SceneTag index="07" label="SEO" />
                <h2 className="mt-4 font-display text-[28px] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl">
                  Be Found by the Right People.
                </h2>
                <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
                  Useful content, thoughtful page optimisation, and clear reporting to guide the next improvement.
                </p>
                <BeatLines ids={["7.1", "7.2", "7.3"]} lastStays />
                <IllustrativeNote from={75.8} to={80.6} />
              </div>
              <div data-story data-from="81" data-to="999" data-in="1" style={{ opacity: 0, visibility: "hidden" }} className="pointer-events-auto self-center">
                <p className="text-sm font-semibold text-brand-600">ONE TEAM · SHOOT TO SEO</p>
                <h2 className="mt-4 font-display text-[28px] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl">
                  Your Story. Every Step Connected.
                </h2>
                <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
                  Shoot, edit, design, social media, marketing, development and search — working together for your brand.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href="/contact">Start a project <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  <Button href="/portfolio" variant="outline">View our work</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          data-story
          data-from="-1"
          data-to="1.4"
          data-in="0.01"
          data-out="0.6"
          className="pointer-events-none absolute inset-x-0 bottom-6 z-10 hidden justify-center md:flex"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-medium text-slate-600 shadow-soft backdrop-blur">
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" /> Scroll to step inside the studio
          </span>
        </div>
      </div>
    </section>
  );
}

function SceneTag({ index, label }: { index: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white/80 py-1 pl-1 pr-3.5 text-xs font-semibold text-brand-700 shadow-soft backdrop-blur">
      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] text-white">{index}</span>
      {label}
    </span>
  );
}

/** Dashboards in the studio are demonstrations of the service, so say so whenever they are on screen. */
function IllustrativeNote({ from, to }: { from: number; to: number }) {
  return (
    <p
      data-story
      data-from={from}
      data-to={to}
      data-in="0.3"
      data-out="0.3"
      style={{ opacity: 0, visibility: "hidden" }}
      className="mt-4 text-xs font-medium text-slate-500"
    >
      Dashboard figures are illustrative examples, not client results.
    </p>
  );
}

/** Per-beat lines from the storyboard, cross-fading under the scene headline. */
function BeatLines({ ids, lastStays = false }: { ids: string[]; lastStays?: boolean }) {
  return (
    <div className="mt-6 grid [&>*]:[grid-area:1/1]">
      {ids.map((id, i) => {
        const f = beat(id);
        const to = lastStays && i === ids.length - 1 ? 999 : f.to;
        return (
          <p
            key={id}
            data-story
            data-from={f.from}
            data-to={to}
            data-in="0.2"
            data-out="0.2"
            style={{ opacity: 0, visibility: "hidden" }}
            className="flex items-center gap-3 text-sm font-semibold text-slate-800"
          >
            <span className="h-px w-8 bg-brand-500" />
            {f.text}
          </p>
        );
      })}
    </div>
  );
}
