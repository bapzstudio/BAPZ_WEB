import type { Metadata } from "next";
import { PageTransition } from "../_components/PageTransition";
import { WeekSchedule } from "../_components/WeekSchedule";
import { getCourses } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Calendrier des cours - BAPZ Studio",
  description:
    "Planning des cours de danse à Metz : heels, hip hop/commercial, street enfant. Tous niveaux.",
};

export default async function CoursPage() {
  const courses = await getCourses();

  return (
    <PageTransition>
      <div className="container-page pt-26 pb-24">
        <h1 className="text-[clamp(38px,3.1vw,59px)] font-black uppercase leading-none tracking-tight">
          Calendrier
        </h1>
        <p className="eyebrow mt-6">
          SEMAINE TYPE - CLIQUE SUR UN COURS POUR RÉSERVER
        </p>

        <div className="mt-23">
          <WeekSchedule courses={courses} />
        </div>
      </div>
    </PageTransition>
  );
}
