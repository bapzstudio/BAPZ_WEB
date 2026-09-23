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
    { chemin: "/contact", priorite: 0.7 },
    { chemin: "/reserver", priorite: 0.8 },
    { chemin: "/galerie", priorite: 0.5 },
    { chemin: "/mentions-legales", priorite: 0.2 },
    { chemin: "/confidentialite", priorite: 0.2 },
  ];

  const profs = (await getTeacherSlugs()).map((slug) => ({
    chemin: `/profs/${slug}`,
    priorite: 0.6,
  }));

  // Pas de `lastModified` : il valait `new Date()`, donc chaque build annonçait
  // à Google que l'intégralité du site venait de changer — un signal qui ne
  // veut plus rien dire, et qu'il vaut mieux taire que mentir. À remettre le
  // jour où Payload remontera la vraie date de modification de chaque page.
  return [...pages, ...profs].map(({ chemin, priorite }) => ({
    url: `${SITE_URL}${chemin === "/" ? "" : chemin}`,
    priority: priorite,
  }));
}
