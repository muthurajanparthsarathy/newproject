import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Heart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import {
  Section,
  Container,
  SectionHeading,
} from "@/components/ui/section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { ProcessSection } from "@/components/sections/process";
import { ContactCTA } from "@/components/sections/contact-cta";
import { stats } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Prova Media — Senior Digital Agency Team in Coimbatore",
  description:
    "Meet Prova Media — senior strategists, designers, engineers and creators based in Saravanampatti, Coimbatore. We've delivered 120+ web, marketing and software projects with proven, measurable growth.",
  keywords: [
    "about Prova Media",
    "Prova Media team",
    "Prova Media founders",
    "digital agency team Coimbatore",
    "Saravanampatti software company",
    "best web agency in Coimbatore",
    "digital marketing experts Coimbatore",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Prova Media — Coimbatore Digital Agency",
    description:
      "Senior-led digital agency in Coimbatore. 120+ brands launched. Proven Digital Growth.",
    url: "/about",
    type: "website",
  },
};

const VALUES = [
  {
    icon: Sparkles,
    title: "Craft over churn",
    description:
      "We obsess over the details — from typography to load time — because they compound into real results.",
  },
  {
    icon: ShieldCheck,
    title: "Honest accountability",
    description:
      "We share the metrics, the wins and the misses every week. No spin, no fluff.",
  },
  {
    icon: Users,
    title: "Senior-led teams",
    description:
      "You always work with senior strategists and engineers — not interns dressed in agency branding.",
  },
  {
    icon: Heart,
    title: "Long-term thinking",
    description:
      "We build for the next 5 years, not the next sprint. Code, content and creative are made to last.",
  },
];

const TEAM = [
  {
    name: "Surya Kumar",
    role: "Founder",
    image: null,
  },
  {
    name: "Muthurajan",
    role: "Co-founder",
    image: "/images/team/muthurajan.jpg",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title={
          <>
            We&rsquo;re a small agency with a{" "}
            <span className="text-gradient">big obsession</span>: your growth.
          </>
        }
        description="Prova Media was built by founders, designers and engineers who&rsquo;ve shipped at the world&rsquo;s top product companies — for ambitious brands ready to win their category."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
        image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80"
        imageAlt="The Prova Media team"
        actions={
          <>
            <Button href="/contact">
              Work with us
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/portfolio" variant="outline">
              See our work
            </Button>
          </>
        }
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionHeading
                  eyebrow="Our story"
                  title={
                    <>
                      Built by operators,{" "}
                      <span className="text-gradient">for operators</span>
                    </>
                  }
                  align="left"
                />
              </Reveal>
            </div>
            <div className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg lg:col-span-7">
              <Reveal delay={0.05}>
                <p>
                  Prova Media was started after years of running marketing,
                  product and engineering teams inside fast-growing companies.
                  We saw the same broken pattern over and over: agencies built
                  for hours billed, not outcomes delivered.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <p>
                  So we built the agency we wished existed — small, senior and
                  obsessed with metrics. Every project is led by founders who
                  ship the work. Every retainer is built around real KPIs.
                  Every relationship is treated like our own business.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <p>
                  Today we partner with bold brands across India and abroad —
                  helping them launch, grow and scale with web, marketing,
                  software and visuals that actually convert.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-white/40">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="What we believe"
              title={
                <>
                  The principles that{" "}
                  <span className="text-gradient">guide our work</span>
                </>
              }
            />
          </Reveal>

          <Stagger className="mt-10 grid gap-6 sm:grid-cols-2">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <StaggerItem key={v.title}>
                  <div className="group flex h-full gap-5 rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-glow">
                    <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-soft transition group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {v.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {v.description}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="The team"
              title={
                <>
                  Meet our <span className="text-gradient">founders</span>
                </>
              }
            />
          </Reveal>

          <Stagger className="mx-auto mt-10 grid max-w-2xl gap-6 sm:grid-cols-2">
            {TEAM.map((member) => (
              <StaggerItem key={member.name}>
                <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 336px"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-sky-100">
                        <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-brand font-display text-3xl font-bold text-white shadow-glow">
                          {member.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-base font-semibold text-foreground">
                      {member.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.role}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-10 grid grid-cols-2 gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                  {s.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <ProcessSection />
      <ContactCTA />
    </>
  );
}
