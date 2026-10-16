import {
  Globe2,
  Megaphone,
  Code2,
  Camera,
  type LucideIcon,
} from "lucide-react";

export type HeroSlide = {
  id: string;
  icon: LucideIcon;
  eyebrow: string;
  /** Headline split into 3 parts: lead + emphasized word + tail */
  lead: string;
  emphasis: string;
  tail: string;
  description: string;
  /** Big metric shown in carousel card */
  metric: string;
  metricLabel: string;
  /** Small live tag chip */
  tag: string;
  image: string;
  /** Tailwind gradient classes "from-X to-Y" used for accents on this slide */
  accent: string;
  /** Hex pair for the same gradient — used in inline gradients (text gradient, glow) */
  hex: [string, string];
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "web",
    icon: Globe2,
    eyebrow: "Website Development",
    lead: "We Build",
    emphasis: "Websites",
    tail: "That Convert",
    description:
      "Lightning-fast, conversion-focused websites — built on Next.js, optimised for SEO and engineered to turn visitors into customers.",
    metric: "+218%",
    metricLabel: "Avg. conversion uplift",
    tag: "Live build",
    image:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80",
    accent: "from-blue-500 to-sky-500",
    hex: ["#2563eb", "#0ea5e9"],
  },
  {
    id: "marketing",
    icon: Megaphone,
    eyebrow: "Digital Marketing",
    lead: "We Run",
    emphasis: "Campaigns",
    tail: "That Drive Revenue",
    description:
      "SEO, Google & Meta ads, social and AI-driven content — all measured to ROAS, all owned by you.",
    metric: "5.2x",
    metricLabel: "Average ROAS",
    tag: "Active campaign",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    accent: "from-sky-500 to-cyan-500",
    hex: ["#0ea5e9", "#06b6d4"],
  },
  {
    id: "software",
    icon: Code2,
    eyebrow: "Software Development",
    lead: "We Ship",
    emphasis: "Software",
    tail: "That Scales",
    description:
      "Custom SaaS, billing, ERP and internal tools — fully yours, designed around your workflow.",
    metric: "90 d",
    metricLabel: "Idea to MVP",
    tag: "Custom build",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    accent: "from-indigo-500 to-blue-500",
    hex: ["#6366f1", "#2563eb"],
  },
  {
    id: "photo",
    icon: Camera,
    eyebrow: "Photography & Video",
    lead: "We Shoot",
    emphasis: "Visuals",
    tail: "That Sell",
    description:
      "Cinematic product, brand and event coverage plus AI-powered reels — premium content for every channel.",
    metric: "4K",
    metricLabel: "Cinematic delivery",
    tag: "On set",
    image:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
    accent: "from-cyan-500 to-blue-500",
    hex: ["#06b6d4", "#2563eb"],
  },
];
