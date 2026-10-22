import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import {
  Section,
  Container,
} from "@/components/ui/section";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { ContactCTA } from "@/components/sections/contact-cta";
import { ProductCard } from "@/components/sections/product-card";
import { products } from "@/lib/content";
import { buildWhatsAppLink } from "@/lib/utils";

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
          <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <StaggerItem key={product.slug}>
                <ProductCard product={product} headingAs="h2" showFeatures />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <ContactCTA />
    </>
  );
}
