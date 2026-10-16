"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Section,
  Container,
  SectionHeading,
} from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { testimonials } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % testimonials.length),
      6500
    );
    return () => clearInterval(t);
  }, [paused]);

  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () =>
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  const current = testimonials[index];

  return (
    <Section id="testimonials">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Testimonials"
            title={
              <>
                Founders and marketers{" "}
                <span className="text-gradient">love working with us</span>
              </>
            }
            description="Real words from real partners — not stock quotes."
          />
        </Reveal>

        <div
          className="mx-auto mt-10 max-w-4xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-30px_rgb(15_23_42_/_0.25)] sm:p-12">
            <Quote
              className="absolute right-8 top-8 h-16 w-16 text-brand-100"
              aria-hidden
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={current.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-6 text-xl leading-relaxed text-foreground sm:text-2xl">
                  &ldquo;{current.quote}&rdquo;
                </blockquote>
                <div className="mt-8 flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={current.avatar}
                      alt={current.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {current.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {current.role} · {current.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to testimonial ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === index ? "w-8 bg-brand-600" : "w-3 bg-slate-200"
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous testimonial"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-foreground transition hover:border-brand-500 hover:text-brand-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next testimonial"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-white transition hover:bg-brand-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
