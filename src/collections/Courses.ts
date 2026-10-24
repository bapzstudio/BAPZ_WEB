import type { CollectionConfig } from "payload";
import { COULEURS_COURS } from "../lib/couleurs";
import { dateDeParis, jourDeParis } from "../lib/planning";
import { slugField } from "./fields/slug";
import { hooksRevalidation } from "./hooks/revalider";

export const Courses: CollectionConfig = {
  slug: "courses",
  labels: { singular: "Cours", plural: "Cours" },
  access: { read: () => true },
  hooks: {
    ...hooksRevalidation,
    // Un événement daté : le jour de la semaine suit la date (le champ Jour est
    // alors masqué), pour que les deux ne puissent pas se contredire.
    beforeValidate: [
      ({ data }) => {
        if (data?.date) data.dayOfWeek = jourDeParis(new Date(data.date));
        return data;
      },
    ],
  },
  admin: {
    useAsTitle: "title",
    group: "Contenu du site",
    defaultColumns: ["title", "dayOfWeek", "startTime", "teacher", "level"],
    description:
      "Le planning de la semaine. Chaque cours apparaît dans le Calendrier, sur la page de son ou sa prof, et dans la liste des cours d'essai proposés aux visiteurs. Supprimer un cours le retire partout.",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Titre du cours",
      required: true,
      admin: {
        description: "Ex : Heels. Le niveau se met dans le champ suivant.",
      },
    },
    // La date d'un événement remplace le jour : deux stages du même nom au même
    // horaire, à des dates différentes, auraient sinon le même identifiant.
    slugField(
      (cours) => [
        cours.title,
        cours.date
          ? dateDeParis(new Date(String(cours.date)))
          : cours.dayOfWeek,
        cours.startTime,
      ],
      "Identifiant du cours dans les liens de réservation, par exemple heels-mardi-19-00. Rempli tout seul ; à ne changer que si le cours n'est pas encore en ligne, sinon les liens existants se cassent.",
    ),
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
      name: "date",
      type: "date",
      label: "Date (événement ponctuel)",
      admin: {
        date: { pickerAppearance: "dayOnly", displayFormat: "d MMMM yyyy" },
        description:
          "Seulement pour un événement qui n'a lieu qu'une fois (stage, soirée…). Il s'affiche avec sa date jusqu'au jour J, puis disparaît tout seul du site. Le jour de la semaine se déduit de la date. Laisser vide pour un cours de chaque semaine.",
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
      // Masqué pour un événement daté : le jour suit la date (cf. hook), et un
      // champ masqué n'est pas validé par Payload.
      admin: { condition: (_, cours) => !cours?.date },
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
      admin: {
        description:
          "Laisser vide si le cours n'a pas de prof attitré·e (ex : Training libre).",
      },
    },
    {
      name: "room",
      type: "text",
      label: "Salle",
      admin: {
        description:
          "Affichée en haut à droite de la carte du calendrier, ex : Studio A.",
      },
    },
    {
      name: "color",
      type: "select",
      label: "Couleur de la carte",
      options: Object.entries(COULEURS_COURS).map(([value, { label }]) => ({
        label,
        value,
      })),
      admin: {
        description:
          "Pour faire ressortir un événement (stage, workshop, soirée…) : sa carte prend cette couleur dans le calendrier, sur l'accueil et sur la page de son ou sa prof. Laisser vide pour un cours habituel.",
      },
    },
    {
      // Case cochée = visible, plutôt qu'une case « Masquer » : une case à
      // décocher pour faire disparaître se lit sans double négation.
      name: "visible",
      type: "checkbox",
      label: "Afficher sur le site",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description:
          "Décoche pour retirer ce cours du site sans le supprimer : il disparaît du calendrier, de l'accueil et des réservations, et revient dès que tu recoches. Pratique pour un cours suspendu ou annulé.",
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
