import Link from "next/link";
import { lienReservation } from "@/lib/reservation/liens";
import type { Course, PricingPlan, SiteSettings } from "@/lib/types";
import { CourseCard } from "../_components/CourseCard";
import { DegradeHero } from "../_components/DegradeHero";
import { FoldText } from "../_components/FoldText";
import { PlaneteDessinee } from "../_components/PlaneteDessinee";
import { ProximityGlow } from "../_components/ProximityGlow";
import { Reveal } from "../_components/Reveal";

/**
 * Haut de l'accueil : la landing (premier écran) et le deuxième écran
 * (boutons, prochains cours). Les sections de contenu et le bandeau défilant
 * qui suivent sont posés par `page.tsx`.
 */
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
    <>
      {/* Premier écran : le titre qui se déplie et le logo qui se dessine, et
          rien d'autre. Le reste de l'accueil vient au défilement.
          C'est un écart assumé avec la maquette, qui fait tenir tout l'accueil
          dans un écran : à montrer à la cliente.
          100svh et non 100vh : sur téléphone, `vh` compte la barre d'adresse
          rétractée, donc l'invite à défiler tombait sous l'écran. Moins les
          67px de la nav (66 + son filet), qui est collante. */}
      <section className="hero-glow flex min-h-[calc(100svh-67px)] flex-col">
        {/* Dégradé animé en WebGL (cf. DegradeHero), sous le contenu.
            Chargé après la page ; sans WebGL 2 ou sans JavaScript, les halos
            CSS de `.hero-glow` restent seuls. */}
        <DegradeHero className="absolute inset-0" />
        {/* relative z-10 : les halos sont des pseudo-éléments positionnés, le
            contenu doit passer au-dessus. */}
        {/* Titre haut, planète basse : sur écran large les deux se croisaient,
            le mot BAPZ du logo passant sous la fin du titre. */}
        <div className="container-page relative z-10 flex flex-1 flex-col justify-start pt-[min(12vh,88px)] pb-8 sm:pt-[min(10vh,96px)]">
          <p className="eyebrow">
            [ {city} - {handle} ]
          </p>

          {/* Le \n de la donnée pilote la coupe du titre (FoldText le convertit
              en <br>). Les tailles restent portées par le h1. */}
          <h1 className="mt-6 text-[clamp(44px,8.3vw,158px)] font-black uppercase leading-[0.94] tracking-[-0.02em]">
            <FoldText text={settings.heroTitle} />
          </h1>

          {/* Le sous-titre reste avec le titre, sur la landing : sans lui, le
              premier écran laissait un grand vide sous le titre.
              Le retour à la ligne de la donnée cale la coupe sur la largeur de
              la maquette ; sur téléphone il laissait un mot seul sur sa ligne,
              le texte y coule donc normalement.
              Taille : celle de la maquette (16px) jusqu'à ~1400px de large,
              puis elle suit la fenêtre comme le titre — sinon, à côté d'un
              titre de 158px sur la landing, il paraissait perdu. Écart avec la
              maquette, assumé, limité à la landing. */}
          <p className="mt-6 max-w-160 text-base leading-[1.35] text-secondary sm:mt-9 sm:max-w-[min(52vw,720px)] sm:text-[clamp(17px,1.45vw,24px)] sm:whitespace-pre-line">
            {settings.heroSubtitle}
          </p>

          {/* Le logo du studio se dessine ligne par ligne pendant que le titre
              se déplie, en filigrane.
              Sur téléphone, centré dans l'espace qui reste sous le sous-titre
              (`flex-1`), à sa taille au plus : posé en bas de l'écran, il
              remontait derrière le texte sur les petits téléphones (440x680).
              `min-h-20` lui garde une taille visible quand le texte prend
              presque tout l'écran, sans pousser la flèche hors de l'écran
              (`min-h-40` allongeait la landing de 78px à 360x640).
              À partir de `sm`, l'enveloppe devient `static` et la planète se
              place sur le conteneur : son bord droit tombe sur la ligne du
              conteneur, comme tout le reste du site. `right-0` porterait sur la
              boîte du conteneur, gouttière comprise, et la planète toucherait le
              bord de la fenêtre dès 1780px ; d'où `right-6 lg:right-10`, les
              deux valeurs de gouttière.
              Fixe une fois dessiné : la dérive (`planete-derive`) faisait
              pencher le mot BAPZ, elle reste réservée à la planète seule. */}
          <div className="relative mt-6 min-h-20 flex-1 sm:static sm:mt-0 sm:min-h-0 sm:flex-none">
            <PlaneteDessinee className="absolute top-1/2 left-1/2 -z-10 aspect-square h-[min(76vw,100%)] -translate-x-1/2 -translate-y-1/2 opacity-[0.13] sm:top-auto sm:right-6 sm:bottom-2 sm:left-auto sm:h-[min(44vw,56vh)] sm:translate-x-0 sm:translate-y-0 sm:opacity-[0.16] lg:right-10" />
          </div>
        </div>
        {/* Invite à défiler : un lien d'ancre, donc utilisable au clavier et
            sans JavaScript. Aucun code pour le masquer — elle sort du champ
            d'elle-même dès qu'on défile.
            Une seule cible à toutes les largeurs : le deuxième écran. La
            flèche descendait jusqu'en bas de page sur ordinateur tant que le
            reste de l'accueil tenait en un écran ; avec les sections de
            contenu ajoutées ensuite, elle aurait sauté tout ce contenu. */}
        <div className="container-page relative z-10 flex justify-center pb-8">
          <a
            href="#decouvrir"
            aria-label="Voir la suite"
            className="invite-defiler flex size-11 items-center justify-center rounded-full border border-rule text-tertiary transition-colors hover:text-foreground"
          >
            <span aria-hidden className="text-lg leading-none">
              ↓
            </span>
          </a>
        </div>
      </section>

      {/* Deuxième écran : boutons et prochains cours. `scroll-mt` arrête
          l'ancre de la flèche sous la nav collante. Il n'a plus besoin de
          faire une fenêtre de haut : les sections de contenu le suivent. */}
      <div
        id="decouvrir"
        className="container-page scroll-mt-[67px] pt-[var(--vr-64)]"
      >
        {/* Sur téléphone : pleine largeur, rapprochés, et l'essai — le bouton
            principal — en premier. L'ordre et l'écart de la maquette
            reprennent à partir de `sm`. */}
        <Reveal className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-7">
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
        </Reveal>

        <Reveal className="mt-[var(--vr-80)] mb-7 flex items-end justify-between gap-4">
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
          {/* Les trois cartes sont empilées sur téléphone, en grille à partir
              de `sm` comme sur la maquette. C'était un carrousel horizontal
              tant que l'accueil devait tenir en 900px : depuis la landing, le
              deuxième écran a la place, et plus rien n'est caché hors champ ni
              n'exige un geste latéral. */}
          <Reveal className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course._id}>
                <CourseCard course={course} />
              </div>
            ))}
          </Reveal>
        </ProximityGlow>
      </div>
    </>
  );
}
