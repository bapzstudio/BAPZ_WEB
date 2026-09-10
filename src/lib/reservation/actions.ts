"use server";

import { sendReservationConfirmation, sendReservationRequest } from "@/lib/mail";
import { enregistrerDemande } from "@/lib/queries";
import { demandeSchema } from "./schemas";

export type ResultatEnvoi = { succes: true } | { succes: false; erreur: string };

/**
 * Traite l'envoi du parcours de réservation.
 *
 * L'ordre compte : la demande est d'abord enregistrée dans Payload, les mails
 * partent ensuite. Si un mail échoue, la demande existe quand même dans /admin
 * et le visiteur voit la confirmation : lui annoncer un échec le ferait
 * recommencer, et la cliente recevrait la même demande deux fois.
 */
export async function envoyerDemande(donnees: unknown): Promise<ResultatEnvoi> {
  // Champ leurre, comme sur le formulaire de contact : rempli, on répond
  // « envoyé » sans rien faire — un robot à qui l'on annonce l'échec réessaie.
  const leurre = (donnees as Record<string, unknown> | null)?.website;
  if (typeof leurre === "string" && leurre.trim() !== "") {
    return { succes: true };
  }

  const lecture = demandeSchema.safeParse(donnees);
  if (!lecture.success) {
    return {
      succes: false,
      erreur:
        "Certaines informations manquent ou sont invalides. Reviens sur l'étape concernée.",
    };
  }

  let resume: Awaited<ReturnType<typeof enregistrerDemande>>;
  try {
    resume = await enregistrerDemande(lecture.data);
  } catch (error) {
    console.error("Parcours de réservation, enregistrement :", error);
    return {
      succes: false,
      erreur: "L'envoi a échoué. Réessaie, ou écris-nous directement sur Instagram.",
    };
  }

  if (!resume) {
    return {
      succes: false,
      erreur:
        "Ce cours, cette formule ou cette salle n'est plus proposé. Recommence ton choix.",
    };
  }

  try {
    await sendReservationRequest(resume);
  } catch (error) {
    console.error("Parcours de réservation, mail à la cliente :", error);
  }
  try {
    await sendReservationConfirmation(resume);
  } catch (error) {
    console.error("Parcours de réservation, accusé de réception :", error);
  }

  return { succes: true };
}
