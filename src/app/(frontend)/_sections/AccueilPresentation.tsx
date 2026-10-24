import Image from "next/image";
import { Reveal } from "../_components/Reveal";
import { ESPACE_SECTION, EnteteSection } from "./EnteteSection";

/**
 * Présentation du studio, rédigée dans les Réglages. C'est le principal texte
 * suivi de l'accueil, là où Google trouve de quoi comprendre ce qu'est le
 * studio. Sans titre ou sans texte, la section n'apparaît pas.
 */
export function AccueilPresentation({
  titre,
  texte,
  photo,
}: {
  titre?: string;
  texte?: string;
  photo?: { src: string; width: number; height: number; alt: string };
}) {
  const paragraphes = (texte ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!titre || paragraphes.length === 0) return null;

  return (
    <section
      aria-labelledby="accueil-presentation"
      className={`container-page ${ESPACE_SECTION}`}
    >
      {/* Texte à gauche, photo à droite à partir de `lg` ; la photo passe
          dessous sur téléphone. Elle suit la hauteur du texte sur ordinateur. */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,760px)_1fr] lg:gap-12">
        <div>
          <EnteteSection id="accueil-presentation" titre={titre} />
          <Reveal className="flex max-w-190 flex-col gap-4 text-base leading-[1.55] text-secondary sm:text-lg">
            {paragraphes.map((paragraphe) => (
              <p key={paragraphe}>{paragraphe}</p>
            ))}
          </Reveal>
        </div>
        {/* Photo des Réglages, recadrée pour suivre la hauteur du texte ; même
            boîte que l'emplacement provisoire, rayon des cartes. Tant qu'il
            n'y en a pas : l'emplacement, masqué aux lecteurs d'écran. */}
        <Reveal className="h-full">
          {photo ? (
            <div className="relative aspect-video h-full overflow-hidden rounded-[15px] lg:aspect-auto lg:min-h-72">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              aria-hidden
              className="photo-attente aspect-video h-full font-mono text-petit text-discret lg:aspect-auto lg:min-h-72"
            >
              [ photo — le studio ]
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
