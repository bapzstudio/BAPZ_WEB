/**
 * Accroche d'une bio, pour un aperçu (section Équipe de l'accueil) : les
 * premières phrases du premier paragraphe, ajoutées une à une jusqu'à dépasser
 * `minimum` caractères. Une phrase trop courte seule (« Alessia danse depuis
 * l'âge de 3 ans. ») est donc complétée par la suivante.
 *
 * Ne coupe jamais au milieu d'un passage en gras : tant qu'une paire de `**`
 * reste ouverte, la phrase suivante est ajoutée.
 */
export function accrocheBio(bio?: string[], minimum = 90): string | undefined {
  const premier = bio?.[0]?.trim();
  if (!premier) return undefined;

  // Une phrase = jusqu'à sa ponctuation finale, `**` fermant compris
  // (« …Los Angeles.** »). Un reste sans ponctuation compte comme une phrase.
  const phrases: string[] = [
    ...(premier.match(/[^.!?…]+[.!?…]+(?:\*\*)?\s*/g) ?? []),
  ];
  const lu = phrases.join("").length;
  if (lu < premier.length) phrases.push(premier.slice(lu));

  let accroche = "";
  for (const phrase of phrases) {
    accroche += phrase;
    const grasOuvert = (accroche.match(/\*\*/g) ?? []).length % 2 === 1;
    if (accroche.trim().length >= minimum && !grasOuvert) break;
  }
  return accroche.trim();
}

/**
 * Rend un paragraphe de bio : les passages entre `**` passent en blanc et en
 * gras, le reste reste en gris (mesuré sur la maquette : #9a9a9a / #ffffff).
 *
 * Partagé par la carte de `/profs`, la page d'un prof et l'accroche de
 * l'accueil, pour que la mise en forme reste la même partout.
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
        ),
      )}
    </p>
  );
}
