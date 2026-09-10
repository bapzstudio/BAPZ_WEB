import Link from "next/link";
import { lienReservation } from "@/lib/reservation/liens";
import type { Course, SiteSettings } from "@/lib/types";
import { CourseCard } from "../_components/CourseCard";
import { FoldText } from "../_components/FoldText";
import { Marquee } from "../_components/Marquee";
import { ProximityGlow } from "../_components/ProximityGlow";
import { Reveal } from "../_components/Reveal";

export function Hero({
  settings,
  courses,
}: {
  settings: SiteSettings;
  courses: Course[];
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

          <p className="mt-11 max-w-160 whitespace-pre-line text-base leading-[1.3] text-secondary">
            {settings.heroSubtitle}
          </p>

          <div className="mt-6 flex flex-wrap gap-7">
            <Link href="/cours" className="pill pill-outline">
              Calendrier
            </Link>
            <Link href={lienReservation({ type: "essai" })} className="pill pill-light">
              {settings.trialLabel ?? "Cours d'essai"}
            </Link>
          </div>
        </div>
      </div>

      {/* Le bas de page entre au défilement, pour prolonger le geste du titre
          au lieu de le laisser retomber sur un bloc inerte. */}
      <div className="container-page pb-14">
        <Reveal className="mb-7 flex items-end justify-between gap-4">
          <h2 className="text-[clamp(28px,2.05vw,39px)] font-black uppercase leading-none tracking-tight">
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
          <Reveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </Reveal>
        </ProximityGlow>
      </div>

      <Marquee items={settings.marqueeItems ?? [city, handle]} />
    </div>
  );
}
