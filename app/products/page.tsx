import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import {
  Section,
  Container,
} from "@/components/ui/section";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { ContactCTA } from "@/components/sections/contact-cta";
import { products } from "@/lib/content";
import { cn, buildWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title:
    "E-commerce, GST Billing Software & Photography Packages — Coimbatore",
  description:
    "Ready-to-launch products from Prova Media Coimbatore — branded ecommerce stores from ₹15,000, GST-ready billing software with POS from ₹999/mo, and photography packages from ₹5,000.",
  keywords: [
    "ecommerce website development Coimbatore",
    "online store development Coimbatore",
    "Shopify alternative Coimbatore",
    "GST billing software Coimbatore",
    "POS software Coimbatore",
    "retail billing software Coimbatore",
    "photography packages Coimbatore",
    "product photography Coimbatore",
    "Prova Media products",
  ],
  alternates: { canonical: "/products" },
  openGraph: {
    title:
      "E-commerce, Billing Software & Photography Packages — Prova Media Coimbatore",
    description:
      "Launch faster with branded ecommerce, GST billing software and curated photography packages from Coimbatore.",
    url: "/products",
    type: "website",
  },
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title={
          <>
            Launch faster with our{" "}
            <span className="text-gradient">ready-to-go</span> products
          </>
        }
        description="Save months of development with battle-tested platforms — branded for you, owned by you."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Products" }]}
        actions={
          <>
            <Button href="/contact">
              Request a demo
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              href={buildWhatsAppLink("Hi Prova Media, I'd like a product demo.")}
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
          <Stagger className="grid gap-8">
            {products.map((product, i) => {
              const Icon = product.icon;
              const reverse = i % 2 === 1;
              return (
                <StaggerItem key={product.slug}>
                  <Link
                    href={product.href}
                    className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgb(37_99_235_/_0.4)]"
                  >
                    <div
                      className={cn(
                        "grid gap-0 lg:grid-cols-12 lg:items-stretch",
                        reverse && "lg:[&>:first-child]:order-2"
                      )}
                    >
                      <div className="relative aspect-[16/10] lg:col-span-6 lg:aspect-auto">
                        <Image
                          src={product.heroImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div
                          className={cn(
                            "absolute left-6 top-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-glow",
                            product.accent
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="flex flex-col justify-center p-8 lg:col-span-6 lg:p-12">
                        <span className="inline-flex w-fit items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-brand-700">
                          Product
                        </span>
                        <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                          {product.name}
                        </h2>
                        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                          {product.longDescription}
                        </p>
                        <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {product.features.slice(0, 4).map((f) => (
                            <li
                              key={f.title}
                              className="flex items-center gap-2 text-sm text-foreground"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                              {f.title}
                            </li>
                          ))}
                        </ul>
                        <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
                          Explore product
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </Container>
      </Section>

      <ContactCTA />
    </>
  );
}
