import Link from "next/link";
import { minutes, ordreJour } from "@/lib/reservation/format";
import type { Course } from "@/lib/types";
import { ProximityGlow } from "../_components/ProximityGlow";
import { Reveal } from "../_components/Reveal";
import { ESPACE_SECTION, EnteteSection } from "./EnteteSection";

type Discipline = {
  titre: string;
  niveaux: string[];
  jours: string[];
  profs: string[];
};

/**
 * Les cours regroupés par discipline : un même titre donné plusieurs jours
 * forme une seule carte. Ordre : le premier créneau de la semaine.
 */
function regrouper(courses: Course[]): Discipline[] {
  const tries = [...courses].sort(
    (a, b) =>
      ordreJour(a.dayOfWeek) - ordreJour(b.dayOfWeek) ||
      minutes(a.startTime) - minutes(b.startTime),
  );
  const parTitre = new Map<string, Discipline>();
  const ajouter = (liste: string[], valeur?: string) => {
    if (valeur && !liste.includes(valeur)) liste.push(valeur);
  };

  for (const cours of tries) {
    const cle = cours.title.trim().toLowerCase();
    const discipline = parTitre.get(cle) ?? {
      titre: cours.title.trim(),
      niveaux: [],
      jours: [],
      profs: [],
    };
    ajouter(discipline.niveaux, cours.level);
    ajouter(discipline.jours, cours.dayOfWeek);
    ajouter(discipline.profs, cours.teacher?.name);
    parTitre.set(cle, discipline);
  }
  return [...parTitre.values()];
}

/**
 * Extrait du calendrier : les disciplines, leur niveau, leurs jours et leurs
 * profs — pas les horaires, qui restent la raison d'aller sur /cours. Tout est
 * lu dans les cours saisis dans l'admin : rien à tenir à jour ici.
 */
export function AccueilDisciplines({ courses }: { courses: Course[] }) {
  const disciplines = regrouper(courses);
  if (disciplines.length === 0) return null;

  return (
    <section
      aria-labelledby="accueil-disciplines"
      className={`container-page ${ESPACE_SECTION}`}
    >
      <EnteteSection
        id="accueil-disciplines"
        titre="Les cours de danse"
        lien="/cours"
        libelleLien="Le calendrier"
      />
      <ProximityGlow>
        {/* Deux colonnes dès le téléphone : empilées une par ligne, les sept
            disciplines prenaient 1 170 px à 390 de large. */}
        <Reveal className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {disciplines.map((discipline) => (
            <Link
              key={discipline.titre}
              href="/cours"
              className="block h-full rounded-[12px]"
            >
              <article
                data-glow-card
                className="card card-interactive cal-glow relative flex h-full flex-col gap-2 p-4 sm:p-6"
              >
                <h3 className="text-sm font-black uppercase leading-tight hyphens-auto sm:text-lg">
                  {discipline.titre}
                </h3>
                {discipline.niveaux.length > 0 && (
                  <p className="text-petit leading-snug text-secondary">
                    {discipline.niveaux.join(" · ")}
                  </p>
                )}
                <p className="mt-auto pt-3 font-mono text-label uppercase tracking-normal text-discret sm:tracking-widest">
                  {[
                    discipline.jours.join(" · "),
                    discipline.profs.length > 0 &&
                      `avec ${discipline.profs.join(", ")}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </article>
            </Link>
          ))}
        </Reveal>
      </ProximityGlow>
    </section>
  );
}
