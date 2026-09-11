import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { resendAdapter } from "@payloadcms/email-resend";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { uploadthingStorage } from "@payloadcms/storage-uploadthing";
import { fr } from "@payloadcms/translations/languages/fr";
import sharp from "sharp";

/**
 * Collections calquées sur les types de `src/lib/types.ts`, eux-mêmes issus
 * des maquettes Figma. Les libellés sont en français : c'est la cliente qui
 * édite.
 */
import { Courses } from "./collections/Courses";
import { Demandes } from "./collections/Demandes";
import { GalleryItems } from "./collections/GalleryItems";
import { Media } from "./collections/Media";
import { PricingPlans } from "./collections/PricingPlans";
import { Rooms } from "./collections/Rooms";
import { Teachers } from "./collections/Teachers";
import { Users } from "./collections/Users";
import { SiteSettings } from "./globals/SiteSettings";
import { expediteur } from "./lib/mail";
import { SITE_URL } from "./lib/seo";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    // Même icône d'onglet que le site : sans elle, l'admin réclamait un
    // `/favicon.ico` inexistant.
    meta: {
      // Payload ajoute lui-même l'espace avant le suffixe.
      titleSuffix: "- BAPZ Studio",
      icons: [{ rel: "icon", type: "image/png", url: "/icon.png" }],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    // En tête : ce que la cliente consultera le plus souvent.
    Demandes,
    Courses,
    Teachers,
    PricingPlans,
    Rooms,
    GalleryItems,
    Media,
    Users,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  // Protection CSRF de la session de l'admin. Sans liste, Payload accepte le
  // cookie de connexion quelle que soit l'origine de la requête : un site tiers
  // pourrait agir au nom d'une personne connectée (vérifié dans
  // payload/dist/auth/extractJWT.js). Adresse publique, plus les adresses
  // Vercel de production et du déploiement en cours.
  csrf: [
    SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  ].filter((adresse): adresse is string => Boolean(adresse)),
  // Le site lit Payload par l'API locale et l'admin par REST : l'API GraphQL
  // ne sert à rien, et exposait publiquement le schéma de toutes les
  // collections.
  graphQL: { disable: true },
  // E-mails de Payload lui-même, dont « Mot de passe oublié ». Sans adaptateur
  // ils partaient dans la console du serveur. Même compte Resend et même
  // expéditeur que les formulaires (`lib/mail.ts`) : tant qu'aucun domaine
  // n'est vérifié, Resend n'écrit qu'à l'adresse d'inscription du compte.
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: expediteur().adresse,
        defaultFromName: expediteur().nom,
      })
    : undefined,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  // Neon Postgres. La chaîne doit être celle de l'endpoint mis en pool
  // (hôte en `-pooler`, port 5432) : la connexion directe n'est joignable
  // qu'en IPv6.
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  // Redimensionnement des images uploadées (tailles, point focal).
  sharp,
  // Interface d'administration en français : c'est la cliente qui l'utilise.
  i18n: {
    supportedLanguages: { fr },
    fallbackLanguage: "fr",
  },
  plugins: [
    // Les fichiers uploadés depuis /admin partent chez UploadThing. Le
    // stockage local est désactivé par l'adaptateur : `Media` n'a donc pas
    // de `staticDir`.
    uploadthingStorage({
      collections: { media: true },
      options: {
        token: process.env.UPLOADTHING_TOKEN,
        acl: "public-read",
      },
    }),
  ],
});
