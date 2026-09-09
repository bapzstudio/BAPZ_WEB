import Link from "next/link";
import type { Course } from "@/lib/types";
import { SpotlightCard } from "./SpotlightCard";

export function CourseCard({ course }: { course: Course }) {
  return (
    // La carte entière est cliquable, pas seulement la pastille : c'est la
    // promesse faite par la page Calendrier ("clique sur un cours pour
    // réserver"). Faute de système de réservation, elle mène au formulaire de
    // contact, comme le bouton "cours d'essai" du hero.
    <Link
      href="/contact"
      className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
    >
      <SpotlightCard className="card card-interactive flex h-full flex-col p-[30px]">
        {/* La maquette affiche ce libellé très sombre (#3c3c3c) : remonté à 45%
            d'opacité pour rester lisible une fois rempli avec de vraies données. */}
        <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/45">
          {course.dayOfWeek} - {course.startTime}
        </div>

        <div className="mt-6 text-[clamp(24px,1.55vw,29px)] font-black uppercase leading-none tracking-tight">
          {course.title}
        </div>

        {(course.level || course.teacher) && (
          <div className="mt-2.5 text-sm text-secondary">
            {course.level}
            {course.level && course.teacher && " - "}
            {course.teacher && `avec ${course.teacher.name}`}
          </div>
        )}

        {/* Pastille décorative : c'est le lien parent qui porte l'interaction,
            imbriquer un second élément cliquable serait invalide. */}
        <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-card-border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors group-hover:border-white/35">
          Réserver
          <span
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        </div>
      </SpotlightCard>
    </Link>
  );
}
