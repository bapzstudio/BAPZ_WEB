import type { CollectionConfig } from "payload";

export const Rooms: CollectionConfig = {
  slug: "rooms",
  labels: { singular: "Salle", plural: "Salles" },
  access: { read: () => true },
  admin: { useAsTitle: "name", defaultColumns: ["name", "area", "capacity"] },
  fields: [
    { name: "name", type: "text", label: "Nom", required: true },
    { name: "capacity", type: "number", label: "Capacité (personnes)" },
    { name: "area", type: "number", label: "Surface (m²)" },
    {
      name: "equipment",
      type: "array",
      label: "Équipements",
      labels: { singular: "Équipement", plural: "Équipements" },
      fields: [{ name: "item", type: "text", label: "Équipement", required: true }],
    },
    {
      name: "availableFrom",
      type: "text",
      label: "Année d'ouverture",
      admin: {
        description:
          "À remplir seulement si la salle n'est pas encore ouverte (ex : 2027). Le bouton de réservation est alors masqué.",
      },
    },
    {
      name: "order",
      type: "number",
      label: "Ordre d'affichage",
      admin: { position: "sidebar" },
    },
  ],
};
