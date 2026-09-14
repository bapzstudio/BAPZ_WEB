import type { CatalogueReservation } from "../types";
import { typeDemandeSchema, type TypeDemande } from "./schemas";

export type Prefill = {
  type: TypeDemande;
  cours?: string;
  formule?: string;
  salle?: string;
};

type Brut = string | string[] | undefined;
const premier = (valeur: Brut) => (Array.isArray(valeur) ? valeur[0] : valeur);

/**
 * Lit le contexte passé par un bouton du site (`?demande=essai&cours=...`).
 *
 * Rien n'est cru sur parole : un type inconnu annule le pré-remplissage, et un
 * cours, une formule ou une salle absents du catalogue sont ignorés.
 */
export function lirePrefill(
  params: Record<string, Brut>,
  catalogue: CatalogueReservation,
): Prefill | undefined {
  const type = typeDemandeSchema.safeParse(premier(params.demande));
  if (!type.success) return undefined;

  const prefill: Prefill = { type: type.data };
  const cours = premier(params.cours);
  const formule = premier(params.formule);
  const salle = premier(params.salle);

  if (
    type.data === "essai" &&
    cours &&
    catalogue.cours.some((c) => c.slug === cours)
  ) {
    prefill.cours = cours;
  }
  if (
    type.data === "inscription" &&
    formule &&
    catalogue.formules.some((f) => f.slug === formule)
  ) {
    prefill.formule = formule;
  }
  if (
    type.data === "location" &&
    salle &&
    catalogue.salles.some((s) => s.slug === salle)
  ) {
    prefill.salle = salle;
  }
  return prefill;
}

/** Étape d'arrivée : on saute tout ce que le bouton a déjà choisi. */
export function etapeDepart(prefill: Prefill): number {
  if (
    prefill.cours ||
    prefill.formule ||
    prefill.salle ||
    prefill.type === "prive"
  ) {
    return 2;
  }
  return 1;
}
