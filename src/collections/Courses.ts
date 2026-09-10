import type { CollectionConfig } from "payload";
import { slugField } from "./fields/slug";
import { hooksRevalidation } from "./hooks/revalider";

export const Courses: CollectionConfig = {
  slug: "courses",
  labels: { singular: "Cours", plural: "Cours" },
  access: { read: () => true },
  hooks: hooksRevalidation,
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
      admin: { description: "Ex : Heels. Le niveau se met dans le champ suivant." },
    },
    slugField(
      ["title", "dayOfWeek", "startTime"],
      "Identifiant du cours dans les liens de réservation, par exemple heels-mardi-19-00. Rempli tout seul ; à ne changer que si le cours n'est pas encore en ligne, sinon les liens existants se cassent."
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
      admin: {
        description: "Laisser vide si le cours n'a pas de prof attitré·e (ex : Training libre).",
      },
    },
    {
      name: "room",
      type: "text",
      label: "Salle",
      admin: { description: "Affichée en haut à droite de la carte du calendrier, ex : Studio A." },
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
