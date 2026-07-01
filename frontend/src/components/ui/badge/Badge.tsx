"use client";

import styles from "./Badge.module.css";
import { motion } from "motion/react";
import { useAnimationsEnabled } from "@/lib/animation-budget";

interface BadgeProps {
  text: string;
  variant?: "light" | "dark";
  align?: "left" | "center";
}

export default function Badge({
  text,
  variant = "light",
  align = "left",
}: BadgeProps) {
  const animationsEnabled = useAnimationsEnabled();
  const containerClass = [
    styles.badgeContainer,
    align === "center" ? styles.badgeContainerCentered : "",
  ]
    .filter(Boolean)
    .join(" ");

  const badgeClass = [styles.badge, variant === "dark" ? styles.badgeDark : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClass}>
      {animationsEnabled ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className={badgeClass}
        >
          <p className={styles.text}>{text}</p>
        </motion.div>
      ) : (
        <div className={badgeClass}>
          <p className={styles.text}>{text}</p>
        </div>
      )}
    </div>
  );
}
