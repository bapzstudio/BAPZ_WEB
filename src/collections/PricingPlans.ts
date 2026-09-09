import type { CollectionConfig } from "payload";

export const PricingPlans: CollectionConfig = {
  slug: "pricing-plans",
  labels: { singular: "Tarif", plural: "Tarifs" },
  access: { read: () => true },
  admin: { useAsTitle: "name", defaultColumns: ["name", "price", "group"] },
  fields: [
    {
      name: "group",
      type: "select",
      label: "Section",
      required: true,
      options: [
        { label: "À la carte", value: "carte" },
        { label: "Abonnement à l'année", value: "abonnement" },
        { label: "Offre d'essai", value: "essai" },
      ],
      admin: {
        description: "Détermine dans quelle section de la page Tarifs la formule apparaît.",
      },
    },
    {
      name: "label",
      type: "text",
      label: "Petit libellé",
      admin: { description: 'Au-dessus du prix, ex : "Le + populaire".' },
    },
    { name: "name", type: "text", label: "Nom de la formule", required: true },
    {
      name: "price",
      type: "text",
      label: "Prix",
      required: true,
      admin: { description: 'Avec la devise, ex : "160 €".' },
    },
    {
      name: "period",
      type: "text",
      label: "Période",
      admin: { description: 'Accolé au prix, ex : "/ an". Vide si sans objet.' },
    },
    {
      name: "sessionsIncluded",
      type: "number",
      label: "Nombre de cours inclus",
      min: 1,
      admin: {
        description:
          "Sert à afficher « soit X € le cours » sous le prix, ce qui permet de comparer les formules. Mettre 10 pour une carte de 10 cours ; pour un abonnement à l'année, le nombre de cours sur la saison (par exemple 34 semaines = 34). Laisser vide pour ne rien afficher.",
      },
    },
    { name: "description", type: "textarea", label: "Description" },
    { name: "highlighted", type: "checkbox", label: "Mettre en avant", defaultValue: false },
    {
      name: "order",
      type: "number",
      label: "Ordre d'affichage",
      admin: { position: "sidebar" },
    },
  ],
};
