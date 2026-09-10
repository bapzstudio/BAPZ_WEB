import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { coordonneesFormSchema, type CoordonneesData } from "@/lib/reservation/schemas";
import { CHAMP, Champ, Titre } from "../ui";

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
        <input {...register("prenom")} autoComplete="given-name" className={CHAMP} />
      </Champ>
      <Champ label="E-mail" erreur={errors.email?.message}>
        <input {...register("email")} type="email" autoComplete="email" className={CHAMP} />
      </Champ>
      <Champ label="Téléphone (facultatif)" erreur={errors.telephone?.message}>
        <input {...register("telephone")} type="tel" autoComplete="tel" className={CHAMP} />
      </Champ>

      <p className="text-[13px] leading-snug text-tertiary">
        Tes coordonnées servent uniquement à répondre à ta demande.
      </p>
    </form>
  );
}
