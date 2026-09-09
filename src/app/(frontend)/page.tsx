import type { Metadata } from "next";
import { Hero } from "./_sections/Hero";
import { PageTransition } from "./_components/PageTransition";
import { getCourses, getSiteSettings } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Accueil",
  description:
    "Studio de danse à Metz : cours de heels, hip-hop et commercial, tous niveaux. Cours d'essai, location de salle.",
  path: "/",
});

export default async function Home() {
  const [settings, courses] = await Promise.all([
    getSiteSettings(),
    getCourses(),
  ]);

  // La maquette de l'accueil montre 3 cartes en aperçu ; le planning complet
  // est sur /cours.
  return (
    <PageTransition>
      <Hero settings={settings} courses={courses.slice(0, 3)} />
    </PageTransition>
  );
}
