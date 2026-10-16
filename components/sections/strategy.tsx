"use client";

import { useState } from "react";
import { ArrowRight, BarChart3, Check, Compass, Pause, Play, Rocket, Target } from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import styles from "./strategy.module.css";

const STEPS = [
  { icon: Compass, label: "Discover", title: "Start with the right questions.", description: "We get to know your business, your customers and what success means to you.", focus: "Your audience", detail: "Understand the people behind every enquiry." },
  { icon: Target, label: "Plan", title: "Give every move a purpose.", description: "We connect your goals to a clear plan for your website, content and marketing.", focus: "Your goals", detail: "One clear direction. A plan built around you." },
  { icon: Rocket, label: "Launch", title: "Bring your next chapter to life.", description: "Design, development and campaigns come together to put your business in front of the right people.", focus: "Your launch", detail: "Turn a thoughtful strategy into something real." },
  { icon: BarChart3, label: "Improve", title: "Learn. Refine. Keep moving.", description: "We review the results, find opportunities and improve the work as your business grows.", focus: "Your progress", detail: "Use real insights to decide what comes next." },
];

export function StrategySection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const step = STEPS[active];
  const Icon = step.icon;

  return (
    <Section id="strategy" className="overflow-hidden bg-white">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>Our approach</Eyebrow>
            <h2 className="mt-5 max-w-xl text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              A growth strategy <span className="text-gradient">built around your goals</span>.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Your business has its own story. We bring strategy, design and marketing together to help you write what comes next.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/contact">Let&rsquo;s plan your growth <ArrowRight className="h-4 w-4" /></Button>
              <Button href="/portfolio" variant="outline">See our work</Button>
            </div>
            <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Clear direction. Thoughtful execution.</p>
          </div>

          <div className={styles.canvas} data-paused={paused}>
            <div className={styles.grid} aria-hidden="true" />
            <div className="relative z-10 flex items-center justify-between gap-3 px-6 pt-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">The Prova approach</span>
              <button type="button" onClick={() => setPaused(!paused)} aria-label={paused ? "Play strategy animation" : "Pause strategy animation"} aria-pressed={paused} className="rounded-full border border-brand-100 bg-white p-2 text-brand-600 transition hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600">
                {paused ? <Play aria-hidden="true" className="h-3.5 w-3.5" /> : <Pause aria-hidden="true" className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className={styles.diagram}>
              <div className={styles.orbit} aria-hidden="true"><span /></div>
              <div className={styles.innerOrbit} aria-hidden="true" />
              <svg className={styles.connections} viewBox="0 0 400 360" fill="none" aria-hidden="true">
                <path d="M200 180L72 68M200 180L328 68M200 180L72 292M200 180L328 292" stroke="rgba(96,165,250,.35)" />
                <path className={styles.flow} d="M72 68L200 180L328 292M328 68L200 180L72 292" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 24" />
              </svg>
              <div className={styles.hub}>
                <div key={active} className={styles.hubContent}>
                  <Icon className="mx-auto mb-3 h-7 w-7 text-brand-600" strokeWidth={1.5} aria-hidden="true" />
                  <span className="text-lg font-semibold text-foreground sm:text-xl">{step.focus}</span>
                  <span className="mt-1 block text-[9px] uppercase tracking-[0.2em] text-brand-600">Step {active + 1} · {step.label}</span>
                </div>
              </div>
              {STEPS.map((item, index) => (
                <button key={item.label} type="button" onClick={() => setActive(index)} aria-pressed={active === index} aria-controls="strategy-detail" className={`${styles.node} ${styles[`node${index}`]}`} data-active={active === index}>
                  <item.icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
                  <span>{item.label}</span>{active === index && <Check aria-hidden="true" className="absolute right-2 top-2 h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
            <div className="relative z-10 mx-6 mb-6 flex items-start gap-3 rounded-xl bg-brand-50/60 px-4 py-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              <p className="text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70">
          <div className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4" aria-label="Explore our growth process">
            {STEPS.map((item, index) => (
              <button key={item.label} type="button" onClick={() => setActive(index)} aria-pressed={active === index} aria-controls="strategy-detail" className={`group flex items-center gap-3 border-b-2 px-4 py-5 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand-600 sm:px-6 ${active === index ? "border-brand-600 bg-white text-brand-700" : "border-transparent text-slate-500 hover:bg-brand-50 hover:text-brand-700"}`}>
                <span className="text-xs font-medium opacity-60">0{index + 1}</span>
                <span className="text-sm font-semibold">{item.label}</span>
                <ArrowRight aria-hidden="true" className={`ml-auto h-4 w-4 transition-transform ${active === index ? "translate-x-1" : "opacity-40"}`} />
              </button>
            ))}
          </div>
          <div id="strategy-detail" aria-live="polite" aria-atomic="true" className="grid gap-3 p-6 sm:p-8 md:grid-cols-2 md:items-center md:gap-10">
            <h3 className="text-xl font-semibold sm:text-2xl">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{step.description}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}


