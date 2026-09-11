import Link from "next/link";
import { formaterHeure } from "@/lib/reservation/format";
import { lienReservation } from "@/lib/reservation/liens";
import type { Course } from "@/lib/types";

export function CourseCard({
  course,
  hideTeacher = false,
}: {
  course: Course;
  /** Sur la page d'un prof, répéter son nom sur chacune de ses cartes n'apprend rien. */
  hideTeacher?: boolean;
}) {
  const teacher = hideTeacher ? undefined : course.teacher;
  return (
    // La carte entière est cliquable, pas seulement la pastille : c'est la
    // promesse faite par la page Calendrier ("clique sur un cours pour
    // réserver"). Elle ouvre le parcours de réservation, ce cours déjà choisi.
    <Link
      href={lienReservation({ type: "essai", cours: course.slug })}
      className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
    >
      {/* `.card` reste la carte mesurée de l'accueil (bordure plate, rayon 12),
          différente de la `.cal-card` des autres pages : c'est la maquette qui
          le veut. Seule l'interaction est commune — `cal-glow` allume la
          bordure comme partout ailleurs. */}
      <div
        data-glow-card
        className="card card-interactive cal-glow relative flex h-full flex-col p-6 sm:p-[30px]"
      >
        <div className="flex items-baseline justify-between gap-4">
          {/* La maquette affiche ce libellé très sombre (#3c3c3c) : remonté à 45%
              d'opacité pour rester lisible une fois rempli avec de vraies données. */}
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/45">
            {course.dayOfWeek} - {formaterHeure(course.startTime)}
          </div>
          {/* Sur téléphone, une flèche remplace la pastille « Réserver » : la
              carte entière est déjà le lien, la pastille répétée sur chaque
              carte alourdissait l'accueil. */}
          <span aria-hidden className="text-tertiary sm:hidden">
            →
          </span>
        </div>

        <div className="mt-4 text-[clamp(24px,1.55vw,29px)] font-black uppercase leading-none tracking-tight sm:mt-6">
          {course.title}
        </div>

        {(course.level || teacher) && (
          <div className="mt-2.5 text-sm text-secondary">
            {course.level}
            {course.level && teacher && " - "}
            {teacher && `avec ${teacher.name}`}
          </div>
        )}

        {/* Pastille décorative : c'est le lien parent qui porte l'interaction,
            imbriquer un second élément cliquable serait invalide. */}
        <div className="mt-4 hidden w-fit items-center gap-2 rounded-full sm:inline-flex border border-card-border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors group-hover:border-white/35">
          Réserver
          <span
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
