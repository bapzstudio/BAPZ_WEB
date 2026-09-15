import Image from "next/image";
import Link from "next/link";
import type { Teacher } from "@/lib/types";
import { accrocheBio, BioParagraph } from "../_components/BioText";
import { ProximityGlow } from "../_components/ProximityGlow";
import { Reveal } from "../_components/Reveal";
import { ESPACE_SECTION, EnteteSection } from "./EnteteSection";

/**
 * Extrait de /profs : un mot sur l'équipe (Réglages), puis pour chaque prof son
 * portrait, sa discipline et une accroche — le début de sa bio, tiré
 * automatiquement (`accrocheBio`). La suite de la bio reste la raison d'ouvrir
 * la fiche. Mêmes profs que la page Profs (`getTeachers`).
 *
 * Mise en page : une carte par ligne, portrait à gauche, jusqu'à `lg` ; trois
 * cartes verticales au-delà, portrait recadré en 3:2 pour que la section ne
 * redevienne pas une deuxième page Profs (750 px de haut avec le cadrage
 * d'origine).
 */
export function AccueilEquipe({
  teachers,
  intro,
}: {
  teachers: Teacher[];
  intro?: string;
}) {
  if (teachers.length === 0) return null;

  return (
    <section
      aria-labelledby="accueil-equipe"
      className={`container-page ${ESPACE_SECTION}`}
    >
      <EnteteSection
        id="accueil-equipe"
        titre="L'équipe"
        lien="/profs"
        libelleLien="Les profs"
      />
      {intro && (
        <Reveal className="mb-8">
          <p className="max-w-190 text-base leading-[1.55] text-secondary sm:text-lg">
            {intro}
          </p>
        </Reveal>
      )}
      <ProximityGlow>
        <Reveal className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {teachers.map((teacher) => {
            const accroche = accrocheBio(teacher.bio);
            return (
              <Link
                key={teacher._id}
                href={`/profs/${teacher.slug}`}
                className="block h-full rounded-[15px]"
              >
                <article
                  data-glow-card
                  className="cal-card cal-glow relative flex h-full min-h-44 overflow-hidden lg:flex-col"
                >
                  {teacher.photo && (
                    // Le cadre porte la taille, l'image le remplit (`fill`) :
                    // sur une ligne, il suit la hauteur de la carte, quelle que
                    // soit la longueur de l'accroche.
                    <div className="relative w-[36%] shrink-0 sm:w-[30%] lg:aspect-3/2 lg:w-full">
                      <Image
                        src={teacher.photo.src}
                        alt={teacher.name}
                        fill
                        sizes="(min-width: 1780px) 545px, (min-width: 1024px) 33vw, 36vw"
                        quality={90}
                        // Visage calé vers le haut : le recadrage coupe le bas
                        // du portrait plutôt que le haut.
                        className="object-cover object-[50%_25%]"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col bg-[#222] p-4 sm:p-6">
                    <h3 className="text-lg font-black uppercase leading-tight sm:text-2xl">
                      {teacher.name}
                    </h3>
                    {teacher.discipline && (
                      <p className="mt-1 font-mono text-label uppercase tracking-normal text-discret sm:tracking-widest">
                        {teacher.discipline}
                      </p>
                    )}
                    {accroche && (
                      // Même rendu que les bios (passages en gras compris), en
                      // un peu plus grand : c'est ici un texte d'appel.
                      <div className="mt-3 text-petit leading-snug text-tertiary">
                        <BioParagraph text={accroche} />
                      </div>
                    )}
                    <p className="mt-auto pt-4 font-mono text-label uppercase tracking-widest text-tertiary">
                      Lire la suite →
                    </p>
                  </div>
                </article>
              </Link>
            );
          })}
        </Reveal>
      </ProximityGlow>
    </section>
  );
}
