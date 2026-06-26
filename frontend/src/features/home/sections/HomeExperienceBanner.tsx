"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Button } from "@/components/ui/button/Button";
import { usePageTransition } from "@/components/providers/page-transition/TransitionProvider";
import { scrollToSection } from "@/lib/scroll-to-section";
import styles from "./HomeExperienceBanner.module.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

const SUMMARY_TEXT =
  "Diseñamos experiencias de viaje cuidadosamente planeadas para descubrir el mundo con mayor claridad, comodidad y profundidad. Desde Japón hasta Europa, cada recorrido nace de una curaduría real y acompañamiento personalizado antes, durante y después del viaje.";
const GALLERY_IMAGES = [
  "/media/shared/home/conocenos/viaja-en-clase-premium-1.avif",
  "/media/shared/home/conocenos/viaja-en-clase-premium-2.avif",
  "/media/shared/home/conocenos/viaja-en-clase-premium-3.avif",
  "/media/shared/home/conocenos/viaja-en-clase-premium-4.avif",
] as const;

export default function HomeExperienceBanner() {
  const rootRef = useRef<HTMLElement | null>(null);
  const { triggerTransition } = usePageTransition();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const container = root.querySelector<HTMLElement>("[data-pin-container]");
      const paragraphs = container?.querySelectorAll<HTMLElement>("[data-animated-text]");
      if (!container || !paragraphs?.length) return;

      const splitInstances: SplitText[] = [];
      const lineTriggers: ScrollTrigger[] = [];
      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      paragraphs.forEach((paragraph) => {
        const split = SplitText.create(paragraph, {
          type: "words",
          wordsClass: styles.word,
        });
        splitInstances.push(split);
      });

      const applyTextAnimation = () => {
        lineTriggers.forEach((trigger) => trigger.kill());
        lineTriggers.length = 0;

        const lineGroups: HTMLElement[][] = [];
        const allWords: HTMLElement[] = [];

        paragraphs.forEach((paragraph) => {
          const words = Array.from(paragraph.querySelectorAll<HTMLElement>(`.${styles.word}`));
          if (!words.length) return;
          allWords.push(...words);

          const lines: HTMLElement[][] = [[]];
          let lineIndex = 0;

          words.forEach((word, index) => {
            if (index > 0 && word.offsetTop !== words[index - 1].offsetTop) {
              lines.push([]);
              lineIndex += 1;
            }
            lines[lineIndex].push(word);
          });

          lines.forEach((line) => {
            if (line.length) lineGroups.push(line);
          });
        });

        if (!lineGroups.length || !allWords.length) return;
        const startX = Math.max(window.innerWidth - 25, 240);
        gsap.set(allWords, { x: startX });

        lineGroups.forEach((lineWords) => {
          const tween = gsap.to(
            lineWords,
            {
              x: 0,
              stagger: isMobile ? 0.08 : 0.2,
              ease: "power1.inOut",
              immediateRender: false,
              force3D: true,
              scrollTrigger: {
                trigger: root,
                start: "top 85%",
                end: "top 10%",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );

          if (tween.scrollTrigger) lineTriggers.push(tween.scrollTrigger);
        });
      };

      applyTextAnimation();
      ScrollTrigger.addEventListener("refreshInit", applyTextAnimation);

      const visualWraps = Array.from(
        root.querySelectorAll<HTMLElement>("[data-sticky-feature-visual-wrap]"),
      );
      const progressBar = root.querySelector<HTMLElement>("[data-sticky-feature-progress]");
      const visualCount = visualWraps.length;
      const visualSteps = Math.max(1, visualCount - 1);
      const pinScrollPerStep = isMobile ? 28 : 36;

      let galleryPinTrigger: ScrollTrigger | null = null;
      if (isMobile) {
        gsap.set(visualWraps, { clearProps: "clipPath" });
        if (progressBar) gsap.set(progressBar, { clearProps: "transform,transformOrigin" });
      } else {
        if (visualWraps[0]) {
          gsap.set(visualWraps, { clipPath: "inset(50%)" });
          gsap.set(visualWraps[0], { clipPath: "inset(0%)" });
        }
        if (progressBar) gsap.set(progressBar, { scaleX: 0, transformOrigin: "0% 50%" });

        galleryPinTrigger = ScrollTrigger.create({
          trigger: root,
          start: "bottom bottom",
          end: () => `+=${visualSteps * pinScrollPerStep}%`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 0.8,
          scrub: 0.7,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          onRefreshInit: () => {
            if (visualWraps.length) {
              gsap.set(visualWraps, { clipPath: "inset(50%)" });
              gsap.set(visualWraps[0], { clipPath: "inset(0%)" });
            }
            if (progressBar) gsap.set(progressBar, { scaleX: 0 });
          },
          onUpdate: (self) => {
            const p = self.progress;
            if (progressBar) {
              gsap.set(progressBar, { scaleX: p });
            }
            const stepped = p * visualSteps;
            visualWraps.forEach((wrap, index) => {
              if (index === 0) {
                gsap.set(wrap, { clipPath: "inset(0%)" });
                return;
              }
              const local = Math.max(0, Math.min(1, stepped - (index - 1)));
              const inset = 50 * (1 - local);
              gsap.set(wrap, { clipPath: `inset(${inset}%)` });
            });
          },
        });
      }

      return () => {
        galleryPinTrigger?.kill();
        ScrollTrigger.removeEventListener("refreshInit", applyTextAnimation);
        lineTriggers.forEach((trigger) => trigger.kill());
        splitInstances.forEach((split) => split.revert());
      };
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className={styles.mwgEffect097}>
      <div className={styles.container} data-pin-container>
        <div className={styles.content}>
          <div className={styles.textColumn}>
            <div className={styles.block}>
              <p className={styles.paragraph} data-animated-text>
                {SUMMARY_TEXT}
              </p>
            </div>
          </div>

          <div className={styles.ctaWrap}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => scrollToSection("#form", { duration: 1.15 })}
            >
              Contacta un asesor
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => triggerTransition("/nosotros")}
            >
              Conoce Viajes Premium
            </Button>
          </div>

          <div className={styles.galleryColumn}>
            <div className={styles.imgList}>
              {GALLERY_IMAGES.map((src, index) => (
                <div key={src} data-sticky-feature-visual-wrap className={styles.imgItem}>
                  <Image
                    src={src}
                    alt={`Galería de experiencias premium ${index + 1}`}
                    title={`Galería de experiencias premium ${index + 1}`}
                    fill
                    sizes="(max-width: 767px) 100vw, 30vw"
                    className={styles.galleryImg}
                    loading={index === 0 ? "eager" : "lazy"}
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
            <div className={styles.progressWrap}>
              <div className={styles.progressBar} data-sticky-feature-progress />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
