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
      "Photos de la page Galerie. La page est encore en préparation : les photos ajoutées ici n'y apparaissent pas pour l'instant.",
  },
  fields: [
    { name: "image", type: "upload", relationTo: "media", label: "Image", required: true },
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
