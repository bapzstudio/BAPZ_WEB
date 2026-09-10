import { revalidatePath } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";

/**
 * Remet le site à jour après une modification dans l'admin.
 *
 * Les pages lisent Payload par l'API locale, sans `fetch` : Next les génère
 * donc une fois pour toutes au build. Sans ce hook, ce que la cliente
 * enregistre n'apparaîtrait en ligne qu'au déploiement suivant.
 *
 * Tout le site est invalidé, pas seulement la page concernée : un cours
 * apparaît sur l'accueil, le calendrier, la page de son prof et le parcours de
 * réservation, et les réglages sur toutes les pages. Pour un site de cette
 * taille, régénérer à la demande ne coûte rien.
 *
 * Hors de Next — `pnpm seed` ou un script `payload run` — il n'y a pas de cache
 * à invalider et `revalidatePath` lève : on ignore.
 */
function revalider() {
  try {
    revalidatePath("/", "layout");
  } catch {
    // Pas de contexte Next : rien à invalider.
  }
}

export const revaliderApresModification: CollectionAfterChangeHook = ({ doc }) => {
  revalider();
  return doc;
};

export const revaliderApresSuppression: CollectionAfterDeleteHook = ({ doc }) => {
  revalider();
  return doc;
};

export const revaliderApresReglages: GlobalAfterChangeHook = ({ doc }) => {
  revalider();
  return doc;
};

/** À étaler dans `hooks` de toute collection affichée sur le site. */
export const hooksRevalidation = {
  afterChange: [revaliderApresModification],
  afterDelete: [revaliderApresSuppression],
};
