"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { BlurredStagger } from "@/components/ui/blurred-stagger-text/BlurredStaggerText";
import { useAnimationsEnabled } from "@/lib/animation-budget";
import type { LandingTheme } from "@/features/landings/data/types";
import styles from "./Promise.module.css";

gsap.registerPlugin(ScrollTrigger);

type PromiseProps = {
  landing: LandingTheme;
};

export default function Includes({ landing }: PromiseProps) {
  const { promise: includes } = landing;
  const animationsEnabled = useAnimationsEnabled();

  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const container = root.querySelector<HTMLElement>(`.${styles.container}`);
      const circles = Array.from(
        root.querySelectorAll<HTMLElement>(`.${styles.circle}`),
      );
      const scrollLabel = root.querySelector<HTMLElement>(`.${styles.scroll}`);

      if (!container || circles.length === 0) return;
      if (!animationsEnabled) {
        gsap.set(circles, { clearProps: "all" });
        if (scrollLabel) gsap.set(scrollLabel, { clearProps: "all" });
        return;
      }

      // Cuántas "pantallas" de scroll dura el pin (1 de entrada + 1 por tarjeta).
      const panels = Math.max(circles.length + 1, 3);

      const renderCards = (
        progress: number,
        cardAngle: number,
        offscreenAngle: number,
      ) => {
        const travelSlots = Math.max(circles.length - 1, 1);
        const exactIndex = gsap.utils.clamp(
          0,
          travelSlots,
          gsap.utils.mapRange(0.01, 0.8, 0, travelSlots, progress),
        );

        circles.forEach((circle, index) => {
          const distance = index - exactIndex;
          const absDistance = Math.abs(distance);
          const rotation = gsap.utils.clamp(
            -offscreenAngle,
            offscreenAngle,
            distance * cardAngle,
          );

          gsap.set(circle, {
            autoAlpha: absDistance <= 1.15 ? 1 : 0,
            force3D: true,
            rotation,
            zIndex: Math.round((circles.length - absDistance) * 10),
          });
        });
      };

      const fadeScroll = scrollLabel
        ? gsap.to(scrollLabel, {
            autoAlpha: 0,
            duration: 0.7,
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "top top-=1",
              toggleActions: "play none reverse none",
            },
          })
        : null;

      const mm = gsap.matchMedia();

      // Mismo patrón que destinations: se pinea el propio container (1 viewport)
      // con pin: true; pinSpacing genera la distancia de scroll. Así el pin
      // engancha cuando el top del container llega al top de la pantalla, sin
      // offsets ni transform-pin (que en mobile causaban salto/desplazamiento).
      const createPin = (
        cardAngle: number,
        offscreenAngle: number,
        triggerElement: HTMLElement = container,
      ) => {
        renderCards(0, cardAngle, offscreenAngle);

        const pendingAssetRefreshRef = { current: false };
        const cleanupCallbacks: Array<() => void> = [];
        let refreshFrame: number | null = null;
        let refreshTimer: number | null = null;

        const flushPendingRefresh = () => {
          if (!pendingAssetRefreshRef.current) return;
          pendingAssetRefreshRef.current = false;
          requestAnimationFrame(() => ScrollTrigger.refresh());
        };

        const trigger = ScrollTrigger.create({
          trigger: triggerElement,
          start: "top top",
          end: () => `+=${(panels - 0.72) * triggerElement.offsetHeight}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 0.35,
          refreshPriority: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) =>
            renderCards(
              gsap.utils.clamp(0, 1, self.progress / 0.92),
              cardAngle,
              offscreenAngle,
            ),
          onRefresh: (self) => {
            root.dataset.includesScrollStart = String(self.start);
            root.dataset.includesScrollEnd = String(self.end);
            renderCards(
              gsap.utils.clamp(0, 1, self.progress / 0.92),
              cardAngle,
              offscreenAngle,
            );
          },
          onLeave: flushPendingRefresh,
          onLeaveBack: flushPendingRefresh,
        });

        const scheduleAssetRefresh = () => {
          if (trigger.isActive) {
            pendingAssetRefreshRef.current = true;
            return;
          }
          if (refreshFrame !== null || refreshTimer !== null) return;

          refreshFrame = requestAnimationFrame(() => {
            refreshFrame = null;
            refreshTimer = window.setTimeout(() => {
              refreshTimer = null;
              if (trigger.isActive) {
                pendingAssetRefreshRef.current = true;
                return;
              }
              ScrollTrigger.refresh();
            }, 80);
          });
        };

        const fontsReady = document.fonts?.ready;
        if (fontsReady) {
          void fontsReady.then(scheduleAssetRefresh);
        }

        const onWindowLoad = () => scheduleAssetRefresh();
        window.addEventListener("load", onWindowLoad, { once: true });
        cleanupCallbacks.push(() =>
          window.removeEventListener("load", onWindowLoad),
        );

        const lateAssets = Array.from(
          document.querySelectorAll<HTMLImageElement | HTMLIFrameElement>(
            "img, iframe",
          ),
        );
        lateAssets.forEach((asset) => {
          if (asset instanceof HTMLImageElement && asset.complete) return;
          const onAssetSettled = () => scheduleAssetRefresh();
          asset.addEventListener("load", onAssetSettled, { once: true });
          asset.addEventListener("error", onAssetSettled, { once: true });
          cleanupCallbacks.push(() => {
            asset.removeEventListener("load", onAssetSettled);
            asset.removeEventListener("error", onAssetSettled);
          });
        });

        return () => {
          cleanupCallbacks.forEach((cleanup) => cleanup());
          if (refreshFrame !== null) {
            cancelAnimationFrame(refreshFrame);
          }
          if (refreshTimer !== null) {
            window.clearTimeout(refreshTimer);
          }
          trigger.kill();
        };
      };

      mm.add("(min-width: 769px)", () => createPin(22, 26));
      mm.add("(max-width: 768px)", () => createPin(44, 60, root));

      return () => {
        fadeScroll?.kill();
        mm.revert();
      };
    },
    { scope: rootRef, dependencies: [animationsEnabled, includes.items.length] },
  );

  return (
    <section
      ref={rootRef}
      className={
        animationsEnabled
          ? styles.mwg_effect007
          : `${styles.mwg_effect007} ${styles.staticLayout}`
      }
    >
      <h2 className="srOnly">{includes.srHeading}</h2>

      <div className={styles.titleBlock}>
        <BlurredStagger
          text="Lo que da forma a tu experiencia PREMIUM"
          align="left"
          className={styles.sectionTitle}
          highlights={[
            { word: "da", useGradient: true },
            { word: "forma", useGradient: true },
            { word: "PREMIUM", useGradient: true },
          ]}
        />
      </div>

      <div className={styles.container}>
        {includes.items.map((item) => (
          <div key={item.id} className={styles.circle}>
            <div className={styles.cardWrapper}>
              <article className={styles.cardCopy}>
                <span className={styles.cardNumber}>{item.label}</span>
                <div className={styles.cardText}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <span className={styles.tag}>
                  Integrado en tu experiencia PREMIUM®
                </span>
              </article>

              <Image
                className={styles.media}
                src={item.image}
                alt={item.title}
                title={item.title}
                width={360}
                height={1027}
                sizes="(max-width: 768px) 78vw, (max-width: 1024px) 34vw, 25vw"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
