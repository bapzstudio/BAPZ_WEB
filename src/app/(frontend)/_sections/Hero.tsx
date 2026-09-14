import Link from "next/link";
import { lienReservation } from "@/lib/reservation/liens";
import type { Course, PricingPlan, SiteSettings } from "@/lib/types";
import { CourseCard } from "../_components/CourseCard";
import { FoldText } from "../_components/FoldText";
import { Marquee } from "../_components/Marquee";
import { PlaneteDessinee } from "../_components/PlaneteDessinee";
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
    // flex-col + `mt-auto` sur le bandeau : quand la page est plus courte que
    // l'écran, le vide se place avant le bandeau, qui reste collé au pied de
    // page au lieu de paraître deux fois plus haut.
    <div className="flex flex-1 flex-col">
      {/* Premier écran : le titre qui se déplie et le logo qui se dessine, et
          rien d'autre. Le reste de l'accueil vient au défilement.
          C'est un écart assumé avec la maquette, qui fait tenir tout l'accueil
          dans un écran : à montrer à la cliente.
          100svh et non 100vh : sur téléphone, `vh` compte la barre d'adresse
          rétractée, donc l'invite à défiler tombait sous l'écran. Moins les
          67px de la nav (66 + son filet), qui est collante. */}
      <section className="hero-glow flex min-h-[calc(100svh-67px)] flex-col">
        {/* relative z-10 : les halos sont des pseudo-éléments positionnés, le
            contenu doit passer au-dessus. */}
        {/* Titre haut, planète basse : sur écran large les deux se croisaient,
            le mot BAPZ du logo passant sous la fin du titre. */}
        <div className="container-page relative z-10 flex flex-1 flex-col justify-start pt-[min(12vh,88px)] pb-8 sm:pt-[min(10vh,96px)]">
          {/* Le logo du studio se dessine ligne par ligne pendant que le titre
              se déplie, en filigrane sous le titre.
              Son bord droit tombe sur la ligne du conteneur, comme tout le
              reste du site : `right-0` porte sur la boîte du conteneur,
              gouttière comprise, donc la planète touchait le bord de la fenêtre
              dès qu'elle faisait moins de 1780px. D'où `right-6 lg:right-10`,
              les deux valeurs de gouttière.
              Sur téléphone, centrée et entière sous le titre : décalée à
              droite, elle sortait de l'écran et se lisait comme un accident.
              Fixe une fois dessiné : la dérive (`planete-derive`) faisait
              pencher le mot BAPZ, elle reste réservée à la planète seule. */}
          <PlaneteDessinee className="absolute bottom-14 left-1/2 -z-10 aspect-square h-[min(76vw,33vh)] -translate-x-1/2 opacity-[0.13] sm:right-6 sm:bottom-2 sm:left-auto sm:h-[min(44vw,56vh)] sm:translate-x-0 sm:opacity-[0.16] lg:right-10" />

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
        </div>

        {/* Invite à défiler : un lien d'ancre, donc utilisable au clavier et
            sans JavaScript. Aucun code pour le masquer — elle sort du champ
            d'elle-même dès qu'on défile.
            Deux cibles selon la largeur, faute de pouvoir en changer en CSS :
            sur ordinateur le reste de l'accueil (contenu, bandeau et pied de
            page) tient dans un écran, donc la flèche descend jusqu'en bas ;
            sur téléphone elle s'arrête en haut du deuxième écran, qui est
            plus long que la fenêtre. */}
        <div className="container-page relative z-10 flex justify-center pb-8">
          <FlecheDefiler cible="#decouvrir" className="lg:hidden" />
          <FlecheDefiler cible="#fin" className="hidden lg:flex" />
        </div>
      </section>

      {/* Deuxième écran. Il fait une fenêtre au moins tant que la flèche y
          mène (sous `lg`), pour que le geste arrive sur un écran entier et non
          sur la fin du hero suivie du contenu ; `scroll-mt` l'arrête sous la
          nav collante. À partir de `lg` la flèche descend jusqu'au pied de
          page : le bloc reprend la hauteur de son contenu, sinon il gardait
          280px de vide sous les cartes. */}
      <div
        id="decouvrir"
        className="container-page flex min-h-[calc(100svh-67px)] scroll-mt-[67px] flex-col justify-center py-[var(--vr-64)] lg:min-h-0 lg:justify-start"
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

      <div className="mt-auto">
        <Marquee items={settings.marqueeItems ?? [city, handle]} />
      </div>

      {/* Cible de la flèche sur ordinateur : la fin de la page, donc le pied de
          page entier une fois le geste terminé. */}
      <span id="fin" aria-hidden />
    </div>
  );
}

/** Flèche « défiler », posée au bas du premier écran. */
function FlecheDefiler({ cible, className }: { cible: string; className: string }) {
  return (
    <a
      href={cible}
      aria-label="Voir la suite"
      className={`invite-defiler flex size-11 items-center justify-center rounded-full border border-rule text-tertiary transition-colors hover:text-foreground ${className}`}
    >
      <span aria-hidden className="text-lg leading-none">
        ↓
      </span>
    </a>
  );
}
