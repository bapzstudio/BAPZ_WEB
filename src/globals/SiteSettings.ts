import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Réglages du site",
  access: { read: () => true },
  fields: [
    {
      name: "heroTitle",
      type: "textarea",
      label: "Titre de la bannière",
      required: true,
      admin: {
        description:
          "Un retour à la ligne dans ce champ coupe le titre au même endroit sur le site.",
      },
    },
    { name: "heroSubtitle", type: "textarea", label: "Sous-titre de la bannière" },
    { name: "address", type: "text", label: "Adresse" },
    { name: "city", type: "text", label: "Ville" },
    { name: "instagramHandle", type: "text", label: "Compte Instagram" },
    {
      name: "trialLabel",
      type: "text",
      label: "Bouton cours d'essai",
      admin: { description: 'Ex : "Cours d\'essai - 10 €".' },
    },
    {
      name: "marqueeItems",
      type: "array",
      label: "Bandeau défilant",
      labels: { singular: "Mot", plural: "Mots" },
      fields: [{ name: "text", type: "text", label: "Mot", required: true }],
    },
    { name: "logo", type: "upload", relationTo: "media", label: "Logo" },
  ],
};
