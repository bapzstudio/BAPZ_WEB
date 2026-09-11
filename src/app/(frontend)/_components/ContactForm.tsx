"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitContact, type ContactState } from "../contact/actions";
import { Turnstile, TURNSTILE_ACTIF, type TurnstileHandle } from "./Turnstile";

const INITIAL: ContactState = { status: "idle" };


export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, INITIAL);
  const [jeton, setJeton] = useState<string | null>(null);
  const turnstile = useRef<TurnstileHandle>(null);

  // Un jeton anti-robot ne sert qu'une fois : après un envoi refusé, on en
  // redemande un pour le prochain essai.
  useEffect(() => {
    if (state.status === "error") turnstile.current?.reinitialiser();
  }, [state]);

  if (state.status === "sent") {
    return (
      <div className="card flex flex-col justify-center gap-2.5 p-6">
        <div className="eyebrow">MESSAGE ENVOYÉ</div>
        <p className="text-sm text-tertiary">
          Merci, on te répond vite. La réponse arrivera à l&apos;adresse que tu
          as indiquée.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="card relative flex flex-col gap-3.5 p-6">
      <div className="eyebrow">UN MESSAGE ?</div>

      {/* Champ leurre : hors flux et hors tabulation, donc invisible pour un
          visiteur, mais rempli par la plupart des robots. `hidden` suffirait à
          le masquer, mais certains robots l'ignorent justement pour ça. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label>
          Ne pas remplir
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <input name="name" placeholder="Ton nom" required maxLength={100} className="champ" />
      <input
        name="email"
        type="email"
        placeholder="Ton e-mail"
        required
        maxLength={200}
        className="champ"
      />
      <textarea
        name="message"
        placeholder="Ton message"
        rows={4}
        required
        maxLength={4000}
        className="champ resize-y"
      />

      <Turnstile ref={turnstile} onJeton={setJeton} />

      <button
        type="submit"
        disabled={pending || (TURNSTILE_ACTIF && !jeton)}
        className="pill pill-light mt-2 disabled:opacity-50"
      >
        {pending ? "Envoi…" : "Envoyer"}
      </button>

      <p className="text-center text-petit leading-snug text-tertiary">
        Ton message sert uniquement à te répondre.{" "}
        <Link
          href="/confidentialite"
          className="underline underline-offset-4 transition-colors hover:text-foreground"
        >
          En savoir plus
        </Link>
      </p>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-center text-label text-secondary">
          {state.message}
        </p>
      )}
    </form>
  );
}
