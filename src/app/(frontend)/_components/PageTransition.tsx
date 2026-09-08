import { ViewTransition, type ReactNode } from "react";

/**
 * Fondu entre deux pages, via l'API View Transitions du navigateur.
 *
 * À placer dans chaque `page.tsx` et non dans le layout : les layouts persistent
 * d'une navigation à l'autre, donc `enter` et `exit` n'y seraient jamais
 * déclenchés (cf. guide Next "Designing view transitions").
 *
 * Aucun JavaScript n'est expédié : si le navigateur ne supporte pas l'API, la
 * navigation reste instantanée, sans animation.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
