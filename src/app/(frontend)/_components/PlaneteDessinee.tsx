import { DessinPlanete } from "./DessinPlanete";
import { TRACES_MOT, TRACES_PLANETE, VIEWBOX } from "./logo-vectoriel";

/**
 * Le logo du studio (le mot posé sur sa planète) en SVG, tel que dessiné par
 * la graphiste, qui se trace ligne par ligne à l'arrivée sur la page.
 *
 * Composant serveur : les tracés (environ 45 Ko) partent dans le HTML, pas
 * dans le JavaScript. Seule l'animation, `DessinPlanete`, est côté client.
 * Décoratif, invisible pour les lecteurs d'écran ; placement et opacité
 * viennent de `className`.
 */
export function PlaneteDessinee({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none select-none ${className}`}>
      <svg
        viewBox={VIEWBOX}
        className="size-full overflow-visible"
        data-dessin=""
        data-dessin-pending=""
      >
        <g data-dessin-planete="">
          {TRACES_PLANETE.map((d, i) => (
            <path key={i} d={d} fill="#fff" />
          ))}
        </g>
        <g data-dessin-mot="">
          {TRACES_MOT.map((d, i) => (
            <path key={i} d={d} fill="#fff" />
          ))}
        </g>
      </svg>
      <DessinPlanete />
    </div>
  );
}
