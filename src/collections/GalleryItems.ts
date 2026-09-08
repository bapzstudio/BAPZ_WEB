import type { CollectionConfig } from "payload";

export const GalleryItems: CollectionConfig = {
  slug: "gallery",
  labels: { singular: "Photo de galerie", plural: "Galerie" },
  access: { read: () => true },
  admin: { useAsTitle: "alt" },
  fields: [
    { name: "image", type: "upload", relationTo: "media", label: "Image", required: true },
    { name: "alt", type: "text", label: "Légende", required: true },
    {
      name: "order",
      type: "number",
      label: "Ordre d'affichage",
      admin: { position: "sidebar" },
    },
  ],
};
