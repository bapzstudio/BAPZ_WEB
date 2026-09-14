"use server";

import { verifierHumain } from "@/lib/antispam";
import { sendContactMessage } from "@/lib/mail";

export type ContactState = {
  status: "idle" | "sent" | "error";
  message?: string;
};

const MAX = { name: 100, email: 200, message: 4000 };

/**
 * Traite l'envoi du formulaire de contact.
 *
 * Anti-spam : un champ leurre (`website`) invisible pour un visiteur mais que
 * les robots remplissent volontiers. Quand il est rempli, on répond « envoyé »
 * sans rien envoyer — un robot à qui l'on annonce l'échec réessaie.
 *
 * Le leurre n'arrête que les robots naïfs : un script qui lit le formulaire
 * l'évite sans effort. La vraie barrière est la vérification Cloudflare
 * Turnstile (`lib/antispam.ts`), contrôlée une fois les champs validés.
 */
export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { status: "sent" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { status: "error", message: "Tous les champs sont nécessaires." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      status: "error",
      message: "Cette adresse e-mail semble invalide.",
    };
  }
  if (
    name.length > MAX.name ||
    email.length > MAX.email ||
    message.length > MAX.message
  ) {
    return { status: "error", message: "Le message est trop long." };
  }

  if (!(await verifierHumain(formData.get("cf-turnstile-response")))) {
    return {
      status: "error",
      message:
        "La vérification anti-robot n'a pas abouti. Réessaie dans un instant.",
    };
  }

  try {
    await sendContactMessage({ name, email, message });
    return { status: "sent" };
  } catch (error) {
    // Le détail part dans les logs du serveur, pas vers le visiteur : il
    // pourrait contenir la configuration d'envoi.
    console.error("Formulaire de contact :", error);
    return {
      status: "error",
      message:
        "L'envoi a échoué. Réessaie, ou écris-nous directement sur Instagram.",
    };
  }
}
