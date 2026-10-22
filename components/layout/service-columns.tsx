import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVICE_CATEGORIES } from "@/lib/service-catalog";
import { cn } from "@/lib/utils";

/** The four service columns — shared by the navbar mega menu and the Services page. */
export function ServiceColumns({
  activeHref,
  onNavigate,
  className,
}: {
  activeHref?: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-8", className)}>
      {SERVICE_CATEGORIES.map((category) => {
        const Icon = category.icon;
        return (
          <div key={category.id}>
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span
                className={cn(
                  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-soft",
                  category.accent
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              {category.href ? (
                <Link
                  href={category.href}
                  onClick={onNavigate}
                  className="group/cat inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:text-brand-600"
                >
                  {category.title}
                  <ArrowRight
                    className="h-3.5 w-3.5 opacity-0 transition group-hover/cat:translate-x-0.5 group-hover/cat:opacity-100"
                    aria-hidden
                  />
                </Link>
              ) : (
                <span className="text-sm font-semibold text-foreground">{category.title}</span>
              )}
            </div>
            <ul className="mt-3 space-y-0.5">
              {category.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={activeHref === item.href ? "page" : undefined}
                    className={cn(
                      "-mx-2 block rounded-lg px-2 py-1.5 text-sm transition",
                      activeHref === item.href
                        ? "bg-brand-50 font-medium text-brand-700"
                        : "text-muted-foreground hover:bg-slate-50 hover:text-brand-600"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
