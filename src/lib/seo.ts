// Métadonnées du site : seul endroit qui connaît l'adresse publique et la
// forme des balises de partage. Même principe que `queries.ts` pour Payload.
import type { Metadata } from "next";
import { lienInstagram } from "./instagram";
import type { SiteSettings } from "./types";

const adresseConfiguree = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

/*
 * Le repli `localhost` est utile en local, catastrophique en production : il
 * fait partir CHAQUE page avec une URL canonique, un `og:image` et un sitemap
 * pointant sur `http://localhost:3000` — sans que rien n'échoue. Le site
 * s'affiche normalement et devient invisible pour Google. C'est arrivé : la
 * variable existait sur Vercel mais vide, donc falsy, donc repliée (constaté le
 * 2026-09-22).
 *
 * Le garde-fou ne vise que le déploiement de production : `VERCEL_ENV` n'est
 * posé que par l'hébergeur. Un `pnpm build` en local continue donc de passer
 * sans la variable, comme l'annonce `.env.example`.
 */
if (!adresseConfiguree && process.env.VERCEL_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL est vide : le site partirait avec des URL canoniques " +
      "en localhost. Renseigne l'adresse publique dans les variables Vercel " +
      "(type Config, pas Secret), puis redéploie.",
  );
}

/**
 * Adresse publique du site.
 *
 * Les URL canoniques, le sitemap et l'image de partage doivent être absolues :
 * un réseau social ne sait pas résoudre un chemin relatif. Tant que le nom de
 * domaine n'est pas acheté, on renseigne l'URL `.vercel.app` ; en local, le
 * repli suffit et rien n'est bloqué.
 */
export const SITE_URL = adresseConfiguree || "http://localhost:3000";

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
  /**
   * Sans le suffixe « - BAPZ Studio », ajouté ici. Sauf pour l'accueil, dont le
   * titre est utilisé tel quel : c'est le premier résultat que montre Google,
   * et « BAPZ Studio » seul ne contenait aucun des mots que les gens cherchent.
   */
  title: string;
  description: string;
  /** Chemin absolu depuis la racine, par exemple `/profs`. */
  path: string;
}): Metadata {
  const titreComplet = path === "/" ? title : `${title} - ${SITE_NAME}`;
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
 * « 2A rue du Jardin d'Écosse, Ars-Laquenexy » -> rue et commune.
 *
 * La commune est ce qui suit la dernière virgule : c'est la règle affichée
 * sous le champ Adresse de l'admin, et celle que suit déjà la page Contact.
 */
export function decouperAdresse(adresse: string): {
  rue: string;
  commune?: string;
} {
  const virgule = adresse.lastIndexOf(",");
  if (virgule === -1) return { rue: adresse.trim() };
  return {
    rue: adresse.slice(0, virgule).trim(),
    commune: adresse.slice(virgule + 1).trim() || undefined,
  };
}

/**
 * « 310 € » -> 310, « 16,50 € » -> 16.5. Un prix est saisi en texte libre dans
 * l'admin (avec sa devise) : tout ce qui le lit comme un nombre passe par ici.
 * Ses deux lecteurs sont la fourchette de prix des données structurées et la
 * description de `/tarifs`.
 */
export function montantTarif(prix: string): number | undefined {
  const valeur = Number(prix.replace(/[^0-9,.]/g, "").replace(",", "."));
  return Number.isFinite(valeur) && valeur > 0 ? valeur : undefined;
}

/** Texte libre ramené sur une ligne : les retours à la ligne calent la mise en page du site, pas une donnée structurée. */
const surUneLigne = (texte?: string) =>
  texte?.replace(/\s+/g, " ").trim() || undefined;

/**
 * Données structurées de l'établissement, au format schema.org.
 *
 * C'est ce qui alimente le bloc local de Google — le plus rentable pour un
 * studio de quartier. Les champs absents ne sont pas inventés : les horaires
 * d'ouverture et le téléphone n'ont jamais été fournis, ils apparaîtront ici
 * dès qu'ils seront saisis dans `/admin`.
 */
export function structuredData(settings: SiteSettings, priceRange?: string) {
  const { rue, commune } = decouperAdresse(settings.address ?? "");

  return {
    "@context": "https://schema.org",
    "@type": "DanceSchool",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      surUneLigne(settings.introText) || surUneLigne(settings.heroSubtitle),
    ...(settings.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: rue,
        // La commune réelle du studio. « Metz » y figurait jusqu'ici, alors que
        // la rue est à Ars-Laquenexy : une adresse incohérente avec la fiche
        // Google Business dessert le référencement local.
        addressLocality: commune || settings.city || undefined,
        postalCode: settings.postalCode || undefined,
        addressCountry: "FR",
      },
    }),
    // La grande ville voisine, là où les gens cherchent : indiquée comme zone
    // desservie plutôt que comme adresse.
    ...(settings.city &&
      settings.city !== commune && {
        areaServed: { "@type": "City", name: settings.city },
      }),
    ...(settings.phone && { telephone: settings.phone }),
    ...(settings.email && { email: settings.email }),
    // Les horaires restent hors des données structurées : saisis en texte
    // libre (« Lundi - Vendredi »), ils ne se traduisent pas sans risque dans
    // le format strict attendu par schema.org.
    ...(settings.instagramHandle && {
      sameAs: [lienInstagram(settings.instagramHandle)],
    }),
    ...(priceRange && { priceRange }),
  };
}

/**
 * Questions fréquentes de l'accueil au format schema.org `FAQPage`.
 *
 * Google n'en fait plus un résultat enrichi que pour une minorité de sites :
 * l'intérêt principal est que les questions et réponses soient lues comme telles.
 */
export function faqStructuredData(faq: SiteSettings["faq"]) {
  if (!faq?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      // Les `**` de mise en valeur (cf. BioParagraph) n'ont rien à faire
      // dans le texte transmis à Google.
      acceptedAnswer: {
        "@type": "Answer",
        text: surUneLigne(answer.replace(/\*\*/g, "")),
      },
    })),
  };
}

/**
 * Sérialise une donnée structurée pour une balise `<script>`.
 *
 * `<` est échappé : `JSON.stringify` le laisse tel quel, et un `</script>`
 * saisi dans l'admin fermerait la balise pour injecter du HTML dans la page.
 */
export const serialiserJsonLd = (donnee: object) =>
  JSON.stringify(donnee).replace(/</g, "\\u003c");
