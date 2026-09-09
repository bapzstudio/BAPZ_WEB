import type { CollectionConfig } from "payload";

export const Teachers: CollectionConfig = {
  slug: "teachers",
  labels: { singular: "Professeur·e", plural: "Professeur·e·s" },
  access: { read: () => true },
  admin: { useAsTitle: "name", defaultColumns: ["name", "discipline"] },
  fields: [
    { name: "name", type: "text", label: "Nom", required: true },
    {
      name: "slug",
      type: "text",
      label: "Adresse de la page",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description:
          "Fin de l'adresse de sa page, par exemple lena-bapz pour /profs/lena-bapz. Rempli tout seul à partir du nom ; à ne changer que si la page n'est pas encore en ligne, sinon les liens existants se cassent.",
      },
      hooks: {
        beforeValidate: [
          ({ value, data, siblingData }) => {
            const source =
              value || siblingData?.name || (data?.name as string) || "";
            return (
              source
                .toString()
                .normalize("NFD")
                // `normalize("NFD")` sépare la lettre de son accent ; on retire
                // ici les signes diacritiques combinants, sinon le filtre
                // suivant les remplacerait par un tiret (« Léna » -> « l-na »).
                .replace(/[̀-ͯ]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "") || undefined
            );
          },
        ],
      },
    },
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
      admin: { description: "Format paysage, environ 1086 x 944." },
    },
    {
      name: "bio",
      type: "array",
      label: "Présentation",
      labels: { singular: "Paragraphe", plural: "Paragraphes" },
      admin: {
        description:
          "Un paragraphe par entrée. Le texte entre ** ** apparaît en blanc et en gras sur le site.",
      },
      fields: [{ name: "text", type: "textarea", label: "Texte", required: true }],
    },
    {
      name: "order",
      type: "number",
      label: "Ordre d'affichage",
      admin: { position: "sidebar" },
    },
  ],
};
