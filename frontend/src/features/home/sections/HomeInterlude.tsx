"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { HOME_INTERLUDE } from "@/features/home/data/home-interlude.data";
import styles from "@/features/landings/sections/founder/Founder.module.css";

type ScrollRowProps = {
  text: string;
  fromX: string;
  toX: string;
  smooth: MotionValue<number>;
};

function ScrollRow({ text, fromX, toX, smooth }: ScrollRowProps) {
  const x = useTransform(smooth, [0, 1], [fromX, toX]);
  return (
    <div className={styles.row}>
      <motion.div style={{ x }} className={styles.track}>
        <span className={styles.chunk}>{text}</span>
        <span className={styles.chunk}>{text}</span>
        <span className={styles.chunk}>{text}</span>
        <span className={styles.chunk}>{text}</span>
      </motion.div>
    </div>
  );
}

export default function HomeInterlude() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { damping: 30, stiffness: 120 });

  const highlightText = HOME_INTERLUDE.quoteHighlight ?? "";
  const highlightIndex = highlightText
    ? HOME_INTERLUDE.quote.indexOf(highlightText)
    : -1;
  const quoteBefore =
    highlightIndex >= 0
      ? HOME_INTERLUDE.quote.slice(0, highlightIndex)
      : HOME_INTERLUDE.quote;
  const quoteAfter =
    highlightIndex >= 0
      ? HOME_INTERLUDE.quote.slice(highlightIndex + highlightText.length)
      : "";

  return (
    <section className={styles.interlude} ref={sectionRef}>
      <h2 className="srOnly">{HOME_INTERLUDE.srHeading}</h2>

      <div className={styles.textLayer} aria-hidden="true">
        <ScrollRow text={HOME_INTERLUDE.rows[0]} fromX="0%" toX="-18%" smooth={smooth} />
        <ScrollRow text={HOME_INTERLUDE.rows[1]} fromX="-18%" toX="0%" smooth={smooth} />
        <ScrollRow text={HOME_INTERLUDE.rows[2]} fromX="-4%" toX="-20%" smooth={smooth} />
      </div>

      <article className={styles.card}>
        <div className={styles.imageWrap}>
          <Image
            src={HOME_INTERLUDE.image.src}
            alt={HOME_INTERLUDE.image.alt}
            title={HOME_INTERLUDE.image.alt}
            fill
            className={styles.photo}
            sizes="(max-width: 768px) 92vw, 420px"
          />
          <div className={styles.imageOverlay} />
        </div>

        <div className={styles.copy}>
          <p className={styles.role}>{HOME_INTERLUDE.role}</p>
          <h3 className={styles.name}>{HOME_INTERLUDE.name}</h3>
          <p className={styles.subtitle}>
            &quot; {quoteBefore}
            {highlightIndex >= 0 ? (
              <span className={styles.textHighlight}>{highlightText}</span>
            ) : null}
            {quoteAfter}
            &quot;
          </p>
        </div>
      </article>
    </section>
  );
}
