import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { accrocheBio, BioParagraph } from "../../_components/BioText";
import { CourseCard } from "../../_components/CourseCard";
import { FoldText } from "../../_components/FoldText";
import { PageTransition } from "../../_components/PageTransition";
import { ProximityGlow } from "../../_components/ProximityGlow";
import { getTeacherBySlug, getTeacherSlugs } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getTeacherSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fiche = await getTeacherBySlug(slug);
  if (!fiche) return { title: "Prof introuvable - BAPZ Studio" };

  const { teacher } = fiche;
  return pageMetadata({
    title: teacher.discipline
      ? `${teacher.name}, ${teacher.discipline}`
      : teacher.name,
    // Les premières phrases de la bio, comme l'accroche de l'accueil : une
    // coupe au 160e caractère tronquait en plein mot, sans points de
    // suspension, et Google affichait la description comme cassée.
    description:
      accrocheBio(teacher.bio, 140)?.replace(/\*\*/g, "") ??
      `${teacher.name}, professeur·e à BAPZ Studio, studio de danse à Metz.`,
    path: `/profs/${teacher.slug}`,
  });
}

export default async function ProfPage({ params }: Props) {
  const { slug } = await params;
  const fiche = await getTeacherBySlug(slug);
  // Un prof sans portrait ni bio n'a pas de page : même règle que /profs, donc
  // pas d'adresse accessible qui ne serait listée nulle part.
  if (!fiche) notFound();

  const { teacher, courses } = fiche;

  return (
    <PageTransition>
      <div className="container-page pt-[var(--vr-104)] pb-8.5">
        <Link
          href="/profs"
          className="eyebrow inline-block transition-colors hover:text-foreground"
        >
          ← LES PROFS
        </Link>

        {/* Le portrait ne dépasse pas sa taille native (1086px) : au-delà il
            serait agrandi et paraîtrait mou. */}
        <div className="mt-[var(--vr-64)] grid gap-8.5 lg:grid-cols-[minmax(0,45%)_minmax(0,1fr)]">
          {teacher.photo && (
            <div className="cal-card relative h-fit overflow-hidden">
              <Image
                src={teacher.photo.src}
                alt={teacher.name}
                width={teacher.photo.width}
                height={teacher.photo.height}
                className="aspect-1086/944 w-full object-cover"
                sizes="(min-width: 1024px) 45vw, 100vw"
                quality={90}
                priority
              />
            </div>
          )}

          <div>
            {/* `flex-wrap` : comme sur la carte, une discipline longue passe
                sous le nom plutôt que de sortir de l'écran sur téléphone. */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
              <h1 className="titre-page">
                <FoldText text={teacher.name} />
              </h1>
              {teacher.discipline && (
                <span className="eyebrow">{teacher.discipline}</span>
              )}
            </div>

            {teacher.bio && (
              <div className="mt-9 flex flex-col gap-4 text-courant leading-snug text-tertiary">
                {teacher.bio.map((paragraph, i) => (
                  <BioParagraph key={i} text={paragraph} />
                ))}
              </div>
            )}

            {courses.length > 0 && (
              <section className="mt-12">
                <div className="h-px bg-rule-faint" />
                <h2 className="eyebrow mt-8">SES COURS</h2>
                {/* Un prof en a un ou deux : deux colonnes suffisent, et une
                    carte seule ne laisse pas un vide en bout de rangée. */}
                <ProximityGlow className="mt-6 grid gap-6 sm:grid-cols-2">
                  {courses.map((course) => (
                    <CourseCard key={course._id} course={course} hideTeacher />
                  ))}
                </ProximityGlow>
              </section>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
