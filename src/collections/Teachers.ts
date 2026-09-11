import type { CollectionConfig } from "payload";
import { slugField } from "./fields/slug";
import { hooksRevalidation } from "./hooks/revalider";

export const Teachers: CollectionConfig = {
  slug: "teachers",
  labels: { singular: "Professeur·e", plural: "Professeur·e·s" },
  access: { read: () => true },
  hooks: hooksRevalidation,
  admin: {
    useAsTitle: "name",
    group: "Contenu du site",
    defaultColumns: ["name", "discipline", "photo"],
    description:
      "L'équipe. Une personne n'apparaît sur la page Profs, avec sa page personnelle, que si elle a un portrait ET une présentation. Sans les deux, elle reste choisissable comme prof d'un cours.",
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Nom",
      required: true,
      admin: { description: "Tel qu'affiché sur le site, ex : Léna Bapz." },
    },
    // Même champ que cours, formules et salles ; seuls le libellé et l'aide
    // changent, parce qu'ici l'identifiant est l'adresse d'une page.
    slugField(
      ["name"],
      "Fin de l'adresse de sa page, par exemple lena-bapz pour /profs/lena-bapz. Rempli tout seul à partir du nom ; à ne changer que si la page n'est pas encore en ligne, sinon les liens existants se cassent.",
      "Adresse de la page"
    ),
    {
      name: "discipline",
      type: "text",
      label: "Discipline",
      admin: {
        description: "Affichée à droite du nom sur la page Profs (ex : Heels).",
      },
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Portrait",
      admin: {
        description:
          "Format paysage, environ 1086 x 944 (un peu plus large que haut). Le visage vers le haut de l'image.",
      },
    },
    {
      name: "bio",
      type: "array",
      label: "Présentation",
      labels: { singular: "Paragraphe", plural: "Paragraphes" },
      admin: {
        description:
          "Un paragraphe par entrée. Le texte entre ** ** apparaît en blanc et en gras sur le site, ex : **Heels**.",
      },
      fields: [{ name: "text", type: "textarea", label: "Texte", required: true }],
    },
    {
      name: "order",
      type: "number",
      label: "Ordre d'affichage",
      admin: {
        position: "sidebar",
        description: "Ordre sur la page Profs : les plus petits nombres passent en premier (1, 2, 3…).",
      },
    },
  ],
};
