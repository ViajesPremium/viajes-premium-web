import { BlurredStagger } from "@/components/ui/blurred-stagger-text/BlurredStaggerText";
import styles from "./about-us.module.css";

export function AboutUsHeader() {
  return (
    <header className={styles.header}>
      <BlurredStagger text="Nuestra Historia" className={styles.title} />
      <p className={styles.subtitle}>
        Desde 2005 construimos una historia de evoluci?n continua, servicio
        y visi?n premium.
      </p>
    </header>
  );
}
