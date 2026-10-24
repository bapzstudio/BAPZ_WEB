import { DessinPlanete } from "./DessinPlanete";
import {
  OPACITE_PLANETE,
  TRACES_MOT,
  TRACES_PLANETE,
  VIEWBOX,
} from "./logo-vectoriel";

/**
 * Le logo du studio (le mot posé sur sa planète) en SVG, tel que dessiné par
 * la graphiste, qui se trace trait par trait à l'arrivée sur la page.
 *
 * La planète garde le dosage du logo (`OPACITE_PLANETE`, 20 % du mot) : ses
 * traits au pinceau sont aussi épais que les lettres, et à égalité le mot se
 * perdait dans la grille. C'est aussi l'état sans JavaScript.
 *
 * Composant serveur : les tracés (environ 57 Ko) partent dans le HTML, pas
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
        <g data-dessin-planete="" opacity={OPACITE_PLANETE}>
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
