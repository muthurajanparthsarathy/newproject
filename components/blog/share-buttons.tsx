"use client";

import { useState } from "react";
import { Check, Link2, MessageCircle } from "lucide-react";
import { LinkedInIcon } from "@/components/ui/brand-icons";

const BUTTON =
  "inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-foreground transition hover:-translate-y-0.5 hover:border-brand-500 hover:text-brand-600";

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="mr-1 text-sm font-semibold text-foreground">Share</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={BUTTON}
      >
        <MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden />
        WhatsApp
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={BUTTON}
      >
        <LinkedInIcon className="h-4 w-4 text-[#0A66C2]" aria-hidden />
        LinkedIn
      </a>
      <button type="button" onClick={copy} className={BUTTON}>
        {copied ? (
          <Check className="h-4 w-4 text-emerald-600" aria-hidden />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden />
        )}
        <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
      </button>
    </div>
  );
}
