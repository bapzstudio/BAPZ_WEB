"use server";

import { verifierHumain } from "@/lib/antispam";
import { sendReservationConfirmation, sendReservationRequest } from "@/lib/mail";
import { compterDemandesRecentes, enregistrerDemande } from "@/lib/queries";
import { demandeSchema } from "./schemas";

export type ResultatEnvoi = { succes: true } | { succes: false; erreur: string };

/** Un seul accusé de réception par adresse sur cette période. */
const DELAI_ACCUSE_MS = 24 * 60 * 60 * 1000;

/**
 * Traite l'envoi du parcours de réservation.
 *
 * L'ordre compte : la demande est d'abord enregistrée dans Payload, les mails
 * partent ensuite. Si un mail échoue, la demande existe quand même dans /admin
 * et le visiteur voit la confirmation : lui annoncer un échec le ferait
 * recommencer, et la cliente recevrait la même demande deux fois.
 */
export async function envoyerDemande(
  donnees: unknown,
  jetonAntiRobot?: string | null
): Promise<ResultatEnvoi> {
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

  // Le leurre n'arrête que les robots naïfs : la vraie barrière est ici.
  if (!(await verifierHumain(jetonAntiRobot))) {
    return {
      succes: false,
      erreur: "La vérification anti-robot n'a pas abouti. Réessaie dans un instant.",
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

  // L'accusé part vers l'adresse saisie par le visiteur : on en limite le
  // nombre, pour que le formulaire ne serve pas à écrire en boucle à une
  // adresse qui n'a rien demandé. La demande, elle, est toujours enregistrée.
  try {
    const recentes = await compterDemandesRecentes(resume.email, DELAI_ACCUSE_MS);
    if (recentes <= 1) await sendReservationConfirmation(resume);
  } catch (error) {
    console.error("Parcours de réservation, accusé de réception :", error);
  }

  return { succes: true };
}
