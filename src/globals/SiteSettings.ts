import type { GlobalConfig } from "payload";
import { revaliderApresReglages } from "../collections/hooks/revalider";

// Les blocs repliables ne changent rien à la forme des données : ils rangent
// seulement l'écran d'édition.
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Réglages du site",
  access: { read: () => true },
  hooks: { afterChange: [revaliderApresReglages] },
  admin: {
    group: "Réglages",
    description:
      "Textes et coordonnées communs à tout le site : bannière d'accueil, adresse, horaires, Instagram, logo.",
  },
  fields: [
    {
      type: "collapsible",
      label: "Bannière d'accueil",
      fields: [
        {
          name: "heroTitle",
          type: "textarea",
          label: "Titre de la bannière",
          required: true,
          admin: {
            description:
              "Le grand titre de l'accueil. Un retour à la ligne dans ce champ coupe le titre au même endroit sur le site.",
          },
        },
        {
          name: "heroSubtitle",
          type: "textarea",
          label: "Sous-titre de la bannière",
          admin: {
            description:
              "Le texte sous le titre. Les retours à la ligne sont conservés. Il sert aussi de description du studio pour Google.",
          },
        },
        {
          name: "trialLabel",
          type: "text",
          label: "Bouton cours d'essai",
          admin: {
            description:
              'Texte du bouton blanc de la bannière, qui ouvre une demande de cours d\'essai. Ex : "Cours d\'essai - 10 €". Penser à le mettre à jour si le prix de l\'essai change dans Tarifs.',
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Coordonnées",
      fields: [
        {
          name: "address",
          type: "text",
          label: "Adresse",
          admin: {
            description: "Numéro, rue et commune. Affichée sur la page Contact et transmise à Google.",
          },
        },
        {
          name: "city",
          type: "text",
          label: "Ville",
          admin: {
            description: "Affichée dans la bannière et en pied de page, ex : Metz.",
          },
        },
        {
          name: "phone",
          type: "text",
          label: "Téléphone",
          admin: {
            description:
              "Ex : 06 12 34 56 78. Affiché sur la page Contact et transmis à Google. Laisser vide pour ne pas l'afficher.",
          },
        },
        {
          name: "openingHours",
          type: "array",
          label: "Horaires",
          labels: { singular: "Créneau", plural: "Créneaux" },
          admin: {
            description:
              "Une ligne par créneau, affichées sur la page Contact. Laisser vide : la rubrique Horaires n'apparaît pas.",
          },
          fields: [
            {
              name: "days",
              type: "text",
              label: "Jours",
              required: true,
              admin: { description: "Ex : Lundi - Vendredi" },
            },
            {
              name: "hours",
              type: "text",
              label: "Heures",
              required: true,
              admin: { description: "Ex : 17h - 22h, ou Fermé" },
            },
          ],
        },
        {
          name: "instagramHandle",
          type: "text",
          label: "Compte Instagram",
          admin: {
            description:
              "Avec le @, ex : @bapzstudio. Affiché dans la bannière, en pied de page et sur la page Contact.",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Bandeau et logo",
      fields: [
        {
          name: "marqueeItems",
          type: "array",
          label: "Bandeau défilant",
          labels: { singular: "Mot", plural: "Mots" },
          admin: {
            description:
              "Les mots qui défilent en bas de l'accueil. Les deux premiers apparaissent aussi au centre du pied de page : y mettre les disciplines phares.",
          },
          fields: [{ name: "text", type: "text", label: "Mot", required: true }],
        },
        {
          name: "logo",
          type: "upload",
          relationTo: "media",
          label: "Logo",
          admin: {
            description: "Affiché dans un rond, en haut à gauche de chaque page. Fond transparent de préférence.",
          },
        },
      ],
    },
  ],
};
