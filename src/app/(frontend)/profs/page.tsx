import type { Metadata } from "next";
import { PageTransition } from "../_components/PageTransition";
import { TeacherCard } from "../_components/TeacherCard";
import { getTeachers } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Les profs - BAPZ Studio",
  description:
    "L'équipe de BAPZ Studio à Metz : Léna Bapz (heels), Lara (street dance) et Alessia (contemporain lyrical).",
};

export default async function ProfsPage() {
  const teachers = await getTeachers();

  // Seuls les profs ayant un portrait et une bio sont présentés ici. Les
  // intervenants du calendrier sans fiche fournie ne s'affichent pas.
  const profiles = teachers.filter((t) => t.photo && t.bio?.length);

  return (
    <PageTransition>
      <div className="container-page pt-26 pb-24">
        <h1 className="text-[clamp(38px,3.1vw,59px)] font-black uppercase leading-none tracking-tight">
          Les profs
        </h1>

        <div className="mt-16 grid gap-8.5 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((teacher) => (
            <TeacherCard key={teacher._id} teacher={teacher} />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
