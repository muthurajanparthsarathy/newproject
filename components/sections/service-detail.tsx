import {
  ArrowRight,
  Check,
  AlertCircle,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Section,
  Container,
  SectionHeading,
} from "@/components/ui/section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { PricingSection } from "@/components/sections/pricing";
import { TabbedPricing } from "@/components/sections/tabbed-pricing";
import { FAQSection } from "@/components/sections/faq";
import { ContactForm } from "@/components/sections/contact-form";
import type { Service } from "@/lib/content";
import { buildWhatsAppLink, cn } from "@/lib/utils";

export function ServiceDetail({ service }: { service: Service }) {
  const Icon = service.icon;

  return (
    <>
      <PageHero
        eyebrow="Service"
        title={
          <>
            {service.name.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="text-gradient">
              {service.name.split(" ").slice(-1)[0]}
            </span>
          </>
        }
        description={service.longDescription}
        image={service.heroImage}
        imageAlt={service.name}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.name },
        ]}
        actions={
          <>
            <Button href="#pricing">
              See pricing
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              href={buildWhatsAppLink(
                `Hi Prova Media, I'd like to chat about ${service.name}.`
              )}
              external
              variant="whatsapp"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp us
            </Button>
          </>
        }
      />

      <Section>
        <Container>
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <Reveal direction="left">
              <div className="h-full rounded-2xl border border-rose-100 bg-rose-50/40 p-6 sm:p-7">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="mt-5 text-xs font-semibold uppercase tracking-widest text-rose-600">
                  The problem
                </div>
                <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
                  Where most brands get stuck
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {service.problem}
                </p>
              </div>
            </Reveal>

            <Reveal direction="right">
              <div className="h-full rounded-2xl border border-brand-100 bg-brand-50/40 p-6 sm:p-7">
                <div
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                    service.accent
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 text-xs font-semibold uppercase tracking-widest text-brand-600">
                  Our solution
                </div>
                <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
                  How Prova Media solves it
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {service.solution}
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="bg-white/40">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Features"
              title={
                <>
                  Everything included with{" "}
                  <span className="text-gradient">{service.name}</span>
                </>
              }
              description="An all-in-one offering — no add-ons or hidden costs."
            />
          </Reveal>

          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {service.features.map((f) => (
              <StaggerItem key={f.title}>
                <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-glow">
                  <div
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft transition group-hover:scale-110",
                      service.accent
                    )}
                  >
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal direction="left" className="lg:col-span-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                Why brands choose us
              </div>
              <h2 className="mt-3 text-[1.75rem] font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Outcomes you can{" "}
                <span className="text-gradient">measure</span>.
              </h2>
              <p className="mt-5 text-base text-muted-foreground sm:text-lg">
                Every project is built around clear KPIs — not vanity metrics.
                Here&rsquo;s what you can expect.
              </p>
              <Button href="/contact" className="mt-8">
                Get a free strategy call
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Reveal>

            <Stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              {service.benefits.map((b) => (
                <StaggerItem key={b}>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {b}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Container>
      </Section>

      {service.pricingGroups && service.pricingGroups.length > 0 ? (
        <TabbedPricing
          groups={service.pricingGroups}
          serviceName={service.name}
          background="muted"
        />
      ) : (
        <PricingSection
          tiers={service.pricing}
          serviceName={service.name}
          background="muted"
        />
      )}
      {service.pricingNote ? (
        <Container>
          <p className="-mt-12 mb-12 text-center text-xs text-muted-foreground sm:text-sm">
            {service.pricingNote}
          </p>
        </Container>
      ) : null}

      <FAQSection faqs={service.faqs} />

      <Section>
        <Container>
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionHeading
                  eyebrow="Get in touch"
                  title={
                    <>
                      Tell us about your{" "}
                      <span className="text-gradient">project</span>
                    </>
                  }
                  description="Share a few details and we'll get back within 24 hours with a tailored plan."
                  align="left"
                />
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal direction="right">
                <ContactForm defaultService={service.name} />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
