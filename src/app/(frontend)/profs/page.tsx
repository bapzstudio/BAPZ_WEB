import type { Metadata } from "next";
import { FoldText } from "../_components/FoldText";
import { PageTransition } from "../_components/PageTransition";
import { ProximityGlow } from "../_components/ProximityGlow";
import { Reveal } from "../_components/Reveal";
import { TeacherCard } from "../_components/TeacherCard";
import { getTeachers } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Les profs",
  description:
    "L'équipe de BAPZ Studio à Metz : Léna Bapz (heels), Lara (street dance) et Alessia (contemporain lyrical).",
  path: "/profs",
});

export default async function ProfsPage() {
  // Seuls les profs qui ont une fiche (portrait et présentation) : la règle
  // vit dans `getTeachers`, la même que pour leur page personnelle.
  const profiles = await getTeachers();

  return (
    <PageTransition>
      {/* pb-8.5 : la maquette laisse 34px entre le bas des cartes (y=993) et le
          filet du footer (y=1027), ce qui fait tenir la page dans un écran de
          1080. */}
      <div className="container-page pt-[var(--vr-104)] pb-8.5">
        <h1 className="titre-page">
          <FoldText text="Les profs" />
        </h1>

        {/* Montage de /tarifs : ProximityGlow autour, Reveal porteur de la
            grille. Le halo cherche ses cartes par `[data-glow-card]`, donc ce
            niveau de plus ne le gêne pas, et les espacements mesurés restent
            sur la grille. */}
        <ProximityGlow>
          <Reveal className="mt-[var(--vr-64)] grid gap-8.5 md:grid-cols-2 xl:grid-cols-3">
            {profiles.map((teacher, index) => (
              <TeacherCard
                key={teacher._id}
                teacher={teacher}
                prioritaire={index === 0}
              />
            ))}
          </Reveal>
        </ProximityGlow>
      </div>
    </PageTransition>
  );
}
