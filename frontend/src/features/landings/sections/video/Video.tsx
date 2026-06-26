import styles from "./Video.module.css";

type VideoProps = {
  srHeading: string;
  desktop: { webm: string; mp4: string };
  mobile: { webm: string; mp4: string };
  alt: string;
};

export default function Video({
  srHeading,
  desktop,
  mobile,
  alt,
}: VideoProps) {
  return (
    <section className={styles.section} id="video" aria-label={srHeading}>
      <h2 className="srOnly">{srHeading}</h2>

      <video
        className={`${styles.video} ${styles.videoDesktop}`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-label={alt}
      >
        <source src={desktop.webm} type="video/webm" />
        <source src={desktop.mp4} type="video/mp4" />
      </video>

      <video
        className={`${styles.video} ${styles.videoMobile}`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-label={alt}
      >
        <source src={mobile.webm} type="video/webm" />
        <source src={mobile.mp4} type="video/mp4" />
      </video>
    </section>
  );
}
