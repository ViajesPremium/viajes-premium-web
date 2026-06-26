"use client";

import Image from "next/image";
import styles from "./about-us.module.css";

const HERO_GRID_IMAGES = [
  "/media/shared/about-us/hero/japon-premium-nosotros-vp.avif",
  "/media/shared/about-us/hero/europa-premium-nosotros-vp.avif",
  "/media/shared/about-us/hero/corea-premium-nosotros-vp.avif",
  "/media/shared/about-us/hero/canada-premium-nosotros-vp.avif",
  "/media/shared/about-us/hero/peru-premium-nosotros-vp.avif",
  "/media/shared/about-us/hero/chiapas-premium-nosotros-vp.avif",
  "/media/shared/about-us/hero/yucatan-premium-nosotros-vp.avif",
  "/media/shared/about-us/hero/barrancas-premium-nosotros-vp.avif",
];

export default function AboutUsHero() {
  return (
    <section className={styles.container} aria-label="Nosotros Hero">
      <div className={styles.media} aria-hidden="true">
        <div className={styles.gridViewport}>
          <div className={styles.destinationGrid}>
            {HERO_GRID_IMAGES.map((src, index) => (
              <div key={src} className={styles.gridColumn}>
                <Image
                  src={src}
                  alt={`Viajes PREMIUM - imagen ${index + 1}`}
                  title={`Viajes PREMIUM - imagen ${index + 1}`}
                  fill
                  priority={index < 2}
                  sizes="(max-width: 959px) 22.5vw, 10.5vw"
                  className={styles.gridImage}
                />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <p className={styles.eyebrow}>
          21 años
          <br />
          <span className={styles.highlight}>brindando experiencias</span>
        </p>
        <div className={styles.logoMask} role="img" aria-label="Viajes Premium" />
      </div>
    </section>
  );
}
