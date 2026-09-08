import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Média", plural: "Médias" },
  access: { read: () => true },
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
      label: "Texte alternatif",
      required: true,
      admin: {
        description:
          "Décrit l'image pour les personnes qui ne la voient pas, et pour Google.",
      },
    },
  ],
};
