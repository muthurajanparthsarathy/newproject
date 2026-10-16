"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import {
  Section,
  Container,
  SectionHeading,
} from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type FAQ = { q: string; a: string };

export function FAQSection({
  faqs,
  title,
  description,
}: {
  faqs: FAQ[];
  title?: React.ReactNode;
  description?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" className="bg-white/40">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title={
              title ?? (
                <>
                  Got questions?{" "}
                  <span className="text-gradient">We&rsquo;ve answered them.</span>
                </>
              )
            }
            description={description ?? "Everything you need to know before getting started."}
          />
        </Reveal>

        <div className="mx-auto mt-10 max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {faqs.map((f, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={f.q}
                  className={cn(
                    "transition",
                    i > 0 ? "border-t border-slate-100" : ""
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition hover:bg-slate-50/80"
                  >
                    <span className="text-base font-semibold text-foreground sm:text-lg">
                      {f.q}
                    </span>
                    <span
                      className={cn(
                        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition",
                        isOpen
                          ? "rotate-45 bg-gradient-brand text-white shadow-glow"
                          : "border border-slate-200 text-slate-500"
                      )}
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
                          {f.a}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
