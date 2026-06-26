"use client";

import Badge from "@/components/ui/badge/Badge";
import LogoLoop, { type LogoItem } from "@/components/ui/marquee/Marquee";
import styles from "./HomeMarquee.module.css";

const HOME_MARQUEE = {
  srHeading: "Alianzas de Viajes Premium",
  badgeText: "Nuestras alianzas",
  logos: [
    {
      src: "/media/shared/home/alianzas/aeromexivo-y-viajes-premium.png",
      alt: "Aeromexico y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/air-canada-y-viajes-premium.png",
      alt: "Air Canada y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/bonjour-quebec-y-viajes-premium.png",
      alt: "Bonjour Quebec y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/chepe-y-viajes-premium.png",
      alt: "Chepe y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/iberia-y-viajes-premium.png",
      alt: "Iberia y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/japan-endless-discovery-y-viajes-premium.png",
      alt: "Japan Endless Discovery y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/jnto-y-viajes-premium.png",
      alt: "JNTO y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/latam-y-viajes-premium.png",
      alt: "LATAM y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/peru-y-viajes-premium.png",
      alt: "Peru y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/perurail-y-viajes-premium.png",
      alt: "Perurail y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/profeco-y-viajes-premium.png",
      alt: "Profeco y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/promperu-y-viajes-premium.png",
      alt: "Promperu y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/turismo-y-viajes-premium.png",
      alt: "Turismo y Viajes Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/shared/home/alianzas/volaris-y-viajes-premium.png",
      alt: "Volaris y Viajes Premium",
      width: 446,
      height: 164,
    },
  ] as LogoItem[],
};

export default function HomeMarquee() {
  return (
    <section className={styles.section} aria-label={HOME_MARQUEE.srHeading}>
      <h2 className="srOnly">{HOME_MARQUEE.srHeading}</h2>
      <div className={styles.container}>
        <div className={styles.header}>
          <Badge text={HOME_MARQUEE.badgeText} variant="light" align="center" />
        </div>

        <div className={styles.stage}>
          <LogoLoop
            className={styles.marquee}
            logos={HOME_MARQUEE.logos}
            speed={58}
            direction="left"
            logoHeight={45}
            gap={90}
            fadeOutColor="var(--black)"
            fadeOut
            pauseOnHover
          />
        </div>
      </div>
    </section>
  );
}
