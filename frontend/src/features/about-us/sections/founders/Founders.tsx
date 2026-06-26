import styles from "./Founders.module.css";
import { BlurredStagger } from "@/components/ui/blurred-stagger-text/BlurredStaggerText";

export default function Founders() {
  return (
    <section className={styles.container} aria-labelledby="founders-title">
      <div className={styles.content}>
        <article className={styles.founderCard}>
          <div className={styles.founderInfo}>
            <span className={styles.founderPosition}>
              Directora Comercial de Viajes PREMIUM
            </span>
            <BlurredStagger text="Karina Sánchez" className={styles.founderName} />
          </div>

          <figure className={styles.founderImageContainer}>
            <img
              src="/media/shared/about-us/karina.webp"
              alt="Karina Sanchez, Directora Comercial de Viajes PREMIUM"
              title="Karina Sanchez, Directora Comercial de Viajes PREMIUM"
              className={styles.founderImage}
            />
          </figure>

          <p className={styles.founderText}>
            Nuestra misión es escuchar, entender y diseñar experiencias que no
            solo cumplan expectativas, sino que conecten emocionalmente. Para
            nosotros, viajar no es acumular destinos, es crear vínculos con cada
            lugar.
          </p>
        </article>

        <div className={styles.centerContainer}>
        <BlurredStagger text="Nuestros Fundadores" className={styles.centerTitle} />
        </div>

        <article className={styles.founderCard}>
          <div className={styles.founderInfo}>
            <span className={styles.founderPosition}>
              Director General de Viajes PREMIUM
            </span>
            <BlurredStagger text="Andrés Bernal" className={styles.founderName} />
          </div>

          <figure className={styles.founderImageContainer}>
            <img
              src="/media/shared/about-us/karina.webp"
              alt="Andres Bernal, Director General de Viajes PREMIUM"
              title="Andres Bernal, Director General de Viajes PREMIUM"
              className={styles.founderImage}
            />
          </figure>

          <p className={styles.founderText}>
            No vendemos itinerarios. Diseñamos historias que se viven con todos
            los sentidos. Después de más de 20 años de experiencia, seguimos
            creyendo que la forma en la que viajas sí importa, porque define cómo
            recuerdas el mundo.
          </p>
        </article>
      </div>
    </section>
  );
}
