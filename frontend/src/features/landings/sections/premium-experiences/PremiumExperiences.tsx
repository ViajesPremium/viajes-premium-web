"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./PremiumExperiences.module.css";
import { BlurredStagger } from "@/components/ui/blurred-stagger-text/BlurredStaggerText";
import BentoGrid from "./BentoGrid";
import Badge from "@/components/ui/badge/Badge";
import { useAnimationsEnabled } from "@/lib/animation-budget";
import type { LandingTheme } from "@/features/landings/data/types";

type PremiumExperiencesProps = {
  landing: LandingTheme;
};

gsap.registerPlugin(ScrollTrigger);

export default function AboutUs({ landing }: PremiumExperiencesProps) {
  const animationsEnabled = useAnimationsEnabled();
  const { premiumExperiences: aboutUs } = landing;

  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const disableForDevice =
        !animationsEnabled && window.matchMedia("(max-width: 1024px)").matches;
      if (disableForDevice) return;

      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();
      const createPinnedAboutUs = (delayPx: number) => {
        ScrollTrigger.create({
          trigger: section,
          start: `bottom+=${delayPx} bottom`,
          end: "bottom top",
          pin: true,
          pinSpacing: false,
          anticipatePin: 0.12,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        });
      };

      // DIAGNÓSTICO TEMPORAL: pin de about-us desactivado en mobile para
      // comprobar si su pinSpacing:false descuadra el pin de itineraries/
      // includes en mobile real. Si esto lo arregla, reactivar con un fix
      // estable (pinSpacing real o rango no dependiente de innerHeight).
      mm.add("(min-width: 769px)", () => {
        const delayPx = Math.round(
          Math.min(Math.max(window.innerHeight * 0.12, 72), 140),
        );
        createPinnedAboutUs(delayPx);
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [animationsEnabled] },
  );

  const titleHighlights = aboutUs.titleHighlightWords.map((word) => ({
    word,
    useGradient: true,
  }));

  return (
    <section ref={sectionRef} className={styles.aboutUs}>
      <h2 className="srOnly">{aboutUs.srHeading}</h2>
      <div className={styles.postersWrapper} />
      <div className={styles.aboutUsContent}>
        <Badge text={aboutUs.badgeText} variant="dark" align="center" />
        <BlurredStagger
          text={aboutUs.titleText}
          className={styles.trustStrip}
          highlights={titleHighlights}
        />
        <BentoGrid
          cards={aboutUs.cards}
          buttonLabel={aboutUs.cardButtonLabel}
          buttonTarget={aboutUs.cardButtonTarget}
        />
      </div>
    </section>
  );
}
