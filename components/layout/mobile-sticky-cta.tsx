"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import { buildWhatsAppLink, SITE } from "@/lib/utils";

export function MobileStickyCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!show}
      className={`pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 transition-all duration-300 md:hidden ${
        show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <a
        href={`tel:${SITE.phoneTel}`}
        aria-label="Call Prova Media"
        className="pointer-events-auto group relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-white shadow-[0_18px_40px_-12px_rgb(37_99_235_/_0.55)] transition active:scale-95"
      >
        <span
          className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand-500/40"
          aria-hidden
        />
        <Phone className="h-6 w-6" />
      </a>
      <Link
        href={buildWhatsAppLink(
          "Hi Prova Media, I'd like to start a project."
        )}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Prova Media on WhatsApp"
        className="pointer-events-auto group relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_-12px_rgb(37_211_102_/_0.6)] transition active:scale-95"
      >
        <span
          className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40"
          aria-hidden
        />
        <MessageCircle className="h-6 w-6" />
      </Link>
    </div>
  );
}
