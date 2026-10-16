import {
  Aperture,
  Camera,
  Clapperboard,
  CodeXml,
  Film,
  Globe,
  Heart,
  Megaphone,
  MonitorSmartphone,
  MousePointerClick,
  Receipt,
  Scissors,
  Search,
  Smartphone,
  Star,
  TrendingUp,
  Trophy,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";

export type OneTeamChip = {
  icon: LucideIcon;
  text: string;
};

/** One cut-out picture in a layered scene, placed on the scene's artboard. */
export type OneTeamLayer = {
  /** Transparent PNG/WebP in /public */
  src: string;
  alt: string;
  /** Intrinsic pixel size of the file (only the ratio matters) */
  width: number;
  height: number;
  /** Left edge, bottom edge and width as % of the artboard */
  left: number;
  bottom: number;
  size: number;
  /** Parallax strength: 0 = still, 1 = normal, >1 = closer to the viewer */
  depth: number;
};

/** A small animated touch drawn in code on top of the artwork. */
export type OneTeamEffect = {
  type: "rec" | "glow" | "sparkle";
  /** Centre point as % of the artboard */
  left: number;
  top: number;
  /** Width as % of the artboard (glow only) */
  size?: number;
  /** Glow colour, e.g. warm "255,226,170" or cool "200,225,255" */
  rgb?: string;
  depth: number;
};

export type OneTeamArt = {
  /** Artboard width ÷ height; layers and effects are positioned in % of it */
  aspect: number;
  layers: OneTeamLayer[];
  effects?: OneTeamEffect[];
};

export type OneTeamScene = {
  id: string;
  /** Short label used in the step row and the orbiting badges */
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind gradient classes "from-X to-Y" for the scene card and its badge */
  accent: string;
  /**
   * Small floating chips drawn around the scene card. For the "before" scene
   * these are the separate vendors a client used to juggle.
   */
  chips: OneTeamChip[];
  /** Optional service page link shown under the caption */
  href?: string;
  hrefLabel?: string;
  /**
   * Layered cut-out artwork of the team that replaces the icon card. Scenes
   * without it keep the icon card until their artwork is ready.
   */
  art?: OneTeamArt;
  /** The "before" scene draws three disconnected vendors instead of a card */
  kind?: "before";
  /** Show the WhatsApp call-to-action under this scene's caption */
  cta?: boolean;
};

export const ONE_TEAM_AUTOPLAY_MS = 3800;

export const ONE_TEAM_SCENES: OneTeamScene[] = [
  {
    id: "before",
    kind: "before",
    label: "Before",
    title: "Three agencies. Zero coordination.",
    description:
      "A web developer here, an ad agency there, a photographer somewhere else. Three invoices, three follow-ups — and nobody owns the result.",
    icon: Users,
    accent: "from-slate-400 to-slate-500",
    chips: [
      { icon: Globe, text: "Web developer" },
      { icon: Megaphone, text: "Ad agency" },
      { icon: Camera, text: "Photographer" },
    ],
  },
  {
    id: "shoot",
    label: "Shoot",
    title: "We shoot it.",
    description:
      "Cinematic photos and reels of your products, space and team — planned around what your ads and website actually need.",
    icon: Camera,
    accent: "from-rose-400 to-orange-400",
    chips: [
      { icon: Aperture, text: "4K" },
      { icon: Film, text: "Reels" },
    ],
    href: "/services/photography",
    hrefLabel: "Photography & video",
    art: {
      aspect: 3 / 2,
      layers: [
        {
          src: "/one-team/shoot-team-v2.png",
          alt: "Surya photographing the amber perfume while Muthurajan arranges the lighting",
          width: 1536,
          height: 1024,
          left: 0,
          bottom: 0,
          size: 100,
          depth: 1,
        },
      ],
    },
  },
  {
    id: "edit",
    label: "Edit",
    title: "We edit it.",
    description:
      "Colour, cuts, captions and motion graphics — delivered in every format: reels, shorts, ad creatives and website banners.",
    icon: Clapperboard,
    accent: "from-violet-500 to-fuchsia-500",
    chips: [
      { icon: Scissors, text: "Cut" },
      { icon: Film, text: "Every format" },
    ],
    href: "/services/photography",
    hrefLabel: "Photography & video",
    art: {
      aspect: 3 / 2,
      layers: [
        {
          src: "/one-team/edit-surya-v2.png",
          alt: "Surya Kumar editing the perfume video at his desk",
          width: 1536,
          height: 1024,
          left: 0,
          bottom: 0,
          size: 100,
          depth: 1,
        },
      ],
    },
  },
  {
    id: "upload",
    label: "Upload",
    title: "We post it.",
    description:
      "Consistent uploads across Instagram, Facebook and YouTube, with captions and hashtags written for your audience.",
    icon: Upload,
    accent: "from-pink-500 to-rose-500",
    chips: [
      { icon: Heart, text: "Reach ↑" },
      { icon: Smartphone, text: "Posted" },
    ],
    href: "/services/digital-marketing",
    hrefLabel: "Digital marketing",
    art: {
      aspect: 4 / 3,
      layers: [
        {
          src: "/one-team/upload-surya.png",
          alt: "Surya uploading the amber perfume video from his phone",
          width: 1024,
          height: 1536,
          left: 25,
          bottom: 0,
          size: 50,
          depth: 1,
        },
      ],
    },
  },
  {
    id: "ads",
    label: "Run ads",
    title: "We put money behind it.",
    description:
      "Meta and Google ad campaigns using the same content we shot — targeted, tracked and tuned for real enquiries.",
    icon: Megaphone,
    accent: "from-amber-400 to-orange-500",
    chips: [
      { icon: TrendingUp, text: "Leads ↑" },
      { icon: MousePointerClick, text: "Tracked" },
    ],
    href: "/services/digital-marketing",
    hrefLabel: "Digital marketing",
    art: {
      aspect: 3 / 2,
      layers: [
        {
          src: "/one-team/ads-muthurajan.png",
          alt: "Muthurajan managing perfume ads at a standing desk",
          width: 1536,
          height: 1024,
          left: 0,
          bottom: 0,
          size: 100,
          depth: 1,
        },
      ],
    },
  },
  {
    id: "website",
    label: "Website",
    title: "We build where it lands.",
    description:
      "A fast, mobile-first website from ₹7,000 — so every ad click and every post lands somewhere that converts.",
    icon: MonitorSmartphone,
    accent: "from-brand-500 to-sky-500",
    chips: [
      { icon: Smartphone, text: "Mobile-first" },
      { icon: CodeXml, text: "Fast" },
    ],
    href: "/services/website-development",
    hrefLabel: "Website development",
    art: {
      aspect: 3 / 2,
      layers: [
        {
          src: "/one-team/website-muthurajan.png",
          alt: "Muthurajan building the perfume website with desktop and mobile previews",
          width: 1536,
          height: 1024,
          left: 0,
          bottom: 0,
          size: 100,
          depth: 1,
        },
      ],
    },
  },
  {
    id: "teamwork",
    label: "Teamwork",
    title: "We keep it connected.",
    description:
      "The same product photos move from the shoot to your website and campaigns, with Surya and Muthurajan working together at every step.",
    icon: Users,
    accent: "from-sky-400 to-brand-600",
    chips: [
      { icon: Users, text: "Together" },
      { icon: Heart, text: "One vision" },
    ],
    art: {
      aspect: 4 / 3,
      layers: [
        {
          src: "/one-team/teamwork-surya.png",
          alt: "Surya sharing edited perfume photos on a tablet with his teammate",
          width: 1024,
          height: 1536,
          left: 25,
          bottom: 0,
          size: 50,
          depth: 1,
        },
      ],
    },
  },
  {
    id: "seo",
    label: "SEO",
    title: "We make you findable.",
    description:
      "SEO-ready pages and local search set-up so customers in Coimbatore find you when they search — not your competitor.",
    icon: Search,
    accent: "from-emerald-400 to-teal-500",
    chips: [
      { icon: Search, text: "Ranked" },
      { icon: Star, text: "Reviews" },
    ],
    href: "/services/website-development",
    hrefLabel: "SEO-ready websites",
    art: {
      aspect: 3 / 2,
      layers: [
        {
          src: "/one-team/seo-muthurajan.png",
          alt: "Muthurajan reviewing a perfume search result from a blue bean bag",
          width: 1536,
          height: 1024,
          left: 0,
          bottom: 0,
          size: 100,
          depth: 1,
        },
      ],
    },
  },
  {
    id: "grow",
    label: "Grow",
    title: "One team. One invoice. One WhatsApp.",
    description:
      "Shoot, edit, upload, ads, website and SEO under one roof — it all works together because one team owns all of it.",
    icon: Trophy,
    accent: "from-brand-600 to-indigo-600",
    chips: [
      { icon: Users, text: "One team" },
      { icon: Receipt, text: "One invoice" },
    ],
    cta: true,
    art: {
      aspect: 3 / 2,
      layers: [
        {
          src: "/one-team/grow-team.png",
          alt: "Surya giving a thumbs up while Muthurajan shakes hands with a perfume business owner",
          width: 1536,
          height: 1024,
          left: 0,
          bottom: 0,
          size: 100,
          depth: 1,
        },
      ],
    },
  },
];
