import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  NIVEAUX,
  NIVEAU_LABELS,
  detailsSchema,
  type DetailsData,
  type TypeDemande,
} from "@/lib/reservation/schemas";
import { CHAMP, Champ, LIBELLE, Titre } from "../ui";

const INVITES: Record<TypeDemande, string> = {
  essai: "Une question, une contrainte, une envie particulière…",
  inscription: "Une question sur la formule, tes disponibilités…",
  location: "L'usage prévu, les horaires, le matériel dont tu as besoin…",
  prive: "Ce que tu aimerais travailler, seul·e ou à plusieurs, tes disponibilités…",
};

export function StepDetails({
  type,
  defaultValues,
  onSubmit,
}: {
  type?: TypeDemande;
  defaultValues: DetailsData;
  onSubmit: (donnees: DetailsData) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<DetailsData>({ resolver: zodResolver(detailsSchema), defaultValues });

  // `useWatch` plutôt que `watch` : compatible avec la mémoïsation de React.
  const niveau = useWatch({ control, name: "niveau" });
  const location = type === "location";

  return (
    <form id="funnel-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
      <Titre>
        {location ? "Pour quand ?" : type === "prive" ? "Parle-nous de ton projet" : "Parle-nous de toi"}
      </Titre>

      {!location && (
        <fieldset>
          <legend className={LIBELLE}>Ton niveau</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {NIVEAUX.map((valeur) => (
              <button
                key={valeur}
                type="button"
                aria-pressed={niveau === valeur}
                onClick={() => setValue("niveau", valeur, { shouldValidate: true })}
                className={`pill ${niveau === valeur ? "pill-light" : "pill-outline"}`}
              >
                {NIVEAU_LABELS[valeur]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {location && (
        <>
          <Champ label="Date souhaitée (facultatif)" erreur={errors.dateSouhaitee?.message}>
            <input
              {...register("dateSouhaitee")}
              aria-invalid={errors.dateSouhaitee ? true : undefined}
              placeholder="Ex : un samedi après-midi en juin"
              className={CHAMP}
            />
          </Champ>
          <Champ label="Nombre de personnes (facultatif)" erreur={errors.personnes?.message}>
            <input
              {...register("personnes")}
              aria-invalid={errors.personnes ? true : undefined}
              inputMode="numeric"
              placeholder="Ex : 12"
              className={CHAMP}
            />
          </Champ>
        </>
      )}

      <Champ label="Message (facultatif)" erreur={errors.message?.message}>
        <textarea
          {...register("message")}
          aria-invalid={errors.message ? true : undefined}
          rows={4}
          placeholder={type ? INVITES[type] : undefined}
          className={`resize-y ${CHAMP}`}
        />
      </Champ>
    </form>
  );
}
