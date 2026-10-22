import type { Metadata } from "next";
import { Mail, MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import {
  Section,
  Container,
} from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/sections/contact-form";
import { SITE, FULL_ADDRESS, buildWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title:
    "Contact Prova Media Coimbatore — Call, WhatsApp +91 86106 59547",
  description:
    "Get in touch with Prova Media — Coimbatore's premium digital agency. Visit Saravanampatti Road (behind Prozone Mall), call +91 86106 59547, WhatsApp or email provamedia193@gmail.com. 24-hour response.",
  keywords: [
    "contact Prova Media",
    "Prova Media Coimbatore phone",
    "Prova Media WhatsApp",
    "Prova Media email",
    "digital agency Saravanampatti",
    "agency near Prozone Mall Coimbatore",
    "web development agency contact Coimbatore",
    "digital marketing agency contact Coimbatore",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Prova Media — Digital Agency in Coimbatore",
    description:
      "Call +91 86106 59547 or WhatsApp Prova Media. Saravanampatti, Coimbatore — 24-hour response.",
    url: "/contact",
    type: "website",
  },
};

const CONTACT_CARDS = [
  {
    icon: MapPin,
    title: "Visit",
    value: FULL_ADDRESS,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(FULL_ADDRESS)}`,
  },
  {
    icon: Phone,
    title: "Call",
    value: SITE.phone,
    href: `tel:${SITE.phoneTel}`,
  },
  {
    icon: Mail,
    title: "Email",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
  },
  {
    icon: Clock,
    title: "Hours",
    value: "Mon–Sat · 10am – 7pm IST",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&rsquo;s build{" "}
            <span className="text-gradient">something great</span>
          </>
        }
        description="Tell us about your project. We&rsquo;ll respond within 24 hours with a tailored plan and timeline."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        actions={
          <Button
            href={buildWhatsAppLink(
              "Hi Prova Media, I'd like to start a project."
            )}
            external
            variant="whatsapp"
          >
            <MessageCircle className="h-4 w-4" />
            Skip the form, chat now
          </Button>
        }
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal direction="left" className="lg:col-span-5">
              <div>
                <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Reach out
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                  Direct lines to our team
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Pick whatever&rsquo;s easiest for you — we&rsquo;ll be on it within
                  minutes during business hours.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {CONTACT_CARDS.map((c) => {
                  const Icon = c.icon;
                  const inner = (
                    <>
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-soft">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {c.title}
                      </div>
                      <div className="mt-1 text-sm font-medium text-foreground">
                        {c.value}
                      </div>
                    </>
                  );
                  return c.href ? (
                    <a
                      key={c.title}
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-glow"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div
                      key={c.title}
                      className="rounded-2xl border border-slate-200 bg-white p-5"
                    >
                      {inner}
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200">
                <iframe
                  title="Prova Media office location"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(FULL_ADDRESS)}&output=embed`}
                  className="h-72 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </Reveal>

            <div className="lg:col-span-7">
              <Reveal direction="right">
                <ContactForm />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
