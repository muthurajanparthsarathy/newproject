import type { MetadataRoute } from "next";
import { SITE } from "@/lib/utils";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Best Digital Agency in Coimbatore`,
    short_name: SITE.name,
    description:
      "Premium digital agency in Coimbatore — web development, digital marketing, software, photography. Proven Digital Growth.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    orientation: "portrait-primary",
    categories: [
      "business",
      "productivity",
      "marketing",
      "design",
      "development",
    ],
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
