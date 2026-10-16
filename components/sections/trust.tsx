"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/section";
import { trustLogos } from "@/lib/content";

export function TrustSection() {
  const doubled = [...trustLogos, ...trustLogos];

  return (
    <section className="border-y border-slate-100 bg-white py-12">
      <Container className="overflow-hidden">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground"
        >
          Trusted by ambitious teams across Tamilnadu
        </motion.p>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

          <div className="flex w-max items-center gap-12 marquee">
            {doubled.map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="flex h-10 shrink-0 items-center justify-center px-4"
              >
                <span className="font-display text-2xl font-bold tracking-tight text-slate-400 transition hover:text-slate-700">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
