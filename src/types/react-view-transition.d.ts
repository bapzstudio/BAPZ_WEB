// `ViewTransition` est exporté par le React que Next embarque pour l'App Router
// (vérifié dans next/dist/compiled/react), mais pas encore déclaré par
// @types/react, qui suit le React stable. Ce complément de types comble l'écart.
// À supprimer dès que @types/react le déclarera.
import type { ReactNode } from "react";

declare module "react" {
  /** Nom de classe d'animation, ou table indexée par type de transition. */
  type ViewTransitionClass = string | Record<string, string>;

  interface ViewTransitionProps {
    children?: ReactNode;
    /** Identité partagée entre deux pages (morph). */
    name?: string;
    default?: ViewTransitionClass;
    enter?: ViewTransitionClass;
    exit?: ViewTransitionClass;
    share?: ViewTransitionClass;
    update?: ViewTransitionClass;
  }

  export const ViewTransition: (props: ViewTransitionProps) => ReactNode;
}
