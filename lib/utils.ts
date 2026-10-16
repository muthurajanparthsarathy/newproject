import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Site URL: read from NEXT_PUBLIC_SITE_URL at build time so the same code
 * works on local dev, Vercel preview deployments and production.
 * Falls back to the canonical production domain.
 */
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://provamedia.com"
).replace(/\/$/, "");

export const SITE = {
  name: "Prova Media",
  legalName: "Prova Media — Tech & Software Company",
  tagline: "Proven Digital Growth",
  url: SITE_URL,
  email: "provamedia193@gmail.com",
  phone: "+91 86106 59547",
  phoneTel: "+918610659547",
  whatsappNumber: "918610659547",
  address: "Saravanampatti Road, behind Prozone Mall",
  city: "Coimbatore",
  region: "Tamil Nadu",
  postalCode: "641035",
  country: "IN",
  socials: {
    instagram: "https://instagram.com/provamedia",
    linkedin: "https://linkedin.com/company/provamedia",
    twitter: "https://twitter.com/provamedia",
    facebook: "https://facebook.com/provamedia",
  },
} as const;

export const FULL_ADDRESS = `${SITE.address}, ${SITE.city}, ${SITE.region} ${SITE.postalCode}, India`;

export function buildWhatsAppLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
