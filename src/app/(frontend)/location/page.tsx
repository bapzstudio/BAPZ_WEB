import type { Metadata } from "next";
import { PageTransition } from "../_components/PageTransition";
import { ProximityGlow } from "../_components/ProximityGlow";
import { RoomCard } from "../_components/RoomCard";
import { getRooms } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Location de salle",
  description:
    "Louer une salle de danse à Ars-Laquenexy, près de Metz : 120 m² pour 50 personnes, climatisation, vestiaires, sonorisation.",
  path: "/location",
});

export default async function LocationPage() {
  const rooms = await getRooms();

  // Mêmes cartes que la section « Locations de salle » de la page Tarifs : une
  // salle ne doit pas s'afficher de deux façons selon la page.
  return (
    <PageTransition>
      <div className="container-page pt-[var(--vr-104)] pb-8.5">
        <h1 className="text-[clamp(38px,3.1vw,59px)] font-black uppercase leading-none tracking-tight">
          Location de salle
        </h1>

        <ProximityGlow className="mt-[var(--vr-64)] grid gap-11.5 lg:grid-cols-2">
          {rooms.map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </ProximityGlow>
      </div>
    </PageTransition>
  );
}
