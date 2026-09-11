import Link from "next/link";
import { formaterHeure, JOURS, minutes } from "@/lib/reservation/format";
import { lienReservation } from "@/lib/reservation/liens";
import type { Course } from "@/lib/types";
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

function CalendarCard({ course }: { course: Course }) {
  return (
    // L'eyebrow de la page annonce « clique sur un cours pour réserver » : la
    // carte entière est donc un lien, qui ouvre le parcours de réservation avec
    // ce cours déjà choisi, comme les cartes de l'accueil.
    <Link
      href={lienReservation({ type: "essai", cours: course.slug })}
      className="group block h-full rounded-[15px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
    >
      <div
        data-glow-card
        className="cal-card cal-glow relative flex h-full flex-col p-5"
      >
      <div className="flex items-baseline justify-between gap-2 font-mono text-[11px] text-rule">
        {/* Même format d'heure que le reste du site (« 19h00 »), en capitales
            comme sur la maquette : la salle, elle, garde sa casse. */}
        <span className="uppercase">
          {formaterHeure(course.startTime)} - {formaterHeure(course.endTime)}
        </span>
        {course.room && <span>{course.room}</span>}
      </div>

      <div className="mt-5 text-lg font-black uppercase leading-tight">
        {course.title}
      </div>

      {course.level && (
        <div className="mt-2 text-[13px] leading-snug text-secondary">
          {course.level}
        </div>
      )}
        {course.teacher && (
          <div className="text-[13px] leading-snug text-secondary">
            {course.teacher.name}
          </div>
        )}
      </div>
    </Link>
  );
}

function DayHeader({ day }: { day: string }) {
  return (
    <>
      <div className="font-mono text-base uppercase tracking-widest text-rule">
        {day}
      </div>
      <div className="mt-4 h-px bg-rule-faint" />
    </>
  );
}

export function WeekSchedule({ courses }: { courses: Course[] }) {
  const placed = place(courses);

  // Seules les bandes réellement occupées sont rendues : évite une rangée vide
  // de 126px quand le studio n'a aucun cours le matin, par exemple.
  const usedBands = [
    ...new Set(
      placed.flatMap((p) =>
        Array.from(
          { length: p.endBand - p.startBand + 1 },
          (_, i) => p.startBand + i
        )
      )
    ),
  ].sort((a, b) => a - b);

  const rowOf = (band: number) => usedBands.indexOf(band) + 1;

  // Les cours démarrant le même jour dans la même bande sont empilés dans la
  // cellule plutôt que superposés.
  const cells = new Map<
    string,
    { day: number; startBand: number; endBand: number; courses: Course[] }
  >();
  for (const p of placed) {
    const key = `${p.day}-${p.startBand}`;
    const cell = cells.get(key);
    if (cell) {
      cell.endBand = Math.max(cell.endBand, p.endBand);
      cell.courses.push(p.course);
    } else {
      cells.set(key, {
        day: p.day,
        startBand: p.startBand,
        endBand: p.endBand,
        courses: [p.course],
      });
    }
  }

  const daysWithCourses = JOURS.map((day, index) => ({
    day,
    courses: placed
      .filter((p) => p.day === index)
      .map((p) => p.course)
      .sort((a, b) => minutes(a.startTime) - minutes(b.startTime)),
  })).filter((d) => d.courses.length > 0);

  return (
    <ProximityGlow>
      {/* Grille hebdomadaire complète, à partir de xl seulement */}
      <div className="hidden xl:block">
        <div className="grid grid-cols-7 gap-x-7.5">
          {JOURS.map((day) => (
            <div key={day} className="text-center">
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
            {[...cells.values()].map((cell) => (
              <div
                key={`${cell.day}-${cell.startBand}`}
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
      </div>

      {/* En dessous de xl : une liste par jour, la grille 7 colonnes étant
          illisible sur écran étroit. */}
      <div className="flex flex-col gap-10 xl:hidden">
        {daysWithCourses.map(({ day, courses: dayCourses }) => (
          <div key={day}>
            <DayHeader day={day} />
            <div className="mt-4.5 grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
              {dayCourses.map((course) => (
                <CalendarCard key={course._id} course={course} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ProximityGlow>
  );
}
