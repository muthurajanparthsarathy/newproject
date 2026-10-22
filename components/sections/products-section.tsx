import {
  Section,
  Container,
  SectionHeading,
} from "@/components/ui/section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { products } from "@/lib/content";
import { ProductCard } from "./product-card";

export function ProductsSection() {
  return (
    <Section id="products" className="bg-white/40">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Products"
            title={
              <>
                Ready-to-launch products that{" "}
                <span className="text-gradient">save you months</span>
              </>
            }
            description="Pre-built solutions for ecommerce, billing and visuals — fully customizable to your brand."
          />
        </Reveal>

        <Stagger className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <StaggerItem key={product.slug}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
