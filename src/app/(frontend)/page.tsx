import type { Metadata } from "next";
import { Hero } from "./_sections/Hero";
import { PageTransition } from "./_components/PageTransition";
import { prochainsCours } from "@/lib/planning";
import { getCourses, getPricingPlans, getSiteSettings } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Accueil",
  description:
    "Studio de danse à Metz : cours de heels, hip-hop et commercial, tous niveaux. Cours d'essai, location de salle.",
  path: "/",
});

// « Prochains cours » dépend de l'heure : la page, statique, est régénérée
// toutes les heures en plus des modifications faites dans l'admin.
export const revalidate = 3600;

export default async function Home() {
  const [settings, courses, plans] = await Promise.all([
    getSiteSettings(),
    getCourses(),
    getPricingPlans(),
  ]);

  // La maquette de l'accueil montre 3 cartes en aperçu ; le planning complet
  // est sur /cours.
  return (
    <PageTransition>
      <Hero
        settings={settings}
        courses={prochainsCours(courses, new Date())}
        essai={plans.find((plan) => plan.group === "essai")}
      />
    </PageTransition>
  );
}
