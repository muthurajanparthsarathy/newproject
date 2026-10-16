"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buildWhatsAppLink } from "@/lib/utils";

export function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 hidden md:bottom-6 md:right-6 md:block">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-72 origin-bottom-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_50px_-20px_rgb(15_23_42_/_0.25)]"
          >
            <div className="flex items-start gap-3 bg-gradient-brand p-4 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Prova Media Team</div>
                <div className="text-xs text-white/80">Typically replies in minutes</div>
              </div>
              <button
                aria-label="Close chat preview"
                className="rounded-full p-1 text-white/80 transition hover:bg-white/15"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div className="rounded-2xl rounded-tl-md bg-slate-100 p-3 text-sm text-foreground">
                Hi there 👋 How can we help you grow today?
              </div>
              <a
                href={buildWhatsAppLink(
                  "Hi Prova Media, I'd like to discuss a project."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-gradient-brand px-4 py-3 text-center text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
              >
                Start chat on WhatsApp
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        aria-label="Chat on WhatsApp"
        onClick={() => setOpen((o) => !o)}
        className="pulse-ring relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_-12px_rgb(37_211_102_/_0.6)] transition hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
