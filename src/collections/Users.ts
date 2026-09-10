import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Compte d'accès", plural: "Comptes d'accès" },
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "Réglages",
    defaultColumns: ["email", "updatedAt"],
    description:
      "Les personnes qui peuvent se connecter à cette administration. Tous les comptes ont les mêmes droits.",
  },
  fields: [],
};
