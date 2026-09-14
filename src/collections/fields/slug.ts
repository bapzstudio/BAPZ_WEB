import type { Field } from "payload";
import { slugify } from "../../lib/slug";

/**
 * Identifiant de lien commun aux contenus vers lesquels le site pointe.
 *
 * Tant qu'il est vide, il se déduit des champs `sources` ; ensuite il est
 * conservé tel quel, même si le titre change : un lien déjà partagé ou déjà
 * indexé ne doit pas se casser parce qu'on a corrigé une heure ou un nom.
 * Indispensable parce que les identifiants numériques de la base changent à
 * chaque exécution du seed.
 */
export function slugField(
  sources: string[],
  description: string,
  label = "Identifiant de lien",
): Field {
  return {
    name: "slug",
    type: "text",
    label,
    unique: true,
    index: true,
    admin: { position: "sidebar", description },
    hooks: {
      beforeValidate: [
        ({ value, siblingData }) => {
          if (value) return slugify(String(value)) || undefined;
          const source = sources
            .map((champ) => siblingData?.[champ])
            .filter(Boolean)
            .join(" ");
          return slugify(source) || undefined;
        },
      ],
    },
  };
}
