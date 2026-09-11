"use client";

import Script from "next/script";
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";

type ApiTurnstile = {
  render: (conteneur: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widget: string) => void;
  remove: (widget: string) => void;
};

declare global {
  interface Window {
    turnstile?: ApiTurnstile;
  }
}

const CLE_SITE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Faux si aucune clé n'est configurée : les formulaires n'attendent alors aucun jeton. */
export const TURNSTILE_ACTIF = Boolean(CLE_SITE);

export type TurnstileHandle = {
  /** Redemande un jeton : le précédent a été consommé par un envoi refusé. */
  reinitialiser: () => void;
};

/**
 * Vérification anti-robot de Cloudflare, en mode invisible : elle ne s'affiche
 * que si Cloudflare a un doute sur le visiteur.
 *
 * Rendue explicitement plutôt que par la détection automatique du script,
 * qui ne scanne la page qu'à son premier chargement — un formulaire atteint
 * par navigation interne n'aurait jamais eu de widget. Dans un `<form>`, le
 * widget ajoute lui-même le champ caché `cf-turnstile-response`.
 */
export function Turnstile({
  onJeton,
  ref,
}: {
  onJeton?: (jeton: string | null) => void;
  ref?: Ref<TurnstileHandle>;
}) {
  const conteneur = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [scriptPret, setScriptPret] = useState(false);

  // Rappel lu au moment de l'appel : le widget n'a pas à être recréé chaque
  // fois que le parent passe une nouvelle fonction.
  const rappel = useRef(onJeton);
  useEffect(() => {
    rappel.current = onJeton;
  });

  useImperativeHandle(
    ref,
    () => ({
      reinitialiser: () => {
        rappel.current?.(null);
        if (widget.current) window.turnstile?.reset(widget.current);
      },
    }),
    []
  );

  useEffect(() => {
    const element = conteneur.current;
    if (!CLE_SITE || !scriptPret || !element || !window.turnstile) return undefined;

    widget.current = window.turnstile.render(element, {
      sitekey: CLE_SITE,
      theme: "dark",
      language: "fr",
      appearance: "interaction-only",
      callback: (jeton: string) => rappel.current?.(jeton),
      "expired-callback": () => rappel.current?.(null),
      "error-callback": () => rappel.current?.(null),
    });

    return () => {
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
      rappel.current?.(null);
    };
  }, [scriptPret]);

  if (!CLE_SITE) return null;

  return (
    <>
      {/* `onReady` et non `onLoad` : il se déclenche aussi quand le script est
          déjà chargé par une page précédente. */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptPret(true)}
      />
      <div ref={conteneur} className="flex justify-center" />
    </>
  );
}
