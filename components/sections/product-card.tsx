import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { Product } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Cadences that read as a unit after the price ("₹999/month"); others are dropped. */
function priceUnit(cadence: string) {
  if (cadence.startsWith("/")) return cadence;
  if (cadence === "one-time") return " one-time";
  return "";
}

export function ProductCard({
  product,
  headingAs: Heading = "h3",
  showFeatures,
}: {
  product: Product;
  headingAs?: "h2" | "h3";
  showFeatures?: boolean;
}) {
  const Icon = product.icon;
  const entry = product.pricing[0];

  return (
    <Link
      href={product.href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={product.heroImage}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
        <span
          className={cn(
            "absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-glow",
            product.accent
          )}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex-1">
          <Heading className="text-xl font-semibold text-foreground transition group-hover:text-brand-700">
            {product.name}
          </Heading>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>

          {showFeatures ? (
            <ul className="mt-5 space-y-2.5 text-sm text-foreground">
              {product.features.slice(0, 4).map((f) => (
                <li key={f.title} className="flex items-center gap-2.5">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                  {f.title}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
          {entry ? (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Starts at
              </div>
              <div className="mt-0.5 font-display text-xl font-bold text-foreground">
                {entry.price}
                <span className="text-sm font-medium text-muted-foreground">
                  {priceUnit(entry.cadence)}
                </span>
              </div>
            </div>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
            Details
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
