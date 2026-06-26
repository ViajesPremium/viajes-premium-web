import styles from "./BlogHero.module.css";

type BlogHeroProps = {
  title: string;
  subtitle: string;
};

export default function BlogHero({ title, subtitle }: BlogHeroProps) {
  return (
    <section className={styles.hero} aria-label="Hero del blog">
      <div className={styles.square} aria-hidden="true" />
      <div className={styles.textWrap}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </section>
  );
}
