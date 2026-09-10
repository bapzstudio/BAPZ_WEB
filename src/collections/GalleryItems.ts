import type { CollectionConfig } from "payload";
import { hooksRevalidation } from "./hooks/revalider";

export const GalleryItems: CollectionConfig = {
  slug: "gallery",
  labels: { singular: "Photo de galerie", plural: "Galerie" },
  access: { read: () => true },
  hooks: hooksRevalidation,
  admin: {
    useAsTitle: "alt",
    group: "Contenu du site",
    defaultColumns: ["alt", "image", "order"],
    description:
      "Photos de la page Galerie. Tant que cette rubrique est vide, la page invite à suivre le studio sur Instagram.",
  },
  fields: [
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Image",
      required: true,
      admin: {
        description:
          "Recadrée en portrait (2 de large pour 3 de haut) sur le site : garder le sujet vers le centre.",
      },
    },
    {
      name: "alt",
      type: "text",
      label: "Légende",
      required: true,
      admin: { description: "Ce qu'on voit sur la photo, en une phrase courte." },
    },
    {
      name: "order",
      type: "number",
      label: "Ordre d'affichage",
      admin: {
        position: "sidebar",
        description: "Les plus petits nombres passent en premier (1, 2, 3…).",
      },
    },
  ],
};
