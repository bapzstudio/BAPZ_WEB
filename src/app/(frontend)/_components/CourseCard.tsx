import type { Course } from "@/lib/types";
import { SpotlightCard } from "./SpotlightCard";

export function CourseCard({ course }: { course: Course }) {
  return (
    <SpotlightCard className="card flex flex-col p-[30px] transition-colors hover:border-white/35">
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

      <div className="mt-4 inline-flex w-fit items-center rounded-full border border-card-border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em]">
        Réserver
      </div>
    </SpotlightCard>
  );
}
