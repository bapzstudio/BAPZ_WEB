import type { Metadata } from "next";
import { AccueilDisciplines } from "./_sections/AccueilDisciplines";
import { AccueilEquipe } from "./_sections/AccueilEquipe";
import { AccueilPresentation } from "./_sections/AccueilPresentation";
import { AccueilQuestions } from "./_sections/AccueilQuestions";
import { AccueilStudio } from "./_sections/AccueilStudio";
import { AccueilTarifs } from "./_sections/AccueilTarifs";
import { Hero } from "./_sections/Hero";
import { Marquee } from "./_components/Marquee";
import { PageTransition } from "./_components/PageTransition";
import { prochainsCours } from "@/lib/planning";
import {
  getCourses,
  getPricingPlans,
  getRooms,
  getSiteSettings,
  getTeachers,
} from "@/lib/queries";
import { faqStructuredData, pageMetadata, serialiserJsonLd } from "@/lib/seo";

// Titre complet, utilisé tel quel pour l'accueil (cf. `pageMetadata`) : c'est
// ce que Google affiche en premier. « BAPZ Studio » seul ne contenait aucun
// des mots que les gens cherchent.
export const metadata: Metadata = pageMetadata({
  title: "Studio de danse à Metz - Heels, Hip-Hop, Commercial | BAPZ Studio",
  description:
    "Studio de danse à Ars-Laquenexy, à côté de Metz : cours de heels, hip-hop et commercial pour tous les niveaux. Cours d'essai, abonnements et location de salle.",
  path: "/",
});

// « Prochains cours » dépend de l'heure : la page, statique, est régénérée
// toutes les heures en plus des modifications faites dans l'admin.
export const revalidate = 3600;

/**
 * Accueil : la landing et les prochains cours (`Hero`), puis un extrait de
 * chaque page du site pour donner du contenu au référencement sans vider les
 * autres pages de leur intérêt — chaque section montre un aperçu et renvoie
 * vers la page complète. Tout vient de l'admin : cours, profs, tarifs, salles,
 * coordonnées, présentation et questions.
 */
export default async function Home() {
  const [settings, courses, plans, teachers, rooms] = await Promise.all([
    getSiteSettings(),
    getCourses(),
    getPricingPlans(),
    getTeachers(),
    getRooms(),
  ]);

  const handle = settings.instagramHandle?.toUpperCase() ?? "@BAPZ.STUDIO";
  const city = settings.city?.toUpperCase() ?? "METZ";
  const faq = faqStructuredData(settings.faq);

  return (
    <PageTransition>
      {/* flex-col + `mt-auto` sur le bandeau : quand la page est plus courte
          que l'écran, le vide se place avant le bandeau, qui reste collé au
          pied de page au lieu de paraître deux fois plus haut. */}
      <div className="flex flex-1 flex-col">
        {faq && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serialiserJsonLd(faq) }}
          />
        )}

        <Hero
          settings={settings}
          courses={prochainsCours(courses, new Date())}
          essai={plans.find((plan) => plan.group === "essai")}
        />

        <AccueilPresentation
          titre={settings.introTitle}
          texte={settings.introText}
        />
        <AccueilDisciplines courses={courses} />
        <AccueilEquipe teachers={teachers} intro={settings.teamIntro} />
        <AccueilTarifs plans={plans} rooms={rooms} />
        <AccueilStudio settings={settings} />
        <AccueilQuestions faq={settings.faq} />

        <div className="mt-auto pt-[var(--vr-104)]">
          <Marquee
            items={
              settings.marqueeItems?.length
                ? settings.marqueeItems
                : [city, handle]
            }
          />
        </div>
      </div>
    </PageTransition>
  );
}
