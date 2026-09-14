import type { CollectionConfig } from "payload";
import { slugField } from "./fields/slug";
import { hooksRevalidation } from "./hooks/revalider";

export const Rooms: CollectionConfig = {
  slug: "rooms",
  labels: { singular: "Salle", plural: "Salles" },
  access: { read: () => true },
  hooks: hooksRevalidation,
  admin: {
    useAsTitle: "name",
    group: "Contenu du site",
    defaultColumns: ["name", "price", "capacity", "availableFrom"],
    description:
      "Salles à louer, affichées en bas de la page Tarifs. Le bouton « Choisir » ouvre une demande de location avec la salle déjà sélectionnée.",
  },
  fields: [
    { name: "name", type: "text", label: "Nom", required: true },
    slugField(
      ["name"],
      "Identifiant de la salle dans les liens de réservation, par exemple salle-a. Rempli tout seul à partir du nom ; à ne changer que si la salle n'est pas encore en ligne.",
    ),
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Photo",
      admin: {
        description:
          "Format paysage, environ 2,7 fois plus large que haut (ex : 1500 x 562). Sans photo, la carte s'affiche sans image.",
      },
    },
    {
      name: "price",
      type: "text",
      label: "Tarif",
      admin: {
        description:
          'Avec la devise, ex : "30 €". Laisser vide pour afficher « Tarif sur demande ».',
      },
    },
    {
      name: "period",
      type: "text",
      label: "Période",
      admin: {
        description: 'Accolé au tarif, ex : "/ heure". Vide si sans objet.',
      },
    },
    {
      name: "capacity",
      type: "number",
      label: "Capacité (personnes)",
      admin: { description: "Nombre de personnes maximum, en chiffres." },
    },
    {
      name: "area",
      type: "number",
      label: "Surface (m²)",
      admin: { description: "En chiffres, sans « m² »." },
    },
    {
      name: "equipment",
      type: "array",
      label: "Équipements",
      labels: { singular: "Équipement", plural: "Équipements" },
      admin: {
        description:
          "Un équipement par ligne, ex : Climatisation. Ils s'affichent à la suite, séparés par des virgules.",
      },
      fields: [
        { name: "item", type: "text", label: "Équipement", required: true },
      ],
    },
    {
      name: "availableFrom",
      type: "text",
      label: "Année d'ouverture",
      admin: {
        description:
          "À remplir seulement si la salle n'est pas encore ouverte (ex : 2027). Le bouton de réservation est alors masqué. Vider le champ le jour de l'ouverture.",
      },
    },
    {
      name: "order",
      type: "number",
      label: "Ordre d'affichage",
      admin: {
        position: "sidebar",
        description: "Les plus petits nombres passent en premier (1, 2, 3…).",
      },
    },
  ],
};
