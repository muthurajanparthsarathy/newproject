import Image from "next/image";
import { ArrowRight, Check, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Section,
  Container,
  SectionHeading,
} from "@/components/ui/section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { PricingSection } from "@/components/sections/pricing";
import { ContactCTA } from "@/components/sections/contact-cta";
import type { Product } from "@/lib/content";
import { buildWhatsAppLink, cn } from "@/lib/utils";

const DEMO_IMAGES: Record<string, string[]> = {
  ecommerce: [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
  ],
  "billing-software": [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=900&q=80",
  ],
  "photography-packages": [
    "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  ],
};

export function ProductDetail({ product }: { product: Product }) {
  const Icon = product.icon;
  const demos = DEMO_IMAGES[product.slug] ?? [product.heroImage];

  return (
    <>
      <PageHero
        eyebrow="Product"
        title={
          <>
            {product.name.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="text-gradient">
              {product.name.split(" ").slice(-1)[0]}
            </span>
          </>
        }
        description={product.longDescription}
        image={product.heroImage}
        imageAlt={product.name}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: product.name },
        ]}
        actions={
          <>
            <Button href="#pricing">
              See pricing
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              href={buildWhatsAppLink(
                `Hi Prova Media, I'm interested in ${product.name}.`
              )}
              external
              variant="whatsapp"
            >
              <MessageCircle className="h-4 w-4" />
              Request a demo
            </Button>
          </>
        }
      />

      <Section>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="What's inside"
              title={
                <>
                  Powerful by default,{" "}
                  <span className="text-gradient">customizable as you grow</span>
                </>
              }
              description="Built for Indian businesses. Tested by hundreds of users."
            />
          </Reveal>

          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {product.features.map((f) => (
              <StaggerItem key={f.title}>
                <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-glow">
                  <div
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft transition group-hover:scale-110",
                      product.accent
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

      <Section className="bg-white/40">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Demo"
              title={
                <>
                  See {product.name}{" "}
                  <span className="text-gradient">in action</span>
                </>
              }
              description="A glimpse of what your branded experience can look like."
            />
          </Reveal>

          <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
            {demos.map((src, i) => (
              <StaggerItem key={src}>
                <div
                  className={cn(
                    "relative aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft",
                    i === 1 ? "md:-translate-y-6" : ""
                  )}
                >
                  <Image
                    src={src}
                    alt={`${product.name} preview ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 hover:scale-105"
                  />
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              "GST-ready",
              "Branded experience",
              "Mobile + Web",
              "Lifetime updates",
            ].map((t) => (
              <Reveal key={t}>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-white",
                      product.accent
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {t}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <PricingSection
        tiers={product.pricing}
        serviceName={product.name}
        title={
          <>
            Pricing for{" "}
            <span className="text-gradient">{product.name}</span>
          </>
        }
      />

      <Section>
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 sm:p-14">
              <div
                className={cn(
                  "absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br opacity-20 blur-3xl",
                  product.accent
                )}
                aria-hidden
              />
              <div className="relative grid gap-10 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-7">
                  <div
                    className={cn(
                      "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                      product.accent
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                    Ready to launch{" "}
                    <span className="text-gradient">{product.name}</span>?
                  </h2>
                  <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
                    Book a 20-minute demo and we&rsquo;ll show you exactly how it
                    fits your workflow.
                  </p>
                </div>
                <div className="flex flex-col gap-3 lg:col-span-5 lg:items-end">
                  <Button href="/contact" size="lg" className="w-full sm:w-auto">
                    Request a demo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    href={buildWhatsAppLink(
                      `Hi Prova Media, I'd like a demo of ${product.name}.`
                    )}
                    external
                    variant="whatsapp"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Chat on WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <ContactCTA />
    </>
  );
}
