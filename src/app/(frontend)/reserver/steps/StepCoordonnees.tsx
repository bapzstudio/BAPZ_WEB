import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  coordonneesFormSchema,
  type CoordonneesData,
} from "@/lib/reservation/schemas";
import { Champ, Titre } from "../ui";

export function StepCoordonnees({
  defaultValues,
  onSubmit,
}: {
  defaultValues: CoordonneesData;
  onSubmit: (donnees: CoordonneesData) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CoordonneesData>({
    resolver: zodResolver(coordonneesFormSchema),
    defaultValues,
  });

  return (
    // `noValidate` : les messages viennent de zod, en français, et non de la
    // validation native du navigateur.
    <form
      id="funnel-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="relative flex flex-col gap-6"
    >
      <Titre>Comment te répondre ?</Titre>

      {/* Champ leurre : hors flux et hors tabulation, rempli par les robots. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label>
          Ne pas remplir
          <input {...register("website")} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Champ label="Prénom" erreur={errors.prenom?.message}>
        <input
          {...register("prenom")}
          autoComplete="given-name"
          aria-invalid={errors.prenom ? true : undefined}
          className="champ"
        />
      </Champ>
      <Champ label="E-mail" erreur={errors.email?.message}>
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          className="champ"
        />
      </Champ>
      <Champ label="Téléphone (facultatif)" erreur={errors.telephone?.message}>
        <input
          {...register("telephone")}
          type="tel"
          autoComplete="tel"
          aria-invalid={errors.telephone ? true : undefined}
          className="champ"
        />
      </Champ>

      <p className="text-petit leading-snug text-tertiary">
        Tes coordonnées servent uniquement à répondre à ta demande.{" "}
        {/* Même onglet : la saisie est conservée, le retour ramène à cette étape. */}
        <Link
          href="/confidentialite"
          className="underline underline-offset-4 transition-colors hover:text-foreground"
        >
          En savoir plus
        </Link>
      </p>
    </form>
  );
}
