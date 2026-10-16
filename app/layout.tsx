import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { MobileStickyCTA } from "@/components/layout/mobile-sticky-cta";
import { SITE } from "@/lib/utils";
import { KEYWORDS, DEFAULT_DESCRIPTION, getJsonLd } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const TITLE_DEFAULT =
  "Prova Media — Best Digital Agency in Coimbatore | Web Development, Digital Marketing, SEO";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: TITLE_DEFAULT,
    template: "%s | Prova Media — Coimbatore",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE.name,
  generator: "Next.js",
  keywords: KEYWORDS as unknown as string[],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "Digital Agency",
  alternates: {
    canonical: SITE.url,
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/icon.png", sizes: "any", type: "image/png" },
    ],
    shortcut: ["/logo.png"],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE.url,
    siteName: SITE.name,
    title: TITLE_DEFAULT,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Prova Media — Proven Digital Growth · Coimbatore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_DEFAULT,
    description: DEFAULT_DESCRIPTION,
    creator: "@provamedia",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  other: {
    "geo.region": "IN-TN",
    "geo.placename": `${SITE.city}, ${SITE.region}`,
    "geo.position": "11.0732;77.0061",
    ICBM: "11.0732, 77.0061",
    "og:locality": SITE.city,
    "og:region": SITE.region,
    "og:country-name": "India",
    rating: "general",
    distribution: "global",
    "revisit-after": "7 days",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = getJsonLd();
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-foreground">
        {jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <MobileStickyCTA />
      </body>
    </html>
  );
}
