import { notFound } from "next/navigation";

/**
 * Toute adresse qui ne correspond à aucune page du site.
 *
 * Le projet a deux layouts racines — le site et l'admin — et pas de layout au
 * sommet de `app/` : sans cette route, Next répondait par sa 404 par défaut,
 * en anglais et sans nav. Ici le `notFound()` est levé à l'intérieur du site,
 * donc `not-found.tsx` s'affiche dans son layout.
 *
 * Les routes plus précises passent avant : `/admin` et `/api` (groupe
 * `(payload)`), les fichiers de `public/`, sitemap et robots.
 */
export default function Introuvable() {
  notFound();
}
