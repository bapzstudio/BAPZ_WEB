import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  coordonneesFormSchema,
  type CoordonneesData,
} from "@/lib/reservation/schemas";
import { Champ, ResumeErreurs, Titre, type ErreurChamp } from "../ui";

/** Ordre d'affichage, donc ordre du récapitulatif des erreurs. */
const CHAMPS = [
  { id: "prenom", label: "Prénom" },
  { id: "email", label: "E-mail" },
  { id: "telephone", label: "Téléphone" },
] as const;

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
    getValues,
    formState: { errors },
  } = useForm<CoordonneesData>({
    resolver: zodResolver(coordonneesFormSchema),
    defaultValues,
  });

  // Après un envoi refusé, react-hook-form revalide à chaque frappe : la liste
  // se vide au fur et à mesure que les champs sont remplis.
  const valeurs = getValues();
  const erreurs: ErreurChamp[] = CHAMPS.flatMap((champ) => {
    const message = errors[champ.id]?.message;
    if (!message) return [];
    return [
      {
        ...champ,
        message,
        vide: !(valeurs[champ.id] ?? "").trim(),
      },
    ];
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

      <ResumeErreurs erreurs={erreurs} />

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
          id="prenom"
          autoComplete="given-name"
          aria-invalid={errors.prenom ? true : undefined}
          className="champ"
        />
      </Champ>
      <Champ label="E-mail" erreur={errors.email?.message}>
        <input
          {...register("email")}
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          className="champ"
        />
      </Champ>
      <Champ label="Téléphone (facultatif)" erreur={errors.telephone?.message}>
        <input
          {...register("telephone")}
          id="telephone"
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
