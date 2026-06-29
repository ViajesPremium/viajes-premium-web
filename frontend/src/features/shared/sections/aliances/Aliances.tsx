"use client";

import Image from "next/image";
import Badge from "@/components/ui/badge/Badge";
import LogoLoop, { type LogoItem } from "@/components/ui/marquee/Marquee";
import type { LandingAliances } from "@/features/landings/data/types";
import styles from "./marquee-section.module.css";

type MarqueeSectionProps = {
  landing: {
    slug?: string;
    aliances: LandingAliances;
  };
};

export default function MarqueeSection({ landing }: MarqueeSectionProps) {
  const { slug, aliances: marquee } = landing;
  const showIntroLogos =
    slug === "japon-premium" ||
    slug === "europa-premium" ||
    slug === "corea-premium" ||
    slug === "barrancas-premium";

  const logoItems: LogoItem[] = marquee.logos;
  const splitIndex = Math.ceil(logoItems.length / 2);
  const topRowLogos = logoItems.slice(0, splitIndex);
  const bottomRowLogos = logoItems.slice(splitIndex);

  return (
    <section className={styles.section} aria-label={marquee.srHeading}>
      <h2 className="srOnly">{marquee.srHeading}</h2>
      <div className={styles.container}>
        <div className={styles.header}>
          <Badge text={marquee.badgeText} variant="light" align="center" />
        </div>

        {showIntroLogos ? (
          <div className={styles.logoIntro}>
            <Image
              src={marquee.introLeftLogo.src}
              alt={marquee.introLeftLogo.alt}
              title={marquee.introLeftLogo.alt}
              width={marquee.introLeftLogo.width}
              height={marquee.introLeftLogo.height}
              className={styles.logoIntroImage}
            />
            <span style={{ fontSize: "30px", color: "var(--white)" }}>x</span>
            <Image
              src={marquee.introRightLogo.src}
              alt={marquee.introRightLogo.alt}
              title={marquee.introRightLogo.alt}
              width={marquee.introRightLogo.width}
              height={marquee.introRightLogo.height}
              className={styles.logoIntroImage}
            />
          </div>
        ) : null}

        <div className={styles.stage}>
          <div className={styles.marqueeRow}>
            <LogoLoop
              className={styles.marquee}
              logos={topRowLogos}
              speed={120}
              direction="right"
              logoHeight={45}
              gap={110}
              fadeOutColor="var(--black)"
              fadeOut
              pauseOnHover
              ariaLabel={`${marquee.srHeading} - fila superior`}
            />
          </div>
          <div className={styles.marqueeRow}>
            <LogoLoop
              className={styles.marquee}
              logos={bottomRowLogos}
              speed={120}
              direction="left"
              logoHeight={45}
              gap={110}
              fadeOutColor="var(--black)"
              fadeOut
              pauseOnHover
              ariaLabel={`${marquee.srHeading} - fila inferior`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
