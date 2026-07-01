"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button/Button";
import { scrollToSection } from "@/lib/scroll-to-section";
import { usePageTransition } from "@/components/providers/page-transition/TransitionProvider";
import { useAnimationsEnabled } from "@/lib/animation-budget";
import styles from "./PremiumExperiences.module.css";
import type { LandingPremiumExperiencesCard } from "@/features/landings/data/types";

gsap.registerPlugin(ScrollTrigger);

type BentoGridProps = {
  cards: LandingPremiumExperiencesCard[];
  buttonLabel: string;
  buttonTarget: string;
};

export default function BentoGrid({
  cards,
  buttonLabel,
  buttonTarget,
}: BentoGridProps) {
  const { triggerTransition } = usePageTransition();
  const animationsEnabled = useAnimationsEnabled();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleGoToTarget = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (buttonTarget.startsWith("#")) {
        scrollToSection(buttonTarget, { duration: 1.15 });
        return;
      }
      triggerTransition(buttonTarget);
    },
    [buttonTarget, triggerTransition],
  );

  useEffect(() => {
    const cardElements = cardRefs.current.filter(Boolean) as HTMLElement[];
    if (!cardElements.length) return;
    if (!animationsEnabled) {
      gsap.set(cardElements, { clearProps: "all" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardElements,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardElements[0],
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
        },
      );
    });
    return () => ctx.revert();
  }, [animationsEnabled]);

  return (
    <div className={styles.bentoGrid}>
      {cards.map((card, index) => (
        <div
          key={`${card.text}-${index}`}
          ref={(el) => {
            cardRefs.current[index] = el;
          }}
          className={styles.bentoCard}
        >
          <Image
            src={card.image}
            alt={card.text}
            title={card.text}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
            style={{ objectFit: "cover" }}
          />
          <p className={styles.bentoCardText}>{card.text}</p>
          <div className={styles.bentoCardOverlay} />

          <div className={styles.bentoCardFooter}>
            <span className={styles.bentoCardExperiences}>
              {card.experiences}
            </span>

            <Button
              variant="secondary"
              onClick={handleGoToTarget}
              className="shrink-0"
            >
              {buttonLabel}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
