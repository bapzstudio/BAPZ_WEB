import type { MetadataRoute } from "next";
import { getTeacherSlugs } from "@/lib/queries";
import { SITE_URL } from "@/lib/seo";

// Hors des groupes `(frontend)` et `(payload)` : les fichiers spéciaux de
// Next se placent à la racine de `app/` pour répondre sur /sitemap.xml.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: { chemin: string; priorite: number }[] = [
    { chemin: "/", priorite: 1 },
    { chemin: "/cours", priorite: 0.9 },
    { chemin: "/tarifs", priorite: 0.9 },
    { chemin: "/profs", priorite: 0.8 },
    { chemin: "/location", priorite: 0.7 },
    { chemin: "/contact", priorite: 0.7 },
    { chemin: "/reserver", priorite: 0.8 },
    { chemin: "/galerie", priorite: 0.5 },
  ];

  const profs = (await getTeacherSlugs()).map((slug) => ({
    chemin: `/profs/${slug}`,
    priorite: 0.6,
  }));

  return [...pages, ...profs].map(({ chemin, priorite }) => ({
    url: `${SITE_URL}${chemin === "/" ? "" : chemin}`,
    lastModified: new Date(),
    priority: priorite,
  }));
}
