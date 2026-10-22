import { SITE, FULL_ADDRESS } from "./utils";

/**
 * Master keyword list — used in metadata + JSON-LD to maximize discoverability
 * for every term users might Google when looking for an agency like Prova Media.
 *
 * Strategy: brand + city + service combinations (the queries that actually rank
 * for local intent) — kept fewer than ~80 to stay healthy for crawlers.
 */
export const KEYWORDS = [
  // Brand
  "Prova Media",
  "Prova Media Coimbatore",
  "Prova Media digital agency",
  "Prova Media software company",
  "Prova Media reviews",
  "Prova Media contact",
  // Top intent — Website Development
  "website development Coimbatore",
  "best website development company in Coimbatore",
  "web development company Coimbatore",
  "web design Coimbatore",
  "static website development Coimbatore",
  "dynamic website development Coimbatore",
  "Next.js developer Coimbatore",
  "React developer Coimbatore",
  "ecommerce website development Coimbatore",
  "Shopify developer Coimbatore",
  "WordPress developer Coimbatore",
  "affordable website development in Coimbatore",
  "website development price in Coimbatore",
  // Top intent — Digital Marketing
  "digital marketing agency Coimbatore",
  "best digital marketing agency in Coimbatore",
  "SEO services Coimbatore",
  "SEO company Coimbatore",
  "Google Ads agency Coimbatore",
  "Meta Ads agency Coimbatore",
  "Facebook Ads Coimbatore",
  "Instagram Ads Coimbatore",
  "social media marketing Coimbatore",
  "performance marketing Coimbatore",
  "lead generation Coimbatore",
  "content marketing Coimbatore",
  "social media management Coimbatore",
  // Software
  "software development company Coimbatore",
  "custom software development Coimbatore",
  "SaaS development Coimbatore",
  "billing software Coimbatore",
  "GST billing software Coimbatore",
  "POS software Coimbatore",
  "ERP software Coimbatore",
  "mobile app development Coimbatore",
  "android app development Coimbatore",
  "iOS app development Coimbatore",
  // Photography & video
  "photography Coimbatore",
  "videography Coimbatore",
  "product photography Coimbatore",
  "brand video maker Coimbatore",
  "ad film maker Coimbatore",
  "real estate photography Coimbatore",
  "social media reels production Coimbatore",
  "AI video creation Coimbatore",
  // Locality
  "digital agency Saravanampatti",
  "software company Saravanampatti",
  "web design Saravanampatti",
  "agency near Prozone Mall Coimbatore",
  "Tamil Nadu web development",
  "Coimbatore digital growth agency",
];

export const DEFAULT_DESCRIPTION =
  "Prova Media is the best digital agency in Coimbatore — website development from ₹7,000, digital marketing from ₹7,000/mo, custom software, billing apps, photography & videography. Based in Saravanampatti, behind Prozone Mall. Call +91 86106 59547.";

export const SHORT_DESCRIPTION =
  "Top-rated Coimbatore digital agency for web development, SEO, Google & Meta ads, software & photography. Senior team, transparent pricing.";

const baseUrl = SITE.url;

/* ════════════════════════════════════════════════════════════════
 * SITE-WIDE JSON-LD (Organization, LocalBusiness, WebSite, Services)
 * ════════════════════════════════════════════════════════════════ */
export function getJsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    alternateName: ["Prova Media Tech", "Prova Media Software", "ProvaMedia"],
    slogan: SITE.tagline,
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/logo.png`,
      width: 512,
      height: 512,
    },
    image: `${baseUrl}/logo.png`,
    description: DEFAULT_DESCRIPTION,
    foundingDate: "2023",
    email: SITE.email,
    telephone: SITE.phoneTel,
    sameAs: [
      SITE.socials.instagram,
      SITE.socials.linkedin,
      SITE.socials.twitter,
      SITE.socials.facebook,
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      postalCode: SITE.postalCode,
      addressCountry: SITE.country,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: SITE.phoneTel,
        contactType: "customer service",
        email: SITE.email,
        areaServed: ["IN", "Worldwide"],
        availableLanguage: ["English", "Tamil", "Hindi"],
      },
    ],
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": `${baseUrl}#localbusiness`,
    name: SITE.name,
    image: `${baseUrl}/logo.png`,
    logo: `${baseUrl}/logo.png`,
    priceRange: "₹₹",
    url: baseUrl,
    telephone: SITE.phoneTel,
    email: SITE.email,
    description: DEFAULT_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      postalCode: SITE.postalCode,
      addressCountry: SITE.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 11.0732,
      longitude: 77.0061,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "10:00",
        closes: "19:00",
      },
    ],
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "120",
      bestRating: "5",
      worstRating: "1",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}#website`,
    url: baseUrl,
    name: SITE.name,
    description: DEFAULT_DESCRIPTION,
    publisher: { "@id": `${baseUrl}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const services = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE.name,
    description: DEFAULT_DESCRIPTION,
    address: FULL_ADDRESS,
    url: baseUrl,
    telephone: SITE.phoneTel,
    image: `${baseUrl}/logo.png`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Prova Media Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Website Development in Coimbatore",
            description:
              "Custom websites built on Next.js, React and modern stacks — fast, SEO-ready and conversion-focused. Static and dynamic sites starting ₹7,000.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Digital Marketing in Coimbatore",
            description:
              "SEO, Google Ads, Meta Ads, social media, content marketing and performance marketing from ₹7,000/month.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Software Development in Coimbatore",
            description:
              "Custom SaaS, internal tools, billing software, ERP and mobile apps for growing businesses.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Photography & Videography in Coimbatore",
            description:
              "Cinematic product, brand and event photography plus video content and AI video production from ₹5,000.",
          },
        },
      ],
    },
  };

  return [organization, localBusiness, website, services];
}

/* ════════════════════════════════════════════════════════════════
 * BREADCRUMBS
 * ════════════════════════════════════════════════════════════════ */
export type Crumb = { name: string; href: string };

export function getBreadcrumbJsonLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.href.startsWith("http") ? c.href : `${baseUrl}${c.href}`,
    })),
  };
}

/* ════════════════════════════════════════════════════════════════
 * PER-SERVICE Service + FAQPage schema
 * ════════════════════════════════════════════════════════════════ */
export type ServiceJsonLdInput = {
  name: string;
  href: string;
  description: string;
  image: string;
  faqs: { q: string; a: string }[];
  priceFrom?: string;
  priceCurrency?: string;
};

export function getServiceJsonLd(s: ServiceJsonLdInput) {
  const url = s.href.startsWith("http") ? s.href : `${baseUrl}${s.href}`;
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${s.name} in Coimbatore`,
    serviceType: s.name,
    url,
    image: s.image,
    description: s.description,
    provider: { "@id": `${baseUrl}#organization` },
    areaServed: [
      { "@type": "City", name: "Coimbatore" },
      { "@type": "City", name: "Saravanampatti" },
      { "@type": "AdministrativeArea", name: "Tamil Nadu" },
      { "@type": "Country", name: "India" },
    ],
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Businesses, founders, marketers and D2C brands",
    },
    ...(s.priceFrom
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: s.priceFrom,
            priceCurrency: s.priceCurrency || "INR",
            availability: "https://schema.org/InStock",
            priceValidUntil: "2030-12-31",
          },
        }
      : {}),
  };

  const faq = s.faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: s.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      }
    : null;

  return faq ? [service, faq] : [service];
}

/* ════════════════════════════════════════════════════════════════
 * BLOG POST schema
 * ════════════════════════════════════════════════════════════════ */
export type BlogPostingJsonLdInput = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  author: string;
  category: string;
  tags: string[];
  cover?: string;
};

export function getBlogPostingJsonLd(p: BlogPostingJsonLdInput) {
  const url = `${baseUrl}/blog/${p.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: p.title,
    description: p.description,
    url,
    mainEntityOfPage: url,
    datePublished: p.date,
    dateModified: p.updated || p.date,
    inLanguage: "en-IN",
    articleSection: p.category,
    ...(p.tags.length ? { keywords: p.tags.join(", ") } : {}),
    image: p.cover
      ? p.cover.startsWith("http")
        ? p.cover
        : `${baseUrl}${p.cover}`
      : `${baseUrl}/logo.png`,
    author:
      p.author === SITE.name
        ? { "@id": `${baseUrl}#organization` }
        : { "@type": "Person", name: p.author },
    publisher: { "@id": `${baseUrl}#organization` },
  };
}
