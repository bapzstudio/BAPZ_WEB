import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { etapeDepart, type Prefill } from "./prefill";
import type { DemandeData } from "./schemas";

export type DonneesReservation = Partial<DemandeData> & { website?: string };

interface ReservationStore {
  etape: number;
  donnees: DonneesReservation;
  allerA: (etape: number) => void;
  completer: (donnees: DonneesReservation) => void;
  recommencer: () => void;
  appliquerPrefill: (prefill: Prefill) => void;
}

/**
 * État du parcours, conservé dans `sessionStorage` comme sur chuttt.ch : un
 * rechargement ou un détour par une autre page ne fait pas perdre la
 * progression, et tout disparaît à la fermeture de l'onglet.
 */
export const useReservationStore = create<ReservationStore>()(
  persist(
    (set) => ({
      etape: 0,
      donnees: {},
      allerA: (etape) => set({ etape }),
      completer: (donnees) =>
        set((state) => ({ donnees: { ...state.donnees, ...donnees } })),
      recommencer: () => set({ etape: 0, donnees: {} }),
      // Un bouton du site impose son contexte, mais les coordonnées déjà
      // saisies sont gardées : inutile de les redemander.
      appliquerPrefill: (prefill) =>
        set((state) => ({
          etape: etapeDepart(prefill),
          donnees: {
            prenom: state.donnees.prenom,
            email: state.donnees.email,
            telephone: state.donnees.telephone,
            ...prefill,
          },
        })),
    }),
    {
      name: "bapz-reservation",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ etape: state.etape, donnees: state.donnees }),
    },
  ),
);
