import type { CollectionConfig } from "payload";
import { hooksRevalidation } from "./hooks/revalider";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Image", plural: "Images" },
  access: { read: () => true },
  // Remplacer ou supprimer une image change les pages qui l'affichent.
  hooks: hooksRevalidation,
  admin: {
    group: "Réglages",
    defaultColumns: ["filename", "alt", "updatedAt"],
    description:
      "Toutes les images du site. Une image ajoutée depuis une fiche (portrait, photo de salle…) arrive ici automatiquement. Supprimer une image la retire aussi des pages qui l'utilisent.",
  },
  upload: {
    // Pas de `staticDir` : l'adaptateur UploadThing branché dans
    // `payload.config.ts` désactive le stockage local et envoie les fichiers
    // chez UploadThing.
    mimeTypes: ["image/*"],
    // L'adaptateur UploadThing lit la taille du fichier dans une requête HEAD,
    // or UploadThing n'y annonce jamais `content-length` (vérifié) : il
    // répondait donc « Content-Length: 0 », et le navigateur recevait une
    // image vide — vignettes de l'admin, tout accès direct à /api/media/file.
    // Les pages du site passaient par l'optimiseur de Next, qui lit le flux
    // sans s'y fier. Sans cet en-tête, la réponse est simplement streamée.
    modifyResponseHeaders: ({ headers }) => {
      if (headers.get("content-length") === "0") headers.delete("content-length");
      return headers;
    },
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Description de l'image",
      required: true,
      admin: {
        description:
          "Une phrase courte qui dit ce qu'on voit, ex : « Léna en cours de heels ». Lue par les personnes malvoyantes et par Google.",
      },
    },
  ],
};
