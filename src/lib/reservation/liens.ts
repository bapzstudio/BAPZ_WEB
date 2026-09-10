import type { TypeDemande } from "./schemas";

/**
 * Adresse du parcours de réservation, pré-positionné sur ce que le bouton sait
 * déjà. Tous les boutons du site passent par ici : un seul endroit connaît la
 * forme de ces liens.
 */
export function lienReservation(contexte?: {
  type?: TypeDemande;
  cours?: string;
  formule?: string;
  salle?: string;
}): string {
  const params = new URLSearchParams();
  if (contexte?.type) params.set("demande", contexte.type);
  if (contexte?.cours) params.set("cours", contexte.cours);
  if (contexte?.formule) params.set("formule", contexte.formule);
  if (contexte?.salle) params.set("salle", contexte.salle);
  const requete = params.toString();
  return requete ? `/reserver?${requete}` : "/reserver";
}
