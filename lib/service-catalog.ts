import type { LucideIcon } from "lucide-react";
import {
  Camera,
  Clapperboard,
  Code2,
  Film,
  LayoutTemplate,
  Mail,
  Megaphone,
  MonitorSmartphone,
  MousePointerClick,
  Palette,
  PartyPopper,
  PenTool,
  Image as ImageIcon,
  Scissors,
  Search,
  Share2,
  Smartphone,
  Sparkles,
  Target,
} from "lucide-react";

/**
 * Everything listed under "Services" in the navbar mega menu, grouped into
 * columns. Items either link to an existing page (main services, products)
 * or to a focused sub-service page defined in SUB_SERVICES below, which is
 * served at /services/<slug>.
 */

export type SubService = {
  slug: string;
  name: string;
  /** Shorter label for the menu, when the name is long */
  menuLabel?: string;
  category: CategoryId;
  icon: LucideIcon;
  /** One line — used on cards and in search results */
  summary: string;
  /** Hero paragraph */
  intro: string;
  includes: { title: string; description: string }[];
  idealFor: string[];
  /** Main service this belongs to (for breadcrumbs, pricing and the enquiry form) */
  parent?: string;
  /** Only where it's backed by a published plan, e.g. "₹10,000 one-time" */
  startsAt?: string;
  /** Where to see the related plans */
  pricingHref?: string;
};

export type CategoryId = "web" | "marketing" | "media" | "design";

export type ServiceCategory = {
  id: CategoryId;
  title: string;
  icon: LucideIcon;
  accent: string;
  /** Overview page for the whole column, if there is one */
  href?: string;
  items: { label: string; href: string }[];
};

export const SUB_SERVICES: SubService[] = [
  // ── Websites & Software ───────────────────────────────────────────
  {
    slug: "cms-websites",
    name: "WordPress & CMS Websites",
    category: "web",
    icon: LayoutTemplate,
    parent: "website-development",
    startsAt: "₹10,000 one-time",
    pricingHref: "/services/website-development#pricing",
    summary: "Websites you can update yourself — no developer needed for every change.",
    intro:
      "A website with an easy admin panel, so you can change text, photos, offers and blog posts yourself. We set it up, train your team, and stay available when you need help.",
    includes: [
      { title: "Easy admin panel", description: "Edit pages, photos and prices from a simple dashboard — no code." },
      { title: "Blog and news section", description: "Publish updates, offers and articles that help you get found on Google." },
      { title: "Mobile-friendly design", description: "Looks right and loads quickly on every phone." },
      { title: "Training and handover", description: "A walkthrough for your team, plus help when you get stuck." },
    ],
    idealFor: [
      "Businesses that change offers or menus often",
      "Schools, clinics and institutions with regular updates",
      "Brands planning to publish a blog",
      "Teams tired of waiting on a developer for small edits",
    ],
  },
  {
    slug: "mobile-app-development",
    name: "Mobile App Development",
    category: "web",
    icon: Smartphone,
    parent: "software-development",
    summary: "Android and iOS apps for your customers or your team.",
    intro:
      "Apps for Android and iOS built from one codebase — for customer orders and bookings, or for the tools your staff use every day.",
    includes: [
      { title: "Android and iOS from one build", description: "One codebase for both platforms keeps cost and upkeep down." },
      { title: "Logins, payments and notifications", description: "The everyday features customers expect, built in." },
      { title: "Admin dashboard", description: "Manage users, orders and content from the web." },
      { title: "Store publishing", description: "We help you publish on Google Play and the App Store." },
    ],
    idealFor: [
      "Businesses taking repeat orders or bookings",
      "Teams replacing paper forms or WhatsApp groups",
      "Startups launching an app-first product",
      "Shops that want a loyalty or rewards app",
    ],
  },

  // ── Digital Marketing ─────────────────────────────────────────────
  {
    slug: "seo",
    name: "SEO (Search Engine Optimization)",
    menuLabel: "SEO",
    category: "marketing",
    icon: Search,
    parent: "digital-marketing",
    summary: "Get found on Google when customers search for what you sell.",
    intro:
      "SEO helps your website show up when people in your area search for your products or services. We fix the technical basics, improve your pages and content, and report what's changing every month.",
    includes: [
      { title: "Keyword research", description: "Find the searches your customers actually use — including “near me” searches." },
      { title: "On-page optimisation", description: "Titles, descriptions, headings and content tuned for each page." },
      { title: "Technical SEO", description: "Speed, mobile-friendliness, sitemaps and indexing issues fixed." },
      { title: "Local SEO", description: "Google Business Profile and consistent business details across the web." },
    ],
    idealFor: [
      "Local shops and service businesses",
      "Clinics, schools and professional services",
      "E-commerce stores",
      "Businesses whose website gets few visitors",
    ],
  },
  {
    slug: "google-ads",
    name: "Google Ads (Pay-Per-Click)",
    menuLabel: "Google Ads (PPC)",
    category: "marketing",
    icon: MousePointerClick,
    parent: "digital-marketing",
    summary: "Show up at the top of Google the moment someone searches.",
    intro:
      "Ads on Google Search, YouTube and Maps put your business in front of people who are already looking. You pay only when someone clicks, and every rupee is tracked.",
    includes: [
      { title: "Campaign setup", description: "Account structure, keywords, ad copy and location targeting." },
      { title: "Conversion tracking", description: "Calls, WhatsApp clicks, forms and purchases measured properly." },
      { title: "Ongoing optimisation", description: "Bids, keywords and ads adjusted based on real results." },
      { title: "Clear monthly reports", description: "What you spent, what you got, and what we're changing next." },
    ],
    idealFor: [
      "Businesses that need enquiries quickly",
      "Services people search for urgently, like repairs and clinics",
      "New launches and seasonal offers",
      "E-commerce stores",
    ],
  },
  {
    slug: "meta-ads",
    name: "Facebook & Instagram Ads",
    category: "marketing",
    icon: Target,
    parent: "digital-marketing",
    summary: "Reach the right people in your city on Facebook and Instagram.",
    intro:
      "Facebook and Instagram ads reach people by location, age and interests — ideal for building awareness and getting messages, leads and sales. We handle the targeting, creatives and testing.",
    includes: [
      { title: "Audience targeting", description: "Reach people by area and interests — or re-engage past visitors." },
      { title: "Ad creatives", description: "Posters, carousels and reels designed for the feed." },
      { title: "Lead and message campaigns", description: "Collect enquiries through forms, WhatsApp or Instagram DMs." },
      { title: "Testing and reporting", description: "Different versions tested, with budget moved to what works." },
    ],
    idealFor: [
      "Restaurants, salons and retail stores",
      "Fashion, beauty and lifestyle brands",
      "Events and new openings",
      "Real estate and education enquiries",
    ],
  },
  {
    slug: "social-media-management",
    name: "Social Media Management",
    category: "marketing",
    icon: Share2,
    parent: "digital-marketing",
    startsAt: "₹7,000/month",
    pricingHref: "/services/digital-marketing#pricing",
    summary: "Consistent, on-brand posting — without the daily stress.",
    intro:
      "We plan, create and post content for your Instagram, Facebook and other channels every month, so your pages stay active and look professional while you run your business.",
    includes: [
      { title: "Monthly content calendar", description: "Posts planned around your offers, festivals and launches." },
      { title: "Posters and reels", description: "Designed and edited by the same team, in your brand style." },
      { title: "Posting and captions", description: "Scheduled at the right times, with captions and hashtags." },
      { title: "Monthly report", description: "Reach, engagement and follower growth, explained simply." },
    ],
    idealFor: [
      "Business owners with no time to post",
      "Brands with inactive or inconsistent pages",
      "Shops and restaurants with regular offers",
      "New brands building an audience",
    ],
  },
  {
    slug: "whatsapp-email-marketing",
    name: "WhatsApp & Email Marketing",
    category: "marketing",
    icon: Mail,
    parent: "digital-marketing",
    summary: "Stay in touch with customers who already know you.",
    intro:
      "Your existing customers are your easiest sales. We set up WhatsApp broadcasts and email campaigns — offers, reminders and updates — that bring people back without spamming them.",
    includes: [
      { title: "Contact list setup", description: "Customer numbers and emails organised, with opt-in respected." },
      { title: "Broadcast campaigns", description: "Offers, new arrivals and festival greetings sent on schedule." },
      { title: "Automated follow-ups", description: "Welcome messages, reminders and repeat-order nudges." },
      { title: "Results tracking", description: "See who opened, clicked and replied." },
    ],
    idealFor: [
      "Stores with repeat customers",
      "Clinics and salons sending appointment reminders",
      "Brands with a customer list but no follow-up",
      "Online stores recovering abandoned carts",
    ],
  },

  // ── Photo & Video ─────────────────────────────────────────────────
  {
    slug: "product-photography",
    name: "Product Photography",
    category: "media",
    icon: Camera,
    parent: "photography",
    startsAt: "₹5,000 per shoot",
    pricingHref: "/products/photography-packages#pricing",
    summary: "Clean, true-to-life product photos that help you sell.",
    intro:
      "Studio and lifestyle photos of your products for your website, marketplaces, catalogue and ads — lit and edited so colours and details look exactly right.",
    includes: [
      { title: "White-background shots", description: "Marketplace-ready photos for Amazon, Flipkart and your own store." },
      { title: "Lifestyle and in-use shots", description: "Your product in real settings customers relate to." },
      { title: "Detail close-ups", description: "Texture, finish and packaging that show the quality." },
      { title: "Retouching", description: "Colour correction and clean-up on every delivered photo." },
    ],
    idealFor: [
      "E-commerce and D2C brands",
      "Food, cosmetics and fashion products",
      "Manufacturers building a catalogue",
      "Shops listing on marketplaces",
    ],
  },
  {
    slug: "brand-films",
    name: "Brand Films & Ad Videos",
    category: "media",
    icon: Clapperboard,
    parent: "photography",
    summary: "Short films that tell your story and sell your product.",
    intro:
      "From a 30-second ad to a short brand film, we plan, shoot and edit videos that explain what you do and why customers should choose you.",
    includes: [
      { title: "Concept and script", description: "We plan the story, shot list and locations with you." },
      { title: "Professional shoot", description: "Cameras, lighting and audio set up properly, on set or on location." },
      { title: "Editing and colour grading", description: "Pacing, music, captions and a polished final look." },
      { title: "Versions for every platform", description: "Cuts for YouTube, Instagram, ads and your website." },
    ],
    idealFor: [
      "Brands launching a product or service",
      "Businesses explaining what makes them different",
      "Companies running video ads",
      "Founders telling their story",
    ],
  },
  {
    slug: "reels-production",
    name: "Reels & Short Videos",
    category: "media",
    icon: Film,
    parent: "photography",
    startsAt: "₹7,000/month",
    pricingHref: "/services/digital-marketing#pricing",
    summary: "Vertical videos made for Instagram Reels, Shorts and Stories.",
    intro:
      "Short, vertical videos with a strong hook in the first seconds — planned in batches so one shoot gives you content for weeks.",
    includes: [
      { title: "Hooks and ideas", description: "Reel concepts based on what your audience responds to." },
      { title: "Batch shooting", description: "Many reels captured in one session to save time and cost." },
      { title: "Editing with captions", description: "Fast cuts, on-screen text, music and subtitles." },
      { title: "Ready to post", description: "Delivered in the right format for Reels, Shorts and Stories." },
    ],
    idealFor: [
      "Brands growing on Instagram",
      "Restaurants, cafés and salons",
      "Coaches and personal brands",
      "Products that look great in motion",
    ],
  },
  {
    slug: "event-coverage",
    name: "Event Coverage",
    category: "media",
    icon: PartyPopper,
    parent: "photography",
    summary: "Photos and videos of your launches, conferences and celebrations.",
    intro:
      "We capture your event as it happens — the people, the moments and the details — and deliver photos and a highlight video you can share.",
    includes: [
      { title: "Photo coverage", description: "Candid and planned shots of guests, speakers and key moments." },
      { title: "Highlight video", description: "A short edited film of the day, ready to share." },
      { title: "Multi-camera setup", description: "More angles for stage events and talks, when needed." },
      { title: "Online gallery", description: "Easy download and sharing for your team and guests." },
    ],
    idealFor: [
      "Product launches and store openings",
      "Conferences and seminars",
      "Corporate events and celebrations",
      "College and school events",
    ],
  },
  {
    slug: "video-editing",
    name: "Video Editing",
    category: "media",
    icon: Scissors,
    parent: "photography",
    summary: "Turn raw footage into polished, ready-to-post videos.",
    intro:
      "Already have footage? Send it to us. We edit, colour grade and add captions, music and motion graphics — whether it's one video or a monthly batch.",
    includes: [
      { title: "Editing and pacing", description: "Tight cuts that keep people watching." },
      { title: "Colour grading", description: "A consistent, professional look across every video." },
      { title: "Captions and motion graphics", description: "Subtitles, titles and simple animations." },
      { title: "Music and sound", description: "Background music and cleaned-up audio." },
    ],
    idealFor: [
      "Creators and coaches who shoot on their own",
      "Businesses with footage they never used",
      "Brands that need regular reels edited",
      "Companies with event or training videos",
    ],
  },

  // ── Creative Design ───────────────────────────────────────────────
  {
    slug: "logo-branding",
    name: "Logo & Brand Identity",
    category: "design",
    icon: PenTool,
    summary: "A logo and visual style that makes your business recognisable.",
    intro:
      "We design your logo and the visual rules around it — colours, fonts and how it's used — so your signboard, social media, packaging and website all look like one brand.",
    includes: [
      { title: "Logo design", description: "Concepts based on your business, refined with your feedback." },
      { title: "Colours and fonts", description: "A consistent style for everything you create." },
      { title: "Brand guide", description: "Simple rules for using your logo correctly." },
      { title: "Ready-to-use files", description: "Formats for print, signboards, social media and the web." },
    ],
    idealFor: [
      "New businesses getting started",
      "Businesses with an outdated logo",
      "Brands expanding to new locations",
      "Products moving into retail packaging",
    ],
  },
  {
    slug: "social-media-posters",
    name: "Social Media Posters",
    category: "design",
    icon: ImageIcon,
    parent: "digital-marketing",
    startsAt: "₹7,000/month",
    pricingHref: "/services/digital-marketing#pricing",
    summary: "On-brand posters for offers, festivals and announcements.",
    intro:
      "Eye-catching posters for Instagram, Facebook and WhatsApp — designed in your brand style so your feed looks consistent and professional.",
    includes: [
      { title: "Offer and product posters", description: "Clear designs that make the offer impossible to miss." },
      { title: "Festival greetings", description: "Ready ahead of time for every important date." },
      { title: "Carousel posts", description: "Multi-slide posts that explain or showcase more." },
      { title: "Every size you need", description: "Versions for the feed, Stories and WhatsApp status." },
    ],
    idealFor: [
      "Shops and restaurants with regular offers",
      "Brands that post often",
      "Businesses without an in-house designer",
      "Event and course promotions",
    ],
  },
  {
    slug: "ad-creatives",
    name: "Ad Creatives",
    category: "design",
    icon: Sparkles,
    summary: "Scroll-stopping designs and videos made for paid ads.",
    intro:
      "Ads need different creative from regular posts: a clear hook, one message and a strong call to action. We design ad posters, carousels and short videos — in several versions so you can test what works.",
    includes: [
      { title: "Static ad designs", description: "Posters and banners sized for each ad platform." },
      { title: "Video ads", description: "Short edits with a hook, captions and a clear ending." },
      { title: "Multiple versions", description: "Different headlines and visuals to test against each other." },
      { title: "Platform-ready formats", description: "Correct sizes for Meta, Google Display and YouTube." },
    ],
    idealFor: [
      "Businesses running Facebook or Instagram ads",
      "Brands whose ads aren't getting clicks",
      "Launches and seasonal campaigns",
      "Online stores testing new products",
    ],
  },
  {
    slug: "ui-ux-design",
    name: "UI / UX Design",
    category: "design",
    icon: MonitorSmartphone,
    parent: "website-development",
    summary: "Website and app screens that are easy and pleasant to use.",
    intro:
      "Good design is how something works, not just how it looks. We map how your customers move through your website or app and design clear, modern screens that guide them to act.",
    includes: [
      { title: "User flows", description: "How customers move from landing to enquiry or purchase." },
      { title: "Wireframes", description: "Simple layouts to agree on structure before design starts." },
      { title: "Visual design", description: "Polished screens in your brand style, for mobile and desktop." },
      { title: "Clickable prototype", description: "Try the experience before a line of code is written." },
    ],
    idealFor: [
      "Startups designing a new app",
      "Businesses redesigning an old website",
      "Software your staff find confusing",
      "Online stores with few completed orders",
    ],
  },
];

const sub = (slug: string) => {
  const s = SUB_SERVICES.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown sub-service "${slug}"`);
  return { label: s.menuLabel ?? s.name, href: `/services/${s.slug}` };
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "web",
    title: "Websites & Software",
    icon: Code2,
    accent: "from-blue-500 to-sky-500",
    items: [
      { label: "Website Development", href: "/services/website-development" },
      { label: "E-commerce Websites", href: "/products/ecommerce" },
      sub("cms-websites"),
      { label: "Custom Software", href: "/services/software-development" },
      sub("mobile-app-development"),
      { label: "Billing Software", href: "/products/billing-software" },
    ],
  },
  {
    id: "marketing",
    title: "Digital Marketing",
    icon: Megaphone,
    accent: "from-sky-500 to-cyan-500",
    href: "/services/digital-marketing",
    items: [
      sub("seo"),
      sub("google-ads"),
      sub("meta-ads"),
      sub("social-media-management"),
      sub("whatsapp-email-marketing"),
      { label: "Monthly Marketing Plans", href: "/services/digital-marketing" },
    ],
  },
  {
    id: "media",
    title: "Photo & Video",
    icon: Camera,
    accent: "from-cyan-500 to-blue-500",
    href: "/services/photography",
    items: [
      sub("product-photography"),
      sub("brand-films"),
      sub("reels-production"),
      sub("event-coverage"),
      sub("video-editing"),
      { label: "Photography Packages", href: "/products/photography-packages" },
    ],
  },
  {
    id: "design",
    title: "Creative Design",
    icon: Palette,
    accent: "from-indigo-500 to-blue-500",
    items: [
      sub("logo-branding"),
      sub("social-media-posters"),
      sub("ad-creatives"),
      sub("ui-ux-design"),
    ],
  },
];

export function getSubService(slug: string) {
  return SUB_SERVICES.find((s) => s.slug === slug);
}

export function getCategory(id: CategoryId) {
  return SERVICE_CATEGORIES.find((c) => c.id === id)!;
}
