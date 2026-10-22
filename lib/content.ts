import type { LucideIcon } from "lucide-react";
import {
  Globe2,
  Megaphone,
  Code2,
  Camera,
  ShoppingBag,
  Receipt,
  Image as ImageIcon,
} from "lucide-react";

export type PricingGroup = {
  label: string;
  description?: string;
  tiers: PricingTier[];
};

export type Service = {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  icon: LucideIcon;
  accent: string;
  href: string;
  problem: string;
  solution: string;
  features: { title: string; description: string }[];
  benefits: string[];
  pricing: PricingTier[];
  pricingGroups?: PricingGroup[];
  pricingNote?: string;
  faqs: { q: string; a: string }[];
  heroImage: string;
};

export type PricingTier = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

export const services: Service[] = [
  {
    slug: "website-development",
    name: "Website Development",
    shortDescription:
      "High-performance websites engineered to convert visitors into customers.",
    longDescription:
      "From elegant landing pages to complex web apps, we craft fast, accessible and conversion-driven experiences that grow with your brand.",
    icon: Globe2,
    accent: "from-blue-500 to-sky-500",
    href: "/services/website-development",
    heroImage:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1600&q=80",
    problem:
      "Generic templates and slow websites cost you trust, traffic and revenue. Customers leave before they ever see your value.",
    solution:
      "We design and build pixel-perfect, lightning-fast websites tailored to your audience — engineered for SEO, conversion and long-term growth.",
    features: [
      {
        title: "Custom UI / UX Design",
        description: "Clean, modern interfaces that reflect your brand and guide users to action.",
      },
      {
        title: "Next.js & React",
        description: "Built on a modern, scalable stack with server-side rendering for top performance.",
      },
      {
        title: "SEO-Ready Architecture",
        description: "Semantic markup, schema, sitemaps and Core Web Vitals tuned out of the box.",
      },
      {
        title: "CMS Integration",
        description: "Edit content yourself with headless CMS, WordPress or a custom dashboard.",
      },
      {
        title: "Mobile-First & Responsive",
        description: "Flawless experience across phones, tablets and desktops.",
      },
      {
        title: "Analytics & Tracking",
        description: "GA4, pixel events and conversion tracking wired in from day one.",
      },
    ],
    benefits: [
      "Up to 3x faster page load",
      "Designed for measurable conversions",
      "Built to scale with your business",
      "Premium support and maintenance",
    ],
    pricing: [
      {
        name: "Basic",
        price: "₹7,000",
        cadence: "one-time",
        description: "Clean static website for new brands launching their first web presence.",
        features: [
          "Up to 5 pages",
          "Responsive design",
          "Contact form",
          "Basic SEO setup",
          "1 round of revisions",
        ],
        cta: "Start Basic",
      },
      {
        name: "Standard",
        price: "₹15,000",
        cadence: "one-time",
        description: "Our most popular static package for growing businesses.",
        features: [
          "Up to 10 pages",
          "Custom UI design",
          "Advanced SEO + schema",
          "Performance optimization",
          "WhatsApp + lead form",
          "3 rounds of revisions",
        ],
        cta: "Start Standard",
        highlighted: true,
      },
      {
        name: "Premium",
        price: "₹20,000",
        cadence: "one-time",
        description: "Premium static site with animations and custom design.",
        features: [
          "Unlimited pages",
          "Custom animations & micro-interactions",
          "Conversion optimization",
          "Advanced analytics",
          "Priority support",
        ],
        cta: "Start Premium",
      },
    ],
    pricingGroups: [
      {
        label: "Static Website",
        description: "Fast, content-driven sites perfect for portfolios, brochures and lead capture.",
        tiers: [
          {
            name: "Basic",
            price: "₹7,000",
            cadence: "one-time",
            description: "Clean static website for new brands launching their first web presence.",
            features: [
              "Up to 5 pages",
              "Responsive design",
              "Contact form + WhatsApp",
              "Basic SEO setup",
              "1 round of revisions",
            ],
            cta: "Start Basic",
          },
          {
            name: "Standard",
            price: "₹15,000",
            cadence: "one-time",
            description: "Our most popular static package for growing businesses.",
            features: [
              "Up to 10 pages",
              "Custom UI design",
              "Advanced SEO + schema",
              "Performance optimization",
              "WhatsApp + lead form",
              "3 rounds of revisions",
            ],
            cta: "Start Standard",
            highlighted: true,
          },
          {
            name: "Premium",
            price: "₹20,000",
            cadence: "one-time",
            description: "Premium static site with animations and conversion-focused design.",
            features: [
              "Unlimited pages",
              "Custom animations & micro-interactions",
              "Conversion optimization",
              "Advanced analytics",
              "Priority support",
            ],
            cta: "Start Premium",
          },
        ],
      },
      {
        label: "Dynamic Website",
        description: "Database-backed sites with admin dashboards, user accounts and CMS.",
        tiers: [
          {
            name: "Basic",
            price: "₹10,000",
            cadence: "one-time",
            description: "Dynamic site with CMS so you can edit content yourself.",
            features: [
              "Up to 8 pages",
              "Headless CMS",
              "Blog / portfolio",
              "Contact + WhatsApp",
              "Basic SEO + sitemap",
            ],
            cta: "Start Basic",
          },
          {
            name: "Standard",
            price: "₹15,000",
            cadence: "one-time",
            description: "Most popular for businesses that need real-time data and admin control.",
            features: [
              "Up to 15 pages",
              "Admin dashboard",
              "Custom CMS modules",
              "Auth + role-based access",
              "Advanced SEO + analytics",
              "3 rounds of revisions",
            ],
            cta: "Start Standard",
            highlighted: true,
          },
          {
            name: "Premium",
            price: "₹25,000",
            cadence: "one-time",
            description: "Full-stack web app with bespoke features, integrations and animations.",
            features: [
              "Unlimited pages & modules",
              "Custom features & APIs",
              "Payment / booking integration",
              "Custom animations",
              "Conversion optimization",
              "Priority support",
            ],
            cta: "Start Premium",
          },
        ],
      },
    ],
    pricingNote:
      "Domain, hosting, third-party APIs and email services billed at actuals. Maintenance retainer available.",
    faqs: [
      {
        q: "How long does it take to build a website?",
        a: "Most projects launch in 3–6 weeks depending on complexity. We'll share a clear timeline after our discovery call.",
      },
      {
        q: "Will I be able to edit the website myself?",
        a: "Yes — every project ships with a CMS or admin dashboard so you can update text, images and pages without touching code.",
      },
      {
        q: "Do you provide hosting and maintenance?",
        a: "We do. Choose from monthly maintenance plans that include hosting, security updates and content changes.",
      },
      {
        q: "What if I need design changes after launch?",
        a: "We include revisions in every plan and offer affordable post-launch support packages for ongoing updates.",
      },
    ],
  },
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    shortDescription:
      "Performance marketing campaigns that turn ad spend into measurable revenue.",
    longDescription:
      "Data-driven SEO, paid ads and social campaigns that put your brand in front of the right audience at the right time.",
    icon: Megaphone,
    accent: "from-sky-500 to-cyan-500",
    href: "/services/digital-marketing",
    heroImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    problem:
      "Random posts, untracked ads and flat traffic. Marketing feels like a cost center instead of a growth engine.",
    solution:
      "We architect full-funnel campaigns — SEO, Google Ads, Meta Ads and content — built around your KPIs and tied to revenue.",
    features: [
      { title: "SEO & Content", description: "Keyword research, content strategy and on-page SEO that ranks." },
      { title: "Google Ads", description: "Search, display and YouTube campaigns optimized for ROAS." },
      { title: "Meta & Instagram Ads", description: "Audience targeting and creative testing on Facebook and Instagram." },
      { title: "Social Media Management", description: "Daily content, community management and brand voice." },
      { title: "Email & WhatsApp", description: "Automated drip campaigns and broadcast flows that convert." },
      { title: "Analytics & Reports", description: "Transparent dashboards so you always know what's working." },
    ],
    benefits: [
      "Higher quality leads",
      "Lower customer acquisition cost",
      "Predictable monthly growth",
      "Full ownership of accounts and data",
    ],
    pricing: [
      {
        name: "Starter",
        price: "₹7,000",
        cadence: "/month",
        description: "Ideal for solo founders launching their brand online.",
        features: [
          "3 videos / month",
          "4 posters / month",
          "1 AI video / month",
          "Simple portfolio website",
          "Social media handling",
          "Content calendar",
          "Monthly performance report",
        ],
        cta: "Start Starter",
      },
      {
        name: "Boost",
        price: "₹12,000",
        cadence: "/month",
        description: "Build momentum with consistent content and a custom portfolio site.",
        features: [
          "6 videos / month",
          "6 posters / month",
          "2 AI videos / month",
          "Portfolio website (extra pages)",
          "Social media handling",
          "Content calendar",
          "Monthly performance report",
        ],
        cta: "Start Boost",
      },
      {
        name: "Grow",
        price: "₹15,000",
        cadence: "/month",
        description: "Most popular plan — high-output content for serious growth.",
        features: [
          "8 videos / month",
          "7 posters / month",
          "3 AI videos / month",
          "Portfolio website (more pages)",
          "Social media handling",
          "Content calendar",
          "Monthly performance report",
        ],
        cta: "Start Grow",
        highlighted: true,
      },
      {
        name: "Scale",
        price: "₹20,000",
        cadence: "/month",
        description: "Scale your brand with a dedicated portfolio website and richer content.",
        features: [
          "10 videos / month",
          "7 posters / month",
          "3 AI videos / month",
          "1 portfolio website included",
          "Social media handling",
          "Content calendar",
          "Monthly performance report",
        ],
        cta: "Start Scale",
      },
      {
        name: "Dominate",
        price: "₹25,000",
        cadence: "/month",
        description: "Premium content engine with custom strategy and creative direction.",
        features: [
          "13 videos / month",
          "10 posters / month",
          "5 AI videos / month",
          "Custom portfolio website",
          "Custom marketing plan",
          "Social media handling",
          "Content calendar + monthly report",
        ],
        cta: "Start Dominate",
      },
    ],
    pricingNote:
      "Every plan includes a portfolio website — features and pages vary by package. Ad spend is billed separately.",
    faqs: [
      {
        q: "Do I need to commit long-term?",
        a: "No long lock-ins. We work month to month after the first 90-day setup phase, because performance speaks for itself.",
      },
      {
        q: "Who owns the ad accounts and assets?",
        a: "You always own everything — accounts, creatives and data. We just run them better than anyone else.",
      },
      {
        q: "How much should I spend on ads?",
        a: "We help you start lean and scale based on data. Most clients begin with a media budget of ₹30k–₹1L per month.",
      },
      {
        q: "Will I see weekly progress?",
        a: "Yes. You'll get a live dashboard plus weekly Loom updates and monthly strategy calls.",
      },
    ],
  },
  {
    slug: "software-development",
    name: "Software Development",
    shortDescription:
      "Custom web and mobile software built to streamline operations and scale your business.",
    longDescription:
      "From SaaS dashboards to internal tools, we engineer reliable software your team and customers will love using every day.",
    icon: Code2,
    accent: "from-indigo-500 to-blue-500",
    href: "/services/software-development",
    heroImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    problem:
      "Manual workflows, spreadsheets and disconnected tools are slowing you down and burning hours every week.",
    solution:
      "We build modern, custom software — dashboards, automations and APIs — that does the boring work for you.",
    features: [
      { title: "Web Apps & SaaS", description: "Full-stack apps with auth, billing, dashboards and reporting." },
      { title: "Mobile Apps", description: "Native-feel apps for iOS and Android with React Native." },
      { title: "Internal Tools", description: "Admin panels, CRMs and ops tools that automate the boring stuff." },
      { title: "API & Integrations", description: "Connect Tally, Razorpay, Shopify, Zapier and more." },
      { title: "AI Features", description: "Add intelligent search, chatbots and automation powered by LLMs." },
      { title: "DevOps & Cloud", description: "Reliable deployments on AWS, Vercel and serverless platforms." },
    ],
    benefits: [
      "Eliminate hours of manual work",
      "Tailor-made to your workflow",
      "Secure, scalable and well-tested",
      "Documentation and training included",
    ],
    pricing: [
      {
        name: "Basic",
        price: "₹74,999",
        cadence: "starting",
        description: "Small internal tool, automation script or simple dashboard.",
        features: [
          "Single module",
          "Auth + admin",
          "Hosted on cloud",
          "30-day support",
        ],
        cta: "Start Basic",
      },
      {
        name: "Standard",
        price: "₹2,49,999",
        cadence: "starting",
        description: "MVP-grade SaaS or business app built for real users.",
        features: [
          "Multi-module SaaS",
          "Payments + subscriptions",
          "Custom dashboards",
          "API integrations",
          "90-day support",
        ],
        cta: "Start Standard",
        highlighted: true,
      },
      {
        name: "Premium",
        price: "₹6,99,999+",
        cadence: "starting",
        description: "Production SaaS, complex integrations or custom mobile + web platforms.",
        features: [
          "Full product engineering",
          "Mobile + web",
          "Enterprise integrations",
          "Dedicated team",
          "12-month roadmap",
        ],
        cta: "Start Premium",
      },
    ],
    faqs: [
      {
        q: "Do you sign NDAs?",
        a: "Always. We sign mutual NDAs before kickoff so your idea and data are protected.",
      },
      {
        q: "What stack do you use?",
        a: "Next.js, Node, TypeScript, Postgres, Tailwind and React Native — but we adapt to your existing stack when it makes sense.",
      },
      {
        q: "Can you take over an existing project?",
        a: "Yes. We do code audits and can take over partially built products with a clear handover plan.",
      },
      {
        q: "Will I own the source code?",
        a: "100%. You receive the GitHub repository, deployment access and complete documentation.",
      },
    ],
  },
  {
    slug: "photography",
    name: "Photography & Videography",
    shortDescription:
      "Cinematic visuals that elevate your brand across every channel.",
    longDescription:
      "Product, brand and event coverage that's instantly recognizable and ready for ads, web and social.",
    icon: Camera,
    accent: "from-cyan-500 to-blue-500",
    href: "/services/photography",
    heroImage:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1600&q=80",
    problem:
      "Stock photos and grainy phone shots don't sell premium products or attract premium clients.",
    solution:
      "We produce scroll-stopping photo and video that makes your brand feel like a category leader — on-set or on-location.",
    features: [
      { title: "Product Photography", description: "Studio shoots that make your products irresistible." },
      { title: "Brand Films", description: "Cinematic short films that tell your story in 60 seconds." },
      { title: "Social Reels", description: "Vertical-first video bundles for Instagram, TikTok and YouTube Shorts." },
      { title: "Event Coverage", description: "Conferences, weddings, launches and more captured beautifully." },
      { title: "Drone & Aerials", description: "Licensed drone operators for breathtaking aerial footage." },
      { title: "Post-Production", description: "Color grading, retouching and motion graphics in-house." },
    ],
    benefits: [
      "Premium look across every channel",
      "Faster ad and content creation",
      "Reusable visual library",
      "Bigger Average Order Value",
    ],
    pricing: [
      {
        name: "Basic",
        price: "₹14,999",
        cadence: "/day",
        description: "Half-day shoot for products or simple brand portraits.",
        features: [
          "4-hour shoot",
          "Up to 30 edited photos",
          "1 location",
          "Online gallery",
        ],
        cta: "Start Basic",
      },
      {
        name: "Standard",
        price: "₹34,999",
        cadence: "/day",
        description: "Full-day production for brand campaigns and product launches.",
        features: [
          "Full-day shoot",
          "Up to 80 edited photos",
          "1 brand reel (60s)",
          "Lighting + assistant",
          "Express turnaround",
        ],
        cta: "Start Standard",
        highlighted: true,
      },
      {
        name: "Premium",
        price: "₹79,999+",
        cadence: "/project",
        description: "Cinematic productions for hero campaigns, events and brand films.",
        features: [
          "Multi-day shoot",
          "Cinematic brand film (90s+)",
          "Drone + multi-cam",
          "Color grading",
          "Reusable visual library",
        ],
        cta: "Start Premium",
      },
    ],
    faqs: [
      {
        q: "Do you travel for shoots?",
        a: "Yes — we shoot pan-India and abroad. Travel and stay are billed at actuals, transparently.",
      },
      {
        q: "How fast do you deliver?",
        a: "Standard delivery is 7–10 days. Express delivery in 48 hours is available on most packages.",
      },
      {
        q: "Will I get raw files?",
        a: "We deliver the best edits. Raw files can be added on request as part of an extended package.",
      },
      {
        q: "Can you handle the full creative direction?",
        a: "Yes. From mood-boards to shot-list to final cut — our team can lead the entire production.",
      },
    ],
  },
];

export type Product = {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  icon: LucideIcon;
  accent: string;
  href: string;
  heroImage: string;
  features: { title: string; description: string }[];
  pricing: PricingTier[];
};

export const products: Product[] = [
  {
    slug: "ecommerce",
    name: "E-commerce Solutions",
    shortDescription:
      "Launch a beautiful, conversion-focused online store in days, not months.",
    longDescription:
      "Sell anything online with a fast storefront, integrated payments, inventory management and marketing tools — all under your brand.",
    icon: ShoppingBag,
    accent: "from-blue-600 to-sky-500",
    href: "/products/ecommerce",
    heroImage:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80",
    features: [
      { title: "Custom Storefront", description: "Branded shopping experience with smooth checkout." },
      { title: "Payment Gateways", description: "Razorpay, Stripe, UPI, COD and EMI ready." },
      { title: "Inventory Management", description: "Track stock, variants and bundles in real time." },
      { title: "Order Dashboard", description: "Manage orders, refunds, shipping and customers in one place." },
      { title: "Marketing Tools", description: "Coupons, abandoned cart recovery, upsells and reviews." },
      { title: "Mobile App Ready", description: "Native PWA + optional iOS / Android app add-on." },
    ],
    pricing: [
      {
        name: "Starter Store",
        price: "₹15,000",
        cadence: "one-time",
        description: "Perfect for new brands launching their first store.",
        features: [
          "Up to 50 products",
          "Razorpay + COD",
          "Mobile-first theme",
          "Order management",
          "1 month support",
        ],
        cta: "Launch Starter",
      },
      {
        name: "Growth Store",
        price: "₹39,999",
        cadence: "one-time",
        description: "For brands ready to scale orders, traffic and revenue.",
        features: [
          "Unlimited products",
          "Custom theme + animations",
          "Marketing automations",
          "Reviews + upsells",
          "3 months support",
        ],
        cta: "Launch Growth",
        highlighted: true,
      },
      {
        name: "Pro Store",
        price: "₹79,999+",
        cadence: "one-time",
        description: "Custom-built D2C platform with full integrations.",
        features: [
          "Custom checkout",
          "ERP + WMS integrations",
          "Loyalty + subscriptions",
          "Mobile app",
          "Dedicated success manager",
        ],
        cta: "Launch Pro",
      },
    ],
  },
  {
    slug: "billing-software",
    name: "Billing Software",
    shortDescription:
      "GST-ready billing, invoicing and inventory in one beautiful dashboard.",
    longDescription:
      "Replace scattered spreadsheets and Tally exports with a clean, fast billing app made for Indian businesses.",
    icon: Receipt,
    accent: "from-sky-500 to-blue-600",
    href: "/products/billing-software",
    heroImage:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80",
    features: [
      { title: "GST Invoicing", description: "Generate compliant invoices, e-way bills and reports in seconds." },
      { title: "Inventory & Stock", description: "Multi-warehouse stock with low-stock alerts." },
      { title: "Customer & Vendor Ledger", description: "Track receivables, payables and payment history." },
      { title: "POS Mode", description: "Touch-optimized POS for retail counters and cafés." },
      { title: "Reports & Insights", description: "Sales, profit, expense and tax reports out of the box." },
      { title: "Cloud + Multi-Device", description: "Web + Android tablet support with secure sync." },
    ],
    pricing: [
      {
        name: "Solo",
        price: "₹999",
        cadence: "/month",
        description: "For freelancers and single-counter businesses.",
        features: ["1 user", "Unlimited invoices", "Basic reports", "GST filing exports"],
        cta: "Try Solo",
      },
      {
        name: "Business",
        price: "₹2,499",
        cadence: "/month",
        description: "For growing retail and service businesses.",
        features: [
          "5 users",
          "Inventory + POS",
          "Multi-location",
          "Custom invoice templates",
          "WhatsApp invoices",
        ],
        cta: "Try Business",
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "Custom",
        cadence: "",
        description: "For multi-branch businesses needing custom workflows.",
        features: [
          "Unlimited users",
          "Custom modules",
          "API access",
          "On-premise option",
          "Dedicated support",
        ],
        cta: "Contact Sales",
      },
    ],
  },
  {
    slug: "photography-packages",
    name: "Photography Packages",
    shortDescription:
      "Curated shoot bundles for products, brands and events — at fixed transparent prices.",
    longDescription:
      "Skip the back-and-forth of custom quotes. Pick a package, book a date and get cinematic visuals delivered fast.",
    icon: ImageIcon,
    accent: "from-cyan-500 to-sky-600",
    href: "/products/photography-packages",
    heroImage:
      "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1600&q=80",
    features: [
      { title: "Studio Product Shoots", description: "Backdrops, lighting and styling included." },
      { title: "Brand Lifestyle Shoots", description: "On-location shoots with models and props." },
      { title: "Reels Bundles", description: "10–20 vertical reels per shoot day." },
      { title: "Event Highlight Reels", description: "Same-day edits for conferences and launches." },
      { title: "E-commerce Catalogues", description: "White-background shots optimized for marketplaces." },
      { title: "Express Delivery", description: "48-hour turnaround on most packages." },
    ],
    pricing: [
      {
        name: "Mini Bundle",
        price: "₹5,000",
        cadence: "/shoot",
        description: "Quick 2-hour shoot for small product or social drops.",
        features: [
          "2-hour studio shoot",
          "15 edited photos",
          "1 short reel (15s)",
          "Online gallery",
        ],
        cta: "Book Mini",
      },
      {
        name: "Starter Bundle",
        price: "₹14,999",
        cadence: "/shoot",
        description: "Half-day product shoot with up to 30 edited photos.",
        features: [
          "4-hour studio shoot",
          "30 edited photos",
          "1 reel (30s)",
          "Online gallery",
        ],
        cta: "Book Starter",
      },
      {
        name: "Brand Bundle",
        price: "₹34,999",
        cadence: "/shoot",
        description: "Full-day brand shoot with photo + reels deliverable.",
        features: [
          "Full-day shoot",
          "80 edited photos",
          "1 brand film (60s)",
          "10 reels",
          "Express delivery",
        ],
        cta: "Book Brand",
        highlighted: true,
      },
      {
        name: "Campaign Bundle",
        price: "₹79,999+",
        cadence: "/project",
        description: "Multi-day cinematic campaign for big launches.",
        features: [
          "Multi-day shoot",
          "Hero brand film",
          "Drone + multi-cam",
          "150+ photos",
          "Full creative direction",
        ],
        cta: "Book Campaign",
      },
    ],
  },
];

export type PortfolioItem = {
  title: string;
  category: "Web";
  url: string;
  description: string;
};

export const portfolio: PortfolioItem[] = [
  {
    title: "Wow Lifestyle",
    category: "Web",
    url: "https://wowlifestyle.online/",
    description: "An online storefront for toys, RC cars and gadgets.",
  },
  {
    title: "Appu's Mart",
    category: "Web",
    url: "https://appusmart.187-126-118-102.sslip.io/",
    description: "Good food. Better living.",
  },
];
export const trustLogos = [
  "Wowlifstyle",
  "Mugil Organic",
  "Style One Beauty Salon",
  "Appu's Appalam",
];

export const stats = [
  { value: "4", label: "Brands launched" },
  { value: "5x", label: "Average ROAS" },
  { value: "100%", label: "Client retention" },
  { value: "4", label: "Industries served" },
];

export const processSteps = [
  {
    step: "01",
    title: "Consultation",
    description:
      "We start with a discovery call to understand your goals, audience and key metrics — no fluff, no upsell.",
  },
  {
    step: "02",
    title: "Strategy",
    description:
      "We craft a tailored growth blueprint, scope and timeline so you know exactly what's coming and when.",
  },
  {
    step: "03",
    title: "Development",
    description:
      "Our designers, developers and marketers work in sprints with weekly check-ins and live previews.",
  },
  {
    step: "04",
    title: "Launch & Scale",
    description:
      "We ship, monitor and optimize. Post-launch, we keep iterating to compound your growth.",
  },
];

