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
