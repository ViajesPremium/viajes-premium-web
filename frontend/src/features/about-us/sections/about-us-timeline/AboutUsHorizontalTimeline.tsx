"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./AboutUsHorizontalTimeline.module.css";
import { TIMELINE_ENTRIES } from "@/features/about-us/data/timeline-data";

gsap.registerPlugin(ScrollTrigger);

export function AboutUsHorizontalTimeline() {
  const rootRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const pinHeightEl = root.querySelector<HTMLElement>("[data-pin-height]");
      const containerEl = root.querySelector<HTMLElement>("[data-container]");
      const titleEls = Array.from(
        root.querySelectorAll<HTMLElement>("[data-year-title]"),
      );

      if (!pinHeightEl || !containerEl || !titleEls.length) return;

      const scrollTween = gsap.to(containerEl, {
        xPercent: -100,
        x: window.innerWidth,
        ease: "none",
        scrollTrigger: {
          trigger: pinHeightEl,
          start: "top top",
          end: "bottom bottom",
          pin: containerEl,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      const titleTweens: gsap.core.Tween[] = [];

      titleEls.forEach((title) => {
        const section = title.closest("[data-section]");
        if (!section) return;

        const outroTween = gsap.to(title, {
          rotation: -90,
          x: window.innerWidth - title.offsetHeight,
          y: title.offsetHeight,
          ease: "expo.inOut",
          scrollTrigger: {
            trigger: section,
            containerAnimation: scrollTween,
            start: "left 0%",
            end: "left -100%",
            scrub: true,
          },
        });
        titleTweens.push(outroTween);

        const introTween = gsap.from(title, {
          rotation: 90,
          y: -window.innerHeight + title.offsetHeight,
          x: title.offsetHeight,
          ease: "expo.inOut",
          scrollTrigger: {
            trigger: section,
            containerAnimation: scrollTween,
            start: "left 100%",
            end: "left 0%",
            scrub: true,
          },
        });
        titleTweens.push(introTween);
      });

      return () => {
        titleTweens.forEach((tween) => {
          tween.scrollTrigger?.kill();
          tween.kill();
        });
        scrollTween.scrollTrigger?.kill();
        scrollTween.kill();
      };
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className={styles.root}>
      <div
        className={styles.pinHeight}
        data-pin-height
        style={{ height: `${TIMELINE_ENTRIES.length * 100}dvh` }}
      >
        <div className={styles.container} data-container>
          {TIMELINE_ENTRIES.map((entry, i) => (
            <div key={entry.year} className={styles.section} data-section>
              {i === 0 ? (
                <div className={styles.left}>
                  <p className={styles.mainTitle}>Nuestra Historia</p>
                  <p className={styles.subtitle}>
                    Desde 2005 construimos una historia de evolución continua,
                    servicio y visión premium.
                  </p>
                </div>
              ) : (
                <div
                  className={styles.leftImage}
                  style={{ backgroundImage: `url("${entry.image}")` }}
                  role="img"
                  aria-label={`Imagen de ${entry.year}`}
                />
              )}
              <div className={styles.right}>
                <p className={styles.label}>{String(i + 1).padStart(2, "0")}</p>
                <p className={styles.content}>{entry.copy}</p>
              </div>
              <p className={styles.yearTitle} data-year-title>
                {entry.year}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
