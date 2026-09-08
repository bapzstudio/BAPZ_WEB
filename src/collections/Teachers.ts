import type { CollectionConfig } from "payload";

export const Teachers: CollectionConfig = {
  slug: "teachers",
  labels: { singular: "Professeur·e", plural: "Professeur·e·s" },
  access: { read: () => true },
  admin: { useAsTitle: "name", defaultColumns: ["name", "discipline"] },
  fields: [
    { name: "name", type: "text", label: "Nom", required: true },
    {
      name: "discipline",
      type: "text",
      label: "Discipline",
      admin: {
        description: "Affichée à droite du nom sur la page Profs (ex : Heels).",
      },
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Portrait",
      admin: { description: "Format paysage, environ 1086 x 944." },
    },
    {
      name: "bio",
      type: "array",
      label: "Présentation",
      labels: { singular: "Paragraphe", plural: "Paragraphes" },
      admin: {
        description:
          "Un paragraphe par entrée. Le texte entre ** ** apparaît en blanc et en gras sur le site.",
      },
      fields: [{ name: "text", type: "textarea", label: "Texte", required: true }],
    },
    {
      name: "order",
      type: "number",
      label: "Ordre d'affichage",
      admin: { position: "sidebar" },
    },
  ],
};
