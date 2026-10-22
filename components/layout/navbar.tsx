"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { cn, buildWhatsAppLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { ServiceColumns } from "./service-columns";
import { SERVICE_CATEGORIES } from "@/lib/service-catalog";

const NAV_LINKS = [
  // Ordered like a visitor's journey: who we are → what we offer → proof → learn → act
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services", mega: true },
  { href: "/products", label: "Products" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pathname = usePathname();

  // Hover intent: a short delay lets the pointer cross the gap between
  // "Services" and the panel without the menu snapping shut.
  const openMega = () => {
    clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const closeMegaSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 160);
  };
  const closeMega = () => {
    clearTimeout(closeTimer.current);
    setMegaOpen(false);
  };

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

  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [megaOpen]);

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

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileServicesOpen(false);
  };

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
            onMouseLeave={closeMegaSoon}
          >
            {NAV_LINKS.map((link) =>
              link.mega ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={openMega}
                >
                  <Link
                    href={link.href}
                    onClick={closeMega}
                    aria-haspopup="true"
                    aria-expanded={megaOpen}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      isActive(link.href) || megaOpen
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
                  onMouseEnter={closeMega}
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
              className="absolute left-0 right-0 top-full hidden pt-2 lg:block"
              onMouseEnter={openMega}
              onMouseLeave={closeMegaSoon}
            >
              <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-20px_rgb(15_23_42_/_0.25)]">
                  <ServiceColumns
                    activeHref={pathname}
                    onNavigate={closeMega}
                    className="grid-cols-4 px-8 pb-6 pt-7"
                  />
                  <div className="flex items-center justify-between gap-6 border-t border-slate-100 bg-slate-50/70 px-8 py-4">
                    <p className="text-sm">
                      <span className="font-semibold text-foreground">
                        Not sure which service you need?
                      </span>{" "}
                      <span className="text-muted-foreground">
                        Book a free 20-minute strategy call.
                      </span>
                    </p>
                    <div className="flex shrink-0 items-center gap-5">
                      <Link
                        href="/services"
                        onClick={closeMega}
                        className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                      >
                        All services
                      </Link>
                      <Button href="/contact" size="sm" onClick={closeMega}>
                        Talk to us
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
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
              onClick={closeMobile}
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
                  onClick={closeMobile}
                  aria-label="Close menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) =>
                  link.mega ? (
                    <div key={link.href}>
                      <button
                        type="button"
                        onClick={() => setMobileServicesOpen((o) => !o)}
                        aria-expanded={mobileServicesOpen}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-3 text-base font-medium transition",
                          isActive(link.href)
                            ? "bg-brand-50 text-brand-700"
                            : "text-foreground hover:bg-slate-50"
                        )}
                      >
                        {link.label}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            mobileServicesOpen && "rotate-180"
                          )}
                        />
                      </button>
                      {mobileServicesOpen ? (
                        <div className="mb-2 ml-3 mt-1 space-y-4 border-l border-slate-200 py-2 pl-4">
                          <Link
                            href="/services"
                            onClick={closeMobile}
                            className="block text-sm font-semibold text-brand-600"
                          >
                            All services
                          </Link>
                          {SERVICE_CATEGORIES.map((category) => (
                            <div key={category.id}>
                              <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                {category.title}
                              </div>
                              <ul className="mt-1.5 space-y-0.5">
                                {category.items.map((item) => (
                                  <li key={item.href}>
                                    <Link
                                      href={item.href}
                                      onClick={closeMobile}
                                      className={cn(
                                        "block py-1.5 text-sm",
                                        pathname === item.href
                                          ? "font-medium text-brand-700"
                                          : "text-foreground"
                                      )}
                                    >
                                      {item.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : (
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
                  )
                )}
              </nav>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6">
                <Button href="/contact" size="lg" onClick={closeMobile}>
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
