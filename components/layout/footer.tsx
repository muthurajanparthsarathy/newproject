import Link from "next/link";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import {
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
  FacebookIcon,
} from "@/components/ui/brand-icons";
import { SITE, FULL_ADDRESS, buildWhatsAppLink } from "@/lib/utils";
import { services, products } from "@/lib/content";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0b1220] text-slate-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(37,99,235,0.18),transparent_45%),radial-gradient(circle_at_85%_100%,rgba(14,165,233,0.18),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 py-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="-translate-y-1">
              <Link
                href="/"
                aria-label="Prova Media — Home"
                className="inline-flex items-center gap-2.5"
              >
                <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-brand">
                  <span className="relative font-display text-lg font-bold text-white">
                    P
                  </span>
                </span>
                <span className="font-display text-lg font-bold tracking-tight text-white">
                  Prova<span className="text-sky-400">Media</span>
                </span>
              </Link>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Prova Media is a premium digital agency helping ambitious brands
              grow with web, marketing, software and visuals that convert.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={SITE.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-brand-500 hover:bg-white/10 hover:text-white"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={SITE.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-brand-500 hover:bg-white/10 hover:text-white"
              >
                <LinkedInIcon className="h-4 w-4" />
              </a>
              <a
                href={SITE.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-brand-500 hover:bg-white/10 hover:text-white"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a
                href={SITE.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-brand-500 hover:bg-white/10 hover:text-white"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-sm font-semibold text-white">Services</div>
            <ul className="mt-4 space-y-2 text-sm">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={s.href}
                    className="text-slate-400 transition hover:text-white"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="text-sm font-semibold text-white">Products</div>
            <ul className="mt-4 space-y-2 text-sm">
              {products.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={p.href}
                    className="text-slate-400 transition hover:text-white"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 text-sm font-semibold text-white">Company</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 transition hover:text-white"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/portfolio"
                  className="text-slate-400 transition hover:text-white"
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-slate-400 transition hover:text-white"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-400 transition hover:text-white"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="text-sm font-semibold text-white">Get in touch</div>

            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-brand-400" />
                <span>{FULL_ADDRESS}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-brand-400" />
                <a href={`tel:${SITE.phoneTel}`} className="hover:text-white">
                  {SITE.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-brand-400" />
                <a href={`mailto:${SITE.email}`} className="hover:text-white">
                  {SITE.email}
                </a>
              </li>
            </ul>

            <Link
              href={buildWhatsAppLink(
                "Hi Prova Media, I'd like to start a project."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
            >
              Start a project
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 py-6 md:flex-row md:items-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Prova Media. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <Link href="/contact" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-white">
              Terms
            </Link>
            <span className="hidden md:inline">{SITE.tagline}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
