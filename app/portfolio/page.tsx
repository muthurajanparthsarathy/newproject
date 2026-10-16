import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Section, Container } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { PortfolioGrid } from "@/components/sections/portfolio-grid";
import { ContactCTA } from "@/components/sections/contact-cta";
import { buildWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Portfolio — Recent Web, Marketing, Software & Photo Work | Coimbatore",
  description:
    "Selected projects from Prova Media — Coimbatore's premium digital agency. D2C ecommerce, brand films, SaaS dashboards, performance ad funnels, POS software and more.",
  keywords: [
    "Prova Media portfolio",
    "Coimbatore web design portfolio",
    "digital agency case studies Coimbatore",
    "ecommerce website portfolio Coimbatore",
    "brand film portfolio Coimbatore",
    "SaaS development portfolio India",
  ],
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Prova Media Portfolio — Selected Work in Coimbatore",
    description:
      "Web, marketing, software and photography projects delivered by Prova Media Coimbatore.",
    url: "/portfolio",
    type: "website",
  },
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title={
          <>
            Selected work that{" "}
            <span className="text-gradient">moved metrics</span>
          </>
        }
        description="A peek at recent launches across web, marketing, software and visuals — every project tied to a measurable outcome."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Portfolio" }]}
        actions={
          <>
            <Button href="/contact">
              Start a project
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              href={buildWhatsAppLink(
                "Hi Prova Media, I'd like to see more case studies."
              )}
              external
              variant="outline"
            >
              Request case studies
            </Button>
          </>
        }
      />

      <Section>
        <Container>
          <PortfolioGrid />
        </Container>
      </Section>

      <ContactCTA />
    </>
  );
}
