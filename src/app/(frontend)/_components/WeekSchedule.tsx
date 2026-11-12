import Link from "next/link";
import { attributsCouleur } from "@/lib/couleurs";
import {
  formaterDate,
  formaterHeure,
  JOURS,
  minutes,
} from "@/lib/reservation/format";
import { lienReservation } from "@/lib/reservation/liens";
import type { Course } from "@/lib/types";
import { CalendrierAnimations } from "./CalendrierAnimations";
import { CalendrierGrille } from "./CalendrierGrille";
import { estEvenement, PastilleEvenement } from "./PastilleEvenement";
import { ProximityGlow } from "./ProximityGlow";

// Modèle déduit de la maquette : les cartes ne sont pas proportionnelles à la
// durée (elles font toutes la même hauteur), elles sont rangées dans trois
// bandes horaires et s'étendent sur les bandes que couvre leur créneau.
const BAND_BOUNDS = [12 * 60, 19 * 60]; // matin | après-midi | soir

const bandOf = (minute: number) =>
  minute < BAND_BOUNDS[0] ? 0 : minute < BAND_BOUNDS[1] ? 1 : 2;

type Placed = {
  course: Course;
  day: number;
  startBand: number;
  endBand: number;
};

function place(courses: Course[]): Placed[] {
  return courses.flatMap((course) => {
    const day = JOURS.indexOf(course.dayOfWeek);
    if (day === -1) return [];
    const start = minutes(course.startTime);
    // -1 minute : un cours qui finit à 19:00 appartient encore à l'après-midi.
    const end = Math.max(start, minutes(course.endTime) - 1);
    return [{ course, day, startBand: bandOf(start), endBand: bandOf(end) }];
  });
}

type Cellule = {
  day: number;
  startBand: number;
  endBand: number;
  courses: Course[];
};

/**
 * Regroupe les cours d'une colonne en cellules qui ne se croisent jamais.
 *
 * Chaque cellule est posée dans la grille par `gridColumn` / `gridRow` : deux
 * cellules d'une même colonne dont les plages de lignes se croisent se
 * peignent donc l'une sur l'autre. C'est arrivé dès qu'un cours franchissait
 * une frontière de bande — un cours de 18h30 à 19h30 occupe l'après-midi ET le
 * soir, et se superposait à celui qui commence à 19h35 (constaté par la
 * cliente le 2026-11-12, sur deux colonnes à la fois). Grouper par bande de
 * DÉPART, comme on le faisait, ne suffit pas : ce qui doit partager une
 * cellule, c'est ce qui partage une bande, quelle qu'en soit l'origine.
 *
 * On fusionne donc, jour par jour, toute suite de cours dont les bandes se
 * touchent, et leurs cartes s'empilent dans la cellule résultante — ce qui est
 * aussi le rendu honnête de deux cours qui ont bien lieu en même temps (un
 * training libre de 8h à 22h et un stage à 15h).
 *
 * Les cours sont triés par heure de début, qui donne le même ordre que la
 * bande de départ (`bandOf` est croissante) : le tri sert donc à la fois à la
 * fusion et à l'ordre de lecture des cartes.
 */
function cellules(placed: Placed[]): Cellule[] {
  const cells: Cellule[] = [];

  for (let day = 0; day < JOURS.length; day++) {
    const duJour = placed
      .filter((p) => p.day === day)
      .sort(
        (a, b) => minutes(a.course.startTime) - minutes(b.course.startTime),
      );

    let courante: Cellule | undefined;
    for (const p of duJour) {
      if (courante && p.startBand <= courante.endBand) {
        courante.endBand = Math.max(courante.endBand, p.endBand);
        courante.courses.push(p.course);
      } else {
        courante = {
          day,
          startBand: p.startBand,
          endBand: p.endBand,
          courses: [p.course],
        };
        cells.push(courante);
      }
    }
  }

  return cells;
}

function CalendarCard({ course }: { course: Course }) {
  return (
    // L'eyebrow de la page annonce « clique sur un cours pour réserver » : la
    // carte entière est donc un lien, qui ouvre le parcours de réservation avec
    // ce cours déjà choisi, comme les cartes de l'accueil.
    <Link
      href={lienReservation({ type: "essai", cours: course.slug })}
      className="group block h-full rounded-[15px]"
    >
      {/* Dans la grille (à partir de 1440 px, seule largeur où une carte
          s'affiche en colonne), la marge intérieure et le titre suivent la
          fenêtre : valeurs de la maquette à 1920, réduites en dessous. À taille
          fixe, les titres en capitales sortaient des cartes à toute largeur
          sous 1920 (« CONTEMPORAIN » de 38 px à 1440). La césure française
          (`hyphens-auto`, le document étant en `lang="fr"`) sert de filet. Sous
          1440 px, la carte est dans la liste et garde ses valeurs fixes. */}
      <div
        data-glow-card
        {...attributsCouleur(course.color)}
        className="cal-card cal-glow relative flex h-full flex-col p-5 min-[1440px]:p-[clamp(14px,1.04vw,20px)]"
      >
        {/* Horaire et salle ne se coupent jamais : quand la colonne est trop
            étroite, la salle passe sous l'horaire au lieu que chacun se casse
            sur deux lignes. Sur la carte d'un événement, ils prennent sa
            couleur (cf. `.cal-card[data-couleur]`). */}
        <div
          className={`flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 font-mono text-label ${
            course.color ? "text-[rgb(var(--couleur-rgb))]" : "text-discret"
          }`}
        >
          {/* Même format d'heure que le reste du site (« 19h00 »), en capitales
            comme sur la maquette : la salle, elle, garde sa casse. Un
            événement daté porte sa date devant l'horaire : la colonne dit
            déjà le jour de la semaine. */}
          <span className="whitespace-nowrap uppercase">
            {course.date && `${formaterDate(course.date)} · `}
            {formaterHeure(course.startTime)} - {formaterHeure(course.endTime)}
          </span>
          {course.room && (
            <span className="whitespace-nowrap">{course.room}</span>
          )}
        </div>

        <PastilleEvenement course={course} className="mt-4" />

        <div
          className={`${estEvenement(course) ? "mt-2.5" : "mt-5"} text-lg font-black uppercase leading-tight hyphens-auto min-[1440px]:text-[clamp(14px,0.94vw,18px)]`}
        >
          {course.title}
        </div>

        {course.level && (
          <div className="mt-2 text-petit leading-snug text-secondary">
            {course.level}
          </div>
        )}
        {course.teacher && (
          <div className="text-petit leading-snug text-secondary">
            {course.teacher.name}
          </div>
        )}
      </div>
    </Link>
  );
}

function DayHeader({ day }: { day: string }) {
  // Les attributs `data-jour-…` repèrent le nom et le filet pour les deux
  // affichages : CalendrierAnimations pour la liste, CalendrierGrille pour la
  // grille.
  return (
    <>
      <div
        data-jour-titre=""
        className="font-mono text-base uppercase tracking-widest text-discret"
      >
        {day}
      </div>
      <div data-jour-filet="" className="mt-4 h-px bg-rule-faint" />
    </>
  );
}

/** « Lundi » -> « lundi » : identifiant d'ancre de la liste par jour. */
const ancreJour = (day: string) => day.toLowerCase();

export function WeekSchedule({ courses }: { courses: Course[] }) {
  const placed = place(courses);

  // Seules les bandes réellement occupées sont rendues : évite une rangée vide
  // de 126px quand le studio n'a aucun cours le matin, par exemple.
  const usedBands = [
    ...new Set(
      placed.flatMap((p) =>
        Array.from(
          { length: p.endBand - p.startBand + 1 },
          (_, i) => p.startBand + i,
        ),
      ),
    ),
  ].sort((a, b) => a - b);

  const rowOf = (band: number) => usedBands.indexOf(band) + 1;

  const cells = cellules(placed);

  const daysWithCourses = JOURS.map((day, index) => ({
    day,
    courses: placed
      .filter((p) => p.day === index)
      .map((p) => p.course)
      .sort((a, b) => minutes(a.startTime) - minutes(b.startTime)),
  })).filter((d) => d.courses.length > 0);

  return (
    <ProximityGlow>
      {/* Grille hebdomadaire complète, à partir de 1440 px seulement : en
          dessous, sept colonnes ne laissent pas la place aux titres des cours
          (mesuré : ils sortaient des cartes de 60 px à 1280). Les attributs
          `data-grille…` servent à CalendrierGrille : entrée au défilement et
          colonne éclairée au survol. Seuil repris dans CalendrierAnimations,
          à changer ensemble. */}
      <div
        data-grille=""
        data-grille-pending=""
        className="hidden min-[1440px]:block"
      >
        <div className="grid grid-cols-7 gap-x-7.5">
          {JOURS.map((day, index) => (
            <div key={day} data-grille-jour={index} className="text-center">
              <DayHeader day={day} />
            </div>
          ))}
        </div>

        {usedBands.length > 0 && (
          <div
            className="mt-4.5 grid grid-cols-7 gap-x-7.5 gap-y-4.5"
            style={{
              gridTemplateRows: `repeat(${usedBands.length}, minmax(126px, auto))`,
            }}
          >
            {cells.map((cell) => (
              <div
                key={`${cell.day}-${cell.startBand}`}
                data-grille-cellule={cell.day}
                className="flex flex-col gap-4.5"
                style={{
                  gridColumn: cell.day + 1,
                  gridRow: `${rowOf(cell.startBand)} / ${
                    rowOf(cell.endBand) + 1
                  }`,
                }}
              >
                {cell.courses.map((course) => (
                  <CalendarCard key={course._id} course={course} />
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 h-px bg-rule-faint" />

        <CalendrierGrille />
      </div>

      {/* En dessous de 1440 px : une liste par jour, la grille 7 colonnes
          étant illisible sur écran étroit. Sur 2,5 écrans de téléphone, une
          barre des jours reste collée sous la nav (67 px) pour s'y retrouver
          et sauter à un jour ; CalendrierAnimations y fait glisser la pastille
          et anime l'entrée de chaque jour. */}
      <div className="min-[1440px]:hidden">
        <nav
          aria-label="Jours de la semaine"
          data-jours-barre=""
          className="sticky top-[67px] z-30 -mx-6 mb-8 overflow-x-auto border-b border-rule-faint bg-background px-6 py-3 [scrollbar-width:none] lg:-mx-10 lg:px-10 [&::-webkit-scrollbar]:hidden"
        >
          <div className="relative flex w-max gap-1">
            <span
              aria-hidden
              data-jours-pastille=""
              className="absolute top-0 left-0 rounded-full bg-light opacity-0"
            />
            {daysWithCourses.map(({ day }) => (
              <a
                key={day}
                href={`#${ancreJour(day)}`}
                data-jour-lien={ancreJour(day)}
                className="relative rounded-full px-3 py-1.5 font-mono text-label tracking-widest text-secondary uppercase transition-colors duration-300 aria-current:text-background"
              >
                {day.slice(0, 3)}
              </a>
            ))}
          </div>
        </nav>

        <div className="flex flex-col gap-10">
          {daysWithCourses.map(({ day, courses: dayCourses }) => (
            <section
              key={day}
              id={ancreJour(day)}
              data-jour={ancreJour(day)}
              data-jour-pending=""
              aria-label={day}
              className="scroll-mt-36"
            >
              <DayHeader day={day} />
              <div
                data-jour-cartes=""
                className="mt-4.5 grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {dayCourses.map((course) => (
                  <CalendarCard key={course._id} course={course} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <CalendrierAnimations />
      </div>
    </ProximityGlow>
  );
}
