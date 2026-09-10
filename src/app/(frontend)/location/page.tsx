import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "../_components/PageTransition";
import { getRooms } from "@/lib/queries";
import { lienReservation } from "@/lib/reservation/liens";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Location de salle",
  description:
    "Louer une salle de danse à Ars-Laquenexy, près de Metz : 120 m² pour 50 personnes, climatisation, vestiaires, sonorisation.",
  path: "/location",
});

export default async function LocationPage() {
  const rooms = await getRooms();

  return (
    <PageTransition>
      <div className="container-page pt-[var(--vr-104)] pb-8.5">
        <h1 className="text-[clamp(38px,3.1vw,59px)] font-black uppercase leading-none tracking-tight">
          Location de salle
        </h1>

        <div className="mt-[var(--vr-64)] grid gap-11.5 lg:grid-cols-2">
          {rooms.map((room) => (
            <div key={room._id} className="cal-card flex flex-col p-7.5">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-[28px] font-black uppercase leading-none">
                  {room.name}
                </h2>
                {room.availableFrom && (
                  <span className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-rule">
                    Ouverture {room.availableFrom}
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-2">
                {room.area && (
                  <span className="text-[clamp(36px,2.6vw,48px)] font-black leading-none tracking-tight">
                    {room.area} m²
                  </span>
                )}
                {room.capacity && (
                  <span className="text-[15px] text-secondary">
                    Jusqu&apos;à {room.capacity} personnes
                  </span>
                )}
              </div>

              {room.equipment && room.equipment.length > 0 ? (
                <ul className="mt-7 flex flex-col gap-1.5 text-[15px] text-secondary">
                  {room.equipment.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-7 text-[15px] text-tertiary">
                  Équipements communiqués prochainement.
                </p>
              )}

              {!room.availableFrom && (
                <Link
                  href={lienReservation({ type: "location", salle: room.slug })}
                  className="mt-8 rounded-full border border-rule py-2.5 text-center text-[13px] font-bold uppercase tracking-widest transition-colors hover:bg-white/10"
                >
                  Demander un créneau
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Aucun tarif de location n'a encore été communiqué : rien n'est
            affiché plutôt qu'un montant inventé. */}
        <p className="mt-11.5 text-[15px] text-tertiary">
          Tarifs de location sur demande.
        </p>
      </div>
    </PageTransition>
  );
}
