import Image from "next/image";
import Link from "next/link";
import { BioParagraph } from "./BioText";
import type { Teacher } from "@/lib/types";

/* Le rendu des paragraphes vit dans BioText, partagé avec la page d'un prof. */

export function TeacherCard({ teacher }: { teacher: Teacher }) {
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
        />
      )}

      <div className="flex flex-1 flex-col bg-[#222] p-7.5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-[28px] font-black uppercase leading-none">
            {teacher.name}
          </h2>
          {teacher.discipline && (
            <span className="shrink-0 font-mono text-base uppercase tracking-widest text-discret">
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
