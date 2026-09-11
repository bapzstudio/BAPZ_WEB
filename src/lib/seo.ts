// Métadonnées du site : seul endroit qui connaît l'adresse publique et la
// forme des balises de partage. Même principe que `queries.ts` pour Payload.
import type { Metadata } from "next";
import type { SiteSettings } from "./types";

/**
 * Adresse publique du site.
 *
 * Les URL canoniques, le sitemap et l'image de partage doivent être absolues :
 * un réseau social ne sait pas résoudre un chemin relatif. Tant que le nom de
 * domaine n'est pas acheté, on renseigne l'URL `.vercel.app` ; en local, le
 * repli suffit et rien n'est bloqué.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const SITE_NAME = "BAPZ Studio";

/**
 * Image de partage, servie depuis `public/` et référencée explicitement.
 *
 * La convention de fichier `opengraph-image` de Next s'attache au segment où
 * le fichier vit ; or chaque page définit son propre objet `openGraph`, qui
 * écrase celui du layout — l'image comprise. Résultat mesuré : `og:image`
 * n'apparaissait que sur l'accueil. En la déclarant ici, toutes les pages
 * l'obtiennent. `metadataBase` se charge de rendre le chemin absolu.
 */
const IMAGE_PARTAGE = {
  url: "/partage.jpg",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME}, studio de danse à Metz`,
};

/**
 * Construit les métadonnées d'une page : titre, description, URL canonique et
 * balises de partage. Passer par ici plutôt que d'écrire un objet `Metadata` à
 * la main garantit qu'aucune page ne parte sans carte de partage — sans quoi
 * un lien posté sur Instagram n'affiche qu'une URL nue.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  /** Sans le suffixe « - BAPZ Studio », ajouté ici. */
  title: string;
  description: string;
  /** Chemin absolu depuis la racine, par exemple `/profs`. */
  path: string;
}): Metadata {
  const titreComplet = path === "/" ? SITE_NAME : `${title} - ${SITE_NAME}`;
  const url = `${SITE_URL}${path === "/" ? "" : path}`;

  return {
    title: titreComplet,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: SITE_NAME,
      title: titreComplet,
      description,
      url,
      images: [IMAGE_PARTAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: titreComplet,
      description,
      images: [IMAGE_PARTAGE.url],
    },
  };
}

/**
 * Données structurées de l'établissement, au format schema.org.
 *
 * C'est ce qui alimente le bloc local de Google — le plus rentable pour un
 * studio de quartier. Les champs absents ne sont pas inventés : les horaires
 * d'ouverture et le téléphone n'ont jamais été fournis, ils apparaîtront ici
 * dès qu'ils seront saisis dans `/admin`.
 */
export function structuredData(settings: SiteSettings, priceRange?: string) {
  const instagram = settings.instagramHandle?.replace(/^@/, "");

  return {
    "@context": "https://schema.org",
    "@type": "DanceSchool",
    name: SITE_NAME,
    url: SITE_URL,
    // Le sous-titre porte un retour à la ligne qui cale la coupe sur le site ;
    // il n'a rien à faire dans une donnée structurée.
    description: settings.heroSubtitle?.replace(/\s+/g, " ").trim() || undefined,
    ...(settings.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.address,
        addressLocality: settings.city || undefined,
        addressCountry: "FR",
      },
    }),
    ...(settings.phone && { telephone: settings.phone }),
    ...(settings.email && { email: settings.email }),
    // Les horaires restent hors des données structurées : saisis en texte
    // libre (« Lundi - Vendredi »), ils ne se traduisent pas sans risque dans
    // le format strict attendu par schema.org.
    ...(instagram && { sameAs: [`https://instagram.com/${instagram}`] }),
    ...(priceRange && { priceRange }),
  };
}
