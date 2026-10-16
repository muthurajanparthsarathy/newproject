import { ArrowUpRight, Globe, ShoppingBag } from "lucide-react";
import { portfolio } from "@/lib/content";

export function PortfolioGrid({ limit }: { limit?: number }) {
  const items = typeof limit === "number" ? portfolio.slice(0, limit) : portfolio;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {items.map((item, index) => (
        <a
          key={item.url}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${item.title} website (opens in a new tab)`}
          className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
        >
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
            <div aria-hidden="true" className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
            </div>
            <Globe aria-hidden="true" className="ml-2 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate text-xs text-muted-foreground">{new URL(item.url).hostname}</span>
          </div>
          <div className={`flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center ${index === 0 ? "bg-gradient-to-br from-sky-50 via-white to-blue-100" : "bg-gradient-to-br from-orange-50 via-white to-amber-100"}`}>
            <ShoppingBag aria-hidden="true" className={`mb-5 h-9 w-9 ${index === 0 ? "text-brand-600" : "text-amber-700"}`} strokeWidth={1.5} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Website project</span>
            <h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{item.title}</h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">Web development</span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">Visit website <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
          </div>
        </a>
      ))}
    </div>
  );
}
