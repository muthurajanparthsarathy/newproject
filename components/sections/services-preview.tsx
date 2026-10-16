import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Section,
  Container,
  SectionHeading,
} from "@/components/ui/section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { services } from "@/lib/content";
import { cn } from "@/lib/utils";

export function ServicesPreview() {
  return (
    <Section id="services">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Services"
            title={
              <>
                Everything your brand needs to{" "}
                <span className="text-gradient">grow online</span>
              </>
            }
            description="Strategy, design, code and creative — handled end-to-end by a single senior team."
          />
        </Reveal>

        <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <StaggerItem key={service.slug}>
                <Link
                  href={service.href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/40 hover:shadow-[0_24px_60px_-20px_rgb(37_99_235_/_0.4)]"
                >
                  <div
                    className={cn(
                      "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft transition group-hover:scale-110",
                      service.accent
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-foreground">
                    {service.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {service.shortDescription}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
                    Learn more
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>

                  <div
                    className={cn(
                      "pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition group-hover:opacity-30",
                      service.accent
                    )}
                  />
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </Section>
  );
}
