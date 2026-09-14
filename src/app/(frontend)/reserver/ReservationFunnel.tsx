"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { envoyerDemande } from "@/lib/reservation/actions";
import type { Prefill } from "@/lib/reservation/prefill";
import { NIVEAU_LABELS, TYPE_LABELS } from "@/lib/reservation/schemas";
import { useReservationStore, type DonneesReservation } from "@/lib/reservation/store";
import type { CatalogueReservation } from "@/lib/types";
import { ProgressBar } from "./ProgressBar";
import { StepChoix } from "./steps/StepChoix";
import { StepConfirmation } from "./steps/StepConfirmation";
import { StepCoordonnees } from "./steps/StepCoordonnees";
import { StepDemande } from "./steps/StepDemande";
import { StepDetails } from "./steps/StepDetails";
import { StepRecap, type ElementRecap } from "./steps/StepRecap";
import { LIBELLE } from "./ui";
import { useBalayage } from "./useBalayage";
import { Turnstile, TURNSTILE_ACTIF, type TurnstileHandle } from "../_components/Turnstile";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Demande, choix, détails, coordonnées, récapitulatif. */
const TOTAL = 5;

// Hors du composant, pour deux raisons. `useSyncExternalStore` se réabonne si
// la fonction d'abonnement change à chaque rendu. Et `persist` n'existe pas
// côté serveur : zustand n'attache son API que si le stockage est disponible,
// ce qui n'est jamais le cas sans navigateur — y accéder sans garde faisait
// répondre la page en 500 au premier chargement.
const sAbonnerHydratation = (ecouteur: () => void) =>
  useReservationStore.persist?.onFinishHydration(ecouteur) ?? (() => {});
const estHydrate = () => useReservationStore.persist?.hasHydrated() ?? false;
const jamaisCoteServeur = () => false;

/**
 * Parcours de réservation, sur la structure du tunnel de devis de chuttt.ch :
 * état conservé par onglet, barre de progression, colonne qui récapitule les
 * choix et permet d'y revenir, étapes-choix qui avancent au clic, étapes-
 * formulaires validées par zod, récapitulatif modifiable, confirmation.
 *
 * Seul écart : les transitions d'étape passent par une animation CSS plutôt
 * que framer-motion, pour ne pas ajouter une seconde bibliothèque d'animation
 * à côté de GSAP.
 */
export function ReservationFunnel({
  catalogue,
  prefill,
}: {
  catalogue: CatalogueReservation;
  prefill?: Prefill;
}) {
  // `false` au rendu serveur, `true` dès que l'état est relu depuis la session :
  // pas de décalage d'hydratation, et jamais l'affichage d'une étape obsolète.
  const hydrate = useSyncExternalStore(
    sAbonnerHydratation,
    estHydrate,
    jamaisCoteServeur
  );

  const etape = useReservationStore((s) => s.etape);
  const donnees = useReservationStore((s) => s.donnees);
  const allerA = useReservationStore((s) => s.allerA);
  const completer = useReservationStore((s) => s.completer);
  const recommencer = useReservationStore((s) => s.recommencer);
  const appliquerPrefill = useReservationStore((s) => s.appliquerPrefill);

  const [sens, setSens] = useState(1);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  // Jeton anti-robot du récapitulatif, redemandé après chaque envoi refusé.
  const [jeton, setJeton] = useState<string | null>(null);
  const turnstile = useRef<TurnstileHandle>(null);
  const [prenomEnvoye, setPrenomEnvoye] = useState<string | null>(null);

  // Focus clavier et lecteurs d'écran : après chaque changement d'étape voulu
  // par la personne, on se place sur le titre de la nouvelle étape. Jamais au
  // chargement ni au pré-remplissage, où déplacer le focus surprendrait.
  const contenuRef = useRef<HTMLDivElement>(null);
  const focusApresRendu = useRef(false);
  useEffect(() => {
    if (!focusApresRendu.current) return;
    focusApresRendu.current = false;
    contenuRef.current?.querySelector<HTMLElement>("h1")?.focus();
  }, [etape, prenomEnvoye]);

  // Le contexte d'un bouton du site s'applique une seule fois, avant le premier
  // affichage, puis disparaît de l'adresse : recharger la page ne doit pas
  // ramener en arrière quelqu'un qui a déjà avancé.
  const prefillApplique = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (!hydrate || !prefill || prefillApplique.current) return;
    prefillApplique.current = true;
    appliquerPrefill(prefill);
    window.history.replaceState(null, "", "/reserver");
  }, [hydrate, prefill, appliquerPrefill]);

  const type = donnees.type;

  const aller = useCallback(
    (cible: number) => {
      setSens(cible > etape ? 1 : -1);
      setErreur(null);
      focusApresRendu.current = true;
      allerA(cible);
    },
    [etape, allerA]
  );

  const suivant = useCallback(
    (ajout: DonneesReservation) => {
      const nouveauType = ajout.type ?? type;
      // Changer de type de demande invalide les choix qui en dépendaient.
      const reinitialisation =
        ajout.type && ajout.type !== type
          ? {
              cours: undefined,
              formule: undefined,
              salle: undefined,
              niveau: undefined,
              dateSouhaitee: undefined,
              personnes: undefined,
            }
          : {};
      completer({ ...reinitialisation, ...ajout });

      let cible = etape + 1;
      // Un cours privé n'a rien à choisir dans le catalogue.
      if (cible === 1 && nouveauType === "prive") cible = 2;
      setSens(1);
      setErreur(null);
      focusApresRendu.current = true;
      allerA(cible);
    },
    [etape, type, completer, allerA]
  );

  const precedent = useCallback(() => {
    let cible = etape - 1;
    if (cible === 1 && type === "prive") cible = 0;
    setSens(-1);
    setErreur(null);
    focusApresRendu.current = true;
    allerA(Math.max(0, cible));
  }, [etape, type, allerA]);

  // Balayage au doigt, en complément des boutons (cf. useBalayage).
  //
  // Vers l'arrière : toujours, c'est le geste attendu et il ne perd rien.
  //
  // Vers l'avant : seulement pour repasser sur ce qui est déjà renseigné.
  // Aux étapes de choix (0 et 1), le balayage n'avance que si le choix est
  // fait — sinon il n'y a rien à valider et il faut choisir. Aux étapes de
  // saisie (2 et 3), il déclenche l'envoi du formulaire, donc exactement ce
  // que fait « Suivant » : la saisie en cours est enregistrée et la validation
  // s'applique. Au récapitulatif, rien : l'envoi reste un geste explicite.
  const choixFait =
    etape === 0
      ? Boolean(type)
      : type === "prive" ||
        (type === "essai" && Boolean(donnees.cours)) ||
        (type === "inscription" && Boolean(donnees.formule)) ||
        (type === "location" && Boolean(donnees.salle));

  const zoneBalayage = useBalayage({
    surRetour: () => {
      if (etape > 0) precedent();
    },
    surAvance: () => {
      if (etape === 0 || etape === 1) {
        if (!choixFait) return;
        aller(etape === 0 && type === "prive" ? 2 : etape + 1);
        return;
      }
      if (etape === 2 || etape === 3) {
        document.querySelector<HTMLFormElement>("#funnel-form")?.requestSubmit();
      }
    },
  });

  const cours = catalogue.cours.find((c) => c.slug === donnees.cours);
  const formule = catalogue.formules.find((f) => f.slug === donnees.formule);
  const salle = catalogue.salles.find((s) => s.slug === donnees.salle);

  const elements: ElementRecap[] = [];
  if (type) elements.push({ label: "Demande", valeur: TYPE_LABELS[type].label, etape: 0 });
  if (type === "essai" && cours) {
    elements.push({ label: "Cours", valeur: `${cours.titre} · ${cours.detail}`, etape: 1 });
  }
  if (type === "inscription" && formule) {
    elements.push({ label: "Formule", valeur: `${formule.titre} · ${formule.prix}`, etape: 1 });
  }
  if (type === "location" && salle) {
    elements.push({ label: "Salle", valeur: salle.titre, etape: 1 });
  }
  if (donnees.niveau) {
    elements.push({ label: "Niveau", valeur: NIVEAU_LABELS[donnees.niveau], etape: 2 });
  }
  if (donnees.dateSouhaitee) {
    elements.push({ label: "Date", valeur: donnees.dateSouhaitee, etape: 2 });
  }
  if (donnees.personnes) {
    elements.push({ label: "Personnes", valeur: donnees.personnes, etape: 2 });
  }
  if (donnees.message) {
    const court =
      donnees.message.length > 80 ? `${donnees.message.slice(0, 80)}…` : donnees.message;
    elements.push({ label: "Message", valeur: court, etape: 2 });
  }
  if (donnees.prenom) elements.push({ label: "Prénom", valeur: donnees.prenom, etape: 3 });
  if (donnees.email) elements.push({ label: "E-mail", valeur: donnees.email, etape: 3 });
  if (donnees.telephone) {
    elements.push({ label: "Téléphone", valeur: donnees.telephone, etape: 3 });
  }

  const envoyer = useCallback(async () => {
    setEnvoiEnCours(true);
    setErreur(null);
    const resultat = await envoyerDemande(donnees, jeton);
    setEnvoiEnCours(false);
    if (resultat.succes) {
      focusApresRendu.current = true;
      setPrenomEnvoye(donnees.prenom ?? "");
      recommencer();
      return;
    }
    setErreur(resultat.erreur);
    turnstile.current?.reinitialiser();
  }, [donnees, jeton, recommencer]);

  if (prenomEnvoye !== null) {
    return (
      <div className="funnel">
        <div className="container-page flex flex-1 items-center justify-center py-[var(--vr-64)]">
          <div
            ref={contenuRef}
            className="funnel-etape w-full max-w-[640px]"
            style={{ "--sens": 1 } as CSSProperties}
          >
            <StepConfirmation prenom={prenomEnvoye} />
          </div>
        </div>
      </div>
    );
  }

  // Même boîte que le parcours, vide : la page ne saute pas à l'arrivée du contenu.
  if (!hydrate) return <div className="funnel" aria-busy="true" />;

  const colonneVisible = etape >= 1 && etape <= 3;

  return (
    <div className="funnel">
      <ProgressBar etape={etape} total={TOTAL} />

      <div className="container-page flex-1 py-[var(--vr-64)]">
        <div className="grid items-start gap-12 lg:grid-cols-[220px_minmax(0,640px)_220px] lg:justify-center">
          <aside
            aria-label="Ta demande"
            className="sticky top-28 hidden flex-col gap-1 lg:flex"
            style={{ visibility: colonneVisible ? "visible" : "hidden" }}
          >
            <p className={`${LIBELLE} mb-3`}>Ta demande</p>
            {elements
              .filter((element) => element.etape < etape)
              .map((element) => (
                <button
                  key={element.label}
                  type="button"
                  onClick={() => aller(element.etape)}
                  className="flex flex-col gap-0.5 border-l border-rule-faint py-2 pl-3 text-left transition-colors hover:border-foreground"
                >
                  <span className="font-mono text-label uppercase tracking-widest text-tertiary">
                    {element.label}
                  </span>
                  <span className="truncate text-sm font-semibold">{element.valeur}</span>
                </button>
              ))}
            <button
              type="button"
              onClick={() => {
                recommencer();
                setSens(-1);
                setErreur(null);
                focusApresRendu.current = true;
              }}
              className="mt-4 w-fit font-mono text-label uppercase tracking-widest text-tertiary transition-colors hover:text-foreground"
            >
              Recommencer
            </button>
          </aside>

          <div ref={zoneBalayage} className="w-full">
            <div
              key={etape}
              ref={contenuRef}
              className="funnel-etape"
              style={{ "--sens": sens } as CSSProperties}
            >
              <p className={`${LIBELLE} mb-5 text-center`}>
                Étape {Math.min(etape + 1, TOTAL)} / {TOTAL}
              </p>

              {etape === 0 && <StepDemande valeur={type} onChoix={suivant} />}
              {etape === 1 && (
                <StepChoix type={type} catalogue={catalogue} donnees={donnees} onChoix={suivant} />
              )}
              {etape === 2 && (
                <StepDetails
                  type={type}
                  defaultValues={{
                    niveau: donnees.niveau,
                    dateSouhaitee: donnees.dateSouhaitee,
                    personnes: donnees.personnes,
                    message: donnees.message,
                  }}
                  onSubmit={suivant}
                />
              )}
              {etape === 3 && (
                <StepCoordonnees
                  defaultValues={{
                    prenom: donnees.prenom ?? "",
                    email: donnees.email ?? "",
                    telephone: donnees.telephone,
                    website: donnees.website,
                  }}
                  onSubmit={suivant}
                />
              )}
              {etape === 4 && <StepRecap elements={elements} onModifier={aller} />}
            </div>

            {etape === 4 && <Turnstile ref={turnstile} onJeton={setJeton} />}

            {etape >= 1 && (
              <div className="mt-10 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={precedent}
                  className="font-mono text-xs uppercase tracking-widest text-tertiary transition-colors hover:text-foreground"
                >
                  ← Retour
                </button>
                {(etape === 2 || etape === 3) && (
                  <button type="submit" form="funnel-form" className="pill pill-light">
                    Suivant
                  </button>
                )}
                {etape === 4 && (
                  <button
                    type="button"
                    onClick={envoyer}
                    disabled={envoiEnCours || (TURNSTILE_ACTIF && !jeton)}
                    className="pill pill-light disabled:opacity-50"
                  >
                    {envoiEnCours
                      ? "Envoi…"
                      : TURNSTILE_ACTIF && !jeton
                        ? "Vérification…"
                        : "Envoyer ma demande"}
                  </button>
                )}
              </div>
            )}

            {erreur && (
              <p role="alert" className="mt-5 text-center text-petit text-secondary">
                {erreur}
              </p>
            )}
          </div>

          <div aria-hidden className="hidden lg:block" />
        </div>
      </div>
    </div>
  );
}
