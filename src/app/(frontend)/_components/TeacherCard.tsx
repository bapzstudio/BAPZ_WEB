import Image from "next/image";
import Link from "next/link";
import { BioParagraph } from "./BioText";
import type { Teacher } from "@/lib/types";

/* Le rendu des paragraphes vit dans BioText, partagé avec la page d'un prof. */

export function TeacherCard({
  teacher,
  prioritaire = false,
}: {
  teacher: Teacher;
  /** Premier portrait de la grille : chargé sans attendre, c'est lui qui
      s'affiche en premier sur téléphone (LCP relevé à 4,6s en différé). */
  prioritaire?: boolean;
}) {
  return (
    <Link
      href={`/profs/${teacher.slug}`}
      className="block h-full rounded-[15px]"
    >
      <article
        data-glow-card
        className="cal-card cal-glow relative flex h-full flex-col overflow-hidden"
      >
        {teacher.photo && (
          <Image
            src={teacher.photo.src}
            alt={teacher.name}
            width={teacher.photo.width}
            height={teacher.photo.height}
            className="aspect-1086/944 w-full object-cover"
            // Au-delà de 1780px le conteneur est plafonné : la carte fait 545px
            // et ne suit plus la largeur de la fenêtre.
            sizes="(min-width: 1780px) 545px, (min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            // 90 plutôt que le défaut 75 : la source a déjà été compressée à
            // l'extraction depuis la maquette, un ré-encodage agressif la ternit.
            quality={90}
            priority={prioritaire}
          />
        )}

        <div className="flex flex-1 flex-col bg-[#222] p-7.5">
          {/* `flex-wrap` : une discipline longue (« Contemporain Lyrical »)
              passe sous le nom quand la carte est étroite, au lieu de sortir
              de la carte sur les petits téléphones. Là où tout tient sur une
              ligne, le rendu de la maquette ne change pas. */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 className="text-[28px] font-black uppercase leading-none">
              {teacher.name}
            </h2>
            {teacher.discipline && (
              <span className="font-mono text-base uppercase tracking-widest text-discret">
                {teacher.discipline}
              </span>
            )}
          </div>

          {teacher.bio && (
            <div className="mt-4 flex flex-col gap-2 text-xs leading-[1.15] text-tertiary">
              {teacher.bio.map((paragraph, i) => (
                <BioParagraph key={i} text={paragraph} />
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
