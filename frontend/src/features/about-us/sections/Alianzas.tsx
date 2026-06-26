"use client";

import Image from "next/image";
import styles from "./alianzas.module.css";
import { BlurredStagger } from "@/components/ui/blurred-stagger-text/BlurredStaggerText";

type AllianceLogo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const ROW_ONE: AllianceLogo[] = [
  {
    src: "/media/shared/home/alianzas/profeco-y-viajes-premium.png",
    alt: "Profeco y Viajes Premium",
    width: 420,
    height: 120,
  },
  {
    src: "/media/shared/home/alianzas/air-canada-y-viajes-premium.png",
    alt: "Air Canada y Viajes Premium",
    width: 420,
    height: 120,
  },
  {
    src: "/media/shared/home/alianzas/aeromexivo-y-viajes-premium.png",
    alt: "Aeroméxico y Viajes Premium",
    width: 420,
    height: 120,
  },
  {
    src: "/media/shared/home/alianzas/volaris-y-viajes-premium.png",
    alt: "Volaris y Viajes Premium",
    width: 420,
    height: 120,
  },
];

const ROW_TWO: AllianceLogo[] = [
  {
    src: "/media/shared/home/alianzas/air-canada-y-viajes-premium.png",
    alt: "Air Canada y Viajes Premium",
    width: 420,
    height: 120,
  },
  {
    src: "/media/shared/home/alianzas/bonjour-quebec-y-viajes-premium.png",
    alt: "Bonjour Quebec y Viajes Premium",
    width: 420,
    height: 120,
  },
  {
    src: "/media/shared/home/alianzas/chepe-y-viajes-premium.png",
    alt: "Chepe y Viajes Premium",
    width: 460,
    height: 120,
  },
  {
    src: "/media/shared/home/alianzas/japan-endless-discovery-y-viajes-premium.png",
    alt: "Japan Endless Discovery y Viajes Premium",
    width: 420,
    height: 120,
  },
];

export default function Alianzas() {
  return (
    <section className={styles.section} aria-labelledby="alianzas-title">
      <header className={styles.header}>
        <BlurredStagger text="Nuestras alianzas" className={styles.title} />
        <p className={styles.subtitle}>
          Colaboramos con marcas y aliados estratégicos para construir
          experiencias premium consistentes en cada destino.
        </p>
      </header>

      <div className={`${styles.row} ${styles.rowA}`}>
        {ROW_ONE.map((logo) => (
          <article key={logo.src} className={styles.logoItem}>
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className={styles.logoImage}
            />
          </article>
        ))}
      </div>

      <div className={`${styles.row} ${styles.rowB}`}>
        {ROW_TWO.map((logo) => (
          <article key={logo.src} className={styles.logoItem}>
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className={styles.logoImage}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
