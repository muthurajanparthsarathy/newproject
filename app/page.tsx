import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { TrustSection } from "@/components/sections/trust";
import { OneTeamIsland } from "@/components/sections/one-team-island";
import { ServicesPreview } from "@/components/sections/services-preview";
import { ProductsSection } from "@/components/sections/products-section";
import { PortfolioSection } from "@/components/sections/portfolio-section";
import { Testimonials } from "@/components/sections/testimonials";
import { VideoSection } from "@/components/sections/video-section";
import { ContactCTA } from "@/components/sections/contact-cta";

export const metadata: Metadata = {
  title:
    "Prova Media — Best Digital Agency in Coimbatore | Web Development, Digital Marketing & SEO",
  description:
    "Top-rated digital agency in Coimbatore offering website development from ₹7,000, digital marketing from ₹7,000/mo, custom software, GST billing apps and cinematic photography. Saravanampatti, behind Prozone Mall. Call +91 86106 59547.",
  alternates: { canonical: "/" },
  openGraph: {
    title:
      "Prova Media — Best Digital Agency in Coimbatore | Web, Marketing, Software, Photography",
    description:
      "Premium Coimbatore agency for website development, digital marketing, custom software & photography. Proven Digital Growth.",
    url: "/",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <TrustSection />
      <OneTeamIsland />
      <ServicesPreview />
      <ProductsSection />
      <PortfolioSection />
      <Testimonials />
      <VideoSection />
      <ContactCTA />
    </>
  );
}
