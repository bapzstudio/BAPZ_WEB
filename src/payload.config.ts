import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
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

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
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
