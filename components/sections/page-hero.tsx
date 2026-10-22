import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

type PageHeroProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  breadcrumb?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  accent?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  breadcrumb,
  actions,
  accent,
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-slate-100">
      <div className="absolute inset-0 -z-10 bg-mesh" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-grid opacity-50" aria-hidden />

      <Container className="pt-20 pb-10 md:pt-24 md:pb-14">
        {breadcrumb && breadcrumb.length > 0 ? (
          <Reveal>
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
            >
              {breadcrumb.map((b, i) => (
                <span key={`${b.label}-${i}`} className="inline-flex items-center gap-1">
                  {b.href ? (
                    <Link href={b.href} className="hover:text-brand-600">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{b.label}</span>
                  )}
                  {i < breadcrumb.length - 1 ? (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  ) : null}
                </span>
              ))}
            </nav>
          </Reveal>
        ) : null}

        <div className={cn("grid items-center gap-12", image ? "lg:grid-cols-12" : "lg:grid-cols-1")}>
          <div className={cn(image ? "lg:col-span-7" : "max-w-3xl mx-auto text-center")}>
            {eyebrow ? (
              <Reveal>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 shadow-soft backdrop-blur",
                    accent
                  )}
                >
                  {eyebrow}
                </span>
              </Reveal>
            ) : null}
            <Reveal delay={0.05}>
              <h1 className="mt-4 font-display text-[2rem] font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                {title}
              </h1>
            </Reveal>
            {description ? (
              <Reveal delay={0.1}>
                <p className={cn("mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg", !image && "mx-auto")}>
                  {description}
                </p>
              </Reveal>
            ) : null}
            {actions ? (
              <Reveal delay={0.15}>
                <div className={cn("mt-7 flex flex-wrap items-center gap-3", !image && "justify-center")}>{actions}</div>
              </Reveal>
            ) : null}
          </div>

          {image ? (
            <Reveal direction="right" className="lg:col-span-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-200 shadow-[0_30px_80px_-30px_rgb(15_23_42_/_0.35)]">
                <Image
                  src={image}
                  alt={imageAlt ?? ""}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
