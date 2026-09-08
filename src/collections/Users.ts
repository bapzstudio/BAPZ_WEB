import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Utilisateur", plural: "Utilisateurs" },
  auth: true,
  admin: { useAsTitle: "email" },
  fields: [],
};
