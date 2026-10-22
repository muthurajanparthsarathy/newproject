import type { Metadata } from "next";
import { StudioHero } from "@/components/studio3d/StudioHero";
import { TrustSection } from "@/components/sections/trust";
// Hidden for now, kept for future use — uncomment this and <OneTeamIsland /> below to bring it back
// import { OneTeamIsland } from "@/components/sections/one-team-island";
import { ServicesPreview } from "@/components/sections/services-preview";
import { ProductsSection } from "@/components/sections/products-section";
import { PortfolioSection } from "@/components/sections/portfolio-section";
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
      <StudioHero />
      <TrustSection />
      {/* "One team · Shoot to SEO" section — hidden for now, kept for future use */}
      {/* <OneTeamIsland /> */}
      <ServicesPreview />
      <ProductsSection />
      <PortfolioSection />
      <ContactCTA />
    </>
  );
}
