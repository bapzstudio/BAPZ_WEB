import type { CollectionConfig } from "payload";

export const Courses: CollectionConfig = {
  slug: "courses",
  labels: { singular: "Cours", plural: "Cours" },
  access: { read: () => true },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "dayOfWeek", "startTime", "teacher"],
  },
  fields: [
    { name: "title", type: "text", label: "Titre du cours", required: true },
    {
      name: "level",
      type: "text",
      label: "Niveau / précision",
      admin: {
        description:
          "Ligne sous le titre. Pas seulement un niveau : aussi une tranche d'âge (10-14 ans) ou une modalité (Sous demande de réservation).",
      },
    },
    {
      name: "dayOfWeek",
      type: "select",
      label: "Jour",
      required: true,
      options: [
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
        "Dimanche",
      ],
    },
    {
      name: "startTime",
      type: "text",
      label: "Heure de début",
      required: true,
      admin: { description: "Format 24h, ex : 19:00 ou 8:00." },
    },
    {
      name: "endTime",
      type: "text",
      label: "Heure de fin",
      required: true,
      admin: { description: "Format 24h, ex : 20:30." },
    },
    {
      name: "teacher",
      type: "relationship",
      relationTo: "teachers",
      label: "Professeur·e",
    },
    { name: "room", type: "text", label: "Salle", admin: { description: "Ex : Studio A." } },
    {
      name: "order",
      type: "number",
      label: "Ordre d'affichage",
      admin: { position: "sidebar" },
    },
  ],
};
