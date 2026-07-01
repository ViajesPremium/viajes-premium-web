"use client";

import { useSyncExternalStore } from "react";
import { motion } from "motion/react";
import GradientText from "@/components/ui/gradient-text/GradientText";
import { useAnimationsEnabled } from "@/lib/animation-budget";
import styles from "./BlurredStaggerText.module.css";

type HighlightWord = {
  word: string;
  className?: string;
  useGradient?: boolean;
  gradientColors?: string[];
  gradientSpeed?: number;
};

type TextAlignMode = "left" | "center" | "right";

type BlurredStaggerProps = {
  text: string;
  className?: string;
  highlights?: HighlightWord[];
  style?: React.CSSProperties;
  isActive?: boolean;
  /** En mobile (<=768px) renderiza texto plano en lugar de la animacion. */
  staticOnMobile?: boolean;
  /** Alineacion horizontal del texto animado y estatico. */
  align?: TextAlignMode;
};

function renderStaticText(text: string, highlights: HighlightWord[]) {
  return text.split(" ").map((word, index) => {
    const cleanWord = word.replace(/[.,!?;:]/g, "");
    const highlighted = highlights.find((h) => h.word === cleanWord);

    if (highlighted?.useGradient) {
      return (
        <GradientText
          key={`${word}-${index}`}
          as="span"
          colors={highlighted.gradientColors}
          animationSpeed={highlighted.gradientSpeed}
          className={`${styles.highlighted} ${styles.staticGradient}`}
        >
          {word}
        </GradientText>
      );
    }

    return (
      <span
        key={`${word}-${index}`}
        className={highlighted ? (highlighted.className ?? "") : ""}
        style={{ display: "inline-flex" }}
      >
        {word}
      </span>
    );
  });
}

export const BlurredStagger = ({
  text = "",
  className,
  highlights = [],
  style = {},
  isActive,
  staticOnMobile = false,
  align = "center",
}: BlurredStaggerProps) => {
  const animationsEnabled = useAnimationsEnabled();
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isMobile = useSyncExternalStore(
    (onStoreChange) => {
      if (!staticOnMobile || typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(max-width: 768px)");
      const handler = () => onStoreChange();
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    },
    () => {
      if (!staticOnMobile || typeof window === "undefined") return false;
      return window.matchMedia("(max-width: 768px)").matches;
    },
    () => false,
  );

  const justifyContent =
    align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";

  // Texto plano cuando la seccion lo pide y estamos en mobile
  if ((staticOnMobile && isMobile) || !animationsEnabled) {
    return (
      <div className={className} style={style}>
        <div
          className={styles.staticText}
          style={{
            justifyContent,
            textAlign: align,
          }}
        >
          {renderStaticText(text, highlights)}
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.018,
      },
    },
  };

  const letterAnimation = {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
    },
    show: {
      opacity: 1,
      filter: "blur(0px)",
    },
  };

  const controlled = isActive !== undefined;

  // Solo se monta en el cliente: los crawlers no leen letras separadas por espacios
  const animatedChars = hydrated ? (
    <motion.div
      variants={container}
      initial="hidden"
      animate={controlled ? (isActive ? "show" : "hidden") : undefined}
      whileInView={controlled ? undefined : "show"}
      viewport={controlled ? undefined : { once: false, amount: 0.4 }}
      style={{
        display: "flex",
        flexWrap: "wrap",
        columnGap: "0.3em",
        justifyContent,
        textAlign: align,
      }}
      aria-hidden="true"
    >
      {text.split(" ").map((word, wordIndex) => {
        const cleanWord = word.replace(/[.,!?;:]/g, "");
        const highlighted = highlights.find((h) => h.word === cleanWord);

        if (highlighted?.useGradient) {
          return (
            <motion.span
              key={wordIndex}
              variants={letterAnimation}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{ display: "inline-flex" }}
            >
              <GradientText
                colors={highlighted.gradientColors}
                animationSpeed={highlighted.gradientSpeed}
                className={styles.highlighted}
              >
                {word}
              </GradientText>
            </motion.span>
          );
        }

        return (
          <span
            key={wordIndex}
            className={highlighted ? (highlighted.className ?? "") : ""}
            style={{ display: "inline-flex" }}
          >
            {word.split("").map((char, charIndex) => (
              <motion.span
                key={charIndex}
                variants={letterAnimation}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        );
      })}
    </motion.div>
  ) : null;

  return (
    <div className={className} style={style}>
      {/* Texto limpio para crawlers: siempre en el HTML inicial */}
      <span className={styles.srOnly}>{text}</span>
      {animatedChars}
    </div>
  );
};
