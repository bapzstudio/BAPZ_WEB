// Couche d'envoi d'e-mail : seul endroit du site qui connaît Resend.
// Même principe que `queries.ts` avec Payload — changer de fournisseur ne
// toucherait que ce fichier.
import { Resend } from "resend";

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
