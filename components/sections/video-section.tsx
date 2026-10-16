"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import {
  Section,
  Container,
  SectionHeading,
} from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export function VideoSection() {
  const [open, setOpen] = useState(false);

  return (
    <Section id="video" className="relative overflow-hidden bg-[#0b1220] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(37,99,235,0.25),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(14,165,233,0.25),transparent_45%)]" />

      <Container className="relative">
        <Reveal>
          <SectionHeading
            eyebrow="Showreel"
            title={
              <>
                See Prova Media{" "}
                <span className="text-gradient">in motion</span>
              </>
            }
            description="A 90-second look at how we partner with brands to ship better, faster."
            className="text-white"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative mx-auto mt-10 block aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10"
          >
            <Image
              src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80"
              alt="Prova Media showreel"
              fill
              sizes="(max-width: 1024px) 100vw, 80vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

            <span className="absolute inset-0 flex items-center justify-center">
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white text-foreground shadow-glow transition group-hover:scale-110">
                <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
                <Play className="relative ml-1 h-7 w-7 fill-current" />
              </span>
            </span>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/70">
                  Watch the showreel
                </div>
                <div className="text-lg font-semibold">Proven Digital Growth — 2025</div>
              </div>
              <div className="hidden text-sm text-white/70 md:block">01:32</div>
            </div>
          </button>
        </Reveal>
      </Container>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4"
          >
            <button
              aria-label="Close video"
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl"
            >
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=1&rel=0"
                title="Prova Media Showreel"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Section>
  );
}
