import Image from "next/image";
import type { Teacher } from "@/lib/types";

/**
 * Rend un paragraphe de bio : les passages entre `**` passent en blanc et en
 * gras, le reste reste en gris (mesuré sur la maquette : #9a9a9a / #ffffff).
 */
function BioParagraph({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/);
  return (
    <p>
      {parts.map((part, i) =>
        // Les index impairs sont les captures, donc les passages en gras.
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-foreground">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </p>
  );
}

export function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <article className="cal-card flex flex-col overflow-hidden">
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
            <span className="shrink-0 font-mono text-base uppercase tracking-widest text-rule">
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
  );
}
