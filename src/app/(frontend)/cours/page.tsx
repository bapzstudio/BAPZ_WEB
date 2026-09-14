import type { Metadata } from "next";
import { FoldText } from "../_components/FoldText";
import { PageTransition } from "../_components/PageTransition";
import { WeekSchedule } from "../_components/WeekSchedule";
import { getCourses } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Calendrier des cours",
  description:
    "Planning des cours de danse à Metz : heels, hip hop/commercial, street enfant. Tous niveaux.",
  path: "/cours",
});

export default async function CoursPage() {
  const courses = await getCourses();

  return (
    <PageTransition>
      <div className="container-page pt-[var(--vr-104)] pb-8.5">
        <h1 className="titre-page">
          <FoldText text="Calendrier" />
        </h1>
        <p className="eyebrow mt-6">
          SEMAINE TYPE - CLIQUE SUR UN COURS POUR RÉSERVER
        </p>

        <div className="mt-[var(--vr-92)]">
          <WeekSchedule courses={courses} />
        </div>
      </div>
    </PageTransition>
  );
}
