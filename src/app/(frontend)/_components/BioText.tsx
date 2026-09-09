/**
 * Rend un paragraphe de bio : les passages entre `**` passent en blanc et en
 * gras, le reste reste en gris (mesuré sur la maquette : #9a9a9a / #ffffff).
 *
 * Partagé par la carte de `/profs` et la page d'un prof, pour que la mise en
 * forme reste la même aux deux endroits.
 */
export function BioParagraph({ text }: { text: string }) {
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
