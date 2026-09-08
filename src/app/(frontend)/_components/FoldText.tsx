"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// useLayoutEffect côté client pour poser l'état plié avant le premier rendu
// visuel (sinon le titre apparaît en entier puis disparaît d'un coup).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Hinge = "top" | "bottom" | "left" | "right";
type SplitBy = "char" | "word" | "line";
type Trigger = "mount" | "hover" | "scroll" | "loop";

const HINGE_CONFIG: Record<
  Hinge,
  { origin: string; rotateX: number; rotateY: number }
> = {
  top: { origin: "50% 0%", rotateX: -92, rotateY: 0 },
  bottom: { origin: "50% 100%", rotateX: 92, rotateY: 0 },
  left: { origin: "0% 50%", rotateX: 0, rotateY: 92 },
  right: { origin: "100% 50%", rotateX: 0, rotateY: -92 },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function FoldText({
  text,
  splitBy = "word",
  hinge = "top",
  duration = 0.65,
  stagger = 0.045,
  ease = "power3.out",
  perspective = 700,
  creaseShading = 0.55,
  trigger = "mount",
  className = "",
  style = {},
}: {
  text: string;
  splitBy?: SplitBy;
  hinge?: Hinge;
  duration?: number;
  stagger?: number;
  ease?: string;
  perspective?: number;
  creaseShading?: number;
  trigger?: Trigger;
  className?: string;
  style?: CSSProperties;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const hingeConfig = HINGE_CONFIG[hinge] ?? HINGE_CONFIG.top;
  const safeCrease = clamp(creaseShading, 0, 1);
  const safePerspective = Math.max(120, perspective);

  const segments = useMemo(() => {
    let segmentIndex = 0;

    const renderSegment = (
      content: ReactNode,
      key: string,
      split: SplitBy = splitBy
    ) => {
      segmentIndex += 1;
      return (
        <span
          className="fold-text-segment"
          data-fold-split={split}
          key={key}
          style={
            { "--fold-perspective": `${safePerspective}px` } as CSSProperties
          }
        >
          <span
            className="fold-text-piece"
            data-fold-hinge={hinge}
            style={
              {
                transformOrigin: hingeConfig.origin,
                "--fold-crease": 0,
              } as CSSProperties
            }
          >
            {content || " "}
          </span>
        </span>
      );
    };

    // Les blancs sont conservés tels quels (pas de  ) : associés à
    // `white-space: pre-wrap`, ils restent visibles ET permettent au titre de
    // passer à la ligne sur petit écran.
    const renderWhitespace = (value: string, key: string) =>
      value.split(/(\n)/).map((part, index) => {
        if (part === "\n") return <br key={`${key}-br-${index}`} />;
        if (!part) return null;
        return (
          <span className="fold-text-whitespace" key={`${key}-space-${index}`}>
            {part}
          </span>
        );
      });

    if (splitBy === "line") {
      return text.split("\n").map((line, index) => (
        <span className="fold-text-line" key={`line-${index}`}>
          {renderSegment(line || " ", `segment-line-${index}`, "line")}
        </span>
      ));
    }

    if (splitBy === "word") {
      return text.split(/(\s+)/).flatMap((part, index) => {
        if (!part) return [];
        if (/^\s+$/.test(part)) return renderWhitespace(part, `ws-${index}`);
        return renderSegment(part, `segment-word-${segmentIndex}`);
      });
    }

    return Array.from(text).map((char, index) => {
      if (char === "\n") return <br key={`br-${index}`} />;
      return renderSegment(
        char === " " ? " " : char,
        `segment-char-${index}`
      );
    });
  }, [text, splitBy, hinge, hingeConfig.origin, safePerspective]);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const pieces = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".fold-text-piece")
    );
    if (!pieces.length) return undefined;

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const activeDuration = reduceMotion ? Math.min(duration, 0.22) : duration;
    const activeStagger = reduceMotion ? Math.min(stagger, 0.02) : stagger;

    const fromVars = {
      opacity: 0,
      rotateX: reduceMotion ? 0 : hingeConfig.rotateX,
      rotateY: reduceMotion ? 0 : hingeConfig.rotateY,
      "--fold-crease": reduceMotion ? 0 : safeCrease,
      transformOrigin: hingeConfig.origin,
      force3D: true,
    };
    const toVars = {
      opacity: 1,
      rotateX: 0,
      rotateY: 0,
      "--fold-crease": 0,
      duration: activeDuration,
      ease: reduceMotion ? "power1.out" : ease,
      stagger: activeStagger,
      clearProps: "willChange",
    };

    const killTimeline = () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      gsap.killTweensOf(pieces);
    };

    const play = (repeat: boolean) => {
      killTimeline();
      timelineRef.current = gsap.timeline({
        repeat: repeat ? -1 : 0,
        repeatDelay: repeat ? 0.75 : 0,
      });
      timelineRef.current.fromTo(pieces, fromVars, toVars);
      return timelineRef.current;
    };

    let scrollTrigger: ScrollTrigger | undefined;
    let hoverHandler: (() => void) | undefined;

    if (trigger === "hover") {
      gsap.set(pieces, {
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
        "--fold-crease": 0,
        transformOrigin: hingeConfig.origin,
      });
      hoverHandler = () => play(false);
      root.addEventListener("mouseenter", hoverHandler);
    } else {
      // État plié posé avant le premier paint, quel que soit le déclencheur.
      gsap.set(pieces, fromVars);
      if (trigger === "scroll") {
        scrollTrigger = ScrollTrigger.create({
          trigger: root,
          start: "top 82%",
          once: true,
          onEnter: () => play(false),
        });
      } else {
        play(trigger === "loop");
      }
    }

    // GSAP pilote désormais l'opacité : on retire le garde-fou CSS qui masquait
    // le texte entre le rendu serveur et l'hydratation.
    root.removeAttribute("data-fold-pending");

    return () => {
      if (hoverHandler) root.removeEventListener("mouseenter", hoverHandler);
      scrollTrigger?.kill();
      killTimeline();
    };
  }, [
    text,
    splitBy,
    hinge,
    duration,
    stagger,
    ease,
    safeCrease,
    trigger,
    hingeConfig.origin,
    hingeConfig.rotateX,
    hingeConfig.rotateY,
  ]);

  return (
    <span
      ref={rootRef}
      data-fold-pending=""
      className={`fold-text ${className}`.trim()}
      style={style}
    >
      <span className="fold-text-sr-only">{text}</span>
      <span className="fold-text-visual" aria-hidden="true">
        {segments}
      </span>
    </span>
  );
}
