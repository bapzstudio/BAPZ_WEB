import type { Field } from "payload";
import { slugify } from "../../lib/slug";

/**
 * Identifiant de lien commun aux contenus vers lesquels le site pointe.
 *
 * Tant qu'il est vide, il se déduit des champs `sources` (ou de ce que renvoie
 * la fonction `sources`, pour un libellé qui n'est pas un champ) ; ensuite il est
 * conservé tel quel, même si le titre change : un lien déjà partagé ou déjà
 * indexé ne doit pas se casser parce qu'on a corrigé une heure ou un nom.
 * Indispensable parce que les identifiants numériques de la base changent à
 * chaque exécution du seed.
 */
export function slugField(
  sources: string[] | ((data: Record<string, unknown>) => unknown[]),
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
          const valeurs =
            typeof sources === "function"
              ? sources(siblingData ?? {})
              : sources.map((champ) => siblingData?.[champ]);
          const source = valeurs.filter(Boolean).join(" ");
          return slugify(source) || undefined;
        },
      ],
    },
  };
}
