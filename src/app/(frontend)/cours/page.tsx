import type { Metadata } from "next";
import { FoldText } from "../_components/FoldText";
import { PageTransition } from "../_components/PageTransition";
import { Reveal } from "../_components/Reveal";
import { WeekSchedule } from "../_components/WeekSchedule";
import { getCourses, getSiteSettings } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Planning des cours de danse à Metz",
  // Les disciplines sont celles réellement au planning : « street enfant »
  // y figurait encore le 2026-11-16 alors que le cours n'existe plus.
  description:
    "Planning hebdomadaire des cours de danse de BAPZ Studio, près de Metz : heels, commercial, hip-hop et contemporain lyrical, du débutant à l'intermédiaire.",
  path: "/cours",
});

// Un événement daté sort du planning une fois passé : la page, statique, est
// régénérée toutes les heures en plus des modifications faites dans l'admin.
export const revalidate = 3600;

export default async function CoursPage() {
  const [courses, settings] = await Promise.all([
    getCourses(),
    getSiteSettings(),
  ]);

  // Texte des Réglages, découpé comme la présentation de l'accueil : une ligne
  // vide sépare deux paragraphes. Vide, rien ne s'affiche.
  const paragraphes = (settings.scheduleIntro ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <PageTransition>
      <div className="container-page pt-[var(--vr-104)] pb-8.5">
        <h1 className="titre-page">
          <FoldText text="Calendrier" />
        </h1>
        <p className="eyebrow mt-6">
          SEMAINE TYPE - CLIQUE SUR UN COURS POUR RÉSERVER
        </p>

        {paragraphes.length > 0 && (
          <Reveal className="mt-7 flex max-w-190 flex-col gap-4 text-base leading-[1.55] text-secondary sm:text-lg">
            {paragraphes.map((paragraphe) => (
              <p key={paragraphe}>{paragraphe}</p>
            ))}
          </Reveal>
        )}

        <div
          className={
            paragraphes.length > 0 ? "mt-[var(--vr-64)]" : "mt-[var(--vr-92)]"
          }
        >
          <WeekSchedule courses={courses} />
        </div>
      </div>
    </PageTransition>
  );
}
