import { ArrowRight } from "lucide-react";
import {
  Section,
  Container,
  SectionHeading,
} from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { PortfolioGrid } from "./portfolio-grid";

export function PortfolioSection() {
  return (
    <Section id="portfolio">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Portfolio"
            title={
              <>
                Work that delivered{" "}
                <span className="text-gradient">real outcomes</span>
              </>
            }
            description="Explore our recent website projects and visit the live sites."
          />
        </Reveal>

        <div className="mt-10">
          <PortfolioGrid limit={6} />
        </div>

        <div className="mt-12 flex justify-center">
          <Button href="/portfolio" variant="outline" size="lg">
            View full portfolio
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Container>
    </Section>
  );
}

