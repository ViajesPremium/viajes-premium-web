"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/features/shared/components/ui/button/Button";
import TextPressure from "@/features/shared/components/ui/text-animations/TextPressure";
import type { LandingTheme } from "@/features/landings/data/types";
import HeroOverlay from "./HeroOverlay";
import styles from "./Hero.module.css";

const pressureFontFamily = "var(--font-nohemi)";

type PressureWordProps = {
  text: string;
  fontWeight: number;
  italic?: boolean;
  weightFrom: number;
  weightTo: number;
  scaleFrom: number;
  scaleTo: number;
};

function PressureWord({
  text,
  fontWeight,
  italic = false,
  weightFrom,
  weightTo,
  scaleFrom,
  scaleTo,
}: PressureWordProps) {
  return (
    <TextPressure
      text={text}
      fontFamily={pressureFontFamily}
      fontWeight={fontWeight}
      fontStyle="normal"
      fontSize="inherit"
      flex={false}
      alpha={false}
      stroke={false}
      width
      weight
      italic={italic}
      weightFrom={weightFrom}
      weightTo={weightTo}
      scaleFrom={scaleFrom}
      scaleTo={scaleTo}
      textColor="inherit"
      minFontSize={50}
    />
  );
}

type HeroProps = {
  landing: LandingTheme;
};

export default function Hero({ landing }: HeroProps) {
  const router = useRouter();
  const { hero } = landing;
  const showCircle = landing.slug === "japon-premium";

  const goToTarget = useCallback(
    (target: string) => {
      if (!target) return;

      if (target.startsWith("#")) {
        const targetId = target.slice(1);
        const element = document.getElementById(targetId);

        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
        }

        return;
      }

      router.push(target);
    },
    [router],
  );

  const handleGoToPrimary = useCallback(() => {
    goToTarget(hero.ctaPrimary.target);
  }, [goToTarget, hero.ctaPrimary.target]);

  return (
    <section className={styles.hero} id="inicio">
      <div className={styles.titleContainer}>
        <h1 className={styles.srOnly}>{hero.seoHeading}</h1>

        <div className={styles.h1} aria-hidden="true">
          <span className={`${styles.line} ${styles.desktopLine}`}>
            <span className={styles.wordSlot}>
              <PressureWord
                text={hero.title.wordOne}
                fontWeight={100}
                italic={false}
                weightFrom={100}
                weightTo={400}
                scaleFrom={1}
                scaleTo={1}
              />
            </span>
            <span className={styles.wordSlot}>
              <PressureWord
                text={hero.title.wordTwo}
                fontWeight={100}
                italic={false}
                weightFrom={100}
                weightTo={400}
                scaleFrom={1}
                scaleTo={1}
              />
            </span>
          </span>

          <span className={`${styles.line} ${styles.desktopLine}`}>
            <span className={styles.wordSlot}>
              <PressureWord
                text={hero.title.wordThree}
                fontWeight={900}
                italic={false}
                weightFrom={500}
                weightTo={100}
                scaleFrom={1.09}
                scaleTo={1}
              />
            </span>
            <span className={styles.wordSlot}>
              <PressureWord
                text={hero.title.wordFour}
                fontWeight={900}
                italic={false}
                weightFrom={500}
                weightTo={100}
                scaleFrom={1.09}
                scaleTo={1}
              />
            </span>
          </span>

          <span className={styles.mobileLine}>
            <span className={styles.mobileSmall}>{hero.title.wordOne}</span>
            <span className={styles.mobileBig}>{hero.title.wordTwo}</span>
          </span>
          <span className={styles.mobileLine}>
            <span className={styles.mobileSmall}>{hero.title.wordThree}</span>
            <span className={styles.mobileBig}>{hero.title.wordFour}</span>
          </span>
        </div>
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.copyColumn}>
          <p className={styles.description}>{hero.description}</p>

          <div className={styles.scrollCue}>
            <span className={styles.scrollCueIconWrap} aria-hidden="true">
              <ChevronDownIcon />
            </span>
            <span className={styles.scrollCueLabel}>Desliza hacia abajo</span>
          </div>
        </div>

        <div className={styles.ctaRow}>
          <div className={styles.heroPrimaryCtaShell}>
            <Button
              type="button"
              fullWidth
              variant="primary"
              onClick={handleGoToPrimary}
            >
              {hero.ctaPrimary.label}
            </Button>
          </div>
        </div>
      </div>

      {showCircle ? <div className={styles.circle} aria-hidden="true" /> : null}

      <HeroOverlay
        baseImage={hero.heroOverlay.baseImage}
        overlayImage={hero.heroOverlay.overlayImage}
        baseAlt={hero.heroOverlay.baseAlt}
        overlayAlt={hero.heroOverlay.overlayAlt}
      />
    </section>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.scrollCueIcon}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
