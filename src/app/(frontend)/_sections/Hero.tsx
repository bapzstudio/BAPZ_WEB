import Link from "next/link";
import { lienReservation } from "@/lib/reservation/liens";
import type { Course, PricingPlan, SiteSettings } from "@/lib/types";
import { CourseCard } from "../_components/CourseCard";
import { FoldText } from "../_components/FoldText";
import { Marquee } from "../_components/Marquee";
import { ProximityGlow } from "../_components/ProximityGlow";
import { Reveal } from "../_components/Reveal";

export function Hero({
  settings,
  courses,
  essai,
}: {
  settings: SiteSettings;
  courses: Course[];
  /** Tarif « Offre d'essai » : son prix est repris sur le bouton. */
  essai?: PricingPlan;
}) {
  const handle = settings.instagramHandle?.toUpperCase() ?? "@BAPZ.STUDIO";
  const city = settings.city?.toUpperCase() ?? "METZ";

  return (
    <div>
      <div className="hero-glow">
        {/* relative z-10 : les halos sont des pseudo-éléments positionnés, le
            contenu doit passer au-dessus. */}
        {/* pb-6 : la maquette laisse 25px entre le bas des boutons (y=539) et le
            haut de « PROCHAINS COURS » (y=564). Le pb-24 d'origine en mettait
            96, à lui seul la cause du défilement de la page d'accueil. */}
        <div className="container-page relative z-10 pt-16 pb-6">
          <p className="eyebrow">
            [ {city} - {handle} ]
          </p>

          {/* Le \n de la donnée pilote la coupe du titre (FoldText le convertit
              en <br>). Les tailles restent portées par le h1. */}
          <h1 className="mt-6 text-[clamp(44px,8.3vw,158px)] font-black uppercase leading-[0.94] tracking-[-0.02em]">
            <FoldText text={settings.heroTitle} splitBy="word" hinge="top" />
          </h1>

          {/* Le retour à la ligne de la donnée cale la coupe sur la largeur de la
              maquette ; sur téléphone il laissait un mot seul sur sa ligne, le
              texte y coule donc normalement, plus près du titre. */}
          <p className="mt-6 max-w-160 text-base leading-[1.3] text-secondary sm:mt-11 sm:whitespace-pre-line">
            {settings.heroSubtitle}
          </p>

          {/* Sur téléphone : pleine largeur, rapprochés, et l'essai — le bouton
              principal — en premier. L'ordre et l'écart de la maquette
              reprennent à partir de `sm`. */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-7">
            <Link href="/cours" className="pill pill-outline w-full sm:w-auto">
              Calendrier
            </Link>
            <Link
              href={lienReservation({ type: "essai" })}
              className="pill pill-light order-first w-full sm:order-none sm:w-auto"
            >
              {/* Le prix vient du tarif lui-même : saisi une seule fois, dans
                  Tarifs, il ne peut plus différer entre le bouton et la page. */}
              {essai ? `Cours d'essai - ${essai.price}` : "Cours d'essai"}
            </Link>
          </div>
        </div>
      </div>

      {/* Le bas de page entre au défilement, pour prolonger le geste du titre
          au lieu de le laisser retomber sur un bloc inerte. */}
      <div className="container-page pb-14">
        <Reveal className="mb-7 flex items-end justify-between gap-4">
          {/* En 28px le titre se coupait sur deux lignes à côté de « Tout voir ».
              5,2vw le garde sur une ligne jusqu'à 360px de large. */}
          <h2 className="text-[clamp(18px,5.2vw,28px)] font-black uppercase leading-none tracking-tight sm:text-[clamp(28px,2.05vw,39px)]">
            Prochains cours
          </h2>
          <Link
            href="/cours"
            className="-my-2 shrink-0 py-2 font-mono text-xs text-tertiary transition-colors hover:text-foreground"
          >
            TOUT VOIR →
          </Link>
        </Reveal>
        <ProximityGlow>
          {/* Sur téléphone, carrousel horizontal plutôt que trois cartes
              empilées (600px de défilement) : une carte à 85 % de la largeur,
              la suivante qui dépasse pour inviter à glisser, arrêt sur chaque
              carte. Il déborde jusqu'aux bords de l'écran (-mx-6 compense la
              marge de `.container-page`) ; `py-3` évite de rogner l'entrée de
              `Reveal` (12px) et le contour de focus, un conteneur à
              défilement coupant aussi ce qui dépasse en hauteur. Grille de la
              maquette à partir de `sm`. */}
          <Reveal className="-mx-6 -my-3 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 py-3 [scrollbar-width:none] sm:mx-0 sm:my-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:py-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
            {courses.map((course) => (
              <div key={course._id} className="w-[85%] shrink-0 snap-start sm:w-auto">
                <CourseCard course={course} />
              </div>
            ))}
          </Reveal>
        </ProximityGlow>
      </div>

      <Marquee items={settings.marqueeItems ?? [city, handle]} />
    </div>
  );
}
