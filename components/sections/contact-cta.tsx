import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Container, Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { buildWhatsAppLink } from "@/lib/utils";

export function ContactCTA() {
  return (
    <Section className="relative overflow-hidden">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 text-white shadow-[0_30px_80px_-30px_rgb(37_99_235_/_0.5)] sm:p-10 md:p-12">
            <div
              className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
              aria-hidden
            />
            <div
              className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_50%)]"
              aria-hidden
            />

            <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                  Ready when you are
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-[2.25rem]">
                  Start your project today &mdash; let&rsquo;s grow your brand.
                </h2>
                <p className="mt-3 max-w-xl text-base text-white/85">
                  Tell us about your goals and we&rsquo;ll come back within 24 hours
                  with a tailored plan, scope and timeline.
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:col-span-5 lg:items-end">
                <Link
                  href="/contact"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-brand-700 shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-50 lg:w-auto"
                >
                  Get a free strategy call
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={buildWhatsAppLink(
                    "Hi Prova Media, I'd like to discuss a project."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-4 text-base font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15 lg:w-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
