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
      "Textes et coordonnées communs à tout le site : bannière d'accueil, présentation et questions fréquentes, adresse, horaires, Instagram, logo.",
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
              "Le texte sous le titre. Les retours à la ligne sont conservés.",
          },
        },
      ],
    },
    {
      // Contenu rédigé de l'accueil. Il existe pour le référencement : sans
      // lui, l'accueil n'offrait à Google qu'une centaine de mots.
      type: "collapsible",
      label: "Accueil : présentation et questions fréquentes",
      fields: [
        {
          name: "introTitle",
          type: "text",
          label: "Titre de la présentation",
          admin: {
            description:
              "Titre de la présentation du studio, sur l'accueil. Il compte pour Google : y mettre ce que les gens cherchent, ex : Un studio de danse à côté de Metz. Laisser vide : la présentation n'apparaît pas.",
          },
        },
        {
          name: "introText",
          type: "textarea",
          label: "Texte de présentation",
          admin: {
            description:
              "Quelques phrases sur le studio, de 80 à 150 mots. Une ligne vide sépare deux paragraphes. Sert aussi de description du studio pour Google.",
          },
        },
        {
          name: "teamIntro",
          type: "textarea",
          label: "Mot sur l'équipe",
          admin: {
            description:
              "Deux ou trois phrases au-dessus des profs, sur l'accueil. Sous chaque prof s'affiche ensuite le début de sa bio : pas besoin de les présenter ici une par une. Laisser vide : les profs s'affichent sans texte au-dessus.",
          },
        },
        {
          name: "faq",
          type: "array",
          label: "Questions fréquentes",
          labels: { singular: "Question", plural: "Questions" },
          admin: {
            description:
              "Affichées en bas de l'accueil et transmises à Google. Deux ou trois phrases par réponse. Pour mettre quelques mots en valeur (en blanc et en gras), les entourer de deux astérisques : **tous les niveaux**. Ne pas y recopier de prix, d'horaires ni d'adresse : ils sont déjà affichés ailleurs sur le site et deviendraient faux ici au premier changement.",
          },
          fields: [
            {
              name: "question",
              type: "text",
              label: "Question",
              required: true,
            },
            {
              name: "answer",
              type: "textarea",
              label: "Réponse",
              required: true,
            },
          ],
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
            description:
              "Numéro et rue, puis la commune après une virgule : 2A rue du Jardin d'Écosse, Ars-Laquenexy. Le texte après la dernière virgule est lu comme la commune. Affichée sur l'accueil et la page Contact, et transmise à Google.",
          },
        },
        {
          name: "postalCode",
          type: "text",
          label: "Code postal",
          admin: {
            description:
              "Ex : 57530. Transmis à Google avec l'adresse : une adresse complète, identique à celle de la fiche Google Business, améliore le référencement local.",
          },
        },
        {
          name: "city",
          type: "text",
          label: "Ville de référence",
          admin: {
            description:
              "La grande ville la plus proche, ex : Metz. Affichée dans la bannière et en pied de page, et indiquée à Google comme zone desservie.",
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
          name: "email",
          type: "email",
          label: "E-mail de contact",
          admin: {
            description:
              "Adresse publique du studio. Affichée sur la page Contact et dans les pages légales, où elle sert aussi aux demandes sur les données personnelles.",
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
              "Avec le @, ex : @bapz.studio. Affiché dans la bannière, en pied de page, sur l'accueil et sur la page Contact, où il renvoie vers le compte.",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Informations légales",
      fields: [
        {
          name: "legalName",
          type: "text",
          label: "Nom de l'entreprise",
          admin: {
            description:
              "Obligatoire avant la mise en ligne. Nom officiel tel qu'inscrit au registre, ou prénom et nom pour une micro-entreprise. Affiché dans les mentions légales et la page Confidentialité ; vide, elles indiquent « À compléter ».",
          },
        },
        {
          name: "legalForm",
          type: "text",
          label: "Statut juridique",
          admin: {
            description:
              "Obligatoire. Ex : Micro-entreprise, SAS au capital de 1 000 €, Association loi 1901.",
          },
        },
        {
          name: "siret",
          type: "text",
          label: "SIRET",
          admin: {
            description: "Obligatoire. 14 chiffres, ex : 123 456 789 00012.",
          },
        },
        {
          name: "publisher",
          type: "text",
          label: "Responsable de la publication",
          admin: {
            description:
              "Obligatoire. Prénom et nom de la personne responsable du contenu du site.",
          },
        },
        {
          name: "host",
          type: "textarea",
          label: "Hébergeur du site",
          admin: {
            description:
              "Obligatoire. Nom, adresse et téléphone de l'hébergeur, un élément par ligne. Rempli au moment de la mise en ligne.",
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
          fields: [
            { name: "text", type: "text", label: "Mot", required: true },
          ],
        },
        {
          name: "logo",
          type: "upload",
          relationTo: "media",
          label: "Logo",
          admin: {
            description:
              "Affiché dans un rond de 40 px, en haut à gauche de chaque page. Une image carrée sur fond transparent, dont le visuel remplit tout le cadre (le logo posé sur sa planète) : une marge vide autour le rendrait illisible.",
          },
        },
      ],
    },
  ],
};
