// Vérification anti-robot des formulaires, côté serveur. Seul fichier du site
// qui connaît Cloudflare Turnstile ; le widget navigateur est
// `app/(frontend)/_components/Turnstile.tsx`.
import { headers } from "next/headers";

const VERIFICATION =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Vérifie auprès de Cloudflare le jeton produit par le widget.
 *
 * Un jeton ne sert qu'une fois et expire au bout de cinq minutes : le
 * formulaire en redemande un après chaque refus.
 *
 * Sans `TURNSTILE_SECRET_KEY`, la vérification est ignorée en développement,
 * mais tout envoi est refusé en production : une clé oubliée au déploiement
 * doit se voir tout de suite, pas laisser les formulaires ouverts.
 */
export async function verifierHumain(jeton: unknown): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("TURNSTILE_SECRET_KEY manquant : envoi refusé.");
      return false;
    }
    return true;
  }

  if (typeof jeton !== "string" || jeton === "") return false;

  const corps = new URLSearchParams({ secret, response: jeton });
  // L'adresse IP aide Cloudflare à juger ; derrière Vercel, la première
  // entrée de `x-forwarded-for` est celle du visiteur.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim();
  if (ip) corps.set("remoteip", ip);

  try {
    const reponse = await fetch(VERIFICATION, {
      method: "POST",
      body: corps,
      cache: "no-store",
    });
    const resultat = (await reponse.json()) as { success?: boolean };
    return resultat.success === true;
  } catch (error) {
    // Cloudflare injoignable : on refuse plutôt que d'ouvrir les formulaires.
    console.error("Vérification anti-robot injoignable :", error);
    return false;
  }
}
