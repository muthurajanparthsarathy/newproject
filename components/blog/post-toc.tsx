"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/blog";

/** "On this page" list that highlights the section being read. */
export function PostToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => !!el);
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      // A heading counts as "current" once it reaches the top fifth of the screen
      { rootMargin: "-96px 0px -80% 0px" }
    );
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">On this page</p>
      <ol className="mt-4 space-y-1 border-l border-slate-200">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l-2 py-1.5 pl-4 text-sm leading-snug transition",
                active === item.id
                  ? "border-brand-600 font-medium text-brand-700"
                  : "border-transparent text-muted-foreground hover:border-slate-300 hover:text-foreground"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
