import type { SiteSettings } from "@/lib/types";
import { QuestionFluide } from "../_components/QuestionFluide";
import { Reveal } from "../_components/Reveal";
import { ESPACE_SECTION, EnteteSection } from "./EnteteSection";

/**
 * Questions fréquentes, rédigées dans les Réglages.
 *
 * Chaque question est un `<details>` natif (`QuestionFluide`) : ouvrable au
 * clavier, sans JavaScript, et la réponse fermée reste dans la page — Google
 * la lit comme le reste. La question est un h3, dans le `<summary>`, pour
 * garder la structure de titres de la page. Au survol à la souris, une bande
 * fait défiler la question. Les mêmes questions partent en données
 * structurées `FAQPage` (`page.tsx`).
 */
export function AccueilQuestions({ faq }: { faq: SiteSettings["faq"] }) {
  if (!faq?.length) return null;

  return (
    <section
      aria-labelledby="accueil-questions"
      className={`container-page ${ESPACE_SECTION}`}
    >
      <EnteteSection id="accueil-questions" titre="Questions fréquentes" />
      {/* Les `<details>` sont les enfants directs de Reveal : ils entrent l'un
          après l'autre. */}
      <Reveal className="border-t border-rule-faint">
        {faq.map(({ question, answer }) => (
          <QuestionFluide key={question} question={question} answer={answer} />
        ))}
      </Reveal>
    </section>
  );
}
