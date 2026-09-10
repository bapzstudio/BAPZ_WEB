import Image from "next/image";
import Link from "next/link";
import { lienReservation } from "@/lib/reservation/liens";
import type { Room } from "@/lib/types";
import { PriceCounter } from "./PriceCounter";

/** « Capacité 50 personnes (120 m²) », avec ce qui est renseigné. */
function capaciteEtSurface(room: Room) {
  if (room.capacity && room.area) {
    return `Capacité ${room.capacity} personnes (${room.area} m²)`;
  }
  if (room.capacity) return `Capacité ${room.capacity} personnes`;
  if (room.area) return `${room.area} m²`;
  return null;
}

/** Les équipements en une phrase : « Climatisation, vestiaires, … ». */
function equipements(items: string[]) {
  return `${items
    .map((item, i) => (i === 0 ? item : item.charAt(0).toLowerCase() + item.slice(1)))
    .join(", ")}.`;
}

/**
 * Salle à louer, sur la page Tarifs (section ajoutée par la maquette TARIFS du
 * 2026-09-10) et sur /location.
 *
 * Même vocabulaire que `PricingCard` : libellé mono, prix, ligne en capitales,
 * description, bouton aligné en bas. Les mesures propres à la maquette sont
 * l'image (750 x 281, rayon 20) et ses écarts : 26 sous le libellé, 34 au-dessus
 * du prix.
 *
 * Une salle pas encore ouverte n'est pas cliquable : pas de bouton, et donc pas
 * de halo de proximité, réservé aux cartes qui mènent quelque part.
 */
export function RoomCard({ room }: { room: Room }) {
  const ouverte = !room.availableFrom;
  const titre = capaciteEtSurface(room);

  return (
    <div
      data-glow-card={ouverte || undefined}
      className={`cal-card relative flex h-full flex-col p-7.5 ${ouverte ? "cal-glow" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-4 font-mono text-[11px] uppercase tracking-widest text-rule">
        <span>{room.name}</span>
        {room.availableFrom && (
          <span className="shrink-0">Ouverture {room.availableFrom}</span>
        )}
      </div>

      {room.photo && (
        <div className="relative mt-6.5 aspect-[750/281] overflow-hidden rounded-[20px]">
          <Image
            src={room.photo.src}
            alt={`${room.name}, BAPZ Studio`}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      )}

      {/* Aucun tarif communiqué : on l'annonce sur demande plutôt que
          d'afficher un montant inventé. En plus petit qu'un prix — au corps
          des noms de salle de l'ancienne page Location — pour ne pas
          donner à une absence le poids d'un chiffre. */}
      <div className={`${room.photo ? "mt-7" : "mt-6"} flex items-baseline gap-1.5`}>
        {room.price ? (
          <>
            <span className="text-[clamp(40px,3.4vw,64px)] font-black leading-none tracking-tight">
              <PriceCounter value={room.price} />
            </span>
            {room.period && (
              <span className="text-xl font-bold leading-none text-tertiary">
                {room.period}
              </span>
            )}
          </>
        ) : (
          <span className="text-[28px] font-black leading-none">Tarif sur demande</span>
        )}
      </div>

      {titre && <div className="mt-5 text-lg font-bold uppercase">{titre}</div>}

      {room.equipment && room.equipment.length > 0 ? (
        <p className="mt-3 text-[15px] leading-snug text-secondary">
          {equipements(room.equipment)}
        </p>
      ) : (
        <p className="mt-3 text-[15px] leading-snug text-tertiary">
          Équipements communiqués prochainement.
        </p>
      )}

      {ouverte && (
        <div className="mt-auto pt-8">
          {/* Lien étiré, comme sur les cartes de tarifs : toute la carte ouvre
              le parcours de réservation, la salle déjà choisie. */}
          <Link
            href={lienReservation({ type: "location", salle: room.slug })}
            className="block rounded-full border border-rule py-2.5 text-center text-[13px] font-bold uppercase tracking-widest transition-colors hover:bg-white/10 after:absolute after:inset-0 after:content-['']"
          >
            Choisir
          </Link>
        </div>
      )}
    </div>
  );
}
