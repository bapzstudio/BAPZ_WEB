import type { Metadata } from "next";
import { PageTransition } from "../_components/PageTransition";
import { getReservationCatalog } from "@/lib/queries";
import { lirePrefill } from "@/lib/reservation/prefill";
import { pageMetadata } from "@/lib/seo";
import { ReservationFunnel } from "./ReservationFunnel";

export const metadata: Metadata = pageMetadata({
  title: "Réserver un cours de danse à Metz",
  description:
    "Demande un cours d'essai, une inscription, une location de salle ou un cours privé à BAPZ Studio, en quelques étapes.",
  path: "/reserver",
});

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReserverPage({ searchParams }: Props) {
  const [catalogue, params] = await Promise.all([
    getReservationCatalog(),
    searchParams,
  ]);

  return (
    <PageTransition>
      <ReservationFunnel
        catalogue={catalogue}
        prefill={lirePrefill(params, catalogue)}
      />
    </PageTransition>
  );
}
