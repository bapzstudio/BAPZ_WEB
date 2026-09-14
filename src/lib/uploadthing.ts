// Adresses des fichiers UploadThing. Partagé par `lib/queries.ts` (réécriture
// des adresses) et `next.config.ts` (pare-feu de l'optimiseur d'images) : les
// deux doivent désigner exactement le même domaine.

/**
 * Identifiant de l'application UploadThing, lu dans le jeton : c'est un JSON
 * encodé en base64 qui porte `appId`. Rien de secret dans cet identifiant, il
 * figure dans l'adresse publique de chaque fichier.
 */
export function appIdUploadThing(
  jeton = process.env.UPLOADTHING_TOKEN,
): string | null {
  if (!jeton) return null;
  try {
    const { appId } = JSON.parse(
      Buffer.from(jeton.replace(/^['"]|['"]$/g, ""), "base64").toString(),
    ) as { appId?: unknown };
    return typeof appId === "string" && /^[a-z0-9]+$/i.test(appId)
      ? appId
      : null;
  } catch {
    return null;
  }
}

/** Domaine propre à l'application : `<appId>.ufs.sh`. */
export function domaineUploadThing(): string | null {
  const appId = appIdUploadThing();
  return appId ? `${appId}.ufs.sh` : null;
}

/**
 * `https://utfs.io/f/<clé>` -> `https://<appId>.ufs.sh/f/<clé>`.
 *
 * L'adaptateur Payload produit des adresses sur `utfs.io`, domaine que
 * partagent toutes les applications UploadThing. Autoriser ce domaine dans
 * l'optimiseur de Next laisserait n'importe qui y faire traiter une image de
 * son propre compte — la faille relevée à l'audit du 2026-09-11. Le domaine de
 * l'application, lui, ne sert que nos fichiers. Les deux adresses renvoient le
 * même fichier (vérifié).
 */
export function adresseUploadThing(url: string): string {
  const domaine = domaineUploadThing();
  if (!domaine) return url;
  return url.replace(/^https:\/\/utfs\.io\/f\//, `https://${domaine}/f/`);
}
