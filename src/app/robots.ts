import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // L'administration et l'API n'ont rien à faire dans un index.
      disallow: ["/admin", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
