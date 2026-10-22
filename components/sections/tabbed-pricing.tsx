"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { cn, buildWhatsAppLink } from "@/lib/utils";
import {
  Section,
  Container,
  SectionHeading,
} from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import type { PricingTier } from "@/lib/content";

export type PricingGroup = {
  label: string;
  description?: string;
  tiers: PricingTier[];
};

type Props = {
  title?: React.ReactNode;
  description?: string;
  groups: PricingGroup[];
  serviceName?: string;
  background?: "white" | "muted";
};

export function TabbedPricing({
  title,
  description,
  groups,
  serviceName,
  background = "white",
}: Props) {
  const [active, setActive] = useState(0);
  const tiers = groups[active]?.tiers ?? [];

  return (
    <Section
      id="pricing"
      className={background === "muted" ? "bg-white/40" : ""}
    >
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Pricing"
            title={
              title ?? (
                <>
                  Simple, transparent{" "}
                  <span className="text-gradient">pricing</span>
                </>
              )
            }
            description={
              description ??
              "Pick a starting plan and scale on your terms. All packages can be customized."
            }
          />
        </Reveal>

        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-soft">
            {groups.map((g, i) => (
              <button
                key={g.label}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={active === i}
                className={cn(
                  "relative rounded-full px-5 py-2 text-sm font-semibold transition",
                  active === i
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "text-foreground hover:text-brand-600"
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {groups[active]?.description ? (
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground">
            {groups[active].description}
          </p>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "mt-8 grid gap-6",
              tiers.length === 2 && "md:grid-cols-2",
              tiers.length === 3 && "md:grid-cols-3",
              tiers.length === 4 && "md:grid-cols-2 xl:grid-cols-4",
              tiers.length >= 5 && "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            )}
          >
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border p-6 transition sm:p-7",
                  tier.highlighted
                    ? "border-transparent bg-gradient-brand text-white shadow-[0_30px_80px_-30px_rgb(37_99_235_/_0.55)]"
                    : "border-slate-200 bg-white text-foreground hover:-translate-y-1 hover:shadow-soft"
                )}
              >
                {tier.highlighted ? (
                  <span className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-700 shadow-soft">
                    <Sparkles className="h-3 w-3" />
                    Most popular
                  </span>
                ) : null}

                <div
                  className={cn(
                    "text-sm font-semibold uppercase tracking-widest",
                    tier.highlighted ? "text-white/80" : "text-brand-600"
                  )}
                >
                  {tier.name}
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span
                    className={cn(
                      "font-display text-3xl font-bold lg:text-4xl",
                      tier.highlighted ? "text-white" : "text-foreground"
                    )}
                  >
                    {tier.price}
                  </span>
                  {tier.cadence ? (
                    <span
                      className={cn(
                        "text-sm",
                        tier.highlighted
                          ? "text-white/80"
                          : "text-muted-foreground"
                      )}
                    >
                      {tier.cadence}
                    </span>
                  ) : null}
                </div>

                <p
                  className={cn(
                    "mt-3 text-sm leading-relaxed",
                    tier.highlighted ? "text-white/85" : "text-muted-foreground"
                  )}
                >
                  {tier.description}
                </p>

                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                          tier.highlighted
                            ? "bg-white/20 text-white"
                            : "bg-brand-50 text-brand-600"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <span
                        className={cn(
                          tier.highlighted ? "text-white" : "text-foreground"
                        )}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={buildWhatsAppLink(
                    `Hi Prova Media, I'm interested in the ${tier.name} plan${
                      serviceName ? ` for ${serviceName}` : ""
                    } (${groups[active]?.label ?? ""}).`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "mt-7 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition",
                    tier.highlighted
                      ? "bg-white text-brand-700 hover:-translate-y-0.5 hover:bg-slate-50"
                      : "bg-foreground text-white hover:-translate-y-0.5 hover:bg-brand-600"
                  )}
                >
                  {tier.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </Container>
    </Section>
  );
}
