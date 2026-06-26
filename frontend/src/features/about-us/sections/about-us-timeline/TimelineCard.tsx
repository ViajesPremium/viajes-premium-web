import type { TimelineEntry } from "@/features/about-us/data/timeline-data";
import styles from "./about-us.module.css";

type TimelineCardProps = {
  entry: TimelineEntry;
  cardRef: (el: HTMLElement | null) => void;
  yearRef: (el: HTMLHeadingElement | null) => void;
};

export function AboutUsTimelineCard({
  entry,
  cardRef,
  yearRef,
}: TimelineCardProps) {
  return (
    <li className={styles.row}>
      <article className={styles.card} ref={cardRef}>
        <div className={styles.cardContent}>
          <h2 className={styles.year} ref={yearRef}>
            {entry.year}
          </h2>
          <p className={styles.copy}>{entry.copy}</p>
        </div>
        <div
          className={styles.cardMedia}
          style={{ backgroundImage: `url("${entry.image}")` }}
          role="img"
          aria-label={`Fotografia de ${entry.year}`}
        />
      </article>
    </li>
  );
}
