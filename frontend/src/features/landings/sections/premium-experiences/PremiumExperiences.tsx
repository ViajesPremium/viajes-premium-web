"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/features/shared/components/ui/button/Button";
import Badge from "@/features/shared/components/ui/badge/Badge";
import { scrollToSection } from "@/lib/scroll-to-section";
import { usePageTransition } from "@/components/providers/page-transition/transition-provider";
import type { LandingTheme } from "@/features/landings/data/types";
import styles from "./PremiumExperiences.module.css";

gsap.registerPlugin(ScrollTrigger);

type PremiumExperiencesProps = {
  landing: LandingTheme;
};

function normalizeWord(word: string) {
  return word.trim().toLowerCase();
}

function PremiumTitle({
  text,
  highlightWords,
  className,
}: {
  text: string;
  highlightWords: string[];
  className?: string;
}) {
  const words = text.split(/\s+/);
  const highlightSet = new Set(highlightWords.map(normalizeWord));

  return (
    <h2 className={className}>
      {words.map((word, index) => {
        const plain = word.replace(/[.,;:!?]$/g, "");
        const isHighlighted = highlightSet.has(normalizeWord(plain));

        return (
          <span
            key={`${word}-${index}`}
            data-premium-title-word
            className={
              isHighlighted
                ? styles.titleWordHighlighted
                : styles.titleWord
            }
          >
            {word}
          </span>
        );
      })}
    </h2>
  );
}

export default function PremiumExperiences({ landing }: PremiumExperiencesProps) {
  const { premiumExperiences } = landing;
  const { triggerTransition } = usePageTransition();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  const handleGoToTarget = useCallback(
    (buttonTarget: string) => {
      if (!buttonTarget) return;

      if (buttonTarget.startsWith("#")) {
        scrollToSection(buttonTarget, { duration: 1.15 });
        return;
      }

      triggerTransition(buttonTarget);
    },
    [triggerTransition],
  );

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cardElements = cardRefs.current.filter(Boolean) as HTMLElement[];
    const titleElements = Array.from(
      section.querySelectorAll<HTMLElement>("[data-premium-title-word]"),
    );
    if (!cardElements.length && !titleElements.length) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      const delayPx = Math.round(
        Math.min(Math.max(window.innerHeight * 0.12, 72), 140),
      );

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
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
        toggleActions: "play none none none",
        once: true,
      },
    });

    if (titleElements.length) {
      tl.fromTo(
        titleElements,
        {
          y: 18,
          opacity: 0,
          filter: "blur(12px)",
        },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.04,
        },
        0,
      );
    }

    if (cardElements.length) {
      tl.fromTo(
        cardElements,
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
        },
        0.15,
      );
    }

    return () => {
      mm.revert();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.premiumExperiences}
      id="experiencias"
    >
      <h2 className={styles.srOnly}>{premiumExperiences.srHeading}</h2>
      <div className={styles.postersWrapper} aria-hidden="true" />
      <div className={styles.premiumExperiencesContent}>
        <Badge
          text={premiumExperiences.badgeText}
          variant="dark"
          align="center"
        />

        <PremiumTitle
          text={premiumExperiences.titleText}
          highlightWords={premiumExperiences.titleHighlightWords}
          className={styles.titleStrip}
        />

        <div className={styles.bentoGrid}>
          {premiumExperiences.cards.map((card, index) => (
            <article
              key={`${card.text}-${index}`}
              ref={(element) => {
                cardRefs.current[index] = element;
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
                className={styles.cardImage}
              />
              <p className={styles.bentoCardText}>{card.text}</p>
              <div className={styles.bentoCardOverlay} />

              <div className={styles.bentoCardFooter}>
                <span className={styles.bentoCardExperiences}>
                  {card.experiences}
                </span>

                <Button
                  variant="secondary"
                  onClick={() =>
                    handleGoToTarget(premiumExperiences.cardButtonTarget)
                  }
                  className={styles.cardButton}
                >
                  {premiumExperiences.cardButtonLabel}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
