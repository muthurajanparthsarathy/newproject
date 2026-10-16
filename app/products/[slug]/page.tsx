import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/sections/product-detail";
import { products } from "@/lib/content";
import { SITE } from "@/lib/utils";
import { getBreadcrumbJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

const SEO_BY_SLUG: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  ecommerce: {
    title:
      "E-commerce Website Development in Coimbatore — Online Store from ₹15,000",
    description:
      "Launch a branded ecommerce store in Coimbatore. Razorpay/UPI/COD checkout, inventory, marketing automations, mobile-first design. Stores from ₹15,000 by Prova Media.",
    keywords: [
      "ecommerce website development Coimbatore",
      "online store Coimbatore",
      "Shopify alternative Coimbatore",
      "D2C website Coimbatore",
      "ecommerce development price Coimbatore",
      "Razorpay store Coimbatore",
    ],
  },
  "billing-software": {
    title:
      "GST Billing Software in Coimbatore — Invoicing, POS & Inventory from ₹999/mo",
    description:
      "Cloud GST billing software with POS, inventory, multi-location and WhatsApp invoices — built for retail, services and hospitality businesses in Coimbatore.",
    keywords: [
      "GST billing software Coimbatore",
      "billing software Coimbatore",
      "POS software Coimbatore",
      "retail billing software Coimbatore",
      "restaurant POS Coimbatore",
      "Tally alternative Coimbatore",
      "invoicing software India",
    ],
  },
  "photography-packages": {
    title:
      "Photography Packages in Coimbatore — Product, Brand & Reels from ₹5,000",
    description:
      "Curated photography packages in Coimbatore — product shoots, brand films, reels and event coverage with express 48-hour delivery. Bundles from ₹5,000.",
    keywords: [
      "photography packages Coimbatore",
      "product photography Coimbatore",
      "brand photography Coimbatore",
      "reels production Coimbatore",
      "studio photography Coimbatore",
      "ecommerce photography Coimbatore",
    ],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: "Product not found" };

  const seo = SEO_BY_SLUG[slug];
  const title = seo?.title || `${product.name} — Prova Media Coimbatore`;
  const description =
    seo?.description ||
    `${product.shortDescription} ${product.longDescription}`;
  const keywords = seo?.keywords || [
    product.name,
    `${product.name} Coimbatore`,
    "Prova Media",
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: product.href },
    openGraph: {
      title,
      description,
      type: "website",
      url: product.href,
      siteName: SITE.name,
      locale: "en_IN",
      images: [
        {
          url: product.heroImage,
          width: 1200,
          height: 630,
          alt: `${product.name} — Prova Media Coimbatore`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.heroImage],
    },
  };
}

export default async function ProductSlugPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const breadcrumb = getBreadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: product.name, href: product.href },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ProductDetail product={product} />
    </>
  );
}
