import Link from "next/link";
import { TYPES_DEMANDE, TYPE_LABELS, type TypeDemande } from "@/lib/reservation/schemas";
import { LigneChoix, ListeChoix, Titre } from "../ui";

export function StepDemande({
  valeur,
  onChoix,
}: {
  valeur?: TypeDemande;
  onChoix: (donnees: { type: TypeDemande }) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <Titre>Qu&apos;est-ce qui t&apos;amène ?</Titre>

      <ListeChoix>
        {TYPES_DEMANDE.map((type) => (
          <LigneChoix
            key={type}
            titre={TYPE_LABELS[type].label}
            detail={TYPE_LABELS[type].aide}
            actif={valeur === type}
            onClick={() => onChoix({ type })}
          />
        ))}
      </ListeChoix>

      <p className="text-center text-[15px] text-tertiary">
        Une simple question ?{" "}
        <Link href="/contact" className="text-foreground underline underline-offset-4">
          Écris-nous
        </Link>
      </p>
    </div>
  );
}
