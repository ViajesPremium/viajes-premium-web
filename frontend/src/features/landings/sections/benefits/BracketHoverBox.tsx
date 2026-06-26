"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

import styles from "./choose.module.css";

type BracketHoverBoxProps = {
  className?: string;
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
};

export default function BracketHoverBox({
  className,
  imageSrc,
  imageAlt,
  children,
}: BracketHoverBoxProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, {
    stiffness: 180,
    damping: 22,
    mass: 0.5,
  });
  const mouseYSpring = useSpring(y, {
    stiffness: 180,
    damping: 22,
    mass: 0.5,
  });

  const top = useTransform(mouseYSpring, [0.5, -0.5], ["62%", "36%"]);
  const left = useTransform(mouseXSpring, [0.5, -0.5], ["72%", "34%"]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const xPct = (event.clientX - rect.left) / rect.width - 0.5;
    const yPct = (event.clientY - rect.top) / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial="initial"
      whileHover="whileHover"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={[styles.bracketBox, styles.hoverBracket, className]
        .filter(Boolean)
        .join(" ")}
    >
      <motion.div
        style={{
          top,
          left,
          translateX: "-16%",
          translateY: "-50%",
        }}
        variants={{
          initial: {
            scale: 0.72,
            opacity: 0,
            rotate: "-10deg",
            filter: "blur(0px)",
          },
          whileHover: {
            scale: 1,
            opacity: 1,
            rotate: "5deg",
            filter: "blur(0px)",
          },
        }}
        transition={{
          type: "spring",
          stiffness: 360,
          damping: 30,
          mass: 0.85,
        }}
        className={styles.hoverPreview}
        aria-hidden="true"
      >
        <div className={styles.hoverPreviewFrame}>
          <Image
            src={imageSrc}
            alt={imageAlt}
            title={imageAlt}
            fill
            sizes="(max-width: 1200px) 0px, 220px"
            className={styles.hoverPreviewImage}
          />
        </div>
      </motion.div>

      <div className={styles.bracketContent}>{children}</div>
    </motion.div>
  );
}
