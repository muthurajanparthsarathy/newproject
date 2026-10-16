import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Section,
  Container,
  SectionHeading,
} from "@/components/ui/section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { products } from "@/lib/content";
import { cn } from "@/lib/utils";

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

        <Stagger className="mt-10 grid gap-6 lg:grid-cols-3">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <StaggerItem key={product.slug}>
                <Link
                  href={product.href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/40 hover:shadow-[0_24px_60px_-20px_rgb(37_99_235_/_0.4)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={product.heroImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
                    <div
                      className={cn(
                        "absolute left-5 top-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-glow",
                        product.accent
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-semibold text-foreground">
                      {product.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {product.shortDescription}
                    </p>

                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
                      Explore product
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </Section>
  );
}
