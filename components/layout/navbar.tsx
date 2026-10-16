"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { cn, buildWhatsAppLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { services } from "@/lib/content";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services", mega: true },
  { href: "/products", label: "Products" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      // Hide while scrolling down, bring back on any scroll up (or near the top).
      // Small deltas are ignored so trackpad jitter doesn't flicker it.
      if (y < 80) setHidden(false);
      else if (y > lastY + 6) {
        setHidden(true);
        setMegaOpen(false);
      } else if (y < lastY - 6) setHidden(false);
      else return;
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lets sections that pin below the navbar (e.g. the process panel) use its space while it's away.
  useEffect(() => {
    const root = document.documentElement;
    if (hidden && !mobileOpen) root.dataset.navHidden = "";
    else delete root.dataset.navHidden;
    return () => {
      delete root.dataset.navHidden;
    };
  }, [hidden, mobileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
          hidden && !mobileOpen && "-translate-y-full focus-within:translate-y-0",
          scrolled
            ? "glass shadow-[0_2px_24px_-12px_rgb(15_23_42_/_0.18)]"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8 md:h-[72px]">
          <Logo />

          <nav
            className="hidden items-center gap-1 lg:flex"
            onMouseLeave={() => setMegaOpen(false)}
          >
            {NAV_LINKS.map((link) =>
              link.mega ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setMegaOpen(true)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      isActive(link.href)
                        ? "text-brand-600"
                        : "text-foreground hover:text-brand-600"
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        megaOpen && "rotate-180"
                      )}
                    />
                  </Link>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "text-brand-600"
                      : "text-foreground hover:text-brand-600"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button
              href={buildWhatsAppLink(
                "Hi Prova Media, I'd like to chat about a project."
              )}
              external
              variant="outline"
              size="sm"
            >
              WhatsApp
            </Button>
            <Button href="/contact" variant="primary" size="sm">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((s) => !s)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-foreground transition hover:border-brand-500 hover:text-brand-600 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {megaOpen ? (
            <motion.div
              key="mega"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full hidden lg:block"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-20px_rgb(15_23_42_/_0.25)]">
                  <div className="grid grid-cols-2 gap-4">
                    {services.map((service) => {
                      const Icon = service.icon;
                      return (
                        <Link
                          key={service.slug}
                          href={service.href}
                          className="group flex items-start gap-4 rounded-xl p-4 transition hover:bg-slate-50"
                        >
                          <div
                            className={cn(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft",
                              service.accent
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground group-hover:text-brand-600">
                              {service.name}
                              <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {service.shortDescription}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="mt-5 flex items-center justify-between rounded-xl bg-gradient-brand-soft p-4">
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        Not sure which service you need?
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Book a free 20-minute strategy call.
                      </div>
                    </div>
                    <Button href="/contact" size="sm">
                      Talk to us
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            key="mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <button
              aria-label="Close menu overlay"
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-white p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <Logo />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobile}
                    className={cn(
                      "rounded-xl px-3 py-3 text-base font-medium transition",
                      isActive(link.href)
                        ? "bg-brand-50 text-brand-700"
                        : "text-foreground hover:bg-slate-50"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Services
                </div>
                <div className="flex flex-col gap-2">
                  {services.map((service) => {
                    const Icon = service.icon;
                    return (
                      <Link
                        key={service.slug}
                        href={service.href}
                        onClick={closeMobile}
                        className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50"
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                            service.accent
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {service.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6">
                <Button href="/contact" size="lg">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  href={buildWhatsAppLink(
                    "Hi Prova Media, I'd like to chat about a project."
                  )}
                  external
                  variant="whatsapp"
                  size="lg"
                >
                  Chat on WhatsApp
                </Button>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

    </>
  );
}
