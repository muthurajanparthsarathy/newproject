import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/sections/service-detail";
import { SubServiceDetail } from "@/components/sections/sub-service-detail";
import { services } from "@/lib/content";
import { SUB_SERVICES, getSubService, type SubService } from "@/lib/service-catalog";
import { SITE } from "@/lib/utils";
import { getServiceJsonLd, getBreadcrumbJsonLd } from "@/lib/seo";

/** Main services and the focused sub-service pages share /services/<slug>. */
export function generateStaticParams() {
  return [...services, ...SUB_SERVICES].map((s) => ({ slug: s.slug }));
}

type Props = { params: Promise<{ slug: string }> };

/* ──────────────────────────────────────────────────────────────────
 * Per-service SEO copy. Each service gets a hand-tuned title/desc
 * + keyword cluster targeting "<service> Coimbatore" intent buckets.
 * ────────────────────────────────────────────────────────────────── */
const SEO_BY_SLUG: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
    priceFrom?: string;
  }
> = {
  "website-development": {
    title:
      "Website Development in Coimbatore — Static & Dynamic Sites from ₹7,000",
    description:
      "Award-winning website development company in Coimbatore. Static websites from ₹7,000, dynamic sites from ₹10,000 — built on Next.js, SEO-ready, mobile-first and conversion-focused. Call Prova Media today.",
    keywords: [
      "website development Coimbatore",
      "best website development company in Coimbatore",
      "web design Coimbatore",
      "static website development Coimbatore",
      "dynamic website development Coimbatore",
      "Next.js developer Coimbatore",
      "React developer Coimbatore",
      "ecommerce website development Coimbatore",
      "WordPress developer Coimbatore",
      "Shopify developer Coimbatore",
      "affordable website development in Coimbatore",
      "website development price in Coimbatore",
      "website builder Coimbatore",
      "website redesign Coimbatore",
      "Prova Media website development",
    ],
    priceFrom: "7000",
  },
  "digital-marketing": {
    title:
      "Digital Marketing Agency in Coimbatore — SEO, Google & Meta Ads from ₹7,000/mo",
    description:
      "Top-rated digital marketing agency in Coimbatore. SEO, Google Ads, Meta Ads, social media, content & AI video — performance plans from ₹7,000/month. Real ROAS, transparent reporting, senior team.",
    keywords: [
      "digital marketing agency Coimbatore",
      "best digital marketing agency in Coimbatore",
      "SEO services Coimbatore",
      "SEO company Coimbatore",
      "Google Ads agency Coimbatore",
      "Meta Ads Coimbatore",
      "Facebook Ads Coimbatore",
      "Instagram Ads Coimbatore",
      "social media marketing Coimbatore",
      "social media management Coimbatore",
      "performance marketing Coimbatore",
      "content marketing Coimbatore",
      "lead generation Coimbatore",
      "Prova Media digital marketing",
    ],
    priceFrom: "7000",
  },
  "software-development": {
    title:
      "Software Development Company in Coimbatore — SaaS, Billing, ERP & Apps",
    description:
      "Custom software development company in Coimbatore. SaaS, GST billing software, POS, ERP, internal tools and mobile apps — built on modern stacks with NDA, source code ownership and 12-month roadmap.",
    keywords: [
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
      "Prova Media software",
    ],
    priceFrom: "74999",
  },
  photography: {
    title:
      "Photography & Videography in Coimbatore — Product, Brand & Event Shoots",
    description:
      "Premium photography and videography in Coimbatore. Product shoots, brand films, social reels, event coverage and AI video — packages from ₹5,000 with express delivery.",
    keywords: [
      "photography Coimbatore",
      "videography Coimbatore",
      "product photography Coimbatore",
      "brand video maker Coimbatore",
      "ad film maker Coimbatore",
      "real estate photography Coimbatore",
      "social media reels production Coimbatore",
      "AI video creation Coimbatore",
      "wedding photography Coimbatore",
      "Prova Media photography",
    ],
    priceFrom: "5000",
  },
};

function subServiceMetadata(sub: SubService): Metadata {
  const title = `${sub.name} in Coimbatore`;
  const description = `${sub.summary} ${sub.intro}`;
  const href = `/services/${sub.slug}`;
  return {
    title,
    description,
    keywords: [
      sub.name,
      `${sub.menuLabel ?? sub.name} Coimbatore`,
      `${sub.menuLabel ?? sub.name} company in Coimbatore`,
      "Prova Media",
    ],
    alternates: { canonical: href },
    openGraph: { title, description, type: "website", url: href, siteName: SITE.name, locale: "en_IN" },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) {
    const sub = getSubService(slug);
    return sub ? subServiceMetadata(sub) : { title: "Service not found" };
  }

  const seo = SEO_BY_SLUG[slug];
  const title =
    seo?.title || `${service.name} in Coimbatore — Prova Media`;
  const description =
    seo?.description ||
    `${service.shortDescription} ${service.longDescription}`;
  const keywords = seo?.keywords || [
    service.name,
    `${service.name} Coimbatore`,
    `${service.name} agency India`,
    "Prova Media",
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: service.href },
    openGraph: {
      title,
      description,
      type: "website",
      url: service.href,
      siteName: SITE.name,
      locale: "en_IN",
      images: [
        {
          url: service.heroImage,
          width: 1200,
          height: 630,
          alt: `${service.name} — Prova Media Coimbatore`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [service.heroImage],
    },
  };
}

export default async function ServiceSlugPage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) {
    const sub = getSubService(slug);
    if (!sub) notFound();
    return <SubServicePage sub={sub} />;
  }

  const seo = SEO_BY_SLUG[slug];
  const description =
    seo?.description ||
    `${service.shortDescription} ${service.longDescription}`;

  // Inline JSON-LD: Service + FAQPage + BreadcrumbList
  const jsonLd = [
    ...getServiceJsonLd({
      name: service.name,
      href: service.href,
      description,
      image: service.heroImage,
      faqs: service.faqs,
      priceFrom: seo?.priceFrom,
      priceCurrency: "INR",
    }),
    getBreadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "Services", href: "/services" },
      { name: service.name, href: service.href },
    ]),
  ];

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ServiceDetail service={service} />
    </>
  );
}

function SubServicePage({ sub }: { sub: SubService }) {
  const href = `/services/${sub.slug}`;
  const parent = services.find((s) => s.slug === sub.parent);
  const jsonLd = [
    ...getServiceJsonLd({
      name: sub.name,
      href,
      description: `${sub.summary} ${sub.intro}`,
      image: `${SITE.url}/logo.png`,
      faqs: [],
    }),
    getBreadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "Services", href: "/services" },
      ...(parent ? [{ name: parent.name, href: parent.href }] : []),
      { name: sub.name, href },
    ]),
  ];

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <SubServiceDetail sub={sub} />
    </>
  );
}
