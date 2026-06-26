import styles from "./HomeHero.module.css";

export default function HomeHero() {
  return (
    <section className={styles.hero} aria-label="Video principal">
      <video
        className={styles.video}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        {/* Prefer WebM first so supported browsers take the lighter file. */}
        <source src="/media/shared/home/videos/herov-2.webm" type="video/webm" />
        <source src="/media/shared/home/videos/herov-2.mp4" type="video/mp4" />
      </video>

      <div className={styles.heroContent}>
        <h1 className="srOnly">
          Experiencias de viaje diseñadas alrededor del mundo
        </h1>
        <div className={styles.heroTitle} aria-hidden="true">
          <span className={styles.heroLine1}>Viajar es diferente en</span>
          <span className={styles.heroLine2}>Clase PREMIUM</span>
        </div>
      </div>
    </section>
  );
}
