import type { Course } from "@/lib/types";

/** Un cours est un événement s'il a une couleur ou une date. */
export const estEvenement = (course: Course) =>
  Boolean(course.color || course.date);

/**
 * Libellé « Événement » des cartes de cours colorées ou datées. Sans lui, seule
 * la couleur distinguait un événement : invisible pour qui perçoit mal les
 * couleurs, et muet pour un lecteur d'écran. Dans la couleur de la carte s'il
 * y en a une (cf. `.cal-card[data-couleur]`), en gris secondaire sinon.
 */
export function PastilleEvenement({
  course,
  className = "",
}: {
  course: Course;
  className?: string;
}) {
  if (!estEvenement(course)) return null;
  return (
    <span
      className={`inline-block w-fit rounded-full border px-2 py-0.5 font-mono text-label leading-none tracking-widest uppercase ${
        course.color
          ? "border-[rgb(var(--couleur-rgb)/0.6)] text-[rgb(var(--couleur-rgb))]"
          : "border-rule text-secondary"
      } ${className}`}
    >
      Événement
    </span>
  );
}
