import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import {
  Section,
  Container,
} from "@/components/ui/section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { ContactCTA } from "@/components/sections/contact-cta";
import { services } from "@/lib/content";
import { cn, buildWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title:
    "Services in Coimbatore — Web Development, Digital Marketing, Software & Photography",
  description:
    "Prova Media services in Coimbatore: website development from ₹7,000, digital marketing from ₹7,000/month, custom software, billing apps and cinematic photography. Senior team, transparent pricing, measurable growth.",
  keywords: [
    "Prova Media services",
    "website development Coimbatore",
    "digital marketing agency Coimbatore",
    "SEO services Coimbatore",
    "Google Ads Coimbatore",
    "software development Coimbatore",
    "photography Coimbatore",
    "videography Coimbatore",
    "best digital agency Coimbatore",
    "agency near Prozone Mall",
  ],
  alternates: { canonical: "/services" },
  openGraph: {
    title:
      "Prova Media Services — Web, Marketing, Software & Photography in Coimbatore",
    description:
      "Senior-led web development, SEO, Google & Meta ads, custom software and cinematic photography in Coimbatore.",
    url: "/services",
    type: "website",
  },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Senior teams. Premium craft.{" "}
            <span className="text-gradient">Real growth.</span>
          </>
        }
        description="Pick the service you need or combine them — every engagement is led by a senior team that owns the outcome."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Services" }]}
        actions={
          <>
            <Button href="/contact">
              Get a free strategy call
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              href={buildWhatsAppLink("Hi Prova Media, I'd like to discuss services.")}
              external
              variant="whatsapp"
            >
              WhatsApp us
            </Button>
          </>
        }
      />

      <Section>
        <Container>
          <Stagger className="grid gap-6 md:grid-cols-2">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <StaggerItem key={service.slug}>
                  <Link
                    href={service.href}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/40 hover:shadow-[0_24px_60px_-20px_rgb(37_99_235_/_0.4)]"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={cn(
                          "inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-soft transition group-hover:scale-110",
                          service.accent
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-foreground transition group-hover:border-brand-500 group-hover:bg-brand-600 group-hover:text-white">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>

                    <h2 className="mt-6 text-2xl font-bold text-foreground">
                      {service.name}
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                      {service.shortDescription}
                    </p>

                    <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-muted-foreground">
                      {service.features.slice(0, 4).map((f) => (
                        <li key={f.title} className="flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-brand-500" />
                          {f.title}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-8">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
                        Learn more
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>

                    <div
                      className={cn(
                        "pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition group-hover:opacity-30",
                        service.accent
                      )}
                    />
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>

          <Reveal>
            <div className="mx-auto mt-12 max-w-3xl text-center">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Need a combined package?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Most of our clients combine 2-3 services into one growth retainer
                — we&rsquo;ll structure it around your goals.
              </p>
              <div className="mt-6 flex justify-center">
                <Button href="/contact" size="lg">
                  Build a custom plan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <ContactCTA />
    </>
  );
}
