import type { MetadataRoute } from "next";
import { services, products } from "@/lib/content";
import { getPosts } from "@/lib/blog";
import { SUB_SERVICES } from "@/lib/service-catalog";
import { SITE } from "@/lib/utils";

// Re-check hourly so scheduled blog posts are listed once they go live
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/portfolio`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}${s.href}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const subServiceRoutes: MetadataRoute.Sitemap = SUB_SERVICES.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}${p.href}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getPosts()
    .filter((p) => p.status === "published")
    .map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(`${p.updated || p.date}T00:00:00+05:30`),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...serviceRoutes, ...subServiceRoutes, ...productRoutes, ...blogRoutes];
}
