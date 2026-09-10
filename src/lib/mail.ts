// Couche d'envoi d'e-mail : seul endroit du site qui connaît Resend.
// Même principe que `queries.ts` avec Payload — changer de fournisseur ne
// toucherait que ce fichier.
import { Resend } from "resend";
import type { ResumeDemande } from "./types";

/**
 * Expéditeur.
 *
 * Tant qu'aucun domaine n'est vérifié chez Resend, un compte ne peut envoyer
 * que depuis `onboarding@resend.dev`, et uniquement vers l'adresse
 * d'inscription du compte. Pour un formulaire de contact la destination est
 * justement la boîte du studio, donc cette limite n'empêche pas le formulaire
 * de fonctionner — elle impose seulement que `CONTACT_TO_EMAIL` soit l'adresse
 * du compte Resend.
 *
 * Une fois le domaine acheté et vérifié, renseigner `CONTACT_FROM_EMAIL`
 * (ex : "BAPZ Studio <contact@bapzstudio.fr>") : l'expéditeur devient propre et
 * la contrainte sur le destinataire disparaît.
 */
const FALLBACK_FROM = "BAPZ Studio <onboarding@resend.dev>";

export type ContactMessage = {
  name: string;
  email: string;
  message: string;
};

/**
 * Envoie un message du formulaire de contact vers la boîte du studio.
 * Lève si la configuration manque ou si Resend refuse l'envoi : c'est à
 * l'appelant de traduire ça en message pour le visiteur.
 */
export async function sendContactMessage({
  name,
  email,
  message,
}: ContactMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !to) {
    throw new Error(
      "RESEND_API_KEY ou CONTACT_TO_EMAIL manquant : envoi impossible."
    );
  }

  const { error } = await new Resend(apiKey).emails.send({
    from: process.env.CONTACT_FROM_EMAIL || FALLBACK_FROM,
    to,
    // Le visiteur n'est pas l'expéditeur (son domaine n'est pas vérifié chez
    // nous, l'envoi serait rejeté) : on le met en réponse, pour que répondre
    // dans la boîte du studio lui écrive directement.
    replyTo: email,
    subject: `Message de ${name} depuis le site`,
    text: `${message}\n\n---\nEnvoyé par ${name} <${email}> depuis le formulaire de contact.`,
  });

  if (error) {
    throw new Error(`Resend a refusé l'envoi : ${error.message}`);
  }
}

/** Échappe une valeur saisie par un visiteur avant de l'insérer dans du HTML. */
const echapper = (texte: string) =>
  texte.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );

/** Un objet de mail tient sur une ligne : on retire les retours à la ligne. */
const uneLigne = (texte: string) => texte.replace(/[\r\n]+/g, " ").trim();

function configuration() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    throw new Error("RESEND_API_KEY ou CONTACT_TO_EMAIL manquant : envoi impossible.");
  }
  return {
    resend: new Resend(apiKey),
    to,
    from: process.env.CONTACT_FROM_EMAIL || FALLBACK_FROM,
  };
}

/**
 * Prévient la cliente d'une demande arrivée par le parcours de réservation.
 *
 * L'objet résume la demande (« [Essai] Heels - Mardi 19h00 - Julie ») pour
 * qu'elle trie sa boîte d'un coup d'œil. Toutes les valeurs viennent d'un
 * visiteur : elles sont échappées avant d'entrer dans le HTML, sans quoi un
 * prénom piégé pourrait injecter du contenu dans le mail.
 */
export async function sendReservationRequest(demande: ResumeDemande): Promise<void> {
  const { resend, to, from } = configuration();

  const lignesHtml = demande.lignes
    .map(
      (ligne) =>
        `<tr><td style="padding:10px 18px 10px 0;color:#707070;white-space:nowrap;vertical-align:top">${echapper(ligne.label)}</td><td style="padding:10px 0;font-weight:600">${echapper(ligne.valeur)}</td></tr>`
    )
    .join("");
  const messageHtml = demande.message
    ? `<p style="margin:24px 0 8px;color:#707070">Message</p><p style="margin:0;white-space:pre-wrap">${echapper(demande.message)}</p>`
    : "";

  const { error } = await resend.emails.send({
    from,
    to,
    // Répondre dans la boîte de la cliente écrit directement au visiteur.
    replyTo: demande.email,
    subject: uneLigne(demande.objet),
    text: [
      ...demande.lignes.map((ligne) => `${ligne.label} : ${ligne.valeur}`),
      demande.message ? `\nMessage :\n${demande.message}` : "",
    ].join("\n"),
    html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#080808"><div style="background:#080808;color:#ffffff;padding:22px 28px;font-size:16px;font-weight:700;letter-spacing:.08em">NOUVELLE DEMANDE</div><div style="padding:24px 28px"><table style="border-collapse:collapse;font-size:15px">${lignesHtml}</table>${messageHtml}<p style="margin:28px 0 0;font-size:13px;color:#707070">Répondre à ce mail écrit directement à ${echapper(demande.prenom)}. La demande est aussi enregistrée dans l'administration du site, rubrique Demandes.</p></div></div>`,
  });

  if (error) {
    throw new Error(`Resend a refusé l'envoi : ${error.message}`);
  }
}

/**
 * Accusé de réception au visiteur.
 *
 * Seulement une fois un domaine vérifié chez Resend (`CONTACT_FROM_EMAIL`) :
 * avant cela, le compte ne peut écrire qu'à sa propre adresse, et l'envoi au
 * visiteur échouerait à coup sûr.
 */
export async function sendReservationConfirmation(demande: ResumeDemande): Promise<void> {
  if (!process.env.CONTACT_FROM_EMAIL) return;
  const { resend, from } = configuration();

  const { error } = await resend.emails.send({
    from,
    to: demande.email,
    subject: "Ta demande a bien été reçue - BAPZ Studio",
    text: `Bonjour ${demande.prenom},\n\nNous avons bien reçu ta demande. Ce n'est pas encore une réservation confirmée : on revient vers toi très vite.\n\nBAPZ Studio`,
  });

  if (error) {
    throw new Error(`Resend a refusé l'envoi : ${error.message}`);
  }
}
